import { createClient } from '@supabase/supabase-js';

// Server-side only: Uses service role key which should NEVER be exposed to client
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.'
      );
    }

    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  return _supabaseAdmin;
}

export const supabaseAdmin = {
  auth: {
    admin: {
      inviteUserByEmail: (email: string, options: any) =>
        getSupabaseAdmin().auth.admin.inviteUserByEmail(email, options),
      getUserById: (userId: string) =>
        getSupabaseAdmin().auth.admin.getUserById(userId),
    },
  },
  from: (table: string) => getSupabaseAdmin().from(table),
} as any;
