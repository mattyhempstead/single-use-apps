import { db } from "@/db/db";
import { ProjectsSelect, projectsTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { t, userProcedure } from "../initTRPC";

export const projectRouter = t.router({
  getProject: userProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }): Promise<ProjectsSelect> => {
      const project = await db.query.projectsTable.findFirst({
        where: eq(projectsTable.id, input.projectId),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),
  createProject: userProcedure.mutation(
    async ({ ctx }): Promise<{ id: string }> => {
      const newProject = await db
        .insert(projectsTable)
        .values({
          userId: ctx.user.userId,
          sourceCode: "",
        })
        .returning({ id: projectsTable.id });

      return { id: newProject[0].id };
    },
  ),
});
