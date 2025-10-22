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
import { CalendarIcon, X, Plus, Car, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { toast } from 'sonner';
import { VehicleInsert } from '@/types/vehicle';

const vehicleSchema = z.object({
  // Basic Vehicle Information
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters').optional().or(z.literal('')),
  trim: z.string().optional(),
  exterior_color: z.string().optional(),
  interior_color: z.string().optional(),
  
  // Vehicle Status and Details
  status: z.enum(['Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress']).optional().default('Pending'),
  odometer: z.number().min(0, 'Odometer must be positive').optional(),
  title_status: z.enum(['Present', 'Absent']).optional().default('Absent'),
  psi_status: z.string().optional(),
  dealshield_arbitration_status: z.string().optional(),
  
  // Financial Information
  bought_price: z.number().min(0, 'Price must be positive').optional(),
  buy_fee: z.number().min(0, 'Fee must be positive').optional(),
  other_charges: z.number().min(0, 'Charges must be positive').optional(),
  
  // Sale Information
  sale_date: z.string().optional(),
  lane: z.number().min(1, 'Lane must be positive').optional(),
  run: z.number().min(1, 'Run must be positive').optional(),
  channel: z.string().optional(),
  
  // Location Information
  facilitating_location: z.string().optional(),
  vehicle_location: z.string().optional(),
  pickup_location_address1: z.string().optional(),
  pickup_location_city: z.string().optional(),
  pickup_location_state: z.string().optional(),
  pickup_location_zip: z.string().optional(),
  pickup_location_phone: z.string().optional(),
  
  // Seller and Buyer Information
  seller_name: z.string().optional(),
  buyer_dealership: z.string().optional(),
  buyer_contact_name: z.string().optional(),
  buyer_aa_id: z.string().optional(),
  buyer_reference: z.string().optional(),
  sale_invoice_status: z.enum(['PAID', 'UNPAID']).optional().default('UNPAID'),
});

type VehicleInput = z.infer<typeof vehicleSchema>;

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded?: () => void;
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

export function AddVehicleModal({ isOpen, onClose, onVehicleAdded }: AddVehicleModalProps) {
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
      title_status: 'Absent',
      sale_invoice_status: 'UNPAID',
      channel: 'Simulcast',
      psi_status: 'Not Eligible',
      dealshield_arbitration_status: '--',
    },
  });

  const onSubmit = async (data: VehicleInput) => {
    setIsSubmitting(true);
    try {
      // Clean up the data - remove empty strings and convert to proper types
      const cleanedData: VehicleInsert = {
        ...data,
        vin: data.vin && data.vin.trim() !== '' ? data.vin.trim() : undefined,
        sale_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
      };

      // Remove undefined values
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key as keyof VehicleInsert] === undefined || cleanedData[key as keyof VehicleInsert] === '') {
          delete cleanedData[key as keyof VehicleInsert];
        }
      });

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vehicle');
      }

      const result = await response.json();
      
      toast.success('Vehicle added successfully!');
      
      // Reset form and close modal
      reset();
      setSelectedDate(new Date());
      onClose();
      
      // Notify parent component to refresh the vehicle list
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create vehicle');
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
          <DialogContent className="glass-card border-slate-200/50 dark:border-slate-700/50 max-w-4xl max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white glow-text flex items-center">
                  <Car className="w-6 h-6 mr-2" />
                  Add New Vehicle
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  Add a new vehicle to your inventory with complete details and tracking information.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6 max-h-[70vh] overflow-y-auto">
                {/* Vehicle Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2">
                    Vehicle Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Make */}
                    <div className="space-y-2">
                      <Label htmlFor="make" className="text-slate-700 dark:text-slate-300">
                        Make *
                      </Label>
                      <Input
                        id="make"
                        placeholder="e.g., Chevrolet"
                        {...register('make')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.make && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.make.message}</p>
                      )}
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-slate-700 dark:text-slate-300">
                        Model *
                      </Label>
                      <Input
                        id="model"
                        placeholder="e.g., Silverado"
                        {...register('model')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.model && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.model.message}</p>
                      )}
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-slate-700 dark:text-slate-300">
                        Year *
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="2021"
                        {...register('year', { valueAsNumber: true })}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.year && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.year.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* VIN */}
                    <div className="space-y-2">
                      <Label htmlFor="vin" className="text-slate-700 dark:text-slate-300">
                        VIN Number
                      </Label>
                      <Input
                        id="vin"
                        placeholder="17-character VIN (optional)"
                        maxLength={17}
                        {...register('vin')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.vin && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.vin.message}</p>
                      )}
                    </div>

                    {/* Trim */}
                    <div className="space-y-2">
                      <Label htmlFor="trim" className="text-slate-700 dark:text-slate-300">
                        Trim
                      </Label>
                      <Input
                        id="trim"
                        placeholder="e.g., LT, XLT"
                        {...register('trim')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Odometer */}
                    <div className="space-y-2">
                      <Label htmlFor="odometer" className="text-slate-700 dark:text-slate-300">
                        Odometer (miles)
                      </Label>
                      <Input
                        id="odometer"
                        type="number"
                        placeholder="45000"
                        {...register('odometer', { valueAsNumber: true })}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.odometer && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.odometer.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Exterior Color */}
                    <div className="space-y-2">
                      <Label htmlFor="exterior_color" className="text-slate-700 dark:text-slate-300">
                        Exterior Color
                      </Label>
                      <Input
                        id="exterior_color"
                        placeholder="e.g., Blue, White, Black"
                        {...register('exterior_color')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Interior Color */}
                    <div className="space-y-2">
                      <Label htmlFor="interior_color" className="text-slate-700 dark:text-slate-300">
                        Interior Color
                      </Label>
                      <Input
                        id="interior_color"
                        placeholder="e.g., Black, Gray, Beige"
                        {...register('interior_color')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Status and Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                    Status & Financial Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-slate-700 dark:text-slate-300">
                        Status *
                      </Label>
                      <Select onValueChange={(value) => setValue('status', value as any)}>
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
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.status.message}</p>
                      )}
                    </div>

                    {/* Title Status */}
                    <div className="space-y-2">
                      <Label htmlFor="title_status" className="text-slate-700 dark:text-slate-300">
                        Title Status
                      </Label>
                      <Select onValueChange={(value) => setValue('title_status', value as 'Present' | 'Absent')}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select title status" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-slate-700">
                          <SelectItem value="Present">Present</SelectItem>
                          <SelectItem value="Absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.title_status && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.title_status.message}</p>
                      )}
                    </div>

                    {/* Sale Invoice Status */}
                    <div className="space-y-2">
                      <Label htmlFor="sale_invoice_status" className="text-slate-700 dark:text-slate-300">
                        Sale Invoice Status
                      </Label>
                      <Select onValueChange={(value) => setValue('sale_invoice_status', value as 'PAID' | 'UNPAID')}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select invoice status" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-slate-700">
                          <SelectItem value="PAID">PAID</SelectItem>
                          <SelectItem value="UNPAID">UNPAID</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sale_invoice_status && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.sale_invoice_status.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bought Price */}
                    <div className="space-y-2">
                      <Label htmlFor="bought_price" className="text-slate-700 dark:text-slate-300">
                        Bought Price ($)
                      </Label>
                      <Input
                        id="bought_price"
                        type="number"
                        step="0.01"
                        placeholder="25000.00"
                        {...register('bought_price', { valueAsNumber: true })}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.bought_price && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.bought_price.message}</p>
                      )}
                    </div>

                    {/* Buy Fee */}
                    <div className="space-y-2">
                      <Label htmlFor="buy_fee" className="text-slate-700 dark:text-slate-300">
                        Buy Fee ($)
                      </Label>
                      <Input
                        id="buy_fee"
                        type="number"
                        step="0.01"
                        placeholder="735.00"
                        {...register('buy_fee', { valueAsNumber: true })}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.buy_fee && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.buy_fee.message}</p>
                      )}
                    </div>

                    {/* Other Charges */}
                    <div className="space-y-2">
                      <Label htmlFor="other_charges" className="text-slate-700 dark:text-slate-300">
                        Other Charges ($)
                      </Label>
                      <Input
                        id="other_charges"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('other_charges', { valueAsNumber: true })}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.other_charges && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.other_charges.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sale Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                    Sale Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sale Date */}
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">Sale Date</Label>
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
                            onSelect={setSelectedDate}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Lane */}
                    <div className="space-y-2">
                      <Label htmlFor="lane" className="text-slate-700 dark:text-slate-300">
                        Lane
                      </Label>
                      <Input
                        id="lane"
                        type="number"
                        placeholder="74"
                        {...register('lane', { valueAsNumber: true })}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.lane && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.lane.message}</p>
                      )}
                    </div>

                    {/* Run */}
                    <div className="space-y-2">
                      <Label htmlFor="run" className="text-slate-700 dark:text-slate-300">
                        Run
                      </Label>
                      <Input
                        id="run"
                        type="number"
                        placeholder="71"
                        {...register('run', { valueAsNumber: true })}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      {errors.run && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.run.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                    Location Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Facilitating Location */}
                    <div className="space-y-2">
                      <Label htmlFor="facilitating_location" className="text-slate-700 dark:text-slate-300">
                        Facilitating Location
                      </Label>
                      <Input
                        id="facilitating_location"
                        placeholder="Manheim Dallas"
                        {...register('facilitating_location')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Vehicle Location */}
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_location" className="text-slate-700 dark:text-slate-300">
                        Vehicle Location
                      </Label>
                      <Input
                        id="vehicle_location"
                        placeholder="Manheim Dallas"
                        {...register('vehicle_location')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Address */}
                    <div className="space-y-2">
                      <Label htmlFor="pickup_location_address1" className="text-slate-700 dark:text-slate-300">
                        Pickup Address
                      </Label>
                      <Input
                        id="pickup_location_address1"
                        placeholder="5333 W Kiest Blvd"
                        {...register('pickup_location_address1')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Pickup City */}
                    <div className="space-y-2">
                      <Label htmlFor="pickup_location_city" className="text-slate-700 dark:text-slate-300">
                        Pickup City
                      </Label>
                      <Input
                        id="pickup_location_city"
                        placeholder="Dallas"
                        {...register('pickup_location_city')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pickup State */}
                    <div className="space-y-2">
                      <Label htmlFor="pickup_location_state" className="text-slate-700 dark:text-slate-300">
                        Pickup State
                      </Label>
                      <Input
                        id="pickup_location_state"
                        placeholder="TX"
                        {...register('pickup_location_state')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Pickup Zip */}
                    <div className="space-y-2">
                      <Label htmlFor="pickup_location_zip" className="text-slate-700 dark:text-slate-300">
                        Pickup Zip
                      </Label>
                      <Input
                        id="pickup_location_zip"
                        placeholder="75236-1055"
                        {...register('pickup_location_zip')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Pickup Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="pickup_location_phone" className="text-slate-700 dark:text-slate-300">
                        Pickup Phone
                      </Label>
                      <Input
                        id="pickup_location_phone"
                        placeholder="(214) 330-1800"
                        {...register('pickup_location_phone')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Seller and Buyer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                    Seller & Buyer Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Seller Name */}
                    <div className="space-y-2">
                      <Label htmlFor="seller_name" className="text-slate-700 dark:text-slate-300">
                        Seller Name
                      </Label>
                      <Input
                        id="seller_name"
                        placeholder="HILEY SUBARU OF FORT WORTH"
                        {...register('seller_name')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Buyer Dealership */}
                    <div className="space-y-2">
                      <Label htmlFor="buyer_dealership" className="text-slate-700 dark:text-slate-300">
                        Buyer Dealership
                      </Label>
                      <Input
                        id="buyer_dealership"
                        placeholder="AUTO PLANET"
                        {...register('buyer_dealership')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Buyer Contact Name */}
                    <div className="space-y-2">
                      <Label htmlFor="buyer_contact_name" className="text-slate-700 dark:text-slate-300">
                        Buyer Contact Name
                      </Label>
                      <Input
                        id="buyer_contact_name"
                        placeholder="MIAD KARIMI"
                        {...register('buyer_contact_name')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Buyer AA ID */}
                    <div className="space-y-2">
                      <Label htmlFor="buyer_aa_id" className="text-slate-700 dark:text-slate-300">
                        Buyer AA ID
                      </Label>
                      <Input
                        id="buyer_aa_id"
                        placeholder="****"
                        {...register('buyer_aa_id')}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
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
