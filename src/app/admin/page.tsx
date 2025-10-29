'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { EventWithRelations } from '@/types';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

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

// Mock data for charts
const salesData = [
  { date: '2024-01-01', sales: 120000 },
  { date: '2024-01-02', sales: 150000 },
  { date: '2024-01-03', sales: 180000 },
  { date: '2024-01-04', sales: 200000 },
  { date: '2024-01-05', sales: 220000 },
  { date: '2024-01-06', sales: 190000 },
  { date: '2024-01-07', sales: 250000 },
  { date: '2024-01-08', sales: 280000 },
  { date: '2024-01-09', sales: 300000 },
  { date: '2024-01-10', sales: 320000 },
  { date: '2024-01-11', sales: 290000 },
  { date: '2024-01-12', sales: 350000 },
  { date: '2024-01-13', sales: 380000 },
  { date: '2024-01-14', sales: 400000 },
  { date: '2024-01-15', sales: 420000 },
  { date: '2024-01-16', sales: 390000 },
  { date: '2024-01-17', sales: 450000 },
  { date: '2024-01-18', sales: 480000 },
  { date: '2024-01-19', sales: 500000 },
  { date: '2024-01-20', sales: 520000 },
  { date: '2024-01-21', sales: 490000 },
  { date: '2024-01-22', sales: 550000 },
  { date: '2024-01-23', sales: 580000 },
  { date: '2024-01-24', sales: 600000 },
  { date: '2024-01-25', sales: 620000 },
  { date: '2024-01-26', sales: 590000 },
  { date: '2024-01-27', sales: 650000 },
  { date: '2024-01-28', sales: 680000 },
  { date: '2024-01-29', sales: 700000 },
  { date: '2024-01-30', sales: 720000 },
];

const mockAuctions = [
  { name: 'Manheim', value: 165000, color: 'bg-blue-500' },
  { name: 'CarMax', value: 33150, color: 'bg-green-500' },
  { name: 'Adesa', value: 0, color: 'bg-yellow-500' },
  { name: 'Default Auction', value: 0, color: 'bg-purple-500' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

// Convert events to calendar format
const getCalendarEvents = (events: EventWithRelations[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return events
    .filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate >= today; // Only show future events
    })
    .map(event => {
      const [hours, minutes] = event.event_time.split(':').map(Number);
      const eventDate = new Date(event.event_date);
      const start = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), hours, minutes);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
      
      return {
        id: event.id,
        title: event.title,
        start,
        end,
        resource: event.assigned_user?.username || 'Unassigned'
      };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime()); // Sort by date ascending
};

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
}) => {
  // Calculate gauge percentage for visual effect
  const getGaugePercentage = () => {
    if (typeof value === 'number') {
      // Normalize large numbers to 0-100 range for gauge display
      if (value > 1000000) return Math.min((value / 1000000) * 20, 100);
      if (value > 1000) return Math.min((value / 1000) * 10, 100);
      return Math.min(value, 100);
    }
    return 50; // Default for string values
  };

  const gaugePercentage = getGaugePercentage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="dashboard-card neon-glow instrument-cluster group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="relative">
            <Icon className="h-4 w-4 text-primary group-hover:text-accent transition-colors duration-300" />
            {/* Mini gauge ring around icon */}
            <div className="absolute -inset-1 rounded-full border border-primary/20 group-hover:border-primary/40 transition-colors duration-300" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main gauge display */}
          <div className="flex items-center space-x-4">
            <div className="radial-gauge">
              <div className="gauge-value">
                {typeof value === 'number' ? Math.round(gaugePercentage) : '--'}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
              {change !== undefined && (
                <div className="flex items-center space-x-1 text-xs">
                  {change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                  <span className="text-muted-foreground">from last week</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar gauge */}
          <div className="gauge-progress">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${gaugePercentage}%` }}
              transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
              className="gauge-progress-bar"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalPurchases: 0,
    arbVehicles: 0,
    weeklyChange: {
      sales: 0,
      purchases: 0,
      arb: 0,
    },
  });
  const [auctions, setAuctions] = useState(mockAuctions);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load events and metrics from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            assigned_user:profiles!events_assigned_to_fkey(*),
            created_user:profiles!events_created_by_fkey(*)
          `)
          .order('event_date', { ascending: true });

        if (!eventsError && eventsData) {
          const eventsWithRelations: EventWithRelations[] = eventsData.map(event => ({
            id: event.id,
            title: event.title,
            event_date: event.event_date,
            event_time: event.event_time,
            assigned_to: event.assigned_to,
            created_by: event.created_by,
            notes: event.notes || '',
            status: event.status || 'scheduled',
            created_at: event.created_at,
            updated_at: event.updated_at,
            assigned_user: event.assigned_user || null,
            created_by_user: event.created_user || null,
          }));
          setEvents(eventsWithRelations);
        }

        // Load vehicle metrics
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Total Sales (sum of sale_invoice where status = 'Sold')
        const { data: soldVehicles, error: salesError } = await supabase
          .from('vehicles')
          .select('sale_invoice, created_at')
          .eq('status', 'Sold');

        // Sales from last week
        const { data: lastWeekSales } = await supabase
          .from('vehicles')
          .select('sale_invoice')
          .eq('status', 'Sold')
          .gte('created_at', oneWeekAgo.toISOString());

        const totalSales = soldVehicles?.reduce((sum, v) => sum + (Number(v.sale_invoice) || 0), 0) || 0;
        const lastWeekTotal = lastWeekSales?.reduce((sum, v) => sum + (Number(v.sale_invoice) || 0), 0) || 0;
        const previousWeekTotal = totalSales - lastWeekTotal;
        const salesChange = previousWeekTotal > 0 ? ((lastWeekTotal / previousWeekTotal) - 1) * 100 : 0;

        // Total Purchases (sum of bought_price + buy_fee)
        const { data: allVehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('bought_price, buy_fee, created_at');

        // Purchases from last week
        const { data: lastWeekPurchases } = await supabase
          .from('vehicles')
          .select('bought_price, buy_fee')
          .gte('created_at', oneWeekAgo.toISOString());

        const totalPurchases = allVehicles?.reduce((sum, v) => 
          sum + (Number(v.bought_price) || 0) + (Number(v.buy_fee) || 0), 0) || 0;
        const lastWeekPurchasesTotal = lastWeekPurchases?.reduce((sum, v) => 
          sum + (Number(v.bought_price) || 0) + (Number(v.buy_fee) || 0), 0) || 0;
        const previousWeekPurchasesTotal = totalPurchases - lastWeekPurchasesTotal;
        const purchasesChange = previousWeekPurchasesTotal > 0 
          ? ((lastWeekPurchasesTotal / previousWeekPurchasesTotal) - 1) * 100 : 0;

        // ARB Vehicles
        const { data: arbVehicles, error: arbError } = await supabase
          .from('vehicles')
          .select('id, created_at')
          .eq('status', 'ARB');

        // ARB from last week
        const { data: lastWeekArb } = await supabase
          .from('vehicles')
          .select('id')
          .eq('status', 'ARB')
          .gte('created_at', oneWeekAgo.toISOString());

        const arbCount = arbVehicles?.length || 0;
        const lastWeekArbCount = lastWeekArb?.length || 0;
        const previousWeekArbCount = arbCount - lastWeekArbCount;
        const arbChange = previousWeekArbCount > 0 
          ? ((lastWeekArbCount / previousWeekArbCount) - 1) * 100 : 0;

        // Auction breakdown
        const { data: auctionData } = await supabase
          .from('vehicles')
          .select('facilitating_location, sale_invoice')
          .eq('status', 'Sold');

        const auctionTotals: Record<string, number> = {};
        auctionData?.forEach(v => {
          const location = v.facilitating_location || 'Unknown';
          const amount = Number(v.sale_invoice) || 0;
          auctionTotals[location] = (auctionTotals[location] || 0) + amount;
        });

        const updatedAuctions = mockAuctions.map(auction => ({
          ...auction,
          value: auctionTotals[auction.name] || 0,
        }));

        setMetrics({
          totalSales,
          totalPurchases,
          arbVehicles: arbCount,
          weeklyChange: {
            sales: Number(salesChange.toFixed(1)),
            purchases: Number(purchasesChange.toFixed(1)),
            arb: Number(arbChange.toFixed(1)),
          },
        });
        setAuctions(updatedAuctions);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  // Calculate dynamic event statistics
  const getEventStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalEvents = events.length;
    const scheduledEvents = events.filter(e => e.status === 'scheduled').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const thisWeekEvents = events.filter(e => {
      const eventDate = new Date(e.event_date);
      return eventDate >= today && eventDate <= weekFromNow;
    }).length;

    return {
      totalEvents,
      scheduledEvents,
      completedEvents,
      thisWeekEvents
    };
  };

  const eventStats = getEventStats();

  const handleSelectEvent = (event: any) => {
    // This would open an event details modal
    console.log('Selected event:', event);
    // In a real implementation, this would open the event details modal
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here&apos;s what&apos;s happening with your inventory.
          </p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={formatCurrency(metrics.totalSales)}
          change={metrics.weeklyChange.sales}
          icon={DollarSign}
          delay={0.1}
        />
        <MetricCard
          title="Total Purchases"
          value={formatCurrency(metrics.totalPurchases)}
          change={metrics.weeklyChange.purchases}
          icon={ShoppingCart}
          delay={0.2}
        />
        <MetricCard
          title="ARB Vehicles"
          value={metrics.arbVehicles}
          change={metrics.weeklyChange.arb}
          icon={AlertTriangle}
          delay={0.3}
        />
        <MetricCard
          title="Total Events"
          value={isLoading ? "..." : eventStats.totalEvents.toString()}
          change={undefined}
          icon={Calendar}
          delay={0.4}
        />
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-slate-700/50 glow-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : eventStats.scheduledEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-400 glow-text" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card border-slate-700/50 glow-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : eventStats.completedEvents}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400 glow-text" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card border-slate-700/50 glow-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : eventStats.thisWeekEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-400 glow-text" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Sales']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                {auctions.map((auction) => (
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

      {/* Upcoming Events - Card Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Events
            </CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Your scheduled events and appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                Loading events...
              </div>
            ) : getCalendarEvents(events).length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming events scheduled</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCalendarEvents(events).slice(0, 6).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="dashboard-card neon-glow p-4 hover:shadow-[0_0_25px_rgba(0,191,255,0.3)] transition-all duration-300 cursor-pointer"
                    onClick={() => handleSelectEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                        {event.title}
                      </h3>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                    </div>
                    <div className="space-y-1" style={{ color: 'var(--subtext)' }}>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(event.start), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(event.start), 'h:mm a')}
                      </div>
                      {event.resource && (
                        <div className="flex items-center text-sm">
                          <span className="mr-2">👤</span>
                          {event.resource}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
