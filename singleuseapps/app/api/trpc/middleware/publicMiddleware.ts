import { getUserAuth } from "@/server/supabase/serverClient";
import { getUser } from "@/server/user/getUser";
import { TRPCError } from "@trpc/server";
import { t } from "../initTRPC";

export const publicMiddleware = () => {
  return t.middleware(async ({ ctx, next }) => {
    const userAuth = await getUserAuth();

    if (!userAuth) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be authenticated to access this resource",
      });
    }

    let user = null;
    try {
      user = await getUser({ userId: userAuth.id });
    } catch (error) {
      // If getUser fails, we'll continue with user as null
      console.error("Failed to fetch user:", error);
    }

    return next({
      ctx: {
        ...ctx,
        userAuth,
        user,
      },
    });
  });
};
