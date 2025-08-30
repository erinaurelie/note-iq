import { db } from "@/db";
import { SendMessageValidator } from "@/lib/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from '@/lib/pinecone';
import { deepseekClient } from "@/lib/deepseek";
import { deepseekEmbeddings } from "@/lib/embeddings";

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { id: userId } = user!;

  if (!userId) 
    return new Response('Unauthorized', {
    status: 401
  });

  // when making a request to this endpoint we expect this Schema
  let fileId: string, message: string;
  

  try {
    ({ fileId, message } = SendMessageValidator.parse(body));
  } catch (error) {
    return new Response('Invalid request', { status: 400 });
  }


  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId
    }
  })

  
  if (!file)
    return new Response('Not found', {
      status: 404
    });


  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId
    }
  })

  // which page of the pdf is most relevant to the question asked retrieve that page for context and send it
  const pinecone = await getPineconeClient()
  const pineconeIndex = pinecone.Index('note-iq');
  
  // Use DeepSeek embeddings instead of OpenAI
  const vectorStore = await PineconeStore.fromExistingIndex(deepseekEmbeddings, {
    pineconeIndex,
    namespace: file.id
  })


  const results = await vectorStore.similaritySearch(message, 4);

  const previousMsg = await db.message.findMany({
    where: {
      fileId
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 6
  });

  const formattedPrevMessages = previousMsg.map(msg => ({
    role: msg.isUserMessage ? 'user' as const : 'assistant' as const,
    content: msg.text
  }));

  
  try {
    const response = await deepseekClient.createChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.',
        },
        {
          role: 'user',
          content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
          
          \n----------------\n
          
          PREVIOUS CONVERSATION:
          ${formattedPrevMessages.map((message) => {
            if (message.role === 'user') return `User: ${message.content}\n`
            return `Assistant: ${message.content}\n`
          })}
          
          \n----------------\n
          
          CONTEXT:
          ${results.map((r) => r.pageContent).join('\n\n')}
          
          USER INPUT: ${message}`,
        },
      ],
      stream: true,
    });

    // Create a readable stream from the DeepSeek response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        
        const reader = response.getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  // Skip malformed JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
        
        // Save the complete response to the database
        await db.message.create({
          data: {
            text: fullResponse,
            isUserMessage: false,
            fileId,
            userId: user!.id,
          },
        });
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('DeepSeek API error:', error);
    
    // Save error message to database
    await db.message.create({
      data: {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        isUserMessage: false,
        fileId,
        userId: user!.id,
      },
    });
    
    return new Response('AI service temporarily unavailable', { status: 503 });
  }
}
