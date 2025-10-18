'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus, Car } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters').optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  status: z.string().min(1, 'Status is required'),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  odometer: z.number().min(0, 'Odometer must be positive').optional(),
  boughtPrice: z.number().min(0, 'Price must be positive').optional(),
  titleStatus: z.string().min(1, 'Title status is required'),
  arbStatus: z.string().min(1, 'ARB status is required'),
});

type VehicleInput = z.infer<typeof vehicleSchema>;

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  'Pending',
  'Sold',
  'Withdrew',
  'Complete',
  'ARB',
  'In Progress',
];

const pickupLocationOptions = [
  'Shop/Mechanic',
  'Auction',
  'Other Mechanic',
  'Unknown',
  'Other',
  'Missing',
  'PDR',
];

const titleStatusOptions = [
  'Absent',
  'Present',
  'In Transit',
  'Received',
  'Available not Received',
  'Released',
  'Validated',
  'Sent but not Validated',
];

const arbStatusOptions = [
  'Absent',
  'Present',
  'In Transit',
  'Failed',
];

export function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'Pending',
      titleStatus: 'Absent',
      arbStatus: 'Absent',
    },
  });

  const onSubmit = async (data: VehicleInput) => {
    setIsSubmitting(true);
    try {
      // Here you would typically call your API to create the vehicle
      console.log('Creating vehicle:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating vehicle:', error);
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
          <DialogContent className="glass-card border-slate-700/50 max-w-4xl max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white glow-text flex items-center">
                  <Car className="w-6 h-6 mr-2" />
                  Add New Vehicle
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new vehicle to your inventory with complete details and tracking information.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                {/* Vehicle Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                    Vehicle Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Make */}
                    <div className="space-y-2">
                      <Label htmlFor="make" className="text-slate-300">
                        Make *
                      </Label>
                      <Input
                        id="make"
                        placeholder="e.g., Chevrolet"
                        {...register('make')}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.make && (
                        <p className="text-red-400 text-sm">{errors.make.message}</p>
                      )}
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-slate-300">
                        Model *
                      </Label>
                      <Input
                        id="model"
                        placeholder="e.g., Silverado"
                        {...register('model')}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.model && (
                        <p className="text-red-400 text-sm">{errors.model.message}</p>
                      )}
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-slate-300">
                        Year *
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="2021"
                        {...register('year', { valueAsNumber: true })}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.year && (
                        <p className="text-red-400 text-sm">{errors.year.message}</p>
                      )}
                    </div>
                  </div>

                  {/* VIN */}
                  <div className="space-y-2">
                    <Label htmlFor="vin" className="text-slate-300">
                      VIN Number
                    </Label>
                    <Input
                      id="vin"
                      placeholder="17-character VIN (optional)"
                      maxLength={17}
                      {...register('vin')}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    {errors.vin && (
                      <p className="text-red-400 text-sm">{errors.vin.message}</p>
                    )}
                  </div>
                </div>

                {/* Purchase Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                    Purchase Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Purchase Date */}
                    <div className="space-y-2">
                      <Label className="text-slate-300">Purchase Date *</Label>
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
                                setValue('purchaseDate', format(date, 'yyyy-MM-dd'));
                              }
                            }}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.purchaseDate && (
                        <p className="text-red-400 text-sm">{errors.purchaseDate.message}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-slate-300">
                        Status *
                      </Label>
                      <Select onValueChange={(value) => setValue('status', value)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-slate-700">
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-red-400 text-sm">{errors.status.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Location */}
                    <div className="space-y-2">
                      <Label htmlFor="pickupLocation" className="text-slate-300">
                        Pickup Location *
                      </Label>
                      <Select onValueChange={(value) => setValue('pickupLocation', value)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-slate-700">
                          {pickupLocationOptions.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.pickupLocation && (
                        <p className="text-red-400 text-sm">{errors.pickupLocation.message}</p>
                      )}
                    </div>

                    {/* Odometer */}
                    <div className="space-y-2">
                      <Label htmlFor="odometer" className="text-slate-300">
                        Odometer (miles)
                      </Label>
                      <Input
                        id="odometer"
                        type="number"
                        placeholder="e.g., 50000"
                        {...register('odometer', { valueAsNumber: true })}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.odometer && (
                        <p className="text-red-400 text-sm">{errors.odometer.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Bought Price */}
                  <div className="space-y-2">
                    <Label htmlFor="boughtPrice" className="text-slate-300">
                      Bought Price ($)
                    </Label>
                    <Input
                      id="boughtPrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 25000.00"
                      {...register('boughtPrice', { valueAsNumber: true })}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    {errors.boughtPrice && (
                      <p className="text-red-400 text-sm">{errors.boughtPrice.message}</p>
                    )}
                  </div>
                </div>

                {/* Title and ARB Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                    Title & ARB Status
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title Status */}
                    <div className="space-y-2">
                      <Label htmlFor="titleStatus" className="text-slate-300">
                        Title Status *
                      </Label>
                      <Select onValueChange={(value) => setValue('titleStatus', value)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select title status" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-slate-700">
                          {titleStatusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.titleStatus && (
                        <p className="text-red-400 text-sm">{errors.titleStatus.message}</p>
                      )}
                    </div>

                    {/* ARB Status */}
                    <div className="space-y-2">
                      <Label htmlFor="arbStatus" className="text-slate-300">
                        ARB Status *
                      </Label>
                      <Select onValueChange={(value) => setValue('arbStatus', value)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select ARB status" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-slate-700">
                          {arbStatusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.arbStatus && (
                        <p className="text-red-400 text-sm">{errors.arbStatus.message}</p>
                      )}
                    </div>
                  </div>
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
                        Adding Vehicle...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vehicle
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
