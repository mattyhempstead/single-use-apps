import { db } from "@/db/db";
import { usersTable } from "@/db/schema";
import { publicProcedure, t, userProcedure } from "../initTRPC";

export const userRouter = t.router({
  getCurrentUser: userProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  upsertUserAccount: publicProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.userAuth.id;
    let user = await ctx.user;

    // TODO: Make this read the email and perform an update if it is missing but the account is not anon

    if (!user) {
      const newUser = {
        userId,
        email: null, // Always null for now
      };

      await db.insert(usersTable).values(newUser);
    }
  }),
});
