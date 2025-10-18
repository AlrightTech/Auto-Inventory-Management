'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskTable } from '@/components/tasks/TaskTable';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import {
  CheckSquare,
  FileText,
  AlertTriangle,
  MapPin,
  Plus,
  Search,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

// Mock data for demonstration
const mockTaskCounts = {
  accountingToDo: 2,
  allTasks: 24,
  missingTitle: 8,
  fileArb: 3,
  location: 5,
};

const mockTasks = [
  {
    id: '1',
    task_name: 'Upload Title Document',
    vehicle_id: 'vehicle-1',
    assigned_to: 'admin-1',
    assigned_by: 'admin-1',
    due_date: '2024-10-20',
    notes: 'Upload title document for VIN123',
    category: 'missing_title' as const,
    status: 'pending' as const,
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-10-15T10:00:00Z',
    vehicle: {
      id: 'vehicle-1',
      make: 'Chevrolet',
      model: 'Silverado',
      year: 2021,
      vin: '1GCHK29U4XZ123456',
      status: 'pending',
      created_by: 'admin-1',
      created_at: '2024-10-15T10:00:00Z',
    },
    assigned_user: {
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'admin' as const,
      username: 'Admin User',
      created_at: '2024-10-01T00:00:00Z',
    },
  },
  {
    id: '2',
    task_name: 'File ARB Request',
    vehicle_id: 'vehicle-2',
    assigned_to: 'seller-1',
    assigned_by: 'admin-1',
    due_date: '2024-10-18',
    notes: 'File ARB request for vehicle VIN456',
    category: 'file_arb' as const,
    status: 'pending' as const,
    created_at: '2024-10-14T09:00:00Z',
    updated_at: '2024-10-14T09:00:00Z',
    vehicle: {
      id: 'vehicle-2',
      make: 'Ford',
      model: 'F-150',
      year: 2020,
      vin: '1FTFW1ET5DFC12345',
      status: 'pending',
      created_by: 'admin-1',
      created_at: '2024-10-14T09:00:00Z',
    },
    assigned_user: {
      id: 'seller-1',
      email: 'seller@example.com',
      role: 'seller' as const,
      username: 'Seller User',
      created_at: '2024-10-01T00:00:00Z',
    },
  },
  {
    id: '3',
    task_name: 'Update Vehicle Location',
    vehicle_id: 'vehicle-3',
    assigned_to: 'transporter-1',
    assigned_by: 'admin-1',
    due_date: '2024-10-17',
    notes: 'Update vehicle location to new storage facility',
    category: 'location' as const,
    status: 'completed' as const,
    created_at: '2024-10-13T08:00:00Z',
    updated_at: '2024-10-13T08:00:00Z',
    vehicle: {
      id: 'vehicle-3',
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      vin: '2HGFC2F59KH123456',
      status: 'completed',
      created_by: 'admin-1',
      created_at: '2024-10-13T08:00:00Z',
    },
    assigned_user: {
      id: 'transporter-1',
      email: 'transporter@example.com',
      role: 'transporter' as const,
      username: 'Transporter User',
      created_at: '2024-10-01T00:00:00Z',
    },
  },
];

const TaskCountCard = ({ 
  title, 
  count, 
  icon: Icon, 
  delay = 0 
}: {
  title: string;
  count: number;
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
            <p className="text-2xl font-bold text-white">{count}</p>
          </div>
          <Icon className="h-8 w-8 text-blue-400" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function TasksPage() {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterReset = () => {
    setFilters({
      category: '',
      status: '',
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
            Task Management
          </h1>
          <p className="text-slate-400 mt-1">
            Track and manage vehicle-related tasks across your team.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </motion.div>

      {/* Task Count Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <TaskCountCard
          title="Accounting To Do"
          count={mockTaskCounts.accountingToDo}
          icon={FileText}
          delay={0.1}
        />
        <TaskCountCard
          title="All Tasks"
          count={mockTaskCounts.allTasks}
          icon={CheckSquare}
          delay={0.2}
        />
        <TaskCountCard
          title="Missing Title"
          count={mockTaskCounts.missingTitle}
          icon={AlertTriangle}
          delay={0.3}
        />
        <TaskCountCard
          title="File an ARB"
          count={mockTaskCounts.fileArb}
          icon={FileText}
          delay={0.4}
        />
        <TaskCountCard
          title="Location"
          count={mockTaskCounts.location}
          icon={MapPin}
          delay={0.5}
        />
      </div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Filters & Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Search and filter tasks, or import/export data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by vehicle VIN, make, model, or task name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
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
            <div className="mt-4">
              <TaskFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Task List</CardTitle>
            <CardDescription className="text-slate-400">
              Showing {mockTasks.length} tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskTable tasks={mockTasks} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
    </div>
  );
}
