'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car } from 'lucide-react';
import Link from 'next/link';

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success messages from URL parameters
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'email_confirmed') {
      setSuccess('Email confirmed successfully! You can now sign in.');
    }
  }, [searchParams]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Configuration Error</h1>
          <p className="text-slate-400">Supabase environment variables are not configured.</p>
        </div>
      </div>
    );
  }
  
  const supabase = createClient();

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to sign in with email:', data.email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Authentication error:', authError);
        
        // Handle specific error cases
        if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the verification link before signing in.');
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(authError.message);
        }
        return;
      }

      console.log('Authentication successful:', authData.user?.id);

      if (authData.user) {
        // Get user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          
          // If profile doesn't exist, create it with default role
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating default profile...');
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: authData.user.email || '',
                role: 'transporter', // Default role
                username: authData.user.email?.split('@')[0] || 'User',
                created_at: new Date().toISOString()
              })
              .select('role')
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              setError('Failed to create user profile. Please contact support.');
              return;
            }

            console.log('Created new profile:', newProfile);
            
            // Redirect based on default role
            router.push('/transporter');
            return;
          } else {
            console.error('Unexpected profile error:', profileError);
            setError(`Failed to load user profile: ${profileError.message}`);
            return;
          }
        }

        console.log('User profile:', profile);

        // Redirect based on role
        if (profile?.role === 'admin') {
          router.push('/admin');
        } else if (profile?.role === 'seller') {
          router.push('/seller');
        } else if (profile?.role === 'transporter') {
          router.push('/transporter');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)', boxShadow: 'var(--glow)' }}
            >
              <Car className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
                Auto Inventory
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Sign in to your account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 control-panel"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 pr-10 control-panel"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm"
                >
                  {success}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full control-panel neon-glow"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  borderRadius: '25px',
                  fontWeight: '500',
                  transition: '0.3s'
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <div>
                {/* Hide forgot password link for Admin after detecting role post-login; show here unconditionally for UI consistency. */}
                <Link
                  href="/auth/forgot-password"
                  className="text-sm transition-colors duration-300"
                  style={{ color: 'var(--accent)' }}
                >
                  Forgot your password?
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="transition-colors duration-300"
                  style={{ color: 'var(--accent)' }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
