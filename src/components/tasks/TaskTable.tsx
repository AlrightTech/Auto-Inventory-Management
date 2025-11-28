'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, Clock, AlertCircle, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { formatDate, getTimeAgo, getStatusColor } from '@/lib/utils';
import { TaskWithRelations } from '@/types';
import { toast } from 'sonner';

interface TaskTableProps {
  tasks: TaskWithRelations[];
  onTaskUpdate?: (taskId: string, updates: { status?: string; notes?: string }) => void;
  onViewTask?: (task: TaskWithRelations) => void;
  onEditTask?: (task: TaskWithRelations) => void;
  onDeleteTask?: (taskId: string) => void;
  onRefresh?: () => void;
}

export function TaskTable({ tasks, onTaskUpdate, onViewTask, onEditTask, onDeleteTask, onRefresh }: TaskTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isBulkCompleting, setIsBulkCompleting] = useState(false);

  const handleTaskUpdate = (taskId: string, updates: { status?: string; notes?: string }) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, updates);
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
  };

  const handleBulkComplete = async () => {
    if (selectedTasks.length === 0) {
      toast.error('Please select at least one task');
      return;
    }

    setIsBulkCompleting(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds: selectedTasks,
          updates: { status: 'completed' }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tasks');
      }

      const { data, count } = await response.json();
      
      // Clear selected tasks
      setSelectedTasks([]);
      
      // Show success toast
      toast.success(`Tasks marked as completed.`);
      
      // Refresh the task list if refresh callback is provided
      if (onRefresh) {
        onRefresh();
      } else {
        // Fallback: reload the page if no refresh callback
        window.location.reload();
      }
    } catch (error) {
      console.error('Error bulk completing tasks:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mark tasks as completed');
    } finally {
      setIsBulkCompleting(false);
    }
  };

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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No tasks found</p>
          <p className="text-sm">Create your first task to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedTasks.length === tasks.length && tasks.length > 0}
            onChange={handleSelectAll}
            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-400">
            {selectedTasks.length > 0 ? `${selectedTasks.length} selected` : 'Select all'}
          </span>
        </div>
        
        {selectedTasks.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="task-action-btn"
              onClick={handleBulkComplete}
              disabled={isBulkCompleting}
              style={{ 
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              {isBulkCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Mark as Completed'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const daysRemaining = getDaysRemaining(task.due_date);
          const isSelected = selectedTasks.includes(task.id);
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 ${
                isSelected ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectTask(task.id)}
                      className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                    />
                    
                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-medium truncate">
                          {task.task_name}
                        </h3>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status}</span>
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {task.category}
                        </Badge>
                      </div>
                      
                      {/* Vehicle Info */}
                      {task.vehicle && (
                        <div className="text-sm text-slate-400 mb-2">
                          <span className="font-medium">Vehicle:</span> {task.vehicle.year} {task.vehicle.make} {task.vehicle.model}
                          {task.vehicle.vin && (
                            <span className="ml-2 text-slate-500">VIN: {task.vehicle.vin}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Assigned User */}
                      {task.assigned_user && (
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {task.assigned_user.username?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>Assigned to: {task.assigned_user.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side Info */}
                  <div className="flex items-center space-x-4 text-sm">
                    {/* Due Date */}
                    <div className="text-right">
                      <div className="text-slate-400">Due Date</div>
                      <div className="text-white">{formatDate(task.due_date, 'MMM dd, yyyy')}</div>
                      <div className={daysRemaining.color}>{daysRemaining.text}</div>
                    </div>
                    
                    {/* Created Date */}
                    <div className="text-right">
                      <div className="text-slate-400">Created</div>
                      <div className="text-white">{getTimeAgo(task.created_at)}</div>
                    </div>
                    
                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)',
                          color: 'var(--text)'
                        }}
                      >
                        <DropdownMenuItem 
                          style={{ color: 'var(--text)' }}
                          onClick={() => onViewTask && onViewTask(task)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          style={{ color: 'var(--text)' }}
                          onClick={() => onEditTask && onEditTask(task)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          style={{ color: 'var(--text)' }}
                          onClick={() => handleTaskUpdate(task.id, { status: 'completed' })}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          style={{ color: '#ef4444' }}
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                              onDeleteTask && onDeleteTask(task.id);
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}