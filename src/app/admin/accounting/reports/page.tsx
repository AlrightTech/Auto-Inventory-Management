'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  FileText,
  Calendar,
  Download
} from 'lucide-react';
import { ProfitPerCarReport } from '@/components/reports/ProfitPerCarReport';
import { SummaryReport } from '@/components/reports/SummaryReport';
import { ArbitrationReport } from '@/components/reports/ArbitrationReport';
import { SalesReport } from '@/components/reports/SalesReport';
import { MissingTitlesReport } from '@/components/reports/MissingTitlesReport';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';

function AccountingReportsPageContent() {
  const [activeTab, setActiveTab] = useState('profit-per-car');
  const { hasPermission } = usePermissions();
  
  const canViewProfitPerCar = hasPermission('reports.profit_per_car');
  const canViewArbitration = hasPermission('reports.arb_activity');
  const canViewMissingTitles = hasPermission('reports.missing_titles');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Reports
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Comprehensive financial and operational reports for your inventory
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5" style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border)'
        }}>
          {canViewProfitPerCar && (
            <TabsTrigger value="profit-per-car" style={{ color: 'var(--text)' }}>
              <DollarSign className="w-4 h-4 mr-2" />
              Profit Per Car
            </TabsTrigger>
          )}
          <TabsTrigger value="summary" style={{ color: 'var(--text)' }}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Summary
          </TabsTrigger>
          {canViewArbitration && (
            <TabsTrigger value="arbitration" style={{ color: 'var(--text)' }}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Arbitration
            </TabsTrigger>
          )}
          <TabsTrigger value="sales" style={{ color: 'var(--text)' }}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Sales
          </TabsTrigger>
          {canViewMissingTitles && (
            <TabsTrigger value="missing-titles" style={{ color: 'var(--text)' }}>
              <FileText className="w-4 h-4 mr-2" />
              Missing Titles
            </TabsTrigger>
          )}
        </TabsList>

        {canViewProfitPerCar && (
          <TabsContent value="profit-per-car" className="mt-6">
            <ProfitPerCarReport />
          </TabsContent>
        )}

        <TabsContent value="summary" className="mt-6">
          <SummaryReport />
        </TabsContent>

        {canViewArbitration && (
          <TabsContent value="arbitration" className="mt-6">
            <ArbitrationReport />
          </TabsContent>
        )}

        <TabsContent value="sales" className="mt-6">
          <SalesReport />
        </TabsContent>

        {canViewMissingTitles && (
          <TabsContent value="missing-titles" className="mt-6">
            <MissingTitlesReport />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default function AccountingReportsPage() {
  return (
    <ProtectedRoute requiredPermission="accounting.accounting_page">
      <AccountingReportsPageContent />
    </ProtectedRoute>
  );
}
