'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  BarChart3,
  PieChart,
} from 'lucide-react';

// Mock data for demonstration
const mockMetrics = {
  totalSales: 3540730,
  totalPurchases: 198750,
  arbVehicles: 11,
  weeklyChange: {
    sales: 15.6,
    purchases: 1.6,
    arb: -15.6,
  },
};

const mockAuctions = [
  { name: 'Manheim', value: 165000, color: 'bg-blue-500' },
  { name: 'CarMax', value: 33150, color: 'bg-green-500' },
  { name: 'Adesa', value: 0, color: 'bg-yellow-500' },
  { name: 'Default Auction', value: 0, color: 'bg-purple-500' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  delay = 0 
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="glass-card hover-glow transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-400" />
            )}
            <span className={change > 0 ? 'text-green-400' : 'text-red-400'}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-slate-400">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
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
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your inventory.
          </p>
        </div>
        <Button className="gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Quick Add
        </Button>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={formatCurrency(mockMetrics.totalSales)}
          change={mockMetrics.weeklyChange.sales}
          icon={DollarSign}
          delay={0.1}
        />
        <MetricCard
          title="Total Purchases"
          value={formatCurrency(mockMetrics.totalPurchases)}
          change={mockMetrics.weeklyChange.purchases}
          icon={ShoppingCart}
          delay={0.2}
        />
        <MetricCard
          title="ARB Vehicles"
          value={mockMetrics.arbVehicles}
          change={mockMetrics.weeklyChange.arb}
          icon={AlertTriangle}
          delay={0.3}
        />
        <MetricCard
          title="Active Tasks"
          value="24"
          change={8.2}
          icon={BarChart3}
          delay={0.4}
        />
      </div>

      {/* Charts and Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Sales Performance
              </CardTitle>
              <CardDescription className="text-slate-400">
                Revenue trends over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chart will be implemented with Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Auctions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-400" />
                Top Auctions
              </CardTitle>
              <CardDescription className="text-slate-400">
                Revenue by auction house
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAuctions.map((auction) => (
                  <div key={auction.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${auction.color}`} />
                      <span className="text-sm text-slate-300">{auction.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(auction.value)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Total</span>
                    <span className="text-sm font-bold text-blue-400">
                      {formatCurrency(mockAuctions.reduce((sum, auction) => sum + auction.value, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Calendar Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Upcoming Events
            </CardTitle>
            <CardDescription className="text-slate-400">
              Click on any date to schedule an event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Calendar will be implemented with react-big-calendar</p>
                <Button className="mt-4 gradient-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
