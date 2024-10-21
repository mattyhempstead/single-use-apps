"use client";

import { trpc } from "@/app/api/trpc/trpcClient";
import { supabase } from "@/lib/supabase/browserClient";
import { User } from "@supabase/auth-js";
import { useEffect, useState } from "react";
import { create } from "zustand";

interface UserAuthState {
  userAuth: User | null;
  isLoading: boolean;
  setUserAuth: (userAuth: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const useUserAuthStore = create<UserAuthState>((set) => ({
  userAuth: null,
  isLoading: true,
  setUserAuth: (userAuth) => set({ userAuth }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

const initializeAuth = async () => {
  const store = useUserAuthStore.getState();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      store.setUserAuth(user);
    } else {
      // Attempt to sign in anonymously if no user is found
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      store.setUserAuth(data.user);
    }
  } catch (error) {
    console.error("Error fetching or creating user:", error);
  } finally {
    store.setIsLoading(false);
  }

  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === "SIGNED_OUT") {
        // Attempt to sign in anonymously when the user signs out
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Error signing in anonymously:", error);
        } else {
          store.setUserAuth(data.user);
        }
      } else {
        store.setUserAuth(session?.user ?? null);
      }
    },
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
};

initializeAuth();

export const useUserAuth = () => {
  const store = useUserAuthStore();
  const [isUpserted, setIsUpserted] = useState(false);
  const upsertUserMutation = trpc.user.upsertUserAccount.useMutation();

  useEffect(() => {
    if (store.userAuth && !isUpserted && !upsertUserMutation.isLoading) {
      upsertUserMutation.mutate(undefined, {
        onSuccess: () => {
          setIsUpserted(true);
        },
        onError: (error) => {
          console.error("Error upserting user:", error);
        },
      });
    }
  }, [store.userAuth, isUpserted, upsertUserMutation]);

  return {
    userAuth: isUpserted ? store.userAuth : null,
    isLoading:
      store.isLoading ||
      upsertUserMutation.isLoading ||
      (!isUpserted && !!store.userAuth),
  };
};
