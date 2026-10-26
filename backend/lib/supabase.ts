import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseServiceRoleKey &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("your-project-id")
);

/**
 * Server-side Supabase client initialized with the Service Role key.
 * This client is strictly for backend API routes and administrative database access.
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl! : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseServiceRoleKey! : "placeholder-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export default supabase;
