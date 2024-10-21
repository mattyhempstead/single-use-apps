import { db } from "@/db/db";
import { projectsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const projectIdSchema = z.string().uuid();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 },
    );
  }

  let validatedProjectId: string;
  try {
    validatedProjectId = projectIdSchema.parse(projectId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid Project ID format" },
        { status: 400 },
      );
    }
    throw error; // Re-throw unexpected errors
  }

  try {
    const project = await db.query.projectsTable.findFirst({
      where: eq(projectsTable.id, validatedProjectId),
      columns: {
        id: true,
        sourceCode: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      projectId: project.id,
      sourceCode: project.sourceCode,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
