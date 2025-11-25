'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { taskSchema, type TaskInput } from '@/lib/validations/tasks';
import { createClient } from '@/lib/supabase/client';
import { Vehicle, User } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    task_name: string;
    vehicle_id: string;
    assigned_to: string;
    assigned_by: string;
    due_date: string;
    notes?: string;
    category: string;
  }) => void;
  preSelectedVehicleId?: string;
}

const taskCategories = [
  { value: 'missing_title', label: 'Missing Title' },
  { value: 'file_arb', label: 'File an ARB' },
  { value: 'location', label: 'Location' },
  { value: 'general', label: 'General' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'inspection', label: 'Inspection' },
];

export function AddTaskModal({ isOpen, onClose, onSubmit, preSelectedVehicleId }: AddTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const supabase = createClient();

  // Load vehicles and users
  useEffect(() => {
    
    const loadData = async () => {
      try {
        // Load vehicles
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });

        if (vehiclesData) {
          console.log('Loaded vehicles:', vehiclesData);
          setVehicles(vehiclesData);
        } else {
          console.log('No vehicles data loaded');
          setVehicles([]);
        }

        // Load users
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersData) {
          console.log('Loaded users:', usersData);
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
        } else {
          console.log('No users data loaded');
          setUsers([]);
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setCurrentUser({
              id: user.id,
              email: user.email || '',
              username: profile.username || user.email?.split('@')[0] || 'User',
              role: profile.role,
              isOnline: true,
              lastSeen: null,
              created_at: user.created_at,
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setVehicles([]);
        setUsers([]);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_name: '',
      vehicle_id: preSelectedVehicleId || '',
      assigned_to: '',
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
      category: 'general',
    },
  });

  // Update vehicle_id when preSelectedVehicleId changes
  useEffect(() => {
    if (preSelectedVehicleId && isOpen) {
      setValue('vehicle_id', preSelectedVehicleId);
    }
  }, [preSelectedVehicleId, isOpen, setValue]);

  const selectedVehicleId = watch('vehicle_id');
  const selectedCategory = watch('category');

  const handleFormSubmit = async (data: TaskInput) => {
    if (!currentUser || !data.vehicle_id || !data.assigned_to || !data.category || data.vehicle_id === 'no-vehicles' || data.assigned_to === 'no-users') return;

    setIsSubmitting(true);
    try {
      const taskData = {
        task_name: data.task_name,
        vehicle_id: data.vehicle_id,
        assigned_to: data.assigned_to,
        assigned_by: currentUser.id,
        due_date: selectedDate ? selectedDate.toISOString().split('T')[0] : data.due_date,
        notes: data.notes,
        category: data.category,
      };
      
      await onSubmit(taskData);
      reset();
      setSelectedDate(new Date());
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedDate(new Date());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
                Add New Task
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--subtext)' }}>
                Create a new task and assign it to a user
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
                      <p className="text-red-500 text-sm mt-1">{errors.task_name.message}</p>
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
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vehicle Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_id" style={{ color: 'var(--text)' }}>
                      Select Vehicle *
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
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }} className="max-h-60">
                        {vehicles.length === 0 ? (
                          <SelectItem value="no-vehicles" disabled style={{ color: 'var(--subtext)' }}>
                            No vehicles available
                          </SelectItem>
                        ) : (
                          vehicles
                            .filter(vehicle => 
                              vehicle && 
                              vehicle.id && 
                              vehicle.id.trim() !== '' && 
                              vehicle.make && 
                              vehicle.model && 
                              vehicle.year &&
                              vehicle.id !== null &&
                              vehicle.id !== undefined
                            )
                            .map((vehicle) => (
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
                      <p className="text-red-500 text-sm mt-1">{errors.vehicle_id.message}</p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to" style={{ color: 'var(--text)' }}>
                      Assign To *
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
                          <SelectItem value="no-users" disabled style={{ color: 'var(--subtext)' }}>
                            No users available
                          </SelectItem>
                        ) : (
                          users
                            .filter(user => 
                              user && 
                              user.id && 
                              user.id.trim() !== '' && 
                              user.username && 
                              user.role &&
                              user.id !== null &&
                              user.id !== undefined
                            )
                            .map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.id}
                                style={{ color: 'var(--text)' }}
                              >
                                {user.username} ({user.role})
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.assigned_to && (
                      <p className="text-red-500 text-sm mt-1">{errors.assigned_to.message}</p>
                    )}
                  </div>
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
                        disabled={(date) => date < new Date()}
                        initialFocus
                        style={{ backgroundColor: 'var(--card-bg)' }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.due_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.due_date.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" style={{ color: 'var(--text)' }}>
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter additional notes or instructions..."
                    className="control-panel min-h-[100px]"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text)' 
                    }}
                    {...register('notes')}
                  />
                    {errors.notes && (
                      <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Task
                      </>
                    )}
                  </Button>
                </div>
              </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}