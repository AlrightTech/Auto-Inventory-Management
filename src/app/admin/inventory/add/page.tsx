'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Plus, Car, Loader2, FileText, CalendarIcon, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { VehicleInsert } from '@/types/vehicle';
import { vehicleSchema, VehicleInput } from '@/lib/validations/inventory';

const statusOptions = [
  'Pending',
  'Sold',
  'Withdrew',
  'Complete',
  'ARB',
  'In Progress',
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

export default function AddVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'In Progress',
      title_status: 'Absent',
      sale_invoice_status: 'UNPAID',
      channel: 'Simulcast',
      psi_status: 'Not Eligible',
      dealshield_arbitration_status: '--',
    },
  });

  // Reset form on mount
  useEffect(() => {
    reset({
      status: 'In Progress',
      title_status: 'Absent',
      sale_invoice_status: 'UNPAID',
      channel: 'Simulcast',
      psi_status: 'Not Eligible',
      dealshield_arbitration_status: '--',
    });
    setSelectedDate(new Date());
  }, [reset]);

  const onSubmit = async (data: VehicleInput) => {
    // Validate VIN before submission
    if (!data.vin || data.vin.trim() === '') {
      toast.error('VIN number is required.');
      return;
    }

    const trimmedVin = data.vin.trim();
    if (trimmedVin.length < 10) {
      toast.error('VIN must be exactly 10 characters.');
      return;
    }

    if (trimmedVin.length > 10) {
      toast.error('VIN must be exactly 10 characters. Extra characters are not allowed.');
      return;
    }

    if (trimmedVin.length !== 10) {
      toast.error('Please correct the VIN. It must be exactly 10 characters to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up the data - remove empty strings and convert to proper types
      const cleanedData: VehicleInsert = {
        ...data,
        vin: trimmedVin,
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
      
      // If this is a new vehicle with a purchase date, trigger ARB countdown (7 days from purchase date)
      if (cleanedData.sale_date) {
        try {
          const purchaseDate = new Date(cleanedData.sale_date);
          const arbDeadline = new Date(purchaseDate);
          arbDeadline.setDate(arbDeadline.getDate() + 7);
          
          // Create a task for ARB countdown if vehicle was created successfully
          if (result.data?.id) {
            const taskResponse = await fetch('/api/tasks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                vehicle_id: result.data.id,
                task_name: 'ARB Countdown - File ARB if needed',
                due_date: format(arbDeadline, 'yyyy-MM-dd'),
                category: 'File an ARB',
                assigned_to: 'admin', // Default to admin, can be changed
                notes: `ARB deadline: 7 days from purchase date (${format(purchaseDate, 'MM/dd/yyyy')}). File ARB if needed before ${format(arbDeadline, 'MM/dd/yyyy')}.`,
                status: 'pending',
              }),
            });
            
            if (!taskResponse.ok) {
              console.warn('Failed to create ARB countdown task, but vehicle was created successfully');
            }
          }
        } catch (error) {
          console.error('Error creating ARB countdown task:', error);
          // Don't fail the vehicle creation if task creation fails
        }
      }
      
      toast.success('Vehicle added successfully!');
      
      // Navigate back to inventory page
      router.push('/admin/inventory');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/inventory')}
              style={{ color: 'var(--text)' }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
                Add New Vehicle
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--subtext)' }}>
                Add a new vehicle to your inventory with complete details and tracking information.
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Vehicle Basic Information */}
          <div className="form-section p-6 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}>
                <Car className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Vehicle Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Make */}
              <div className="space-y-2">
                <Label htmlFor="make" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Make <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="make"
                  placeholder="e.g., Chevrolet"
                  {...register('make')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.make && (
                  <p className="text-red-500 text-xs mt-1">{errors.make.message}</p>
                )}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Model <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model"
                  placeholder="e.g., Silverado"
                  {...register('model')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>
                )}
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2021"
                  {...register('year', { valueAsNumber: true })}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* VIN */}
              <div className="space-y-2">
                <Label htmlFor="vin" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  VIN Number
                </Label>
                <Input
                  id="vin"
                  placeholder="17-character VIN (optional)"
                  maxLength={17}
                  {...register('vin')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.vin && (
                  <p className="text-red-500 text-xs mt-1">{errors.vin.message}</p>
                )}
              </div>

              {/* Trim */}
              <div className="space-y-2">
                <Label htmlFor="trim" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Trim
                </Label>
                <Input
                  id="trim"
                  placeholder="e.g., LT, XLT"
                  {...register('trim')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Odometer */}
              <div className="space-y-2">
                <Label htmlFor="odometer" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Odometer (miles)
                </Label>
                <Input
                  id="odometer"
                  type="number"
                  placeholder="45000"
                  {...register('odometer', { valueAsNumber: true })}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.odometer && (
                  <p className="text-red-500 text-xs mt-1">{errors.odometer.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Exterior Color */}
              <div className="space-y-2">
                <Label htmlFor="exterior_color" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Exterior Color
                </Label>
                <Input
                  id="exterior_color"
                  placeholder="e.g., Blue, White, Black"
                  {...register('exterior_color')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Interior Color */}
              <div className="space-y-2">
                <Label htmlFor="interior_color" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Interior Color
                </Label>
                <Input
                  id="interior_color"
                  placeholder="e.g., Black, Gray, Beige"
                  {...register('interior_color')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status and Financial Information */}
          <div className="p-6 rounded-xl space-y-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Status & Financial Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select value={watch('status') || ''} onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger className="h-11" style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} style={{ color: 'var(--text)' }}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                )}
              </div>

              {/* Title Status */}
              <div className="space-y-2">
                <Label htmlFor="title_status" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Title Status <span className="text-red-500">*</span>
                </Label>
                <Select value={watch('title_status') || ''} onValueChange={(value) => setValue('title_status', value as 'Absent' | 'Released' | 'Received' | 'Present' | 'In Transit' | 'Available not Received' | 'Validated' | 'Sent but not Validated')}>
                  <SelectTrigger className="h-11" style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}>
                    <SelectValue placeholder="Select title status" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    {titleStatusOptions.map((status) => (
                      <SelectItem key={status} value={status} style={{ color: 'var(--text)' }}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.title_status && (
                  <p className="text-red-500 text-xs mt-1">{errors.title_status.message}</p>
                )}
              </div>

              {/* Sale Invoice Status */}
              <div className="space-y-2">
                <Label htmlFor="sale_invoice_status" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Sale Invoice Status
                </Label>
                <Select value={watch('sale_invoice_status') || ''} onValueChange={(value) => setValue('sale_invoice_status', value as 'PAID' | 'UNPAID')}>
                  <SelectTrigger className="h-11" style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}>
                    <SelectValue placeholder="Select invoice status" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <SelectItem value="PAID" style={{ color: 'var(--text)' }}>PAID</SelectItem>
                    <SelectItem value="UNPAID" style={{ color: 'var(--text)' }}>UNPAID</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sale_invoice_status && (
                  <p className="text-red-500 text-xs mt-1">{errors.sale_invoice_status.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bought Price */}
              <div className="space-y-2">
                <Label htmlFor="bought_price" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Bought Price ($)
                </Label>
                <Input
                  id="bought_price"
                  type="number"
                  step="0.01"
                  placeholder="25000.00"
                  {...register('bought_price', { valueAsNumber: true })}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.bought_price && (
                  <p className="text-red-500 text-xs mt-1">{errors.bought_price.message}</p>
                )}
              </div>

              {/* Buy Fee */}
              <div className="space-y-2">
                <Label htmlFor="buy_fee" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Buy Fee ($)
                </Label>
                <Input
                  id="buy_fee"
                  type="number"
                  step="0.01"
                  placeholder="735.00"
                  {...register('buy_fee', { valueAsNumber: true })}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.buy_fee && (
                  <p className="text-red-500 text-xs mt-1">{errors.buy_fee.message}</p>
                )}
              </div>

              {/* Other Charges */}
              <div className="space-y-2">
                <Label htmlFor="other_charges" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Other Charges ($)
                </Label>
                <Input
                  id="other_charges"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('other_charges', { valueAsNumber: true })}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {/* No validation errors displayed for Other Charges */}
              </div>
            </div>
          </div>

          {/* Sale Information */}
          <div className="p-6 rounded-xl space-y-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}>
                <CalendarIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Sale Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sale Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Purchase Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-11"
                      style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: errors.sale_date ? '#ef4444' : 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
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
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setValue('sale_date', format(date, 'yyyy-MM-dd'));
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.sale_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.sale_date.message}</p>
                )}
                {selectedDate && selectedDate > new Date() && (
                  <p className="text-red-500 text-xs mt-1">Purchase date cannot be a future date.</p>
                )}
              </div>

              {/* Lane */}
              <div className="space-y-2">
                <Label htmlFor="lane" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Lane
                </Label>
                <Input
                  id="lane"
                  type="number"
                  placeholder="74"
                  {...register('lane', { valueAsNumber: true })}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.lane && (
                  <p className="text-red-500 text-xs mt-1">{errors.lane.message}</p>
                )}
              </div>

              {/* Run */}
              <div className="space-y-2">
                <Label htmlFor="run" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Run
                </Label>
                <Input
                  id="run"
                  type="number"
                  placeholder="71"
                  {...register('run', { valueAsNumber: true })}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.run && (
                  <p className="text-red-500 text-xs mt-1">{errors.run.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="p-6 rounded-xl space-y-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}>
                <Truck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Location Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Facilitating Location */}
              <div className="space-y-2">
                <Label htmlFor="facilitating_location" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Facilitating Location
                </Label>
                <Input
                  id="facilitating_location"
                  placeholder="Manheim Dallas"
                  {...register('facilitating_location')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Vehicle Location */}
              <div className="space-y-2">
                <Label htmlFor="vehicle_location" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Vehicle Location
                </Label>
                <Input
                  id="vehicle_location"
                  placeholder="Manheim Dallas"
                  {...register('vehicle_location')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Address */}
              <div className="space-y-2">
                <Label htmlFor="pickup_location_address1" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Pickup Address
                </Label>
                <Input
                  id="pickup_location_address1"
                  placeholder="5333 W Kiest Blvd"
                  {...register('pickup_location_address1')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Pickup City */}
              <div className="space-y-2">
                <Label htmlFor="pickup_location_city" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Pickup Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pickup_location_city"
                  placeholder="Dallas"
                  {...register('pickup_location_city')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: errors.pickup_location_city ? '#ef4444' : 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
                {errors.pickup_location_city && (
                  <p className="text-red-500 text-xs mt-1">{errors.pickup_location_city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pickup State */}
              <div className="space-y-2">
                <Label htmlFor="pickup_location_state" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Pickup State
                </Label>
                <Input
                  id="pickup_location_state"
                  placeholder="TX"
                  {...register('pickup_location_state')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Pickup Zip */}
              <div className="space-y-2">
                <Label htmlFor="pickup_location_zip" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Pickup Zip
                </Label>
                <Input
                  id="pickup_location_zip"
                  placeholder="75236-1055"
                  {...register('pickup_location_zip')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Pickup Phone */}
              <div className="space-y-2">
                <Label htmlFor="pickup_location_phone" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Pickup Phone
                </Label>
                <Input
                  id="pickup_location_phone"
                  placeholder="(214) 330-1800"
                  {...register('pickup_location_phone')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Seller and Buyer Information */}
          <div className="p-6 rounded-xl space-y-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Seller & Buyer Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seller Name */}
              <div className="space-y-2">
                <Label htmlFor="seller_name" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Seller Name
                </Label>
                <Input
                  id="seller_name"
                  placeholder="HILEY SUBARU OF FORT WORTH"
                  {...register('seller_name')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Buyer Dealership */}
              <div className="space-y-2">
                <Label htmlFor="buyer_dealership" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Buyer Dealership
                </Label>
                <Input
                  id="buyer_dealership"
                  placeholder="AUTO PLANET"
                  {...register('buyer_dealership')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buyer Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="buyer_contact_name" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Buyer Contact Name
                </Label>
                <Input
                  id="buyer_contact_name"
                  placeholder="MIAD KARIMI"
                  {...register('buyer_contact_name')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Buyer AA ID */}
              <div className="space-y-2">
                <Label htmlFor="buyer_aa_id" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Buyer AA ID
                </Label>
                <Input
                  id="buyer_aa_id"
                  placeholder="****"
                  {...register('buyer_aa_id')}
                  className="h-11"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/inventory')}
              className="h-11 px-6"
              style={{ 
                backgroundColor: 'transparent', 
                borderColor: 'var(--border)', 
                color: 'var(--text)',
                borderRadius: '8px'
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 191, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 191, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 191, 255, 0.3)';
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
      </div>
    </div>
  );
}

