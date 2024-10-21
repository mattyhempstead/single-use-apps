"use client";

import { trpc } from "@/app/api/trpc/trpcClient";
import { Button } from "@/components/ui/button";
import SelectInput from "@/components/ui/custom-inputs/SelectInput";
import { useUserAuth } from "@/hooks/useUserAuth";
import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function Page() {
  const { userAuth, isLoading } = useUserAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userAuth) {
    return <div>Please log in to access this page.</div>;
  }

  return <PageContent />;
}

function PageContent() {
  const [code, setCode] = useState("// Write your code here");
  const [projectId, setProjectId] = useState<string | null>(null);
  const { userAuth } = useUserAuth();
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      enabled: !!userAuth,
    });

  const { data: projects, isLoading: isProjectsLoading } =
    trpc.project.listProjects.useQuery();

  const createProjectMutation = trpc.project.createProject.useMutation();
  const updateProjectMutation = trpc.project.updateProject.useMutation();

  const handleSaveProject = async () => {
    if (!projectId) {
      const result = await createProjectMutation.mutateAsync();
      setProjectId(result.id);
      await updateProjectMutation.mutateAsync({
        projectId: result.id,
        sourceCode: code,
      });
    } else {
      await updateProjectMutation.mutateAsync({
        projectId,
        sourceCode: code,
      });
    }
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
          {isProjectsLoading ? (
            <p>Loading projects...</p>
          ) : (
            <SelectInput
              value={projectId}
              onChange={setProjectId}
              items={
                projects?.map((project) => ({
                  value: project.projectId,
                  label: `Project ${project.projectId} (${new Date(
                    project.updatedAt,
                  ).toLocaleString()})`,
                })) || []
              }
              placeholder="Select a project"
              showPlaceholderAsOption={true}
              className="w-64"
            />
          )}
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
