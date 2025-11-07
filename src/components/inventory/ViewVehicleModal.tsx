'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Car, Calendar as CalendarIcon, DollarSign, MapPin, User, FileText, CheckCircle, AlertCircle, ClipboardList, ClipboardCheck, Wrench, Truck, Clock, Upload, Download, X, Plus, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { TaskWithRelations } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ViewVehicleModalProps {
  vehicle: VehicleWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

interface VehicleNote {
  id: string;
  note_text: string;
  created_at: string;
  updated_at?: string;
}

interface VehicleImage {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
}

export function ViewVehicleModal({ vehicle, isOpen, onClose }: ViewVehicleModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [vehicleTasks, setVehicleTasks] = useState<TaskWithRelations[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [notes, setNotes] = useState<VehicleNote[]>([]);
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState(vehicle?.status || 'Pending');
  const [titleStatus, setTitleStatus] = useState(vehicle?.title_status || 'Absent');
  const [arbStatus, setArbStatus] = useState((vehicle as any)?.arb_status || 'Absent');
  const [auctionName, setAuctionName] = useState((vehicle as any)?.auction_name || '');
  const [auctionDate, setAuctionDate] = useState<Date | undefined>(
    (vehicle as any)?.auction_date ? new Date((vehicle as any).auction_date) : undefined
  );
  const [isUpdatingAuction, setIsUpdatingAuction] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!vehicle) return null;

  // Load tasks for this vehicle
  useEffect(() => {
    if (isOpen && vehicle?.id) {
      const loadTasks = async () => {
        try {
          setIsLoadingTasks(true);
          const response = await fetch(`/api/tasks?vehicleId=${vehicle.id}&limit=100`);
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
  }, [isOpen, vehicle?.id]);

  // Load notes and images
  useEffect(() => {
    if (isOpen && vehicle?.id) {
      const loadNotes = async () => {
        try {
          setIsLoadingNotes(true);
          const response = await fetch(`/api/vehicles/${vehicle.id}/notes`);
          if (response.ok) {
            const { data } = await response.json();
            setNotes(data || []);
          }
        } catch (error) {
          console.error('Error loading notes:', error);
        } finally {
          setIsLoadingNotes(false);
        }
      };

      const loadImages = async () => {
        try {
          setIsLoadingImages(true);
          const response = await fetch(`/api/vehicles/${vehicle.id}/images`);
          if (response.ok) {
            const { data } = await response.json();
            setImages(data || []);
          }
        } catch (error) {
          console.error('Error loading images:', error);
        } finally {
          setIsLoadingImages(false);
        }
      };

      loadNotes();
      loadImages();
    }
  }, [isOpen, vehicle?.id]);

  // Initialize state from vehicle
  useEffect(() => {
    if (vehicle) {
      setStatus(vehicle.status || 'Pending');
      setTitleStatus(vehicle.title_status || 'Absent');
      setArbStatus((vehicle as any)?.arb_status || 'Absent');
      setAuctionName((vehicle as any)?.auction_name || '');
      setAuctionDate((vehicle as any)?.auction_date ? new Date((vehicle as any).auction_date) : undefined);
    }
  }, [vehicle]);

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    { id: 'parts', label: 'Parts & Expenses', icon: Wrench },
    { id: 'dispatch', label: 'Central Dispatch', icon: Truck },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  const handleDownload = () => {
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
        vehicle.vin || '',
        vehicle.year || '',
        vehicle.make || '',
        vehicle.model || '',
        vehicle.trim || '',
        vehicle.exterior_color || '',
        vehicle.interior_color || '',
        vehicle.status || '',
        vehicle.odometer || '',
        vehicle.title_status || '',
        vehicle.psi_status || '',
        vehicle.dealshield_arbitration_status || '',
        vehicle.bought_price || '',
        vehicle.buy_fee || '',
        vehicle.sale_invoice || '',
        vehicle.other_charges || '',
        vehicle.total_vehicle_cost || '',
        vehicle.sale_date || '',
        vehicle.lane || '',
        vehicle.run || '',
        vehicle.channel || '',
        vehicle.facilitating_location || '',
        vehicle.vehicle_location || '',
        vehicle.pickup_location_address1 || '',
        vehicle.pickup_location_city || '',
        vehicle.pickup_location_state || '',
        vehicle.pickup_location_zip || '',
        vehicle.pickup_location_phone || '',
        vehicle.seller_name || '',
        vehicle.buyer_dealership || '',
        vehicle.buyer_contact_name || '',
        vehicle.buyer_aa_id || '',
        vehicle.sale_invoice_status || ''
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400';
      case 'ARB':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'Sold':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const statusOptions = ['Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'];
  const titleStatusOptions = ['Absent', 'In Transit', 'Received', 'Available not Received', 'Present', 'Released', 'Validated', 'Sent but not Validated'];
  const arbStatusOptions = ['Absent', 'Present', 'In Transit', 'Failed'];
  const auctionOptions = ['iaai', 'Manheim', 'CarMax', 'Adesa', 'Western', 'Default Auction'];
  const locationOptions = ['Missing', 'Shop/Mechanic', 'Auction', 'Other Mechanic', 'Unknown', 'Other', 'PDR'];

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Only JPG/PNG files under 10MB are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setIsUploadingImage(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/vehicles/${vehicle.id}/images`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} image(s)`);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload images
      const response = await fetch(`/api/vehicles/${vehicle.id}/images`);
      if (response.ok) {
        const { data } = await response.json();
        setImages(data || []);
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast.success('Image deleted successfully');
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error.message || 'Failed to delete image');
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!newNoteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsSavingNote(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: newNoteText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save note');
      }

      const { data } = await response.json();
      setNotes(prev => [data, ...prev]);
      setNewNoteText('');
      toast.success('Note added successfully');
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error(error.message || 'Failed to add note');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Handle update note
  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: editingNoteText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update note');
      }

      const { data } = await response.json();
      setNotes(prev => prev.map(note => note.id === noteId ? data : note));
      setEditingNoteId(null);
      setEditingNoteText('');
      toast.success('Note updated successfully');
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error(error.message || 'Failed to update note');
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      toast.success('Note deleted successfully');
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error(error.message || 'Failed to delete note');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (field: string, value: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      toast.success('Status updated successfully');
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle auction update
  const handleAuctionUpdate = async () => {
    setIsUpdatingAuction(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auction_name: auctionName,
          auction_date: auctionDate ? format(auctionDate, 'yyyy-MM-dd') : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update auction details');
      }

      toast.success('Auction details updated successfully');
    } catch (error: any) {
      console.error('Error updating auction:', error);
      toast.error(error.message || 'Failed to update auction details');
    } finally {
      setIsUpdatingAuction(false);
    }
  };

  // Check if BW History should be shown
  const shouldShowBWHistory = () => {
    return vehicle.status === 'ARB' || (vehicle.status === 'Sold' && arbStatus !== 'Absent');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            <div className="flex items-center">
              <Car className="w-6 h-6 mr-2" />
              Vehicle Details
            </div>
            {activeTab === 'details' && (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="title-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploadingImage(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const response = await fetch(`/api/vehicles/${vehicle.id}/images`, {
                          method: 'POST',
                          body: formData,
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || 'Failed to upload title');
                        }

                        toast.success('Title document uploaded successfully');
                        
                        // Reload images
                        const imagesResponse = await fetch(`/api/vehicles/${vehicle.id}/images`);
                        if (imagesResponse.ok) {
                          const { data } = await imagesResponse.json();
                          setImages(data || []);
                        }
                      } catch (error: any) {
                        console.error('Error uploading title:', error);
                        toast.error(error.message || 'Failed to upload title document');
                      } finally {
                        setIsUploadingImage(false);
                        if (e.target) {
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }
                  }}
                />
                <label htmlFor="title-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-slate-600 hover:bg-slate-700/50 cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Title
                    </span>
                  </Button>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-slate-600 hover:bg-slate-700/50"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            Complete information about this vehicle
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
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

        <div className="space-y-6 mt-4">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <>
              {/* Vehicle Section - Display Only */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Car className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Vehicle Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Make</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicle.make}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Model</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicle.model}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Year</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicle.year}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>VIN</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicle.vin || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Purchase Date</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>
                      {(vehicle as any)?.purchase_date 
                        ? format(new Date((vehicle as any).purchase_date), 'MM/dd/yyyy')
                        : vehicle.sale_date 
                        ? format(new Date(vehicle.sale_date), 'MM/dd/yyyy')
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Odometer</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>
                      {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} mi` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Bought Price</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>
                      {vehicle.bought_price ? `$${vehicle.bought_price.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Location</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>
                      {vehicle.vehicle_location || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section - Editable */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Status</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Status</label>
                    <Select
                      value={status}
                      onValueChange={(value) => {
                        setStatus(value);
                        handleStatusUpdate('status', value);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Title Status</label>
                    <Select
                      value={titleStatus}
                      onValueChange={(value) => {
                        setTitleStatus(value);
                        handleStatusUpdate('title_status', value);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {titleStatusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>ARB Status</label>
                    <Select
                      value={arbStatus}
                      onValueChange={(value) => {
                        setArbStatus(value);
                        handleStatusUpdate('arb_status', value);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {arbStatusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    {shouldShowBWHistory() && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        onClick={() => toast.info('BW History feature coming soon')}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        BW History
                      </Button>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                        Exported
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auction Section */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Auction</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Select Auction</label>
                    <Select
                      value={auctionName}
                      onValueChange={setAuctionName}
                    >
                      <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                        <SelectValue placeholder="Select auction" />
                      </SelectTrigger>
                      <SelectContent>
                        {auctionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Auction Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {auctionDate ? format(auctionDate, 'MM/dd/yyyy') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                        <Calendar
                          mode="single"
                          selected={auctionDate}
                          onSelect={setAuctionDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAuctionUpdate}
                      disabled={isUpdatingAuction}
                      className="w-full"
                      style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                    >
                      {isUpdatingAuction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image Upload and Notes Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Upload - Left Side */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <ImageIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Images</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </Button>
                      </label>
                      <p className="text-xs mt-2" style={{ color: 'var(--subtext)' }}>
                        {selectedFiles.length > 0 
                          ? `${selectedFiles.length} file(s) selected` 
                          : 'No file chosen'}
                      </p>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                              <span className="text-sm truncate flex-1" style={{ color: 'var(--text)' }}>{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                className="ml-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedFiles.length > 0 && (
                      <Button
                        onClick={handleImageUpload}
                        disabled={isUploadingImage}
                        className="w-full"
                        style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Images
                          </>
                        )}
                      </Button>
                    )}

                    {/* Display uploaded images */}
                    {isLoadingImages ? (
                      <div className="text-center py-4" style={{ color: 'var(--subtext)' }}>Loading images...</div>
                    ) : images.length === 0 ? (
                      <div className="text-center py-4 text-sm" style={{ color: 'var(--subtext)' }}>No images uploaded</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {images.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.file_url}
                              alt={image.file_name}
                              className="w-full h-32 object-cover rounded"
                              style={{ border: '1px solid var(--border)' }}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes - Right Side */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Notes</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Add new note */}
                    <div>
                      <Textarea
                        placeholder="Enter your notes here"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="min-h-[100px]"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      <Button
                        onClick={handleAddNote}
                        disabled={isSavingNote || !newNoteText.trim()}
                        className="mt-2 w-full"
                        style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                      >
                        {isSavingNote ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Note
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Display existing notes */}
                    {isLoadingNotes ? (
                      <div className="text-center py-4" style={{ color: 'var(--subtext)' }}>Loading notes...</div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-4 text-sm" style={{ color: 'var(--subtext)' }}>No notes available</div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded"
                            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                          >
                            {editingNoteId === note.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  className="min-h-[80px]"
                                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateNote(note.id)}
                                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingNoteId(null);
                                      setEditingNoteText('');
                                    }}
                                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm mb-2" style={{ color: 'var(--text)' }}>{note.note_text}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs" style={{ color: 'var(--subtext)' }}>
                                    {format(new Date(note.created_at), 'MM/dd/yyyy HH:mm')}
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingNoteId(note.id);
                                        setEditingNoteText(note.note_text);
                                      }}
                                      style={{ color: 'var(--text)' }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteNote(note.id)}
                                      style={{ color: '#ef4444' }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
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
          {activeTab === 'assessment' && (
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
          {activeTab === 'parts' && (
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
          {activeTab === 'dispatch' && (
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
          {activeTab === 'timeline' && (
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
                      {vehicle.created_at ? format(new Date(vehicle.created_at), 'MMMM dd, yyyy HH:mm') : 'N/A'}
                    </div>
                  </div>
                </div>
                {vehicle.updated_at && vehicle.updated_at !== vehicle.created_at && (
                  <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--accent)' }} />
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: 'var(--text)' }}>Last Updated</div>
                      <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                        {format(new Date(vehicle.updated_at), 'MMMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

