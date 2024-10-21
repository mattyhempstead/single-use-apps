"use client";

import { trpc } from "@/app/api/trpc/trpcClient";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/hooks/useUserAuth";
import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function Page() {
  const [code, setCode] = useState("// Write your code here");
  const { userAuth, isLoading } = useUserAuth();
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      enabled: !!userAuth,
    });

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
          test
          <Button>Click me</Button>
          {isLoading || (userAuth && isCurrentUserLoading) ? (
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
