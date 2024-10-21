import { db } from "@/db/db";
import { UsersSelect, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUser = async ({
  userId,
}: {
  userId: string;
}): Promise<UsersSelect | null> => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userId, userId))
    .limit(1);

  return users.length > 0 ? users[0] : null;
};
