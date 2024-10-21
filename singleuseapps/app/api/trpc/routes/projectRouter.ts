import { db } from "@/db/db";
import { ProjectsSelect, projectsTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
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
  updateProject: userProcedure
    .input(z.object({ projectId: z.string().uuid(), sourceCode: z.string() }))
    .mutation(async ({ input, ctx }): Promise<{ id: string }> => {
      const updatedProject = await db
        .update(projectsTable)
        .set({
          sourceCode: input.sourceCode,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(projectsTable.id, input.projectId),
            eq(projectsTable.userId, ctx.user.userId),
          ),
        )
        .returning({ id: projectsTable.id });

      if (updatedProject.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Project not found or not owned by the user",
        });
      }

      return { id: updatedProject[0].id };
    }),
});
