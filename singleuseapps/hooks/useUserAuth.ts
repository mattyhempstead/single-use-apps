import { supabase } from "@/lib/supabase/browserClient";
import { User } from "@supabase/auth-js";
import { create } from "zustand";

interface UserAuthState {
  userAuth: User | null;
  isLoading: boolean;
  setUserAuth: (userAuth: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUserAuth = create<UserAuthState>((set) => ({
  userAuth: null,
  isLoading: true,
  setUserAuth: (userAuth) => set({ userAuth }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

const initializeAuth = async () => {
  const store = useUserAuth.getState();

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
        if (error) console.error("Error signing in anonymously:", error);
        else store.setUserAuth(data.user);
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
