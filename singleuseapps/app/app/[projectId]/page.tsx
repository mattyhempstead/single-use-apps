"use client";

import { trpc } from "@/app/api/trpc/trpcClient";
import { Button } from "@/components/ui/button";
import { ProjectsSelect } from "@/db/schema";
import { useUserAuth } from "@/hooks/useUserAuth";
import { javascript } from "@codemirror/lang-javascript";
import { keymap } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { format } from "date-fns";
import { useCallback, useState } from "react";

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

  const updateProjectMutation = trpc.project.updateProject.useMutation();

  const handleSaveProject = useCallback(async () => {
    await updateProjectMutation.mutateAsync({
      projectId: project.id,
      sourceCode: code,
    });
  }, [updateProjectMutation, project.id, code]);

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
        <div className="flex-grow h-[calc(100vh-1rem) overflow-y-auto">
          <CodeEditor
            code={code}
            setCode={setCode}
            onSave={handleSaveProject}
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-8">
        <AppDisplay projectId={project.id} />
      </div>
    </div>
  );
}

function CodeEditor({
  code,
  setCode,
  onSave,
}: {
  code: string;
  setCode: (code: string) => void;
  onSave: () => void;
}) {
  const handleEditorChange = useCallback(
    (value: string) => {
      setCode(value);
    },
    [setCode],
  );

  // Create a keymap that listens for Ctrl+S (or Cmd+S) and triggers the save action
  const saveKeymap = keymap.of([
    {
      key: "Mod-s",
      run: () => {
        onSave();
        return true;
      },
    },
  ]);

  return (
    <CodeMirror
      value={code}
      onChange={handleEditorChange}
      extensions={[javascript({ jsx: true, typescript: true }), saveKeymap]}
      height="100%"
      style={{
        height: "100%",
      }}
    />
  );
}

function AppDisplay({ projectId }: { projectId: string }) {
  const currentUrl = new URL(window.location.href);
  const appUrl = `${currentUrl.protocol}//${currentUrl.hostname}:3001/app/${projectId}/index.html`;

  return (
    <iframe
      src={appUrl}
      className="w-full h-full border-0"
      title="App Display"
    />
  );
}
