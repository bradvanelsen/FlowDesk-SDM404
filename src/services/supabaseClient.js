// Supabase browser client — a single shared instance for the whole app.
//
// Config comes from Vite env vars (see .env.example). The anon/publishable key
// is browser-safe but lives only in .env.local (gitignored) — nothing secret is
// hardcoded here.
//
// If the env vars are missing (e.g. a teammate hasn't created .env.local yet),
// we export `null` instead of throwing at import time, so the rest of the app
// (Login, Register, the mock-data screens) keeps working. Callers should go
// through src/services/auth.js and must not import this module directly.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        // Parse the invite/recovery tokens from the redirect URL and establish
        // the temporary session automatically. Works for both the hash-token
        // and PKCE (?code=) link formats Supabase may send.
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
