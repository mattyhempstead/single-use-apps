import { t } from "../initTRPC";
import { userRouter } from "./userRouter";

export const appRouter = t.router({
  user: userRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
