'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Download, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Calculator
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// Mock accounting data
const mockFinancialData = {
  totalSales: 3540730,
  totalPurchases: 198750,
  netProfit: 3341980,
  grossProfit: 3341980,
  avgPrice: 186406,
  weeklyChange: {
    sales: 15.6,
    purchases: 1.6,
    profit: 18.2
  }
};

const mockPurchaseSources = [
  { name: 'Manheim', count: 45, value: 165000, change: 12.5 },
  { name: 'CarMax', count: 12, value: 33150, change: -5.2 },
  { name: 'Adesa', count: 8, value: 0, change: 0 },
  { name: 'Default Auction', count: 3, value: 0, change: 0 },
];

const mockSoldStatus = [
  { status: 'All', count: 19, percentage: 100 },
  { status: 'Payment Received', count: 15, percentage: 79 },
  { status: 'Payment Pending', count: 4, percentage: 21 },
];

const mockReports = [
  { type: 'Purchases', value: 198750, change: 1.6, indicator: '+18k this week' },
  { type: 'Sold Orders', value: 3540730, change: 15.6, indicator: '+1.6k this week' },
  { type: 'Profit', value: 3341980, change: 18.2, indicator: '+2.1k this week' },
  { type: 'Loss', value: -15000, change: -5.2, indicator: '-800 this week' },
  { type: 'Avg Price', value: 186406, change: 8.3, indicator: '+12k this week' },
  { type: 'Vendor Purchases', value: 165000, change: 12.5, indicator: '+18k this week' },
  { type: 'Vendor Sales', value: 33150, change: -5.2, indicator: '-2k this week' },
];

const salesTrendData = [
  { month: 'Jan', sales: 120000, purchases: 80000 },
  { month: 'Feb', sales: 150000, purchases: 95000 },
  { month: 'Mar', sales: 180000, purchases: 110000 },
  { month: 'Apr', sales: 200000, purchases: 125000 },
  { month: 'May', sales: 220000, purchases: 140000 },
  { month: 'Jun', sales: 250000, purchases: 160000 },
  { month: 'Jul', sales: 280000, purchases: 180000 },
  { month: 'Aug', sales: 300000, purchases: 200000 },
  { month: 'Sep', sales: 320000, purchases: 220000 },
  { month: 'Oct', sales: 350000, purchases: 240000 },
  { month: 'Nov', sales: 380000, purchases: 260000 },
  { month: 'Dec', sales: 400000, purchases: 280000 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function AccountingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

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
            Accounting Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Comprehensive financial overview and reporting.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex space-x-1">
              {[
                { id: 'summary', label: 'Summary', icon: BarChart3 },
                { id: 'purchases', label: 'Purchases', icon: TrendingDown },
                { id: 'sold', label: 'Sold', icon: TrendingUp },
                { id: 'reports', label: 'Reports', icon: FileText },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'gradient-primary text-white'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Total Sales</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(mockFinancialData.totalSales)}
                      </p>
                      <div className="flex items-center space-x-1 text-xs mt-1">
                        {getChangeIcon(mockFinancialData.weeklyChange.sales)}
                        <span className={getChangeColor(mockFinancialData.weeklyChange.sales)}>
                          +{mockFinancialData.weeklyChange.sales}%
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Total Purchases</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(mockFinancialData.totalPurchases)}
                      </p>
                      <div className="flex items-center space-x-1 text-xs mt-1">
                        {getChangeIcon(mockFinancialData.weeklyChange.purchases)}
                        <span className={getChangeColor(mockFinancialData.weeklyChange.purchases)}>
                          +{mockFinancialData.weeklyChange.purchases}%
                        </span>
                      </div>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Net Profit</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(mockFinancialData.netProfit)}
                      </p>
                      <div className="flex items-center space-x-1 text-xs mt-1">
                        {getChangeIcon(mockFinancialData.weeklyChange.profit)}
                        <span className={getChangeColor(mockFinancialData.weeklyChange.profit)}>
                          +{mockFinancialData.weeklyChange.profit}%
                        </span>
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Gross Profit</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(mockFinancialData.grossProfit)}
                      </p>
                    </div>
                    <Calculator className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Avg Price</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {formatCurrency(mockFinancialData.avgPrice)}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Sales vs Purchases Trend</CardTitle>
                  <CardDescription className="text-slate-400">
                    Monthly performance over the last 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value: number, name: string) => [formatCurrency(value), name]}
                        />
                        <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="Sales" />
                        <Line type="monotone" dataKey="purchases" stroke="#EF4444" strokeWidth={2} name="Purchases" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Purchase Sources</CardTitle>
                  <CardDescription className="text-slate-400">
                    Revenue distribution by auction house
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={mockPurchaseSources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${Math.round((Number(percent) || 0) * 100)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mockPurchaseSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {mockPurchaseSources.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="glass-card border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-300">{source.name}</p>
                        <p className="text-2xl font-bold text-white">{source.count} stores</p>
                        <p className="text-lg font-semibold text-blue-400">
                          {formatCurrency(source.value)}
                        </p>
                        <div className="flex items-center space-x-1 text-xs mt-1">
                          {getChangeIcon(source.change)}
                          <span className={getChangeColor(source.change)}>
                            {source.change > 0 ? '+' : ''}{source.change}%
                          </span>
                        </div>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sold Tab */}
      {activeTab === 'sold' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockSoldStatus.map((status, index) => (
              <motion.div
                key={status.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="glass-card border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-300">{status.status}</p>
                        <p className="text-3xl font-bold text-white">{status.count}</p>
                        <p className="text-sm text-slate-400">{status.percentage}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Financial Reports</CardTitle>
              <CardDescription className="text-slate-400">
                Comprehensive financial analysis and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockReports.map((report, index) => (
                  <motion.div
                    key={report.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{report.type}</h3>
                      <Badge 
                        variant="outline" 
                        className={`${getChangeColor(report.change)} border-current`}
                      >
                        {report.change > 0 ? '+' : ''}{report.change}%
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                      {formatCurrency(report.value)}
                    </p>
                    <p className="text-sm text-slate-400">{report.indicator}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}