import { t } from "../initTRPC";
import { projectRouter } from "./projectRouter";
import { userRouter } from "./userRouter";

export const appRouter = t.router({
  user: userRouter,
  project: projectRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
