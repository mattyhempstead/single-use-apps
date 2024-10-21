"use client";

import { trpc } from "@/app/api/trpc/trpcClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserAuth } from "@/hooks/useUserAuth";
import { PROJECT_SINGLE_PATH } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [appDescription, setAppDescription] = useState("");
  const router = useRouter();
  const { userAuth, isLoading } = useUserAuth();

  const createProjectMutation = trpc.project.createProject.useMutation({
    onSuccess: (result) => {
      router.push(PROJECT_SINGLE_PATH(result.id));
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      // Handle error (e.g., show error message to user)
    },
  });

  const handleCreateApp = () => {
    createProjectMutation.mutate();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-4">
        <Textarea
          value={appDescription}
          onChange={(e) => setAppDescription(e.target.value)}
          placeholder="Describe your app..."
          className="min-h-[100px]"
        />
        <Button
          onClick={handleCreateApp}
          className="w-full"
          loading={createProjectMutation.isPending}
          disabled={isLoading || !userAuth}
        >
          Create app
        </Button>
      </div>
    </div>
  );
}
