'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { TaskFiltersState } from '@/types';

interface TaskFiltersDebugProps {
  filters: TaskFiltersState;
  onFiltersChange: (filters: TaskFiltersState) => void;
}

const taskCategories = [
  'Missing Title',
  'File an ARB',
  'Location',
  'General',
  'Accounting',
  'Inspection',
];

const taskStatuses = [
  'pending',
  'completed',
  'cancelled',
];

const mockUsers = [
  { id: 'admin-1', username: 'Admin User', role: 'admin' },
  { id: 'seller-1', username: 'Seller User', role: 'seller' },
  { id: 'transporter-1', username: 'Transporter User', role: 'transporter' },
];

export function TaskFiltersDebug({ filters, onFiltersChange }: TaskFiltersDebugProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    console.log('Filter change:', key, value);
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {isExpanded && (
          <X className="w-4 h-4 ml-2" />
        )}
      </Button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 glass-card border-slate-700/50"
        >
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => {
                console.log('Category selected:', value);
                handleFilterChange('category', value);
              }}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-700">
                <SelectItem value="all">All categories</SelectItem>
                {taskCategories.map((category) => {
                  console.log('Rendering category:', category);
                  return (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => {
                console.log('Status selected:', value);
                handleFilterChange('status', value);
              }}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-700">
                <SelectItem value="all">All statuses</SelectItem>
                {taskStatuses.map((status) => {
                  console.log('Rendering status:', status);
                  return (
                    <SelectItem key={status} value={status}>
                      <span className="capitalize">{status}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Assigned To</Label>
            <Select
              value={filters.assignedTo}
              onValueChange={(value) => {
                console.log('Assigned to selected:', value);
                handleFilterChange('assignedTo', value);
              }}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-700">
                <SelectItem value="all">All users</SelectItem>
                {mockUsers.map((user) => {
                  console.log('Rendering user:', user);
                  return (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}
    </div>
  );
}
