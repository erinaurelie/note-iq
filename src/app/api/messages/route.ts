import { db } from "@/db";
import { SendMessageValidator } from "@/lib/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from '@/lib/pinecone';
import { openai } from "@/lib/openai";

import { streamText } from "ai";
import { openai as openAI} from "@ai-sdk/openai"


export const PORT = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = getUser();

  const { id: userId } = user;

  if (!userId) 
    return new Response('Unauthorized', {
    status: 401
    });

  // when making a request to this endpoint we expect this Schema
  const { fileId, message } = SendMessageValidator.parse(body);

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
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
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

  const response =  await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
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
  })

  const stream = await streamText({
    model: openAI('gpt-4o'),
    async onFinish(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      }); 
    }
  })

  return stream.toDataStreamResponse();
  
}

/*
  Using an LLM every text like "the dog is brown" can be turned into a vector i.e. a JS array of 1536 numbers. You can see how similar sentences using their vectors. That is called semantic query. We are going to index the entire PDF first and then based on the question we can find the parts of the PDF in the text that are most relevant to that question. 

  We can calculate that mathematically using the *consine similarity*

  We are indexing the PDF using a vector db there are many we'll be using Pinecone. there create an index which just stores a bunch of vectors

  and OpenAI for the embedings

*/
