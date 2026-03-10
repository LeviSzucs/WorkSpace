import { createClient } from '@supabase/supabase-js';

// This file is for server-side usage (e.g., in API routes)
// For client-side, use lib/supabase/client.ts instead

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase server environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);
