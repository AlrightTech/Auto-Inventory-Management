'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  CheckSquare, 
  TrendingUp, 
  MessageCircle, 
  DollarSign,
  BarChart3
} from 'lucide-react';
import { textStyles, cn } from '@/lib/typography';

// Mock data for demonstration
const mockMetrics = {
  inventoryCount: 24,
  pendingTasks: 8,
  activeListings: 18,
  monthlySales: 156000,
  earnings: 23400,
  responseRate: 95,
};

const mockRecentActivity = [
  {
    id: 1,
    type: 'sale',
    message: '2021 Honda Civic sold for $18,500',
    time: '2 hours ago',
    amount: 18500,
  },
  {
    id: 2,
    type: 'task',
    message: 'Upload title document for 2020 Toyota Camry',
    time: '4 hours ago',
    status: 'pending',
  },
  {
    id: 3,
    type: 'inquiry',
    message: 'New inquiry for 2019 Ford F-150',
    time: '6 hours ago',
    from: 'John Smith',
  },
  {
    id: 4,
    type: 'listing',
    message: 'Added 2022 Chevrolet Silverado to inventory',
    time: '1 day ago',
    price: 32000,
  },
];

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  delay = 0 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="glass-card hover-glow transition-all duration-300 glow-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={textStyles.subtitle}>{title}</p>
            <p className={textStyles.cardValue}>{value}</p>
            {change && (
              <p className={cn(textStyles.muted, "text-green-400")}>{change}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-blue-400 glow-text" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ActivityItem = ({ activity }: { activity: typeof mockRecentActivity[0] }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
  >
    <div className="flex-shrink-0">
      {activity.type === 'sale' && <TrendingUp className="h-5 w-5 text-green-400" />}
      {activity.type === 'task' && <CheckSquare className="h-5 w-5 text-yellow-400" />}
      {activity.type === 'inquiry' && <MessageCircle className="h-5 w-5 text-blue-400" />}
      {activity.type === 'listing' && <Package className="h-5 w-5 text-purple-400" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white truncate">{activity.message}</p>
      <p className="text-xs text-slate-400">{activity.time}</p>
    </div>
    {activity.amount && (
      <div className="text-sm font-medium text-green-400">
        +${activity.amount.toLocaleString()}
      </div>
    )}
  </motion.div>
);

export default function SellerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={textStyles.h1}>
            Seller Dashboard
          </h1>
          <p className={textStyles.subtitle}>
            Manage your vehicle inventory and track sales performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button className="gradient-primary hover:opacity-90 glow-border">
            <Package className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="My Inventory"
          value={mockMetrics.inventoryCount}
          change="+3 this week"
          icon={Package}
          delay={0.1}
        />
        <MetricCard
          title="Pending Tasks"
          value={mockMetrics.pendingTasks}
          change="2 due today"
          icon={CheckSquare}
          delay={0.2}
        />
        <MetricCard
          title="Active Listings"
          value={mockMetrics.activeListings}
          change="+5 this month"
          icon={TrendingUp}
          delay={0.3}
        />
        <MetricCard
          title="Monthly Sales"
          value={`$${mockMetrics.monthlySales.toLocaleString()}`}
          change="+12.5% from last month"
          icon={DollarSign}
          delay={0.4}
        />
        <MetricCard
          title="Total Earnings"
          value={`$${mockMetrics.earnings.toLocaleString()}`}
          change="+8.2% this month"
          icon={TrendingUp}
          delay={0.5}
        />
        <MetricCard
          title="Response Rate"
          value={`${mockMetrics.responseRate}%`}
          change="Excellent"
          icon={MessageCircle}
          delay={0.6}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Sales Performance</CardTitle>
              <CardDescription className="text-slate-400">
                Revenue trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Sales chart will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-slate-400">
                Your latest sales, tasks, and inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockRecentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <Package className="h-6 w-6" />
                <span>Add Vehicle</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <CheckSquare className="h-6 w-6" />
                <span>View Tasks</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <MessageCircle className="h-6 w-6" />
                <span>Check Messages</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <BarChart3 className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
