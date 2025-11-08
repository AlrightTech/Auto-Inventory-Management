'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Upload, X, Loader2, Car, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { toast } from 'sonner';
import { VehicleInsert, VehicleWithRelations } from '@/types/vehicle';
import { vehicleSchema, VehicleInput } from '@/lib/validations/inventory';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

const statusOptions = ['Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'];
const titleStatusOptions = ['Absent', 'Present', 'In Transit', 'Received', 'Available not Received', 'Released', 'Validated', 'Sent but not Validated'];
const arbStatusOptions = ['Absent', 'Present', 'In Transit', 'Failed'];

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [vehicle, setVehicle] = useState<VehicleWithRelations | null>(null);
  
  // Fetch location options dynamically
  const { options: locationOptions } = useDropdownOptions('car_location', true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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

  // Load vehicle data
  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        if (!response.ok) {
          throw new Error('Failed to load vehicle');
        }
        const { data } = await response.json();
        setVehicle(data);
        
        // Populate form
        if (data) {
          setValue('make', data.make || '');
          setValue('model', data.model || '');
          setValue('year', data.year || undefined);
          setValue('vin', data.vin || '');
          setValue('trim', data.trim || '');
          setValue('exterior_color', data.exterior_color || '');
          setValue('interior_color', data.interior_color || '');
          setValue('status', data.status || 'Pending');
          setValue('odometer', data.odometer || undefined);
          setValue('title_status', data.title_status || 'Absent');
          setValue('psi_status', data.psi_status || 'Not Eligible');
          setValue('dealshield_arbitration_status', data.dealshield_arbitration_status || '--');
          setValue('bought_price', data.bought_price || undefined);
          setValue('buy_fee', data.buy_fee || undefined);
          setValue('other_charges', data.other_charges || undefined);
          setValue('sale_date', data.sale_date || '');
          setValue('lane', data.lane || undefined);
          setValue('run', data.run || undefined);
          setValue('channel', data.channel || 'Simulcast');
          setValue('facilitating_location', data.facilitating_location || '');
          setValue('vehicle_location', data.vehicle_location || '');
          setValue('pickup_location_address1', data.pickup_location_address1 || '');
          setValue('pickup_location_city', data.pickup_location_city || '');
          setValue('pickup_location_state', data.pickup_location_state || '');
          setValue('pickup_location_zip', data.pickup_location_zip || '');
          setValue('pickup_location_phone', data.pickup_location_phone || '');
          setValue('seller_name', data.seller_name || '');
          setValue('buyer_dealership', data.buyer_dealership || '');
          setValue('buyer_contact_name', data.buyer_contact_name || '');
          setValue('buyer_aa_id', data.buyer_aa_id || '');
          setValue('buyer_reference', data.buyer_reference || '');
          setValue('sale_invoice_status', data.sale_invoice_status || 'UNPAID');
          
          if (data.sale_date) {
            setSelectedDate(new Date(data.sale_date));
          }
        }
      } catch (error: any) {
        console.error('Error loading vehicle:', error);
        toast.error(error.message || 'Failed to load vehicle');
        router.push('/admin/inventory');
      } finally {
        setIsLoading(false);
      }
    };

    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId, setValue, router]);

  const onSubmit = async (data: VehicleInput) => {
    // Validate VIN before submission
    if (data.vin && data.vin.trim() !== '' && data.vin.trim().length !== 10) {
      toast.error('VIN must be exactly 10 characters');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const cleanedData: VehicleInsert = {
        ...data,
        vin: data.vin && data.vin.trim() !== '' ? data.vin.trim() : undefined,
        sale_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
      };

      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key as keyof VehicleInsert] === undefined || cleanedData[key as keyof VehicleInsert] === '') {
          delete cleanedData[key as keyof VehicleInsert];
        }
      });

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle');
      }

      toast.success('Vehicle updated successfully!');
      router.push('/admin/inventory');
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      toast.error(error.message || 'Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <Car className="w-16 h-16 mb-4" style={{ color: 'var(--subtext)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Vehicle not found</h2>
        <Button onClick={() => router.push('/admin/inventory')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                Edit Vehicle
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--subtext)' }}>
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.vin ? `(${vehicle.vin})` : ''}
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--text)' }}>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="make" style={{ color: 'var(--text)' }}>Make *</Label>
                      <Input
                        id="make"
                        {...register('make')}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="model" style={{ color: 'var(--text)' }}>Model *</Label>
                      <Input
                        id="model"
                        {...register('model')}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year" style={{ color: 'var(--text)' }}>Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        {...register('year', { valueAsNumber: true })}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="vin" style={{ color: 'var(--text)' }}>VIN</Label>
                      <Input
                        id="vin"
                        maxLength={10}
                        {...register('vin', {
                          validate: (value) => {
                            if (!value || value.trim() === '') return true; // Optional field
                            if (value.length !== 10) {
                              return 'VIN must be exactly 10 characters';
                            }
                            return true;
                          }
                        })}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      {errors.vin && (
                        <p className="text-red-500 text-sm mt-1">{errors.vin.message}</p>
                      )}
                      {watch('vin') && watch('vin').trim().length > 0 && watch('vin').trim().length !== 10 && (
                        <p className="text-red-500 text-sm mt-1">VIN must be exactly 10 characters</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status" style={{ color: 'var(--text)' }}>Status</Label>
                      <Select
                        value={watch('status')}
                        onValueChange={(value) => setValue('status', value as any)}
                      >
                        <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status} style={{ color: 'var(--text)' }}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bought_price" style={{ color: 'var(--text)' }}>Bought Price</Label>
                      <Input
                        id="bought_price"
                        type="number"
                        step="0.01"
                        {...register('bought_price', { valueAsNumber: true })}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--text)' }}>Status & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title_status" style={{ color: 'var(--text)' }}>Title Status</Label>
                      <Select
                        value={watch('title_status')}
                        onValueChange={(value) => setValue('title_status', value as any)}
                      >
                        <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                          {titleStatusOptions.map((status) => (
                            <SelectItem key={status} value={status} style={{ color: 'var(--text)' }}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="odometer" style={{ color: 'var(--text)' }}>Odometer</Label>
                      <Input
                        id="odometer"
                        type="number"
                        {...register('odometer', { valueAsNumber: true })}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Location & Details */}
            <div className="space-y-6">
              <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--text)' }}>Location Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle_location" style={{ color: 'var(--text)' }}>Vehicle Location</Label>
                    <Select
                      value={watch('vehicle_location') || ''}
                      onValueChange={(value) => setValue('vehicle_location', value)}
                    >
                      <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                        {locationOptions.map((location) => (
                          <SelectItem key={location.value} value={location.value} style={{ color: 'var(--text)' }}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="facilitating_location" style={{ color: 'var(--text)' }}>Facilitating Location</Label>
                    <Input
                      id="facilitating_location"
                      {...register('facilitating_location')}
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--text)' }}>Auction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sale_date" style={{ color: 'var(--text)' }}>Sale Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lane" style={{ color: 'var(--text)' }}>Lane</Label>
                      <Input
                        id="lane"
                        type="number"
                        {...register('lane', { valueAsNumber: true })}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="run" style={{ color: 'var(--text)' }}>Run</Label>
                      <Input
                        id="run"
                        type="number"
                        {...register('run', { valueAsNumber: true })}
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sticky Update Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              size="lg"
              className="shadow-lg update-all-btn"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                borderRadius: '12px',
                padding: '12px 24px',
                border: '2px solid',
                borderColor: 'var(--accent)',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update All
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

