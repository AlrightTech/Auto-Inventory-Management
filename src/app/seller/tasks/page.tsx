'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import {
  CheckSquare,
  FileText,
  AlertTriangle,
  MapPin,
  Search,
  Download,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TaskWithRelations, TaskFiltersState } from '@/types';
import { toast } from 'sonner';

export default function SellerTasksPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithRelations[]>([]);
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
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const supabase = createClient();

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadCurrentUser();
  }, [supabase]);

  // Load tasks assigned to current user
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const { data: tasksData, error } = await supabase
          .from('tasks')
          .select(`
            *,
            vehicle:vehicles(*),
            assigned_user:profiles!tasks_assigned_to_fkey(*)
          `)
          .eq('assigned_to', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading tasks:', error);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [currentUser, supabase]);

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

    // Apply date range filter
    if (filters.dateRange.from && filters.dateRange.to) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= filters.dateRange.from! && taskDate <= filters.dateRange.to!;
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filters]);

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

  // Helper function to escape CSV values
  const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCSV = () => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }

    try {
      const headers = ['Task ID', 'Task Name', 'Vehicle', 'Due Date', 'Category', 'Status', 'Notes'];
      const csvRows = [
        headers.map(escapeCsvValue).join(','),
        ...filteredTasks.map(task => [
          task.id,
          task.task_name,
          task.vehicle ? `${task.vehicle.year} ${task.vehicle.make} ${task.vehicle.model}` : 'N/A',
          task.due_date,
          task.category || '',
          task.status,
          task.notes || '',
        ].map(escapeCsvValue).join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-tasks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${filteredTasks.length} tasks to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: { status?: string; notes?: string }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          ...updates,
          status: updates.status as 'pending' | 'completed' | 'cancelled' || task.status
        } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

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
            My Tasks
          </h1>
          <p className="text-slate-400 mt-1">
            Tasks assigned to you by admin
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <Card className="glass-card glow-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Accounting To Do</p>
                <p className="text-2xl font-bold text-white">{taskCounts.accountingToDo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glow-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">All Tasks</p>
                <p className="text-2xl font-bold text-white">{taskCounts.allTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glow-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Missing Title</p>
                <p className="text-2xl font-bold text-white">{taskCounts.missingTitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glow-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">File ARB</p>
                <p className="text-2xl font-bold text-white">{taskCounts.fileArb}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glow-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Location</p>
                <p className="text-2xl font-bold text-white">{taskCounts.location}</p>
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
              placeholder="Search your tasks..."
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
            <CardTitle className="text-white">Your Tasks ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskTable
              tasks={filteredTasks}
              onTaskUpdate={handleTaskUpdate}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}