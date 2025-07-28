import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { db } from '@/db';


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
      console.log(`file object: ${file}`)
      
      try {
        const createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url,
            uploadStatus: 'PROCESSING',
          },
        });
        
        return { uploadedBy: metadata.userId };
      } catch (err) {
        console.error('onUploadComplete error', err);
        throw err;
      }
    })
    
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
