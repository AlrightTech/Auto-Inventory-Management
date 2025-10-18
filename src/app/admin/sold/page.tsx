'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, Search, Filter, Download } from 'lucide-react';

export default function SoldPage() {
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
            Sold Vehicles
          </h1>
          <p className="text-slate-400 mt-1">
            Track sold vehicles, profit calculations, and buyer information.
          </p>
        </div>
        <Button className="gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Sold Vehicle
        </Button>
      </motion.div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sold Module</h2>
            <p className="text-slate-400 mb-6">
              This module will include sold vehicle tracking, profit calculations, buyer information, and ARB history management.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Search className="w-4 h-4 mr-2" />
                Search Sold Vehicles
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Date
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Download className="w-4 h-4 mr-2" />
                Export Sales Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
