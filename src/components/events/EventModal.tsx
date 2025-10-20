'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { eventSchema, type EventInput } from '@/lib/validations/events';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { User as UserType } from '@/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Omit<EventInput, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function EventModal({ isOpen, onClose, onSubmit }: EventModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
  });

  // Load users from database
  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        try {
          setIsLoadingUsers(true);
          const { data: usersData, error } = await supabase
            .from('profiles')
            .select('*')
            .order('username', { ascending: true });

          if (error) {
            console.error('Error loading users:', error);
            return;
          }

          if (usersData) {
            const usersWithStatus: UserType[] = usersData.map(user => ({
              id: user.id,
              email: user.email || '',
              username: user.username || user.email?.split('@')[0] || 'User',
              role: user.role,
              isOnline: false, // Default to false, will be updated by presence
              lastSeen: null,
              created_at: user.created_at,
            }));
            setUsers(usersWithStatus);
          }
        } catch (error) {
          console.error('Error loading users:', error);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      loadUsers();
    }
  }, [isOpen, supabase]);

  const handleFormSubmit = async (data: EventInput) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="glass-card-strong border-slate-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                Create New Event
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Schedule a new event, inspection, or important date.
              </DialogDescription>
            </DialogHeader>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-200 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Event Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Inspection Day, Car Mela, Auction Review"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm">{errors.title.message}</p>
                )}
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="event_date" className="text-slate-200 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Date * (dd-mm-yyyy)
                </Label>
                <Input
                  id="event_date"
                  type="date"
                  className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register('event_date')}
                />
                {errors.event_date && (
                  <p className="text-red-400 text-sm">{errors.event_date.message}</p>
                )}
              </div>

              {/* Event Time */}
              <div className="space-y-2">
                <Label htmlFor="event_time" className="text-slate-200 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Event Time * (hh:mm AM/PM)
                </Label>
                <Input
                  id="event_time"
                  type="time"
                  className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register('event_time')}
                />
                {errors.event_time && (
                  <p className="text-red-400 text-sm">{errors.event_time.message}</p>
                )}
              </div>

              {/* Assign to User */}
              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-slate-200 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Assign to User
                </Label>
                <Select onValueChange={(value) => setValue('assigned_to', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user to assign this event"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {isLoadingUsers ? (
                      <SelectItem value="loading" disabled className="text-slate-400">
                        Loading users...
                      </SelectItem>
                    ) : users.length === 0 ? (
                      <SelectItem value="no-users" disabled className="text-slate-400">
                        No users available
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          className="text-white hover:bg-slate-700"
                        >
                          {user.username} ({user.role})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gradient-primary hover:opacity-90"
                >
                  {isLoading ? 'Creating...' : 'Save Event'}
                </Button>
              </div>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
