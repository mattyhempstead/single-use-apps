import { createServerClient } from "@supabase/ssr";
import { createClient as createClientSupabase } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * A supabase client that has user creds.
 * Might have anon or user perms, not sure.
 * Definitely not service role though.
 */
export const createClient = () => {
  /*
    Note that this defines a cookie store from NextJS.
    To actually change cookies in the response, you will need to set the cookies
    on the NextResponse object when the route eventually returns.

    However, I have confirmed using the below code that the same cookie object will
    be returned on subsequent calls to `cookies()`.

    const c1 = cookies();
    c1.set({ name: 'foo', value: 'bar' });
    const c2 = cookies();
    console.log(c2.get('foo')?.value);

    This means that the createServerClient object below will be able to modify cookies
    for the reponse object by modifying its reference to the cookies() instance defined here.

    I'm assuming eventually when the reponse object is created they are pulling from
    this cookies() object again somehow.
  */
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};

/**
 * A supabase client with service role permissions.
 * This supabase client does not have a user session attached, but does
 * have full permissions on all tables.
 *
 * To make a table that nobody can access except thi service role client,
 * you should enable RLS and then not add any policies.
 */
export const createServiceClient = () => {
  return createClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY!,
  );
};

export const getUserAuth = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
