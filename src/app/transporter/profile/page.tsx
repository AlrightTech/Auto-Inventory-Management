'use client';

import { motion } from 'framer-motion';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function TransporterProfilePage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ProfileForm role={'transporter'} />
      </motion.div>
    </div>
  );
}
