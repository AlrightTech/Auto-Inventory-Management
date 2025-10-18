'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { CheckSquare, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskWithRelations, TaskFiltersState } from '@/types';

// Mock data for demonstration
const mockTasks: TaskWithRelations[] = [
  {
    id: '1',
    vehicle_id: 'v1',
    task_name: 'Vehicle pickup coordination',
    due_date: '2024-10-20',
    notes: 'Coordinate with seller for vehicle pickup at the specified location',
    assigned_to: 'transporter-1',
    assigned_by: 'admin-1',
    category: 'location',
    status: 'pending',
    created_at: '2024-10-17T10:00:00Z',
    updated_at: '2024-10-17T10:00:00Z',
    vehicle: {
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'JTDKN3D27L3000001',
      color: 'Silver',
      mileage: 45000,
      price: 22500,
      status: 'available',
      notes: 'Well-maintained, single owner.',
      created_by: 'seller-1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-09-01T11:00:00Z',
    },
    assigned_user: {
      id: 'transporter-1',
      email: 'transporter@example.com',
      username: 'You',
      role: 'transporter',
      isOnline: true,
      lastSeen: null,
      created_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '2',
    vehicle_id: 'v2',
    task_name: 'Vehicle inspection and documentation',
    due_date: '2024-10-18',
    notes: 'Perform thorough inspection and document any issues found',
    assigned_to: 'transporter-1',
    assigned_by: 'admin-1',
    category: 'general',
    status: 'completed',
    created_at: '2024-10-16T09:00:00Z',
    updated_at: '2024-10-17T14:30:00Z',
    vehicle: {
      id: 'v2',
      make: 'Honda',
      model: 'Civic',
      year: 2018,
      vin: '3HGFC2F59KH100002',
      color: 'Blue',
      mileage: 60000,
      price: 18000,
      status: 'pending',
      notes: 'Minor dent on rear bumper.',
      created_by: 'seller-1',
      created_at: '2024-02-20T12:00:00Z',
      updated_at: '2024-09-05T14:00:00Z',
    },
    assigned_user: {
      id: 'transporter-1',
      email: 'transporter@example.com',
      username: 'You',
      role: 'transporter',
      isOnline: true,
      lastSeen: null,
      created_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '3',
    vehicle_id: 'v3',
    task_name: 'Delivery confirmation',
    due_date: '2024-10-22',
    notes: 'Confirm successful delivery and obtain customer signature',
    assigned_to: 'transporter-1',
    assigned_by: 'admin-1',
    category: 'general',
    status: 'pending',
    created_at: '2024-10-17T11:00:00Z',
    updated_at: '2024-10-17T11:00:00Z',
    vehicle: {
      id: 'v3',
      make: 'Ford',
      model: 'F-150',
      year: 2022,
      vin: '1FTFW1ET5NFC00003',
      color: 'Black',
      mileage: 15000,
      price: 45000,
      status: 'available',
      notes: 'Heavy duty package, low mileage.',
      created_by: 'seller-1',
      created_at: '2024-03-10T09:00:00Z',
      updated_at: '2024-09-10T10:00:00Z',
    },
    assigned_user: {
      id: 'transporter-1',
      email: 'transporter@example.com',
      username: 'You',
      role: 'transporter',
      isOnline: true,
      lastSeen: null,
      created_at: '2024-01-01T00:00:00Z',
    },
  },
];

const TaskCountCard = ({ title, value, icon: Icon, delay = 0 }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="glass-card hover-glow transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-blue-400" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function TransporterTasksPage() {
  const [tasks] = useState<TaskWithRelations[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersState>({
    status: '',
    category: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesCategory = !filters.category || task.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'pending' && new Date(t.due_date) < new Date()).length,
  };

  const handleFiltersChange = (newFilters: TaskFiltersState) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
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
            View and manage tasks assigned to you
          </p>
        </div>
      </motion.div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TaskCountCard title="Total Tasks" value={taskStats.total} icon={CheckSquare} delay={0.1} />
        <TaskCountCard title="Pending" value={taskStats.pending} icon={CheckSquare} delay={0.2} />
        <TaskCountCard title="Completed" value={taskStats.completed} icon={CheckSquare} delay={0.3} />
        <TaskCountCard title="Overdue" value={taskStats.overdue} icon={CheckSquare} delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card border-slate-700/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <TaskFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          )}

          <TaskTable tasks={filteredTasks} />
        </Card>
      </motion.div>
    </div>
  );
}
