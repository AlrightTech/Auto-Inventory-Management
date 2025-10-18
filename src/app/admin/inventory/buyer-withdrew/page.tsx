import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function BuyerWithdrewPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">
            Buyer Withdrew Inventory
          </h1>
          <p className="text-slate-400 mt-1">
            Vehicles that were withdrawn by buyers.
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
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon!</h2>
            <p className="text-slate-400">
              This section will display vehicles where the buyer withdrew their purchase.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
