'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { EventWithRelations } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';

interface EventTableProps {
  events: EventWithRelations[];
  onViewDetails: (event: EventWithRelations) => void;
  onEditEvent: (event: EventWithRelations) => void;
  onDeleteEvent: (event: EventWithRelations) => void;
}

export function EventTable({ events, onViewDetails, onEditEvent, onDeleteEvent }: EventTableProps) {
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

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-300 font-medium">Event Date</th>
              <th className="text-left p-4 text-slate-300 font-medium">Event</th>
              <th className="text-left p-4 text-slate-300 font-medium">Time</th>
              <th className="text-left p-4 text-slate-300 font-medium">User Name</th>
              <th className="text-left p-4 text-slate-300 font-medium">Status</th>
              <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => {
              const eventStatus = getEventStatus(event.event_date, event.event_time);
              
              return (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">
                        {formatDate(event.event_date)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">
                      {event.title}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        {formatTime(event.event_time)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        {event.assigned_user?.username || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="outline" 
                      className={`${eventStatus.color} border-current`}
                    >
                      {eventStatus.label}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card-strong border-slate-700">
                        <DropdownMenuItem 
                          onClick={() => onViewDetails(event)}
                          className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onEditEvent(event)}
                          className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteEvent(event)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No events found</h3>
          <p className="text-slate-400">Create your first event to get started.</p>
        </motion.div>
      )}

      {/* Pagination */}
      {events.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-slate-400">
            Showing 1 to {events.length} of {events.length} events
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              1
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
