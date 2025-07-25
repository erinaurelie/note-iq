import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import z from 'zod';

 
// all api routes
export const appRouter = router({
  // get request endpoint to check if user user exist anyone can query this endpoint
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // check if user is in the db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email
        }
      })
    }
    return { success: true };
    
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    
    return await db.file.findMany({
      where: {
        userId
      }
    })
  }),
  deleteFile: privateProcedure.input(
    z.object({ id: z.string() }) // whenever you call this route pass in an object of type string
  ).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    const file = await db.file.findFirst({
      where: {
        id: input.id,
        userId
      }
    })

    if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

    await db.file.delete({
      where: {
        id: input.id
      }
    })

    return file;
  }),
  getFile: privateProcedure.input(
    z.object({ key: z.string() })
  ).mutation(async ({ ctx, input }) => { 
    const { userId } = ctx;

    const file = await db.file.findFirst({
      where: {
        key: input.key,
        userId
      }
    })

    if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

    return file;
   }),  
});
 

export type AppRouter = typeof appRouter;