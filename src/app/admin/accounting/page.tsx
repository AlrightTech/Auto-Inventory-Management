'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus, Search, Filter, Download } from 'lucide-react';

export default function AccountingPage() {
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
            Accounting Summary
          </h1>
          <p className="text-slate-400 mt-1">
            Comprehensive financial overview and profit tracking.
          </p>
        </div>
        <Button className="gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
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
            <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Accounting Module</h2>
            <p className="text-slate-400 mb-6">
              This module will include financial summaries, profit calculations, purchase tracking, and comprehensive reporting.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Search className="w-4 h-4 mr-2" />
                Search Transactions
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Period
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Download className="w-4 h-4 mr-2" />
                Export Financial Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
