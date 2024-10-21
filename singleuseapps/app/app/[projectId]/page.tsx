"use client";

import { trpc } from "@/app/api/trpc/trpcClient";
import { Button } from "@/components/ui/button";
import { ProjectsSelect } from "@/db/schema";
import { useUserAuth } from "@/hooks/useUserAuth";
import Editor from "@monaco-editor/react";
import { format } from "date-fns";
import * as monaco from "monaco-editor";
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

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSaveProject();
    });
  };

  return (
    <div className="grid grid-cols-2 min-h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col h-screen border-r">
        <div className="flex justify-between items-center p-4 border-b">
          <p>Project ID: {project.id}</p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Last updated: {format(new Date(project.updatedAt), "PPpp")}
            </p>
            <Button
              onClick={handleSaveProject}
              loading={updateProjectMutation.isPending}
            >
              Save changes
            </Button>
          </div>
        </div>
        <div className="flex-grow">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={code}
            onChange={(value: string | undefined) => setCode(value || "")}
            onMount={handleEditorMount}
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex flex-col gap-8 items-center sm:items-start">
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
