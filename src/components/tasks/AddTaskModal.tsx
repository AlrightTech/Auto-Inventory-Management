'use client';

import { useState } from 'react';
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

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for dropdowns
const mockVehicles = [
  { id: 'vehicle-1', make: 'Chevrolet', model: 'Silverado', year: 2021, vin: '1GCHK29U4XZ123456' },
  { id: 'vehicle-2', make: 'Ford', model: 'F-150', year: 2020, vin: '1FTFW1ET5DFC12345' },
  { id: 'vehicle-3', make: 'Honda', model: 'Civic', year: 2019, vin: '2HGFC2F59KH123456' },
];

const mockUsers = [
  { id: 'admin-1', username: 'Admin User', role: 'admin' },
  { id: 'seller-1', username: 'Seller User', role: 'seller' },
  { id: 'transporter-1', username: 'Transporter User', role: 'transporter' },
];

const taskCategories = [
  'Missing Title',
  'File an ARB',
  'Location',
  'General',
  'Accounting',
  'Inspection',
];

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'pending',
    },
  });


  const onSubmit = async (data: TaskInput) => {
    setIsSubmitting(true);
    try {
      // Here you would typically call your API to create the task
      console.log('Creating task:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="glass-card border-slate-700/50 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white glow-text">
                  Create New Task
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new task to track vehicle-related activities and assignments.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vehicle Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_id" className="text-slate-300">
                      Select Vehicle *
                    </Label>
                    <Select onValueChange={(value) => setValue('vehicle_id', value)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="Choose a vehicle" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-slate-700">
                        {mockVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.vehicle_id && (
                      <p className="text-red-400 text-sm">{errors.vehicle_id.message}</p>
                    )}
                  </div>

                  {/* Task Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-300">
                      Category
                    </Label>
                    <Select onValueChange={(value) => setValue('category', value)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-slate-700">
                        {taskCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-400 text-sm">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                {/* Task Name */}
                <div className="space-y-2">
                  <Label htmlFor="task_name" className="text-slate-300">
                    Task Name *
                  </Label>
                  <Input
                    id="task_name"
                    placeholder="e.g., Upload Title Document"
                    {...register('task_name')}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  {errors.task_name && (
                    <p className="text-red-400 text-sm">{errors.task_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 glass-card border-slate-700">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setValue('due_date', format(date, 'yyyy-MM-dd'));
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.due_date && (
                      <p className="text-red-400 text-sm">{errors.due_date.message}</p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to" className="text-slate-300">
                      Assign To
                    </Label>
                    <Select onValueChange={(value) => setValue('assigned_to', value)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-slate-700">
                        {mockUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
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

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-300">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or instructions..."
                    {...register('notes')}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px]"
                  />
                  {errors.notes && (
                    <p className="text-red-400 text-sm">{errors.notes.message}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
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
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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