import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Get environment variables - these should be available at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
    console.error(error.message);
    
    // In development, throw error to make it obvious
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    
    // In production, return a mock client that logs errors
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: error }),
        signOut: () => Promise.resolve({ error: error }),
        signUp: () => Promise.resolve({ data: { user: null }, error: error }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: error }),
        resetPasswordForEmail: () => Promise.resolve({ error: error }),
        updateUser: () => Promise.resolve({ data: { user: null }, error: error }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: error }),
            maybeSingle: () => Promise.resolve({ data: null, error: error }),
          }),
          neq: () => ({
            order: () => Promise.resolve({ data: [], error: error }),
          }),
          or: () => ({
            order: () => Promise.resolve({ data: [], error: error }),
          }),
        }),
        insert: () => Promise.resolve({ data: null, error: error }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: error }),
        }),
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({}),
        }),
        removeChannel: () => ({}),
      }),
    } as any;
  }

  // Create the real Supabase client
  // createBrowserClient automatically includes the API key in requests
  // But we'll ensure it's properly configured
  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Verify the client was created successfully
    if (!client) {
      throw new Error('Failed to create Supabase client');
    }
    
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw new Error(`Failed to initialize Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
