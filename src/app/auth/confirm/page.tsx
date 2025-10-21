'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function ConfirmPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || !type) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please try again.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage(error.message || 'Failed to confirm email. Please try again.');
          return;
        }

        setStatus('success');
        setMessage('Email confirmed successfully! You can now sign in.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?message=email_confirmed');
        }, 3000);
      } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    confirmEmail();
  }, [searchParams, supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Email Confirmation
            </CardTitle>
            <CardDescription className="text-slate-400">
              Verifying your email address...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
                <p className="text-slate-300">Confirming your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                <p className="text-green-400 font-medium">{message}</p>
                <p className="text-slate-400 text-sm">
                  Redirecting to login page...
                </p>
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="gradient-primary hover:opacity-90"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-red-400 font-medium">{message}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/auth/register')}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => router.push('/auth/login')}
                    className="gradient-primary hover:opacity-90"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  );
}

