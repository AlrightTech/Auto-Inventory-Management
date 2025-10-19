'use client';

import { useState, useEffect } from 'react';
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
import { createClient } from '@/lib/supabase/client';
import { Event } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Load events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
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
          setError('Failed to load events. Please try again.');
          return;
        }

        if (eventsData) {
          const eventsWithRelations: Event[] = eventsData.map(event => ({
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
          }));
          setEvents(eventsWithRelations);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setError('Failed to load events. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [supabase]);

  // Apply search filter
  useEffect(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const handleAddEvent = async (eventData: {
    title: string;
    event_date: string;
    event_time: string;
    assigned_to: string;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('events').insert({
        title: eventData.title,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        assigned_to: eventData.assigned_to,
        created_by: user.id,
        notes: eventData.notes || '',
        status: 'scheduled',
      });

      if (error) {
        console.error('Error creating event:', error);
        return;
      }

      // Reload events
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          assigned_user:profiles!events_assigned_to_fkey(*),
          created_user:profiles!events_created_by_fkey(*)
        `)
        .order('event_date', { ascending: true });

      if (eventsData) {
        const eventsWithRelations: Event[] = eventsData.map(event => ({
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
        }));
        setEvents(eventsWithRelations);
      }

      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        return;
      }

      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

      if (error) {
        console.error('Error updating event:', error);
        return;
      }

      setEvents(events.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      ));
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="gradient-primary hover:opacity-90"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">Event Management</h1>
          <p className="text-slate-400 mt-1">Schedule and manage events across the platform</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="glass-card-strong border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-white">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-strong border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Scheduled</p>
                <p className="text-2xl font-bold text-white">
                  {events.filter(e => e.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-strong border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {events.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-strong border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">This Week</p>
                <p className="text-2xl font-bold text-white">
                  {events.filter(e => {
                    const eventDate = new Date(e.event_date);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return eventDate >= now && eventDate <= weekFromNow;
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-strong border-slate-700/50 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search events by title or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </motion.div>

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <EventTable
          events={filteredEvents}
          onDelete={handleDeleteEvent}
          onUpdate={handleUpdateEvent}
        />
      </motion.div>

      {/* Add Event Modal */}
      <EventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEvent}
      />
    </div>
  );
}