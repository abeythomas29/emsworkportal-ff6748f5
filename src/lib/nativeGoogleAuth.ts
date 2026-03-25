import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { supabase } from '@/integrations/supabase/client';

let initialized = false;

function ensureInitialized() {
  if (!initialized && Capacitor.isNativePlatform()) {
    GoogleAuth.initialize({
      clientId: '', // Will be set from capacitor.config.ts or Google Services JSON
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
    initialized = true;
  }
}

export async function signInWithGoogleNative(): Promise<{ error: Error | null }> {
  try {
    ensureInitialized();
    const result = await GoogleAuth.signIn();
    const idToken = result.authentication.idToken;

    if (!idToken) {
      return { error: new Error('No ID token received from Google') };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
