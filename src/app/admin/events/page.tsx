'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventTable } from '@/components/events/EventTable';
import { EventModal } from '@/components/events/EventModal';
import {
  Calendar,
  Plus,
  Search,
  RotateCcw,
  Clock,
  User,
} from 'lucide-react';

// Mock data for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Inspection Day',
    event_date: '2024-10-20',
    event_time: '09:00',
    assigned_to: 'admin-1',
    created_by: 'admin-1',
    notes: 'Vehicle inspection for VIN123',
    status: 'scheduled' as const,
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Car Mela',
    event_date: '2024-10-25',
    event_time: '14:00',
    assigned_to: 'seller-1',
    created_by: 'admin-1',
    notes: 'Annual car exhibition event',
    status: 'scheduled' as const,
    created_at: '2024-10-16T11:00:00Z',
    updated_at: '2024-10-16T11:00:00Z',
  },
  {
    id: '3',
    title: 'Auction Review',
    event_date: '2024-10-22',
    event_time: '16:30',
    assigned_to: 'transporter-1',
    created_by: 'admin-1',
    notes: 'Review auction results and pricing',
    status: 'scheduled' as const,
    created_at: '2024-10-17T09:00:00Z',
    updated_at: '2024-10-17T09:00:00Z',
  },
];

export default function EventsPage() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterReset = () => {
    setFilters({
      assignedTo: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchTerm('');
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
            Event Management
          </h1>
          <p className="text-slate-400 mt-1">
            Schedule and manage events, inspections, and important dates.
          </p>
        </div>
        <Button 
          onClick={() => setIsEventModalOpen(true)}
          className="gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card hover-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Events</p>
                  <p className="text-2xl font-bold text-white">{mockEvents.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card hover-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">This Week</p>
                  <p className="text-2xl font-bold text-white">2</p>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card hover-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Assigned Users</p>
                  <p className="text-2xl font-bold text-white">3</p>
                </div>
                <User className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Filters & Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Search events and filter by date or assigned user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by event title or VIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleFilterReset}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Assigned To Filter */}
              <div className="space-y-2">
                <label className="text-slate-300 text-sm">Assigned To</label>
                <select 
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                  className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500/20"
                >
                  <option value="">All Users</option>
                  <option value="admin">Admin User</option>
                  <option value="seller">Seller User</option>
                  <option value="transporter">Transporter User</option>
                </select>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <label className="text-slate-300 text-sm">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <label className="text-slate-300 text-sm">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Event List</CardTitle>
            <CardDescription className="text-slate-400">
              Showing {mockEvents.length} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventTable events={mockEvents} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Modal */}
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </div>
  );
}
