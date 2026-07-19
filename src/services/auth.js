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

// Set the invited user's password. Requires the temporary invite session to be
// active. Returns Supabase's { data, error } shape so the caller can render the
// message on failure.
export async function updatePassword(password) {
  if (!supabase) {
    return {
      data: null,
      error: { message: 'Supabase is not configured — missing .env.local.' },
    };
  }
  return supabase.auth.updateUser({ password });
}
