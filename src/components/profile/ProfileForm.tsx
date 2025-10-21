'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

type Role = 'admin' | 'seller' | 'transporter';

interface ProfileFormProps {
  role: Role;
}

export function ProfileForm({ role }: ProfileFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const canChangePasswordHere = role !== 'admin' || true; // Admins change here per requirement; disable forgot/reset elsewhere

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setUserId(user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, username, avatar_url, role')
          .eq('id', user.id)
          .single();

        setEmail(profile?.email || user.email || '');
        setUsername(profile?.username || '');
        setAvatarUrl(profile?.avatar_url || '');
      } catch (e) {
        // no-op
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username, avatar_url: avatarUrl, email })
        .eq('id', userId);
      if (profileError) throw profileError;

      // Update auth email if changed
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && user.email !== email) {
        const { error: authUpdateError } = await supabase.auth.updateUser({ email });
        if (authUpdateError) throw authUpdateError;
      }

      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!canChangePasswordHere) return;
    if (!password || password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="text-slate-400">Loading...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
          <CardDescription className="text-slate-400">Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Name</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-800/50 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-800/50 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Profile Image URL</Label>
            <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="bg-slate-800/50 border-slate-600 text-white" />
          </div>
          <Button disabled={saving} onClick={handleSave} className="gradient-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {canChangePasswordHere && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Change Password</CardTitle>
            <CardDescription className="text-slate-400">Set a new password for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-800/50 border-slate-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-slate-800/50 border-slate-600 text-white" />
            </div>
            <Button variant="outline" onClick={handleChangePassword} className="border-slate-600 text-slate-200">
              Update Password
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



