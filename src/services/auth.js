// Auth service — the ONLY place the app talks to Supabase Auth.
//
// Per SRS Appendix B.2, components never import the Supabase client or call it
// directly; they go through this service. Passwords are sent ONLY to Supabase —
// our own FastAPI backend never sees them.
import { supabase, isSupabaseConfigured } from './supabaseClient';

export { isSupabaseConfigured };

// Subscribe to auth-state changes. Returns Supabase's { data: { subscription } }
// so callers can unsubscribe on unmount. Safe no-op when Supabase isn't set up.
export function onAuthChange(callback) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe() {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}

// The current session. On the set-password page this is the temporary session
// Supabase establishes from the invite link (see detectSessionInUrl).
export async function getSession() {
  if (!supabase) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}

// The current access token (JWT), for the API client's Authorization header.
// Null when there's no session / Supabase isn't configured.
export async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

// Email + password sign-in. Returns Supabase's { data, error } shape.
export async function signInWithPassword(email, password) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase is not configured — missing .env.local.' } };
  }
  return supabase.auth.signInWithPassword({ email, password });
}

// Clear the session (real sign-out).
export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

// Set the invited user's password (AB#27). Requires the temporary invite session
// to be active. Returns Supabase's { data, error } shape.
export async function updatePassword(password) {
  if (!supabase) {
    return {
      data: null,
      error: { message: 'Supabase is not configured — missing .env.local.' },
    };
  }
  return supabase.auth.updateUser({ password });
}
