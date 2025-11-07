'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { User, ListChecks } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">
            Settings
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your account settings and system preferences.
          </p>
        </div>
      </motion.div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card hover-glow transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                My Account
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your profile and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/admin/settings/dropdowns">
            <Card className="glass-card hover-glow transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ListChecks className="w-5 h-5 mr-2 text-blue-400" />
                  Dropdown Manager
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage dropdown options for Car Location and other categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  Manage Dropdowns
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Profile editor */}
      <ProfileForm role={'admin'} />
    </div>
  );
}
