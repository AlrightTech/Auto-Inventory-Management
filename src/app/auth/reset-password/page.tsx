'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidSession(true);
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch {
        setError('Configuration error. Please try again later.');
      }
    };
    
    checkSession();
  }, []);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      // First, get the current session to ensure user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
        return;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Sign out the user to force them to sign in with new password
      await supabase.auth.signOut();
      
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card-strong glow-border">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold text-white glow-text">
                  Password Updated
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Your password has been successfully updated
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-slate-400 text-sm">
                  Your password has been successfully updated. You have been signed out for security.
                </p>
                <p className="text-slate-400 text-sm">
                  Please sign in with your new password.
                </p>
                <p className="text-slate-500 text-xs">
                  Redirecting to login page...
                </p>
              </div>
              
              <Link href="/auth/login" className="w-full">
                <Button className="w-full gradient-primary hover:opacity-90">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isValidSession && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card-strong glow-border">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Verifying reset link...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card-strong glow-border">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center"
            >
              <Car className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-white glow-text">
                Reset Password
              </CardTitle>
              <CardDescription className="text-slate-300">
                Enter your new password
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
