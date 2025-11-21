'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfitPerCarReport } from '@/components/reports/ProfitPerCarReport';
import { ProfitSummaryReport } from '@/components/reports/ProfitSummaryReport';
import { ARBReport } from '@/components/reports/ARBReport';
import { SalesReport } from '@/components/reports/SalesReport';
import { MissingTitlesReport } from '@/components/reports/MissingTitlesReport';
import { FileText, TrendingUp, AlertTriangle, DollarSign, Calendar, Package } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('profit-per-car');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Reports & Analytics
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Comprehensive financial and operational reports based on finalized data.
          </p>
        </div>
      </div>

      {/* Reports Tabs */}
      <div>
        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardHeader>
            <CardTitle style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
              Report Types
            </CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Select a report type to view detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <TabsTrigger 
                  value="profit-per-car"
                  style={{ color: activeTab === 'profit-per-car' ? 'var(--accent)' : 'var(--subtext)' }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Profit Per Car
                </TabsTrigger>
                <TabsTrigger 
                  value="profit-summary"
                  style={{ color: activeTab === 'profit-summary' ? 'var(--accent)' : 'var(--subtext)' }}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Profit Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="arb"
                  style={{ color: activeTab === 'arb' ? 'var(--accent)' : 'var(--subtext)' }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  ARB Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="sales"
                  style={{ color: activeTab === 'sales' ? 'var(--accent)' : 'var(--subtext)' }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Sales Volume
                </TabsTrigger>
                <TabsTrigger 
                  value="missing-titles"
                  style={{ color: activeTab === 'missing-titles' ? 'var(--accent)' : 'var(--subtext)' }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Missing Titles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profit-per-car" className="mt-0">
                <ProfitPerCarReport />
              </TabsContent>

              <TabsContent value="profit-summary" className="mt-0">
                <ProfitSummaryReport />
              </TabsContent>

              <TabsContent value="arb" className="mt-0">
                <ARBReport />
              </TabsContent>

              <TabsContent value="sales" className="mt-0">
                <SalesReport />
              </TabsContent>

              <TabsContent value="missing-titles" className="mt-0">
                <MissingTitlesReport />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

