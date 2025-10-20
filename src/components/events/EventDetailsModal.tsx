'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText, X } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { EventWithRelations } from '@/types';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventWithRelations | null;
}

export function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  if (!event) return null;

  const getEventStatus = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const now = new Date();
    const diffTime = eventDateTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'past', color: 'text-slate-400', label: 'Past' };
    if (diffDays === 0) return { status: 'today', color: 'text-orange-400', label: 'Today' };
    if (diffDays <= 3) return { status: 'upcoming', color: 'text-yellow-400', label: 'Upcoming' };
    return { status: 'future', color: 'text-green-400', label: 'Future' };
  };

  const eventStatus = getEventStatus(event.event_date, event.event_time);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="glass-card-strong border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-400" />
                Event Details
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                View complete information about this event
              </DialogDescription>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium">Event Title</label>
                <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-white text-lg font-medium">{event.title}</span>
                </div>
              </div>

              {/* Event Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-medium">Event Date</label>
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{formatDate(event.event_date)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-medium">Event Time</label>
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{formatTime(event.event_time)}</span>
                  </div>
                </div>
              </div>

              {/* Assigned User */}
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium">Assigned To</label>
                <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-white">
                    {event.assigned_user?.username || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium">Status</label>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${eventStatus.color} border-current`}
                  >
                    {eventStatus.label}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-blue-400 border-blue-400"
                  >
                    {event.status || 'Scheduled'}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {event.notes && (
                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-medium">Notes</label>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                    <p className="text-white">{event.notes}</p>
                  </div>
                </div>
              )}

              {/* Created/Updated Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs">Created</label>
                  <p className="text-slate-300 text-sm">
                    {formatDate(event.created_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs">Last Updated</label>
                  <p className="text-slate-300 text-sm">
                    {formatDate(event.updated_at)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
