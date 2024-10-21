"use client";

import { trpc } from "@/app/api/trpc/trpcClient";
import { Button } from "@/components/ui/button";
import { ProjectsSelect } from "@/db/schema";
import { useUserAuth } from "@/hooks/useUserAuth";
import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function Page({ params }: { params: { projectId: string } }) {
  const { userAuth, isLoading } = useUserAuth();
  const { data: project, isLoading: isProjectLoading } =
    trpc.project.getProject.useQuery(
      { projectId: params.projectId },
      { enabled: !!userAuth },
    );

  if (isLoading || isProjectLoading) {
    return <div>Loading...</div>;
  }

  if (!userAuth) {
    return <div>Please log in to access this page.</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return <PageContent project={project} />;
}

function PageContent({ project }: { project: ProjectsSelect }) {
  const [code, setCode] = useState(project.sourceCode);
  const { userAuth } = useUserAuth();
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      enabled: !!userAuth,
    });

  const updateProjectMutation = trpc.project.updateProject.useMutation();

  const handleSaveProject = async () => {
    await updateProjectMutation.mutateAsync({
      projectId: project.id,
      sourceCode: code,
    });
  };

  return (
    <div className="grid grid-cols-2 min-h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="h-screen">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue={code}
          onChange={(value: string | undefined) => setCode(value || "")}
        />
      </div>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex flex-col gap-8 items-center sm:items-start">
          <p>Project ID: {project.id}</p>
          <Button
            onClick={handleSaveProject}
            loading={updateProjectMutation.isPending}
          >
            Save project
          </Button>
          {isCurrentUserLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>User ID: {userAuth?.id}</p>
              {userAuth?.email && !userAuth.app_metadata.provider && (
                <p>Email: {userAuth.email}</p>
              )}
              {currentUser && (
                <p>
                  Created At: {new Date(currentUser.createdAt).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
