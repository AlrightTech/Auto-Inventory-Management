'use client';

import { useState, useEffect } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createClient } from '@/lib/supabase/client';
import { EventWithRelations } from '@/types';
import { MessageCircle, Clock } from 'lucide-react';
import { textStyles } from '@/lib/typography';

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

const localizer = momentLocalizer(moment);

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
    <Card className="glass-card hover:shadow-audi-glow transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-audi-text-light/80 dark:text-audi-text-dark/80 font-inter">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-audi-neon glow-text group-hover:animate-glow" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-audi-text-light dark:text-audi-text-dark font-poppins">{value}</div>
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
            <span className="text-audi-text-light/60 dark:text-audi-text-dark/60">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data: eventsData, error } = await supabase
          .from('events')
          .select(`
            *,
            assigned_user:profiles!events_assigned_to_fkey(*),
            created_user:profiles!events_created_by_fkey(*)
          `)
          .order('event_date', { ascending: true });

        if (error) {
          console.error('Error loading events:', error);
          return;
        }

        if (eventsData) {
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
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [supabase]);

  // Load recent messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(*),
            receiver:profiles!messages_receiver_id_fkey(*)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        if (messagesData) {
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
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

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // This would open an event creation modal
    console.log('Selected slot:', { start, end });
    // In a real implementation, this would open the event creation modal
  };

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
        <div>
          <h1 className="text-3xl font-bold text-audi-text-light dark:text-audi-text-dark font-poppins glow-text">
            Dashboard Overview
          </h1>
          <p className="text-audi-text-light/70 dark:text-audi-text-dark/70 mt-1 font-inter">
            Welcome back! Here&apos;s what&apos;s happening with your inventory.
          </p>
        </div>
        <Button className="gradient-primary hover:opacity-90 glow-border animate-glow">
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
                  <p className={textStyles.subtitle}>Scheduled</p>
                  <p className={textStyles.cardValue}>
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
                  <p className={textStyles.subtitle}>Completed</p>
                  <p className={textStyles.cardValue}>
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
                  <p className={textStyles.subtitle}>This Week</p>
                  <p className={textStyles.cardValue}>
                    {isLoading ? "..." : eventStats.thisWeekEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-400 glow-text" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Messages Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
              Recent Messages
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest conversations and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent messages</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {message.sender?.username?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {message.sender?.username || 'Unknown User'}
                        </p>
                        <div className="flex items-center text-xs text-slate-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 truncate mt-1">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
            <div className="h-96">
              <BigCalendar
                localizer={localizer}
                events={getCalendarEvents(events)}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                style={{ height: '100%' }}
                className="calendar-dark"
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: '#3B82F6',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px',
                    padding: '2px 4px'
                  }
                })}
                dayPropGetter={(date) => ({
                  style: {
                    backgroundColor: date.getDay() === 0 || date.getDay() === 6 ? '#1F2937' : '#111827'
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
