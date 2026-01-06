import { createClient } from "@supabase/supabase-js";

export const getBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase browser credentials");
  }

  return createClient(url, key, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};
