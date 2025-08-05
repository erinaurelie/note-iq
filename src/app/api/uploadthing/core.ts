import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

import { 
  createUploadthing, 
  type FileRouter 
} from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { db } from '@/db';

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";


import { getPineconeClient } from '@/lib/pinecone';
import { PineconeStore } from "@langchain/pinecone";




const f = createUploadthing();


export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user.id) throw new UploadThingError('Unauthorized');
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
            uploadStatus: 'PROCESSING',
          },
        });

        // loading pdf into memory for indexing
        try {
          const response = await fetch(`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`);
          const blob = await response.blob();
          const loader = new PDFLoader(blob);

          const pageLevelDocs = await loader.load();
          const pagesAmout = pageLevelDocs.length;

          // vectorize and index entire document
          const pinecone = await getPineconeClient()
          const pineconeIndex = pinecone.Index('note-iq');
          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY
          });

          await PineconeStore.fromDocuments(
            pageLevelDocs,
            embeddings,
            {
              pineconeIndex,
              namespace: createdFile.id // all the vectors for that file
            }
          )

          await db.file.update({
            data: {
              uploadStatus: 'SUCCESS'
            },
            where: {
              id: createdFile.id
            }
          })
        } catch (error) {
          await db.file.update({
            data: {
              uploadStatus: 'FAILED'
            },
            where: {
              id: createdFile.id
            }
          })
        }
        
        return { uploadedBy: metadata.userId };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
