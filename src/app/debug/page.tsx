'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    error?: string;
  }>({
    supabaseUrl: false,
    supabaseAnonKey: false,
  });

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setEnvStatus({
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      error: !supabaseUrl || !supabaseAnonKey ? 'Missing environment variables' : undefined,
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Environment Debug</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${envStatus.supabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_URL: {envStatus.supabaseUrl ? '✓ Set' : '✗ Missing'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${envStatus.supabaseAnonKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.supabaseAnonKey ? '✓ Set' : '✗ Missing'}</span>
              </div>
            </div>
          </div>

          {envStatus.error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <h3 className="text-red-400 font-semibold mb-2">Error</h3>
              <p className="text-red-300">{envStatus.error}</p>
            </div>
          )}

          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Next Steps</h2>
            <ol className="text-slate-300 space-y-1 list-decimal list-inside">
              <li>Check Vercel environment variables in dashboard</li>
              <li>Ensure variables are set for Production environment</li>
              <li>Redeploy the application after setting variables</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
