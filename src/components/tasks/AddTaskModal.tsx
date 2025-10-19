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
}

const taskCategories = [
  { value: 'missing_title', label: 'Missing Title' },
  { value: 'file_arb', label: 'File an ARB' },
  { value: 'location', label: 'Location' },
  { value: 'general', label: 'General' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'inspection', label: 'Inspection' },
];

export function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
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
          setVehicles(vehiclesData);
        }

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
      vehicle_id: '',
      assigned_to: '',
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
      category: 'general',
    },
  });

  const selectedVehicleId = watch('vehicle_id');
  const selectedCategory = watch('category');

  const handleFormSubmit = async (data: TaskInput) => {
    if (!currentUser || !data.vehicle_id || !data.assigned_to || !data.category) return;

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
          <DialogContent className="glass-card-strong max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white glow-text">
                  Add New Task
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Create a new task and assign it to a user
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Task Name */}
                  <div className="space-y-2">
                    <Label htmlFor="task_name" className="text-slate-200">
                      Task Name *
                    </Label>
                    <Input
                      id="task_name"
                      placeholder="Enter task name"
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      {...register('task_name')}
                    />
                    {errors.task_name && (
                      <p className="text-red-400 text-sm">{errors.task_name.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-200">
                      Category *
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => setValue('category', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {taskCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                            className="text-white hover:bg-slate-700"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vehicle Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_id" className="text-slate-200">
                      Select Vehicle *
                    </Label>
                    <Select
                      value={selectedVehicleId}
                      onValueChange={(value) => setValue('vehicle_id', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                        {vehicles.map((vehicle) => (
                          <SelectItem
                            key={vehicle.id}
                            value={vehicle.id}
                            className="text-white hover:bg-slate-700"
                          >
                            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.vin ? `(${vehicle.vin})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.vehicle_id && (
                      <p className="text-red-400 text-sm">{errors.vehicle_id.message}</p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to" className="text-slate-200">
                      Assign To *
                    </Label>
                    <Select
                      value={watch('assigned_to')}
                      onValueChange={(value) => setValue('assigned_to', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {users.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            className="text-white hover:bg-slate-700"
                          >
                            {user.username} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assigned_to && (
                      <p className="text-red-400 text-sm">{errors.assigned_to.message}</p>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label className="text-slate-200">Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="bg-slate-800"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.due_date && (
                    <p className="text-red-400 text-sm">{errors.due_date.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-200">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter additional notes or instructions..."
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px]"
                    {...register('notes')}
                  />
                  {errors.notes && (
                    <p className="text-red-400 text-sm">{errors.notes.message}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gradient-primary hover:opacity-90"
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
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}