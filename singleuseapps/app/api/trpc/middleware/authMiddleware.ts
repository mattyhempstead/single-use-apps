import { getUserAuth } from "@/server/supabase/serverClient";
import { getUser } from "@/server/user/getUser";
import { TRPCError } from "@trpc/server";
import { t } from "../initTRPC";

export const AuthLevel = {
  USER: "user",
  // ADMIN: "admin",
} as const;

type AuthLevel = (typeof AuthLevel)[keyof typeof AuthLevel];

export const authMiddleware = (requiredLevel: AuthLevel) => {
  return t.middleware(async ({ ctx, next }) => {
    const userAuth = await getUserAuth();

    if (!userAuth) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    const user = await getUser({ userId: userAuth.id });
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  });
};
