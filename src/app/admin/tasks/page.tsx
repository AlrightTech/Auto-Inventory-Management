'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskTable } from '@/components/tasks/TaskTable';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { ViewTaskModal } from '@/components/tasks/ViewTaskModal';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { toast } from 'sonner';
import {
  CheckSquare,
  FileText,
  AlertTriangle,
  MapPin,
  Plus,
  Search,
  Download,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TaskWithRelations, TaskFiltersState } from '@/types';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithRelations[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TaskFiltersState>({
    status: 'all',
    category: 'all',
    assignedTo: 'all',
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });
  const [taskCounts, setTaskCounts] = useState({
    accountingToDo: 0,
    allTasks: 0,
    missingTitle: 0,
    fileArb: 0,
    location: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Load tasks from database
  useEffect(() => {
    
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data: tasksData, error } = await supabase
          .from('tasks')
          .select(`
            *,
            vehicle:vehicles(*),
            assigned_user:profiles!tasks_assigned_to_fkey(*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading tasks:', error);
          setError('Failed to load tasks. Please try again.');
          return;
        }

        if (tasksData) {
          const tasksWithRelations: TaskWithRelations[] = tasksData.map(task => ({
            id: task.id,
            task_name: task.task_name,
            vehicle_id: task.vehicle_id,
            assigned_to: task.assigned_to,
            assigned_by: task.assigned_by,
            due_date: task.due_date,
            notes: task.notes,
            category: task.category,
            status: task.status,
            created_at: task.created_at,
            updated_at: task.updated_at,
            vehicle: task.vehicle ? {
              id: task.vehicle.id,
              make: task.vehicle.make,
              model: task.vehicle.model,
              year: task.vehicle.year,
              vin: task.vehicle.vin,
              status: task.vehicle.status,
              created_by: task.vehicle.created_by,
              created_at: task.vehicle.created_at,
            } : undefined,
            assigned_user: task.assigned_user ? {
              id: task.assigned_user.id,
              email: task.assigned_user.email,
              username: task.assigned_user.username || task.assigned_user.email.split('@')[0],
              role: task.assigned_user.role,
              isOnline: false,
              lastSeen: null,
              created_at: task.assigned_user.created_at,
            } : undefined,
          }));

          setTasks(tasksWithRelations);
          setFilteredTasks(tasksWithRelations);

          // Calculate task counts
          const counts = {
            accountingToDo: tasksWithRelations.filter(t => t.category === 'accounting' && t.status === 'pending').length,
            allTasks: tasksWithRelations.length,
            missingTitle: tasksWithRelations.filter(t => t.category === 'missing_title' && t.status === 'pending').length,
            fileArb: tasksWithRelations.filter(t => t.category === 'file_arb' && t.status === 'pending').length,
            location: tasksWithRelations.filter(t => t.category === 'location' && t.status === 'pending').length,
          };
          setTaskCounts(counts);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setError('Failed to load tasks. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [supabase]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.vehicle?.vin?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Apply assigned to filter
    if (filters.assignedTo !== 'all') {
      filtered = filtered.filter(task => task.assigned_to === filters.assignedTo);
    }

    // Apply date range filter
    if (filters.dateRange.from && filters.dateRange.to) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= filters.dateRange.from! && taskDate <= filters.dateRange.to!;
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filters]);

  const handleAddTask = async (taskData: {
    task_name: string;
    vehicle_id: string;
    assigned_to: string;
    assigned_by: string;
    due_date: string;
    notes?: string;
    category: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          task_name: taskData.task_name,
          vehicle_id: taskData.vehicle_id,
          assigned_to: taskData.assigned_to,
          assigned_by: taskData.assigned_by,
          due_date: taskData.due_date,
          notes: taskData.notes,
          category: taskData.category,
          status: 'pending',
        })
        .select(`
          *,
          vehicle:vehicles(*),
          assigned_user:profiles!tasks_assigned_to_fkey(*)
        `)
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return;
      }

      if (data) {
        const newTask: TaskWithRelations = {
          id: data.id,
          task_name: data.task_name,
          vehicle_id: data.vehicle_id,
          assigned_to: data.assigned_to,
          assigned_by: data.assigned_by,
          due_date: data.due_date,
          notes: data.notes,
          category: data.category,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
          vehicle: data.vehicle ? {
            id: data.vehicle.id,
            make: data.vehicle.make,
            model: data.vehicle.model,
            year: data.vehicle.year,
            vin: data.vehicle.vin,
            status: data.vehicle.status,
            created_by: data.vehicle.created_by,
            created_at: data.vehicle.created_at,
          } : undefined,
          assigned_user: data.assigned_user ? {
            id: data.assigned_user.id,
            email: data.assigned_user.email,
            username: data.assigned_user.username || data.assigned_user.email.split('@')[0],
            role: data.assigned_user.role,
            isOnline: false,
            lastSeen: null,
            created_at: data.assigned_user.created_at,
          } : undefined,
        };

        setTasks(prev => [newTask, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleFiltersChange = (newFilters: TaskFiltersState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      assignedTo: 'all',
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
    setSearchTerm('');
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Task ID', 'Task Name', 'Vehicle', 'Assigned To', 'Due Date', 'Category', 'Status', 'Notes'],
      ...filteredTasks.map(task => [
        task.id,
        task.task_name,
        task.vehicle ? `${task.vehicle.year} ${task.vehicle.make} ${task.vehicle.model}` : 'N/A',
        task.assigned_user?.username || 'Unassigned',
        task.due_date,
        task.category,
        task.status,
        task.notes || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <p className="text-slate-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Task Management
          </h1>
          <p style={{ color: 'var(--subtext)' }}>
            Track and manage vehicle-related tasks across all users
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="control-panel neon-glow"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: '25px',
            fontWeight: '500',
            transition: '0.3s'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 191, 255, 0.2)' }}>
                <CheckSquare className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--subtext)' }}>Accounting To Do</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{taskCounts.accountingToDo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                <FileText className="w-5 h-5" style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--subtext)' }}>All Tasks</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{taskCounts.allTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--subtext)' }}>Missing Title</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{taskCounts.missingTitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                <FileText className="w-5 h-5" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--subtext)' }}>File ARB</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{taskCounts.fileArb}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                <MapPin className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--subtext)' }}>Location</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{taskCounts.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search tasks, vehicles, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <TaskFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Task Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Tasks ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskTable
              tasks={filteredTasks}
              onTaskUpdate={async (taskId, updates) => {
                try {
                  const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                  });

                  if (!response.ok) throw new Error('Failed to update task');

                  const { data } = await response.json();
                  setTasks(prev => prev.map(task => 
                    task.id === taskId ? {
                      ...task,
                      ...data,
                    } : task
                  ));
                  toast.success('Task updated successfully!');
                } catch (error) {
                  toast.error('Failed to update task');
                }
              }}
              onViewTask={(task) => {
                setSelectedTask(task);
                setIsViewModalOpen(true);
              }}
              onEditTask={(task) => {
                setSelectedTask(task);
                setIsEditModalOpen(true);
              }}
              onDeleteTask={async (taskId) => {
                try {
                  const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE',
                  });

                  if (!response.ok) throw new Error('Failed to delete task');

                  setTasks(prev => prev.filter(task => task.id !== taskId));
                  toast.success('Task deleted successfully!');
                } catch (error) {
                  toast.error('Failed to delete task');
                }
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
      />

      {/* View Task Modal */}
      <ViewTaskModal
        task={selectedTask}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={async () => {
          // Reload tasks
          const { data: tasksData, error } = await supabase
            .from('tasks')
            .select(`
              *,
              vehicle:vehicles(*),
              assigned_user:profiles!tasks_assigned_to_fkey(*)
            `)
            .order('created_at', { ascending: false });

          if (!error && tasksData) {
            const tasksWithRelations: TaskWithRelations[] = tasksData.map(task => ({
              id: task.id,
              task_name: task.task_name,
              vehicle_id: task.vehicle_id,
              assigned_to: task.assigned_to,
              assigned_by: task.assigned_by,
              due_date: task.due_date,
              notes: task.notes,
              category: task.category,
              status: task.status,
              created_at: task.created_at,
              updated_at: task.updated_at,
              vehicle: task.vehicle ? {
                id: task.vehicle.id,
                make: task.vehicle.make,
                model: task.vehicle.model,
                year: task.vehicle.year,
                vin: task.vehicle.vin,
                status: task.vehicle.status,
                created_by: task.vehicle.created_by,
                created_at: task.vehicle.created_at,
              } : undefined,
              assigned_user: task.assigned_user ? {
                id: task.assigned_user.id,
                email: task.assigned_user.email,
                username: task.assigned_user.username || task.assigned_user.email.split('@')[0],
                role: task.assigned_user.role,
                isOnline: false,
                lastSeen: null,
                created_at: task.assigned_user.created_at,
              } : undefined,
            }));
            setTasks(tasksWithRelations);
            setFilteredTasks(tasksWithRelations);
          }
        }}
      />
    </div>
  );
}