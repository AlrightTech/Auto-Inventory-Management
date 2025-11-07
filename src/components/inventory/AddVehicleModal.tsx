'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X, Plus, Car, Loader2, FileText, ClipboardList, ClipboardCheck, Wrench, Truck, Clock, Upload, Download } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { toast } from 'sonner';
import { VehicleInsert, VehicleWithRelations } from '@/types/vehicle';
import { TaskWithRelations } from '@/types';
import { vehicleSchema, VehicleInput } from '@/lib/validations/inventory';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded?: () => void;
  vehicleToEdit?: VehicleWithRelations;
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

export function AddVehicleModal({ isOpen, onClose, onVehicleAdded, vehicleToEdit }: AddVehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('details');
  const [vehicleTasks, setVehicleTasks] = useState<TaskWithRelations[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Load tasks for this vehicle when editing
  useEffect(() => {
    if (isOpen && vehicleToEdit?.id) {
      const loadTasks = async () => {
        try {
          setIsLoadingTasks(true);
          const response = await fetch(`/api/tasks?vehicleId=${vehicleToEdit.id}&limit=100`);
          if (response.ok) {
            const { data } = await response.json();
            setVehicleTasks(data || []);
          }
        } catch (error) {
          console.error('Error loading tasks:', error);
        } finally {
          setIsLoadingTasks(false);
        }
      };
      loadTasks();
    }
  }, [isOpen, vehicleToEdit?.id]);

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    { id: 'parts', label: 'Parts & Expenses', icon: Wrench },
    { id: 'dispatch', label: 'Central Dispatch', icon: Truck },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

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
      status: 'Pending',
      title_status: 'Absent',
      sale_invoice_status: 'UNPAID',
      channel: 'Simulcast',
      psi_status: 'Not Eligible',
      dealshield_arbitration_status: '--',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (vehicleToEdit && isOpen) {
      reset({
        make: vehicleToEdit.make || '',
        model: vehicleToEdit.model || '',
        year: vehicleToEdit.year || undefined,
        vin: vehicleToEdit.vin || '',
        trim: vehicleToEdit.trim || '',
        exterior_color: vehicleToEdit.exterior_color || '',
        interior_color: vehicleToEdit.interior_color || '',
        status: vehicleToEdit.status || 'Pending',
        odometer: vehicleToEdit.odometer || undefined,
        title_status: vehicleToEdit.title_status || 'Absent',
        psi_status: vehicleToEdit.psi_status || 'Not Eligible',
        dealshield_arbitration_status: vehicleToEdit.dealshield_arbitration_status || '--',
        bought_price: vehicleToEdit.bought_price || undefined,
        buy_fee: vehicleToEdit.buy_fee || undefined,
        other_charges: vehicleToEdit.other_charges || undefined,
        sale_date: vehicleToEdit.sale_date || '',
        lane: vehicleToEdit.lane || undefined,
        run: vehicleToEdit.run || undefined,
        channel: vehicleToEdit.channel || 'Simulcast',
        facilitating_location: vehicleToEdit.facilitating_location || '',
        vehicle_location: vehicleToEdit.vehicle_location || '',
        pickup_location_address1: vehicleToEdit.pickup_location_address1 || '',
        pickup_location_city: vehicleToEdit.pickup_location_city || '',
        pickup_location_state: vehicleToEdit.pickup_location_state || '',
        pickup_location_zip: vehicleToEdit.pickup_location_zip || '',
        pickup_location_phone: vehicleToEdit.pickup_location_phone || '',
        seller_name: vehicleToEdit.seller_name || '',
        buyer_dealership: vehicleToEdit.buyer_dealership || '',
        buyer_contact_name: vehicleToEdit.buyer_contact_name || '',
        buyer_aa_id: vehicleToEdit.buyer_aa_id || '',
        buyer_reference: vehicleToEdit.buyer_reference || '',
        sale_invoice_status: vehicleToEdit.sale_invoice_status || 'UNPAID',
      });

      if (vehicleToEdit.sale_date) {
        setSelectedDate(new Date(vehicleToEdit.sale_date));
      }
    } else if (!vehicleToEdit && isOpen) {
      // Reset form for new vehicle
      reset({
        status: 'Pending',
        title_status: 'Absent',
        sale_invoice_status: 'UNPAID',
        channel: 'Simulcast',
        psi_status: 'Not Eligible',
        dealshield_arbitration_status: '--',
      });
      setSelectedDate(new Date());
    }
  }, [vehicleToEdit, isOpen, reset]);

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

      const url = vehicleToEdit ? `/api/vehicles/${vehicleToEdit.id}` : '/api/vehicles';
      const method = vehicleToEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${vehicleToEdit ? 'update' : 'create'} vehicle`);
      }

      const result = await response.json();
      
      toast.success(`Vehicle ${vehicleToEdit ? 'updated' : 'added'} successfully!`);
      
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
          <DialogContent className={`dashboard-card neon-glow instrument-cluster ${vehicleToEdit ? 'max-w-6xl' : 'max-w-4xl'} no-scroll`}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center justify-between" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
                <div className="flex items-center">
                  <Car className="w-6 h-6 mr-2" />
                  {vehicleToEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                </div>
                {vehicleToEdit && activeTab === 'details' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-slate-600 hover:bg-slate-700/50"
                      onClick={() => toast.info('Upload Title feature coming soon')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Title
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-slate-600 hover:bg-slate-700/50"
                      onClick={() => {
                        const vehicle = vehicleToEdit;
                        try {
                          const escapeCsvValue = (value: any): string => {
                            if (value === null || value === undefined) return '';
                            const stringValue = String(value);
                            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                              return `"${stringValue.replace(/"/g, '""')}"`;
                            }
                            return stringValue;
                          };

                          const headers = [
                            'VIN', 'Year', 'Make', 'Model', 'Trim', 'Exterior Color', 'Interior Color',
                            'Status', 'Odometer', 'Title Status', 'PSI Status', 'Dealshield Arbitration Status',
                            'Bought Price', 'Buy Fee', 'Sale Invoice', 'Other Charges', 'Total Vehicle Cost',
                            'Sale Date', 'Lane', 'Run', 'Channel', 'Facilitating Location', 'Vehicle Location',
                            'Pickup Location Address1', 'Pickup Location City', 'Pickup Location State',
                            'Pickup Location Zip', 'Pickup Location Phone', 'Seller Name', 'Buyer Dealership',
                            'Buyer Contact Name', 'Buyer AA ID', 'Sale Invoice Status'
                          ];

                          const csvRow = [
                            vehicle.vin || '', vehicle.year || '', vehicle.make || '', vehicle.model || '',
                            vehicle.trim || '', vehicle.exterior_color || '', vehicle.interior_color || '',
                            vehicle.status || '', vehicle.odometer || '', vehicle.title_status || '',
                            vehicle.psi_status || '', vehicle.dealshield_arbitration_status || '',
                            vehicle.bought_price || '', vehicle.buy_fee || '', vehicle.sale_invoice || '',
                            vehicle.other_charges || '', vehicle.total_vehicle_cost || '', vehicle.sale_date || '',
                            vehicle.lane || '', vehicle.run || '', vehicle.channel || '',
                            vehicle.facilitating_location || '', vehicle.vehicle_location || '',
                            vehicle.pickup_location_address1 || '', vehicle.pickup_location_city || '',
                            vehicle.pickup_location_state || '', vehicle.pickup_location_zip || '',
                            vehicle.pickup_location_phone || '', vehicle.seller_name || '',
                            vehicle.buyer_dealership || '', vehicle.buyer_contact_name || '',
                            vehicle.buyer_aa_id || '', vehicle.sale_invoice_status || ''
                          ];

                          const csvContent = [
                            headers.map(escapeCsvValue).join(','),
                            csvRow.map(escapeCsvValue).join(',')
                          ].join('\n');

                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          const fileName = `${vehicle.year}-${vehicle.make}-${vehicle.model}-${vehicle.vin || 'vehicle'}`.replace(/\s+/g, '-');
                          link.href = url;
                          link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.csv`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                          toast.success('Vehicle data downloaded successfully');
                        } catch (error) {
                          console.error('Error downloading vehicle:', error);
                          toast.error('Failed to download vehicle data');
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--subtext)' }}>
                {vehicleToEdit 
                  ? 'Update vehicle details and tracking information.'
                  : 'Add a new vehicle to your inventory with complete details and tracking information.'}
              </DialogDescription>
            </DialogHeader>

            {/* Tab Navigation - Only show when editing */}
            {vehicleToEdit && (
              <div className="border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex space-x-1 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 rounded-none border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-slate-400 hover:text-slate-300'
                        }`}
                        style={{
                          borderBottomColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                          color: activeTab === tab.id ? 'var(--accent)' : 'var(--subtext)',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="form-container mt-6" style={{ overflowY: 'visible', overflowX: 'hidden', maxHeight: 'none', height: 'auto' }}>
              {/* Details Tab Content */}
              {(activeTab === 'details' || !vehicleToEdit) && (
                <>
                {/* Vehicle Basic Information */}
                <div className="form-section">
                  <h3 className="text-lg font-semibold border-b pb-2" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                    Vehicle Information
                  </h3>
                  
                  <div className="form-row">
                    {/* Make */}
                    <div className="form-field">
                      <Label htmlFor="make" style={{ color: 'var(--text)' }}>
                        Make *
                      </Label>
                      <Input
                        id="make"
                        placeholder="e.g., Chevrolet"
                        {...register('make')}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                      {errors.make && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.make.message}</p>
                      )}
                    </div>

                    {/* Model */}
                    <div className="form-field">
                      <Label htmlFor="model" style={{ color: 'var(--text)' }}>
                        Model *
                      </Label>
                      <Input
                        id="model"
                        placeholder="e.g., Silverado"
                        {...register('model')}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                      {errors.model && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.model.message}</p>
                      )}
                    </div>

                    {/* Year */}
                    <div className="form-field">
                      <Label htmlFor="year" style={{ color: 'var(--text)' }}>
                        Year *
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="2021"
                        {...register('year', { valueAsNumber: true })}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                      {errors.year && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.year.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    {/* VIN */}
                    <div className="form-field">
                      <Label htmlFor="vin" style={{ color: 'var(--text)' }}>
                        VIN Number
                      </Label>
                      <Input
                        id="vin"
                        placeholder="17-character VIN (optional)"
                        maxLength={17}
                        {...register('vin')}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                      {errors.vin && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.vin.message}</p>
                      )}
                    </div>

                    {/* Trim */}
                    <div className="form-field">
                      <Label htmlFor="trim" style={{ color: 'var(--text)' }}>
                        Trim
                      </Label>
                      <Input
                        id="trim"
                        placeholder="e.g., LT, XLT"
                        {...register('trim')}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                    </div>

                    {/* Odometer */}
                    <div className="form-field">
                      <Label htmlFor="odometer" style={{ color: 'var(--text)' }}>
                        Odometer (miles)
                      </Label>
                      <Input
                        id="odometer"
                        type="number"
                        placeholder="45000"
                        {...register('odometer', { valueAsNumber: true })}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                      {errors.odometer && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.odometer.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    {/* Exterior Color */}
                    <div className="form-field">
                      <Label htmlFor="exterior_color" style={{ color: 'var(--text)' }}>
                        Exterior Color
                      </Label>
                      <Input
                        id="exterior_color"
                        placeholder="e.g., Blue, White, Black"
                        {...register('exterior_color')}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                    </div>

                    {/* Interior Color */}
                    <div className="form-field">
                      <Label htmlFor="interior_color" style={{ color: 'var(--text)' }}>
                        Interior Color
                      </Label>
                      <Input
                        id="interior_color"
                        placeholder="e.g., Black, Gray, Beige"
                        {...register('interior_color')}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status and Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                    Status & Financial Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status" style={{ color: 'var(--text)' }}>
                        Status *
                      </Label>
                      <Select onValueChange={(value) => setValue('status', value as any)}>
                        <SelectTrigger className="control-panel" style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="dashboard-card neon-glow instrument-cluster">
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status} style={{ color: 'var(--text)' }}>
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
                      <Label htmlFor="title_status" style={{ color: 'var(--text)' }}>
                        Title Status
                      </Label>
                      <Select onValueChange={(value) => setValue('title_status', value as 'Present' | 'Absent')}>
                        <SelectTrigger className="control-panel" style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}>
                          <SelectValue placeholder="Select title status" />
                        </SelectTrigger>
                        <SelectContent className="dashboard-card neon-glow instrument-cluster">
                          <SelectItem value="Present" style={{ color: 'var(--text)' }}>Present</SelectItem>
                          <SelectItem value="Absent" style={{ color: 'var(--text)' }}>Absent</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.title_status && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.title_status.message}</p>
                      )}
                    </div>

                    {/* Sale Invoice Status */}
                    <div className="space-y-2">
                      <Label htmlFor="sale_invoice_status" style={{ color: 'var(--text)' }}>
                        Sale Invoice Status
                      </Label>
                      <Select onValueChange={(value) => setValue('sale_invoice_status', value as 'PAID' | 'UNPAID')}>
                        <SelectTrigger className="control-panel" style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}>
                          <SelectValue placeholder="Select invoice status" />
                        </SelectTrigger>
                        <SelectContent className="dashboard-card neon-glow instrument-cluster">
                          <SelectItem value="PAID" style={{ color: 'var(--text)' }}>PAID</SelectItem>
                          <SelectItem value="UNPAID" style={{ color: 'var(--text)' }}>UNPAID</SelectItem>
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
                      <Label htmlFor="bought_price" style={{ color: 'var(--text)' }}>
                        Bought Price ($)
                      </Label>
                      <Input
                        id="bought_price"
                        type="number"
                        step="0.01"
                        placeholder="25000.00"
                        {...register('bought_price', { valueAsNumber: true })}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                      {errors.bought_price && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.bought_price.message}</p>
                      )}
                    </div>

                    {/* Buy Fee */}
                    <div className="space-y-2">
                      <Label htmlFor="buy_fee" style={{ color: 'var(--text)' }}>
                        Buy Fee ($)
                      </Label>
                      <Input
                        id="buy_fee"
                        type="number"
                        step="0.01"
                        placeholder="735.00"
                        {...register('buy_fee', { valueAsNumber: true })}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                      {errors.buy_fee && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.buy_fee.message}</p>
                      )}
                    </div>

                    {/* Other Charges */}
                    <div className="space-y-2">
                      <Label htmlFor="other_charges" style={{ color: 'var(--text)' }}>
                        Other Charges ($)
                      </Label>
                      <Input
                        id="other_charges"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('other_charges', { valueAsNumber: true })}
                        className="control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
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
                </>
              )}

              {/* Tasks Tab - Only in Edit mode */}
              {vehicleToEdit && activeTab === 'tasks' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <ClipboardList className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Vehicle Tasks</h4>
                  </div>
                  {isLoadingTasks ? (
                    <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>Loading tasks...</div>
                  ) : vehicleTasks.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>No tasks assigned to this vehicle.</div>
                  ) : (
                    <div className="space-y-3">
                      {vehicleTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border"
                          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium mb-1" style={{ color: 'var(--text)' }}>{task.task_name}</h5>
                              {task.notes && (
                                <p className="text-sm mb-2" style={{ color: 'var(--subtext)' }}>{task.notes}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--subtext)' }}>
                                <span>Category: {task.category || 'N/A'}</span>
                                <span>Due: {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A'}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    task.status === 'completed'
                                      ? 'bg-green-500/20 text-green-400'
                                      : task.status === 'cancelled'
                                      ? 'bg-gray-500/20 text-gray-400'
                                      : 'bg-amber-500/20 text-amber-400'
                                  }
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Assessment Tab */}
              {vehicleToEdit && activeTab === 'assessment' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <ClipboardCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Vehicle Assessment</h4>
                  </div>
                  <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                    Assessment information will be displayed here.
                  </div>
                </div>
              )}

              {/* Parts & Expenses Tab */}
              {vehicleToEdit && activeTab === 'parts' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Wrench className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Parts & Expenses</h4>
                  </div>
                  <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                    Parts and expenses information will be displayed here.
                  </div>
                </div>
              )}

              {/* Central Dispatch Tab */}
              {vehicleToEdit && activeTab === 'dispatch' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Central Dispatch</h4>
                  </div>
                  <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                    Dispatch and delivery information will be displayed here.
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {vehicleToEdit && activeTab === 'timeline' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Activity Timeline</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--accent)' }} />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--text)' }}>Vehicle Created</div>
                        <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                          {vehicleToEdit.created_at ? format(new Date(vehicleToEdit.created_at), 'MMMM dd, yyyy HH:mm') : 'N/A'}
                        </div>
                      </div>
                    </div>
                    {vehicleToEdit.updated_at && vehicleToEdit.updated_at !== vehicleToEdit.created_at && (
                      <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--accent)' }} />
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: 'var(--text)' }}>Last Updated</div>
                          <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                            {format(new Date(vehicleToEdit.updated_at), 'MMMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

                  {/* Action Buttons - Only show on Details tab or when adding */}
                  {(activeTab === 'details' || !vehicleToEdit) && (
                  <div className="form-actions">
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
                          Adding Vehicle...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          {vehicleToEdit ? 'Update Vehicle' : 'Add Vehicle'}
                        </>
                      )}
                    </Button>
                  </div>
                  )}
              </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
