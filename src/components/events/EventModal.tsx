'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { eventSchema, type EventInput } from '@/lib/validations/events';
import { Calendar, Clock, User, FileText } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ isOpen, onClose }: EventModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
  });


  const onSubmit = async (data: EventInput) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to create event
      console.log('Creating event:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
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
          <DialogContent className="glass-card-strong border-slate-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                Create New Event
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Schedule a new event, inspection, or important date.
              </DialogDescription>
            </DialogHeader>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-200 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Event Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Inspection Day, Car Mela, Auction Review"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm">{errors.title.message}</p>
                )}
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="event_date" className="text-slate-200 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Date * (dd-mm-yyyy)
                </Label>
                <Input
                  id="event_date"
                  type="date"
                  className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register('event_date')}
                />
                {errors.event_date && (
                  <p className="text-red-400 text-sm">{errors.event_date.message}</p>
                )}
              </div>

              {/* Event Time */}
              <div className="space-y-2">
                <Label htmlFor="event_time" className="text-slate-200 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Event Time * (hh:mm AM/PM)
                </Label>
                <Input
                  id="event_time"
                  type="time"
                  className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register('event_time')}
                />
                {errors.event_time && (
                  <p className="text-red-400 text-sm">{errors.event_time.message}</p>
                )}
              </div>

              {/* Assign to User */}
              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-slate-200 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Assign to User
                </Label>
                <Select onValueChange={(value) => setValue('assigned_to', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select user to assign this event" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="admin" className="text-white hover:bg-slate-700">
                      Admin User
                    </SelectItem>
                    <SelectItem value="seller1" className="text-white hover:bg-slate-700">
                      Seller User
                    </SelectItem>
                    <SelectItem value="transporter1" className="text-white hover:bg-slate-700">
                      Transporter User
                    </SelectItem>
                    <SelectItem value="staff1" className="text-white hover:bg-slate-700">
                      Staff Member
                    </SelectItem>
                    <SelectItem value="momina" className="text-white hover:bg-slate-700">
                      Momina
                    </SelectItem>
                    <SelectItem value="aftab" className="text-white hover:bg-slate-700">
                      Aftab
                    </SelectItem>
                    <SelectItem value="ayesha" className="text-white hover:bg-slate-700">
                      Ayesha Magsi
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gradient-primary hover:opacity-90"
                >
                  {isLoading ? 'Creating...' : 'Save Event'}
                </Button>
              </div>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
