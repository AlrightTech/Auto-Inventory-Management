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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

interface AddVehicleTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    task_name: string;
    vehicle_id: string;
    due_date: string;
    notes?: string;
  }) => void;
  vehicleId: string;
}

const vehicleTaskSchema = z.object({
  task_name: z.string().min(1, 'Task name is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

type VehicleTaskInput = z.infer<typeof vehicleTaskSchema>;

export function AddVehicleTaskModal({ isOpen, onClose, onSubmit, vehicleId }: AddVehicleTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  
  const supabase = createClient();

  // Get current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({ id: user.id });
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    if (isOpen) {
      loadCurrentUser();
    }
  }, [isOpen, supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleTaskInput>({
    resolver: zodResolver(vehicleTaskSchema),
    defaultValues: {
      task_name: '',
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const handleFormSubmit = async (data: VehicleTaskInput) => {
    if (!currentUser || !vehicleId) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        task_name: data.task_name,
        vehicle_id: vehicleId,
        due_date: selectedDate ? selectedDate.toISOString().split('T')[0] : data.due_date,
        notes: data.notes || '',
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
                Create a new task for this vehicle
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                      style={{ backgroundColor: 'var(--card-bg)' }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.due_date && (
                  <p className="text-red-400 text-sm">{errors.due_date.message}</p>
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
                  <p className="text-red-400 text-sm">{errors.notes.message}</p>
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

