'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, Clock, AlertCircle, FileText, Calendar, User, Car, MessageSquare } from 'lucide-react';
import { TaskWithRelations } from '@/types';
import { formatDate, getTimeAgo } from '@/lib/utils';

interface ViewTaskModalProps {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewTaskModal({ task, isOpen, onClose }: ViewTaskModalProps) {
  if (!task) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-yellow-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-orange-400' };
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-400' };
    }
  };

  const daysRemaining = getDaysRemaining(task.due_date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            <FileText className="w-6 h-6 mr-2" />
            Task Details
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            View complete information about this task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Task Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {task.task_name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="flex items-center gap-1">
                  {getStatusIcon(task.status)}
                  <span className="capitalize">{task.status}</span>
                </Badge>
                <Badge variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--subtext)' }}>
                  {task.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Due Date Section */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <div>
                <div className="text-sm" style={{ color: 'var(--subtext)' }}>Due Date</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  {formatDate(task.due_date, 'MMMM dd, yyyy')}
                </div>
              </div>
            </div>
            <div className={`text-sm font-medium ${daysRemaining.color}`}>
              {daysRemaining.text}
            </div>
          </div>

          {/* Vehicle Information */}
          {task.vehicle && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Car className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Vehicle Information</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Vehicle:</span>
                  <span style={{ color: 'var(--text)' }}>
                    {task.vehicle.year} {task.vehicle.make} {task.vehicle.model}
                  </span>
                </div>
                {task.vehicle.vin && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--subtext)' }}>VIN:</span>
                    <span style={{ color: 'var(--text)' }}>{task.vehicle.vin}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Status:</span>
                  <Badge variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                    {task.vehicle.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Assigned User */}
          {task.assigned_user && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <div className="flex-1">
                  <div className="text-sm mb-1" style={{ color: 'var(--subtext)' }}>Assigned To</div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {task.assigned_user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text)' }}>
                        {task.assigned_user.username || 'Unknown User'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--subtext)' }}>
                        {task.assigned_user.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Notes</h4>
              </div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                {task.notes}
              </p>
            </div>
          )}

          {/* Task Metadata */}
          <div className="flex items-center justify-between text-xs pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--subtext)' }}>
              Created {getTimeAgo(task.created_at)}
            </div>
            {task.updated_at !== task.created_at && (
              <div style={{ color: 'var(--subtext)' }}>
                Last updated {getTimeAgo(task.updated_at)}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

