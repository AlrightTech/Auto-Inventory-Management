'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export default function TransporterPurchasePage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">
            Purchase Process
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your vehicle inquiries and purchase workflow
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon!</h2>
            <p className="text-slate-400">
              This section will guide you through the vehicle purchase process with inquiries, offers, and negotiations.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
