import { initTRPC } from "@trpc/server";
import { AuthLevel, authMiddleware } from "./middleware/authMiddleware";
import { publicMiddleware } from "./middleware/publicMiddleware";

export const t = initTRPC.create();

export const userProcedure = t.procedure.use(authMiddleware(AuthLevel.USER));
export const publicProcedure = t.procedure.use(publicMiddleware());
