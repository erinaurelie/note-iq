import { publicProcedure, router } from './trpc';
 
export const appRouter = router({
  // get endpoint
  test: publicProcedure.query(() => {
    return 'hello'
  })
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;