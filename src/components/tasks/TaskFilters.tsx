'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { TaskFiltersState } from '@/types';

interface TaskFiltersProps {
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

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        from: date,
      },
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        to: date,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      assignedTo: 'all',
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  };

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.assignedTo !== 'all' || 
    filters.dateRange.from !== undefined || 
    filters.dateRange.to !== undefined;

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
              {Object.values(filters).filter(value => value !== '').length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="task-field-input" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="glass-card" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <SelectItem value="all">All categories</SelectItem>
                {taskCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-700">
                <SelectItem value="all">All statuses</SelectItem>
                {taskStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className="capitalize">{status}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Assigned To</Label>
            <Select
              value={filters.assignedTo}
              onValueChange={(value) => handleFilterChange('assignedTo', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-700">
                <SelectItem value="all">All users</SelectItem>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Due Date Range</Label>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal task-field-input"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, 'MMM dd') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card border-slate-700">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={handleDateFromChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal task-field-input"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, 'MMM dd') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card border-slate-700">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={handleDateToChange}
                    disabled={(date) => filters.dateRange.from ? date < filters.dateRange.from : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}