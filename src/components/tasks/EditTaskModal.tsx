'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { taskSchema, type TaskInput } from '@/lib/validations/tasks';
import { createClient } from '@/lib/supabase/client';
import { Vehicle, User, TaskWithRelations } from '@/types';
import { toast } from 'sonner';

interface EditTaskModalProps {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const taskCategories = [
  { value: 'missing_title', label: 'Missing Title' },
  { value: 'file_arb', label: 'File an ARB' },
  { value: 'location', label: 'Location' },
  { value: 'general', label: 'General' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'inspection', label: 'Inspection' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function EditTaskModal({ task, isOpen, onClose, onTaskUpdated }: EditTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
  });

  const selectedVehicleId = watch('vehicle_id');
  const selectedCategory = watch('category');
  const selectedStatus = watch('status');

  // Load data and set form values when task changes
  useEffect(() => {
    const loadData = async () => {
      if (!task) return;

      try {
        // Load vehicles
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
        if (vehiclesData) setVehicles(vehiclesData);

        // Load users
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (usersData) {
          const usersWithStatus: User[] = usersData.map(user => ({
            id: user.id,
            email: user.email,
            username: user.username || user.email.split('@')[0],
            role: user.role,
            isOnline: false,
            lastSeen: null,
            created_at: user.created_at,
          }));
          setUsers(usersWithStatus);
        }

        // Set form values from task
        reset({
          task_name: task.task_name,
          vehicle_id: task.vehicle_id || '',
          assigned_to: task.assigned_to || '',
          due_date: task.due_date,
          notes: task.notes || '',
          category: task.category || 'general',
          status: task.status || 'pending',
        });

        // Set date
        if (task.due_date) {
          setSelectedDate(new Date(task.due_date));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (isOpen && task) {
      loadData();
    }
  }, [isOpen, task, supabase, reset]);

  const handleFormSubmit = async (data: TaskInput) => {
    if (!task || !data.vehicle_id || !data.assigned_to || !data.category) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_name: data.task_name,
          vehicle_id: data.vehicle_id,
          assigned_to: data.assigned_to,
          due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : data.due_date,
          notes: data.notes,
          category: data.category,
          status: data.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      toast.success('Task updated successfully!');
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedDate(undefined);
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Edit Task
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            Update task information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Name */}
            <div className="space-y-2">
              <Label htmlFor="task_name" style={{ color: 'var(--text)' }}>
                Task Name *
              </Label>
              <Input
                id="task_name"
                placeholder="Enter task name"
                className="control-panel"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}
                {...register('task_name')}
              />
              {errors.task_name && (
                <p className="text-red-400 text-sm">{errors.task_name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" style={{ color: 'var(--text)' }}>
                Category *
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger className="control-panel" style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  {taskCategories.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                      style={{ color: 'var(--text)' }}
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-400 text-sm">{errors.category.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" style={{ color: 'var(--text)' }}>
                Status *
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as 'pending' | 'completed' | 'cancelled')}
              >
                <SelectTrigger className="control-panel" style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  {statusOptions.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                      style={{ color: 'var(--text)' }}
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label style={{ color: 'var(--text)' }}>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal control-panel"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text)' 
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.due_date && (
                <p className="text-red-400 text-sm">{errors.due_date.message}</p>
              )}
            </div>

            {/* Vehicle */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_id" style={{ color: 'var(--text)' }}>
                Vehicle *
              </Label>
              <Select
                value={selectedVehicleId}
                onValueChange={(value) => setValue('vehicle_id', value)}
              >
                <SelectTrigger className="control-panel" style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  {vehicles.length === 0 ? (
                    <SelectItem value="no-vehicles" disabled>No vehicles available</SelectItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <SelectItem
                        key={vehicle.id}
                        value={vehicle.id}
                        style={{ color: 'var(--text)' }}
                      >
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.vin ? `(${vehicle.vin})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.vehicle_id && (
                <p className="text-red-400 text-sm">{errors.vehicle_id.message}</p>
              )}
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to" style={{ color: 'var(--text)' }}>
                Assigned To *
              </Label>
              <Select
                value={watch('assigned_to')}
                onValueChange={(value) => setValue('assigned_to', value)}
              >
                <SelectTrigger className="control-panel" style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  {users.length === 0 ? (
                    <SelectItem value="no-users" disabled>No users available</SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        style={{ color: 'var(--text)' }}
                      >
                        {user.username || user.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.assigned_to && (
                <p className="text-red-400 text-sm">{errors.assigned_to.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" style={{ color: 'var(--text)' }}>
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter task notes..."
              rows={4}
              className="control-panel"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--border)', 
                color: 'var(--text)' 
              }}
              {...register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="control-panel"
              style={{ 
                backgroundColor: 'transparent', 
                borderColor: 'var(--border)', 
                color: 'var(--text)' 
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="control-panel neon-glow"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                borderRadius: '25px',
                fontWeight: '500',
                transition: '0.3s'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

