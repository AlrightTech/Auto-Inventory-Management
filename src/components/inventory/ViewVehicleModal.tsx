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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Car, Calendar as CalendarIcon, DollarSign, MapPin, User, FileText, CheckCircle, AlertCircle, ClipboardList, ClipboardCheck, Wrench, Truck, Clock, Upload, Download, X, Plus, Image as ImageIcon, Link as LinkIcon, Loader2, Edit, Trash2, MoreHorizontal, FileText as FileTextIcon } from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { TaskWithRelations, User as UserType } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { AddAssessmentModal } from '@/components/inventory/AddAssessmentModal';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { createClient } from '@/lib/supabase/client';

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
  const [status, setStatus] = useState<'Pending' | 'Sold' | 'Withdrew' | 'Complete' | 'ARB' | 'In Progress'>((vehicle?.status as any) || 'Pending');
  const [titleStatus, setTitleStatus] = useState<'Absent' | 'In Transit' | 'Received' | 'Available not Received' | 'Present' | 'Released' | 'Validated' | 'Sent but not Validated'>((vehicle?.title_status as any) || 'Absent');
  const [arbStatus, setArbStatus] = useState((vehicle as any)?.arb_status || 'Absent');
  const [auctionName, setAuctionName] = useState((vehicle as any)?.auction_name || '');
  const [auctionDate, setAuctionDate] = useState<Date | undefined>(
    (vehicle as any)?.auction_date ? new Date((vehicle as any).auction_date) : undefined
  );
  const [isUpdatingAuction, setIsUpdatingAuction] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  
  // Initialize Supabase client
  const supabase = createClient();
  
  // Expense state
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [editingExpenseCostId, setEditingExpenseCostId] = useState<string | null>(null);
  const [editingExpenseCostValue, setEditingExpenseCostValue] = useState('');
  const [editingExpenseNoteId, setEditingExpenseNoteId] = useState<string | null>(null);
  const [editingExpenseNoteValue, setEditingExpenseNoteValue] = useState('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [isAddAssessmentModalOpen, setIsAddAssessmentModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [assessmentsCurrentPage, setAssessmentsCurrentPage] = useState(1);
  const assessmentsPerPage = 10;
  
  // Dispatch state
  const [dispatchRecords, setDispatchRecords] = useState<any[]>([]);
  const [isLoadingDispatch, setIsLoadingDispatch] = useState(false);
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    location: '',
    transportCompany: '',
    transportCost: '',
    notes: '',
    address: '',
    state: '',
    zip: '',
    acAssignCarrier: '',
  });
  const [dispatchFile, setDispatchFile] = useState<File | null>(null);
  const [editingDispatch, setEditingDispatch] = useState<any | null>(null);
  const dispatchFileInputRef = useRef<HTMLInputElement>(null);
  
  // Timeline state
  const [timelineEntries, setTimelineEntries] = useState<any[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [timelineCurrentPage, setTimelineCurrentPage] = useState(1);
  const timelinePerPage = 10;

  // Paginated assessments
  const paginatedAssessments = assessments.slice(
    (assessmentsCurrentPage - 1) * assessmentsPerPage,
    assessmentsCurrentPage * assessmentsPerPage
  );
  const assessmentsTotalPages = Math.ceil(assessments.length / assessmentsPerPage);

  // Load tasks for this vehicle
  useEffect(() => {
    if (isOpen && vehicle?.id && activeTab === 'tasks') {
      const loadTasks = async () => {
        try {
          setIsLoadingTasks(true);
          const response = await fetch(`/api/tasks?vehicleId=${vehicle.id}&limit=100`);
          if (response.ok) {
            const responseData = await response.json();
            const tasks = responseData.data || responseData || [];
            // Ensure tasks is an array and filter out any invalid entries
            setVehicleTasks(Array.isArray(tasks) ? tasks : []);
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to load tasks:', response.statusText, errorData);
            setVehicleTasks([]);
            // Don't show error toast for 404 or empty results
            if (response.status !== 404) {
              toast.error('Failed to load tasks');
            }
          }
        } catch (error: any) {
          console.error('Error loading tasks:', error);
          setVehicleTasks([]);
          // Only show error if it's not a network error or expected error
          if (error?.message && !error.message.includes('fetch')) {
            toast.error('Failed to load tasks');
          }
        } finally {
          setIsLoadingTasks(false);
        }
      };
      loadTasks();
    } else if (!isOpen || !vehicle?.id) {
      setVehicleTasks([]);
    }
  }, [isOpen, vehicle?.id, activeTab]);

  // Load assessments for this vehicle
  useEffect(() => {
    if (isOpen && vehicle?.id && activeTab === 'assessment') {
      const loadAssessments = async () => {
        try {
          setIsLoadingAssessments(true);
          const response = await fetch(`/api/vehicles/${vehicle.id}/assessments`);
          if (response.ok) {
            const { data } = await response.json();
            setAssessments(data || []);
          } else {
            setAssessments([]);
          }
        } catch (error) {
          console.error('Error loading assessments:', error);
          setAssessments([]);
        } finally {
          setIsLoadingAssessments(false);
        }
      };
      loadAssessments();
    } else {
      setAssessments([]);
    }
  }, [isOpen, vehicle?.id, activeTab]);

  // Load dispatch records for this vehicle
  useEffect(() => {
    if (isOpen && vehicle?.id && activeTab === 'dispatch') {
      const loadDispatchRecords = async () => {
        try {
          setIsLoadingDispatch(true);
          const response = await fetch(`/api/vehicles/${vehicle.id}/dispatch`);
          if (response.ok) {
            const { data } = await response.json();
            setDispatchRecords(data || []);
          } else {
            // If endpoint doesn't exist yet, initialize empty array
            setDispatchRecords([]);
          }
        } catch (error) {
          console.error('Error loading dispatch records:', error);
          setDispatchRecords([]);
        } finally {
          setIsLoadingDispatch(false);
        }
      };
      loadDispatchRecords();
    }
  }, [isOpen, vehicle?.id, activeTab]);

  // Load timeline entries for this vehicle
  useEffect(() => {
    if (isOpen && vehicle?.id && activeTab === 'timeline') {
      const loadTimeline = async () => {
        try {
          setIsLoadingTimeline(true);
          const response = await fetch(`/api/vehicles/${vehicle.id}/timeline?page=${timelineCurrentPage}&limit=${timelinePerPage}`);
          if (response.ok) {
            const { data } = await response.json();
            // Sort by newest first (chronological order: newest â†’ oldest)
            const sorted = (data || []).sort((a: any, b: any) => {
              const dateA = new Date(a.created_at || a.date || 0).getTime();
              const dateB = new Date(b.created_at || b.date || 0).getTime();
              return dateB - dateA;
            });
            setTimelineEntries(sorted);
          } else {
            // If endpoint doesn't exist yet, create initial timeline from vehicle data
            const initialTimeline = [];
            if (vehicle?.created_at) {
              initialTimeline.push({
                id: `vehicle-created-${vehicle.id}`,
                action: 'Vehicle Created',
                user: 'System',
                date: format(new Date(vehicle.created_at), 'yyyy-MM-dd'),
                time: format(new Date(vehicle.created_at), 'HH:mm:ss'),
                cost: null,
                expense: null,
                note: 'Vehicle record created',
                status: 'Asset',
                created_at: vehicle.created_at,
              });
            }
            setTimelineEntries(initialTimeline);
          }
        } catch (error) {
          console.error('Error loading timeline:', error);
          setTimelineEntries([]);
        } finally {
          setIsLoadingTimeline(false);
        }
      };
      loadTimeline();
    } else {
      setTimelineEntries([]);
    }
  }, [isOpen, vehicle?.id, activeTab, timelineCurrentPage]);

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
          } else {
            setNotes([]);
          }
        } catch (error) {
          console.error('Error loading notes:', error);
          setNotes([]);
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
          } else {
            setImages([]);
          }
        } catch (error) {
          console.error('Error loading images:', error);
          setImages([]);
        } finally {
          setIsLoadingImages(false);
        }
      };

      loadNotes();
      loadImages();
    } else {
      setNotes([]);
      setImages([]);
    }
  }, [isOpen, vehicle?.id]);

  // Load users for assignment dropdown
  useEffect(() => {
    if (isOpen && activeTab === 'tasks' && supabase) {
      const loadUsers = async () => {
        try {
          const { data: usersData, error } = await supabase
            .from('profiles')
            .select('*')
            .order('username', { ascending: true });

          if (error) {
            console.error('Error loading users:', error);
            setUsers([]);
            return;
          }

          if (usersData) {
            const usersWithStatus: UserType[] = usersData.map(user => ({
              id: user.id,
              email: user.email,
              username: user.username || user.email.split('@')[0],
              role: user.role,
              isOnline: false,
              lastSeen: null,
              created_at: user.created_at,
            }));
            setUsers(usersWithStatus);
          } else {
            setUsers([]);
          }
        } catch (error) {
          console.error('Error loading users:', error);
          setUsers([]);
        }
      };
      loadUsers();
    } else {
      setUsers([]);
    }
  }, [isOpen, activeTab, supabase]);

  // Load expenses for this vehicle
  useEffect(() => {
    if (isOpen && vehicle?.id && activeTab === 'parts') {
      const loadExpenses = async () => {
        try {
          setIsLoadingExpenses(true);
          const response = await fetch(`/api/vehicles/${vehicle.id}/expenses`);
          if (response.ok) {
            const { data } = await response.json();
            setExpenses(data || []);
          }
        } catch (error) {
          console.error('Error loading expenses:', error);
        } finally {
          setIsLoadingExpenses(false);
        }
      };
      loadExpenses();
    }
  }, [isOpen, vehicle?.id, activeTab]);

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
      const fileName = `${vehicleYear}-${vehicleMake}-${vehicleModel}-${vehicleVin || 'vehicle'}`.replace(/\s+/g, '-');
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
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Only JPG/PNG files under 10MB are allowed.');
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) selected`);
    }
    
    // Reset input to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
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
    if (!vehicle?.id) {
      toast.error('Invalid vehicle');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update vehicle' }));
        throw new Error(errorData.error || 'Failed to update vehicle');
      }

      // Get updated data from API response
      const responseData = await response.json();
      const updatedData = responseData.data || responseData;
      
      // Update local state with API response data
      if (field === 'status') {
        setStatus(value as any);
      } else if (field === 'title_status') {
        setTitleStatus(value as any);
      } else if (field === 'arb_status') {
        setArbStatus(value);
      }

      toast.success(`${field.replace('_', ' ')} updated successfully`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error?.message || 'Failed to update vehicle');
      // Revert state on error
      if (field === 'status') {
        setStatus(vehicle.status as any);
      } else if (field === 'title_status') {
        setTitleStatus(vehicle.title_status as any);
      } else if (field === 'arb_status') {
        setArbStatus((vehicle as any)?.arb_status || 'Absent');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle auction update
  const handleAuctionUpdate = async () => {
    if (!vehicle?.id) {
      toast.error('Invalid vehicle');
      return;
    }
    setIsUpdatingAuction(true);
    try {
      const updatePayload: any = {
        auction_name: auctionName || null,
      };
      
      // Only include auction_date if we have a date value
      if (auctionDate) {
        updatePayload.auction_date = format(auctionDate, 'yyyy-MM-dd');
      }

      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update auction details' }));
        throw new Error(errorData.error || 'Failed to update auction details');
      }

      const responseData = await response.json();
      const updatedData = responseData.data || responseData;
      
      // Update local state
      if (updatedData) {
        setAuctionName(updatedData.auction_name || auctionName);
        if (updatedData.auction_date) {
          setAuctionDate(new Date(updatedData.auction_date));
        } else if (updatedData.auction_date === null || updatedData.auction_date === undefined) {
          setAuctionDate(undefined);
        }
      }
      
      toast.success('Auction details updated successfully');
    } catch (error: any) {
      console.error('Error updating auction:', error);
      toast.error(error?.message || 'Failed to update auction details');
    } finally {
      setIsUpdatingAuction(false);
    }
  };

  // Handle details update (all form fields)
  const handleDetailsUpdate = async () => {
    if (!vehicle?.id) {
      toast.error('Invalid vehicle');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      // Build update data, only including fields that have values
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (titleStatus) updateData.title_status = titleStatus;
      if (arbStatus) updateData.arb_status = arbStatus;
      if (auctionName !== undefined) updateData.auction_name = auctionName || null;
      // Only include auction_date if we have a date value
      // The backend will handle the column existence
      if (auctionDate) {
        updateData.auction_date = format(auctionDate, 'yyyy-MM-dd');
      }

      console.log('Updating vehicle with data:', updateData);

      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Update failed:', responseData);
        const errorMessage = responseData.error || responseData.details || 'Failed to update details';
        throw new Error(errorMessage);
      }

      const updatedData = responseData.data || responseData;
      
      // Update local state with API response
      if (updatedData) {
        if (updatedData.status) setStatus(updatedData.status as any);
        if (updatedData.title_status) setTitleStatus(updatedData.title_status as any);
        if (updatedData.arb_status !== undefined) setArbStatus(updatedData.arb_status);
        if (updatedData.auction_name !== undefined) setAuctionName(updatedData.auction_name || '');
        if (updatedData.auction_date) {
          setAuctionDate(new Date(updatedData.auction_date));
        } else if (updatedData.auction_date === null || updatedData.auction_date === undefined) {
          setAuctionDate(undefined);
        }
      }
      
      toast.success('All details updated successfully');
    } catch (error: any) {
      console.error('Error updating details:', error);
      const errorMessage = error?.message || 'Failed to update details';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Check if BW History should be shown
  const shouldShowBWHistory = () => {
    return vehicle.status === 'ARB' || (vehicle.status === 'Sold' && arbStatus !== 'Absent');
  };

  // Task management functions
  const handleAddTask = async (taskData: {
    task_name: string;
    vehicle_id: string;
    assigned_to: string;
    assigned_by: string;
    due_date: string;
    notes?: string;
    category: string;
  }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          vehicle_id: vehicle.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      toast.success('âœ… Task added successfully');
      setIsAddTaskModalOpen(false);
      
      // Reload tasks
      const tasksResponse = await fetch(`/api/tasks?vehicleId=${vehicle.id}&limit=100`);
      if (tasksResponse.ok) {
        const { data } = await tasksResponse.json();
        setVehicleTasks(data || []);
      }
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error(error.message || 'Failed to add task');
    }
  };

  const handleEditTask = (task: TaskWithRelations) => {
    if (!task || !task.id) {
      toast.error('Invalid task');
      return;
    }
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId || !vehicle?.id) {
      toast.error('Invalid task or vehicle');
      return;
    }
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete task' }));
        throw new Error(error.error || 'Failed to delete task');
      }

      toast.success('Task deleted successfully');
      setVehicleTasks(prev => (prev || []).filter(t => t.id !== taskId));
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error?.message || 'Failed to delete task');
    }
  };

  const handleMarkAsSold = async (taskId: string) => {
    if (!taskId || !vehicle?.id) {
      toast.error('Invalid task or vehicle');
      return;
    }
    try {
      // Update vehicle status to Sold
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Sold' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle status');
      }

      toast.success('Vehicle marked as Sold');
      
      // Optionally delete the task
      await handleDeleteTask(taskId);
    } catch (error: any) {
      console.error('Error marking as sold:', error);
      toast.error(error.message || 'Failed to mark vehicle as sold');
    }
  };

  const handleUpdateNotes = async (taskId: string) => {
    if (!taskId || !vehicle?.id) {
      toast.error('Invalid task or vehicle');
      return;
    }
    if (!editingNotesText.trim()) {
      toast.error('Please enter notes');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editingNotesText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update notes');
      }

      const { data } = await response.json();
      setVehicleTasks(prev => (prev || []).map(t => t.id === taskId ? data : t));
      setEditingNotesId(null);
      setEditingNotesText('');
      toast.success('Notes updated successfully');
    } catch (error: any) {
      console.error('Error updating notes:', error);
      toast.error(error?.message || 'Failed to update notes');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    if (!taskId || !vehicle?.id) {
      toast.error('Invalid task or vehicle');
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update task status' }));
        throw new Error(error.error || 'Failed to update task status');
      }

      const { data } = await response.json();
      setVehicleTasks(prev => (prev || []).map(t => t.id === taskId ? data : t));
      toast.success('Task status updated');
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error(error?.message || 'Failed to update task status');
    }
  };

  const handleAssignedChange = async (taskId: string, assignedTo: string) => {
    if (!taskId || !vehicle?.id) {
      toast.error('Invalid task or vehicle');
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: assignedTo || null }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update assignment' }));
        throw new Error(error.error || 'Failed to update assignment');
      }

      const { data } = await response.json();
      setVehicleTasks(prev => (prev || []).map(t => t.id === taskId ? data : t));
      toast.success('Assignment updated');
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      toast.error(error?.message || 'Failed to update assignment');
    }
  };

  const handleExportTasksPDF = () => {
    try {
      const vehicleName = `${vehicleYear} ${vehicleMake} ${vehicleModel}`;
      const vin = vehicleVin || 'N/A';
      const generatedDate = format(new Date(), 'MM/dd/yyyy HH:mm');

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tasks - ${vehicleName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              h2 { color: #666; font-size: 14px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .pending { background-color: #fff3cd; }
            </style>
          </head>
          <body>
            <h1>Vehicle Tasks Report</h1>
            <h2>Vehicle: ${vehicleName} | VIN: ${vin} | Generated: ${generatedDate}</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${vehicleTasks.map((task, index) => `
                  <tr class="${task.status === 'pending' ? 'pending' : ''}">
                    <td>${index + 1}</td>
                    <td>${task.task_name}</td>
                    <td>${task.status}</td>
                    <td>${task.due_date ? format(new Date(task.due_date), 'dd-MM-yyyy') : 'N/A'}</td>
                    <td>${task.assigned_user?.username || 'Not Assigned'}</td>
                    <td>${task.notes || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-${vehicleName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Tasks exported successfully. Open the HTML file and print to PDF.');
    } catch (error) {
      console.error('Error exporting tasks:', error);
      toast.error('Failed to export tasks');
    }
  };

  const handleExportAssessmentsPDF = () => {
    try {
      const vehicleName = `${vehicleYear} ${vehicleMake} ${vehicleModel}`;
      const vin = vehicleVin || 'N/A';
      const generatedDate = format(new Date(), 'MM/dd/yyyy HH:mm');

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Assessments - ${vehicleName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              h2 { color: #666; font-size: 14px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .pending { background-color: #fff3cd; }
            </style>
          </head>
          <body>
            <h1>Vehicle Assessments Report</h1>
            <h2>Vehicle: ${vehicleName} | VIN: ${vin} | Generated: ${generatedDate}</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Assessment Date</th>
                  <th>Assessment Time</th>
                  <th>Conducted By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${assessments.map((assessment, index) => `
                  <tr class="${assessment.status === 'Pending' ? 'pending' : ''}">
                    <td>${index + 1}</td>
                    <td>${assessment.assessment_date ? format(new Date(assessment.assessment_date), 'dd-MM-yyyy') : 'N/A'}</td>
                    <td>${assessment.assessment_time || 'N/A'}</td>
                    <td>${assessment.conducted_by || 'N/A'}</td>
                    <td>${assessment.status || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assessments-${vehicleName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Assessments exported successfully. Open the HTML file and print to PDF.');
    } catch (error) {
      console.error('Error exporting assessments:', error);
      toast.error('Failed to export assessments');
    }
  };

  const handleDownloadAssessment = (assessment: any) => {
    if (assessment.assessment_file_url) {
      window.open(assessment.assessment_file_url, '_blank');
    } else {
      toast.error('No file available for this assessment');
    }
  };

  const handleEditAssessment = (assessment: any) => {
    setEditingAssessment(assessment);
    setIsAddAssessmentModalOpen(true);
  };

  const handleAddOrUpdateAssessment = async (assessmentData: any) => {
    try {
      if (editingAssessment) {
        // Update existing assessment
        const response = await fetch(`/api/vehicles/${vehicle.id}/assessments/${editingAssessment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update assessment');
        }

        const { data } = await response.json();
        setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? data : a));
        toast.success('Assessment updated successfully');
        setEditingAssessment(null);
        setIsAddAssessmentModalOpen(false);
      } else {
        // Create new assessment
        const response = await fetch(`/api/vehicles/${vehicle.id}/assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create assessment');
        }

        const { data } = await response.json();
        setAssessments(prev => [data, ...prev]);
        toast.success('Assessment added successfully');
        setIsAddAssessmentModalOpen(false);

        // Log to timeline
        await logTimelineEntry({
          action: 'Assessment Added',
          note: `Assessment conducted on ${assessmentData.assessment_date || 'N/A'}`,
          status: 'Assessment',
        });
      }
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast.error(error.message || 'Failed to save assessment');
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/assessments/${assessmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assessment');
      }

      toast.success('Assessment deleted successfully');
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
    } catch (error: any) {
      console.error('Error deleting assessment:', error);
      toast.error(error.message || 'Failed to delete assessment');
    }
  };

  // Expense management functions
  const handleAddOrUpdateExpense = async (expenseData: {
    expense_description: string;
    expense_date: string;
    cost: number;
    notes?: string;
  }) => {
    try {
      if (editingExpense) {
        // Update existing expense
        const response = await fetch(`/api/vehicles/${vehicle.id}/expenses/${editingExpense.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update expense');
        }

        const { data } = await response.json();
        setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? data : exp));
        toast.success('Expense updated successfully');
        setEditingExpense(null);
      } else {
        // Create new expense
        const response = await fetch(`/api/vehicles/${vehicle.id}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create expense');
        }

        const { data } = await response.json();
        setExpenses(prev => [data, ...prev]);
        toast.success('Expense added successfully');

        // Log to timeline
        await logTimelineEntry({
          action: 'Expense Added',
          note: expenseData.expense_description,
          expenseValue: expenseData.cost,
          status: 'Expense',
        });
      }
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast.error(error.message || 'Failed to save expense');
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      toast.success('Expense deleted successfully');
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  const handleUpdateExpenseCost = async (expenseId: string) => {
    if (!editingExpenseCostValue || isNaN(parseFloat(editingExpenseCostValue))) {
      toast.error('Please enter a valid cost');
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost: parseFloat(editingExpenseCostValue) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update cost');
      }

      const { data } = await response.json();
      setExpenses(prev => prev.map(exp => exp.id === expenseId ? data : exp));
      setEditingExpenseCostId(null);
      setEditingExpenseCostValue('');
      toast.success('Cost updated successfully');
    } catch (error: any) {
      console.error('Error updating expense cost:', error);
      toast.error(error.message || 'Failed to update cost');
    }
  };

  const handleUpdateExpenseNote = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editingExpenseNoteValue.trim() || null }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update note');
      }

      const { data } = await response.json();
      setExpenses(prev => prev.map(exp => exp.id === expenseId ? data : exp));
      setEditingExpenseNoteId(null);
      setEditingExpenseNoteValue('');
      toast.success('Note updated successfully');
    } catch (error: any) {
      console.error('Error updating expense note:', error);
      toast.error(error.message || 'Failed to update note');
    }
  };

  const handleDownloadExpenses = () => {
    try {
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const vehicleName = `${vehicleYear} ${vehicleMake} ${vehicleModel}`;
      const headers = ['#', 'Vehicle', 'Expense', 'Date', 'Cost', 'Note'];
      
      const csvRows = expenses.map((expense, index) => [
        index + 1,
        vehicleName,
        expense.expense_description,
        expense.expense_date ? format(new Date(expense.expense_date), 'dd-MM-yyyy') : '',
        expense.cost,
        expense.notes || '',
      ]);

      const csvContent = [
        headers.map(escapeCsvValue).join(','),
        ...csvRows.map(row => row.map(escapeCsvValue).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${vehicleName.replace(/\s+/g, '-')}-expenses-${format(new Date(), 'yyyy-MM-dd')}`;
      link.href = url;
      link.download = `${fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Expenses downloaded successfully');
    } catch (error) {
      console.error('Error downloading expenses:', error);
      toast.error('Failed to download expenses');
    }
  };

  // Dispatch management functions
  const handleSubmitDispatch = async () => {
    // Validate required fields
    if (!dispatchForm.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!dispatchForm.transportCompany.trim()) {
      toast.error('Transport Company is required');
      return;
    }

    setIsSubmittingDispatch(true);
    try {
      let fileUrl = null;
      let fileName = null;

      // Upload file if selected
      if (dispatchFile) {
        const formData = new FormData();
        formData.append('file', dispatchFile);

        const uploadResponse = await fetch(`/api/vehicles/${vehicle.id}/dispatch/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload file');
        }

        const uploadData = await uploadResponse.json();
        fileUrl = uploadData.fileUrl;
        fileName = uploadData.fileName;
      }

      const dispatchData = {
        location: dispatchForm.location.trim(),
        transportCompany: dispatchForm.transportCompany.trim(),
        transportCost: dispatchForm.transportCost ? parseFloat(dispatchForm.transportCost) : null,
        notes: dispatchForm.notes.trim() || null,
        address: dispatchForm.address.trim() || null,
        state: dispatchForm.state.trim() || null,
        zip: dispatchForm.zip.trim() || null,
        acAssignCarrier: dispatchForm.acAssignCarrier.trim() || null,
        fileUrl,
        fileName,
      };

      if (editingDispatch) {
        // Update existing dispatch
        const response = await fetch(`/api/vehicles/${vehicle.id}/dispatch/${editingDispatch.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dispatchData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update dispatch record');
        }

        const { data } = await response.json();
        setDispatchRecords(prev => prev.map(d => d.id === editingDispatch.id ? data : d));
        toast.success('Dispatch record updated successfully');
        setEditingDispatch(null);
      } else {
        // Create new dispatch
        const response = await fetch(`/api/vehicles/${vehicle.id}/dispatch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dispatchData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create dispatch record');
        }

        const { data } = await response.json();
        setDispatchRecords(prev => [data, ...prev]);
        toast.success('Central Dispatch data added successfully.');

        // Log to timeline
        await logTimelineEntry({
          action: 'Dispatch Record Added',
          note: `Location: ${dispatchForm.location}, Transport Company: ${dispatchForm.transportCompany}`,
          cost: dispatchForm.transportCost ? parseFloat(dispatchForm.transportCost) : null,
        });
      }

      // Reset form
      setDispatchForm({
        location: '',
        transportCompany: '',
        transportCost: '',
        notes: '',
        address: '',
        state: '',
        zip: '',
        acAssignCarrier: '',
      });
      setDispatchFile(null);
      if (dispatchFileInputRef.current) {
        dispatchFileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error saving dispatch:', error);
      toast.error(error.message || 'Failed to save dispatch record');
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  const handleDeleteDispatch = async (dispatchId: string) => {
    if (!confirm('Are you sure you want to delete this dispatch record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/dispatch/${dispatchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dispatch record');
      }

      toast.success('Dispatch record deleted successfully');
      setDispatchRecords(prev => prev.filter(d => d.id !== dispatchId));
    } catch (error: any) {
      console.error('Error deleting dispatch:', error);
      toast.error(error.message || 'Failed to delete dispatch record');
    }
  };

  const handleEditDispatch = (dispatch: any) => {
    setEditingDispatch(dispatch);
    setDispatchForm({
      location: dispatch.location || '',
      transportCompany: dispatch.transport_company || '',
      transportCost: dispatch.transport_cost ? dispatch.transport_cost.toString() : '',
      notes: dispatch.notes || '',
      address: dispatch.address || '',
      state: dispatch.state || '',
      zip: dispatch.zip || '',
      acAssignCarrier: dispatch.ac_assign_carrier || '',
    });
    setDispatchFile(null);
  };

  const handleDownloadDispatchFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'dispatch-document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Timeline logging function
  const logTimelineEntry = async (entry: {
    action: string;
    actionDate?: string;
    actionTime?: string;
    cost?: number;
    expenseValue?: number;
    note?: string;
    status?: string;
  }) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: entry.action,
          actionDate: entry.actionDate || new Date().toISOString().split('T')[0],
          actionTime: entry.actionTime || new Date().toTimeString().split(' ')[0].substring(0, 8),
          cost: entry.cost || null,
          expenseValue: entry.expenseValue || null,
          note: entry.note || null,
          status: entry.status || null,
        }),
      });

      if (response.ok) {
        // Refresh timeline if on timeline tab
        if (activeTab === 'timeline') {
          const timelineResponse = await fetch(`/api/vehicles/${vehicle.id}/timeline?page=${timelineCurrentPage}&limit=${timelinePerPage}`);
          if (timelineResponse.ok) {
            const { data } = await timelineResponse.json();
            const sorted = (data || []).sort((a: any, b: any) => {
              const dateA = new Date(a.created_at || a.date || 0).getTime();
              const dateB = new Date(b.created_at || b.date || 0).getTime();
              return dateB - dateA;
            });
            setTimelineEntries(sorted);
          }
        }
      }
    } catch (error) {
      console.error('Error logging timeline entry:', error);
      // Don't show error toast for timeline logging failures
    }
  };

  // Get user display name
  const getUserDisplayName = (userId: string | null) => {
    if (!userId) return 'Not Assigned';
    const user = users.find(u => u.id === userId);
    if (!user) return 'Unknown User';
    
    // Map specific usernames
    const username = user.username || user.email.split('@')[0];
    if (username.toLowerCase().includes('momina')) return 'Momina';
    if (username.toLowerCase().includes('afifa')) return 'Afifa';
    if (username.toLowerCase().includes('ayesha')) return 'Ayesha Masood';
    if (user.role === 'transporter') return 'Transporter User';
    if (user.role === 'admin' || user.role === 'seller') return 'Staff';
    return username;
  };

  // Guard: Don't render if vehicle is not available
  if (!vehicle) {
    return null;
  }

  // Ensure vehicle has required properties
  const vehicleId = vehicle?.id;
  const vehicleMake = vehicle?.make || 'Unknown';
  const vehicleModel = vehicle?.model || 'Unknown';
  const vehicleYear = vehicle?.year || 'Unknown';
  const vehicleVin = vehicle?.vin || 'N/A';

  // Pagination - safely calculate with null checks
  const paginatedTasks = (vehicleTasks || []).slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );
  const totalPages = Math.ceil((vehicleTasks || []).length / tasksPerPage);

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setActiveTab('details');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen && !!vehicle} onOpenChange={handleClose}>
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            <div className="flex items-center">
              <Car className="w-6 h-6 mr-2" />
              Vehicle Details
            </div>
            {((activeTab === 'details' || activeTab === 'tasks' || activeTab === 'assessment')) && (
              <div className="flex items-center gap-2">
                {/* Upload Title button - only show for details and tasks tabs */}
                {(activeTab === 'details' || activeTab === 'tasks') && (
                  <>
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
                  </>
                )}
                {activeTab === 'details' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-slate-600 hover:bg-slate-700/50"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                {activeTab === 'tasks' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-slate-600 hover:bg-slate-700/50"
                    onClick={handleExportTasksPDF}
                    disabled={vehicleTasks.length === 0}
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
                {activeTab === 'assessment' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-slate-600 hover:bg-slate-700/50"
                    onClick={handleExportAssessmentsPDF}
                    disabled={assessments.length === 0}
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
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
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicleMake}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Model</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicleModel}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Year</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicleYear}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>VIN</div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{vehicleVin}</div>
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
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', marginTop: '24px' }}>
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
                        setStatus(value as any);
                        handleStatusUpdate('status', value);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        minHeight: '36px'
                      }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)',
                        zIndex: 50
                      }}>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option} style={{ color: 'var(--text)' }}>
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
                        setTitleStatus(value as any);
                        handleStatusUpdate('title_status', value);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        minHeight: '36px'
                      }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)',
                        zIndex: 50
                      }}>
                        {titleStatusOptions.map((option) => (
                          <SelectItem key={option} value={option} style={{ color: 'var(--text)' }}>
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
                      <SelectTrigger style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        minHeight: '36px'
                      }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)',
                        zIndex: 50
                      }}>
                        {arbStatusOptions.map((option) => (
                          <SelectItem key={option} value={option} style={{ color: 'var(--text)' }}>
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
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', marginTop: '24px' }}>
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
                          style={{ 
                            backgroundColor: 'var(--card-bg)', 
                            borderColor: 'var(--border)', 
                            color: 'var(--text)',
                            minHeight: '36px'
                          }}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" style={{ color: 'var(--text)' }} />
                          {auctionDate ? format(auctionDate, 'MM/dd/yyyy') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0" 
                        align="start"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)',
                          zIndex: 50
                        }}
                      >
                        <Calendar
                          mode="single"
                          selected={auctionDate}
                          onSelect={(date) => {
                            setAuctionDate(date);
                          }}
                          initialFocus
                          className="rounded-md border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAuctionUpdate}
                      disabled={isUpdatingAuction}
                      className="w-full dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
                      style={{ 
                        border: '1px solid transparent'
                      }}
                    >
                      {isUpdatingAuction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Auction'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div style={{ marginTop: '24px' }}>
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

              {/* Update Button at Bottom */}
              <div className="flex justify-end pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <Button
                  onClick={handleDetailsUpdate}
                  disabled={isUpdatingStatus || isUpdatingAuction}
                  size="lg"
                  className="min-w-[140px] dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
                  style={{ 
                    border: '1px solid transparent',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {isUpdatingStatus || isUpdatingAuction ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update All
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Header with Add Task Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Vehicle Tasks</h4>
                </div>
                <Button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  size="sm"
                  style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* Tasks Table */}
              {isLoadingTasks ? (
                <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                  Loading tasks...
                </div>
              ) : !vehicleTasks || vehicleTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <ClipboardList className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--subtext)', opacity: 0.5 }} />
                  <div className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>No tasks found for this vehicle.</div>
                  <div className="text-sm mb-4" style={{ color: 'var(--subtext)' }}>
                    Get started by adding your first task for this vehicle.
                  </div>
                  <Button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    size="sm"
                    style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </motion.div>
              ) : (
                <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)', borderRadius: '12px' }}>
                  <Table className="min-w-[1000px]">
                    <TableHeader>
                      <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>#</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Vehicle</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Task</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Status</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Due</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Assigned</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Assigned Date</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Notes</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)', textAlign: 'right' }}>Options</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTasks && paginatedTasks.length > 0 ? paginatedTasks.map((task, index) => {
                        if (!task || !task.id) return null;
                        
                        const isPending = task.status === 'pending';
                        const rowIndex = (currentPage - 1) * tasksPerPage + index + 1;
                        
                        return (
                          <motion.tr
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="transition-all duration-200"
                            style={{
                              borderColor: 'var(--border)',
                              backgroundColor: isPending ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (!isPending) {
                                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isPending) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.boxShadow = 'none';
                              }
                            }}
                          >
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {rowIndex}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {vehicleYear} {vehicleMake} {vehicleModel}
                              {vehicle?.trim && <span className="ml-1" style={{ color: 'var(--subtext)' }}>({vehicle.trim})</span>}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)', fontWeight: '500' }}>
                              {task.task_name || 'N/A'}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                              <Select
                                value={task.status || 'pending'}
                                onValueChange={(value) => handleStatusChange(task.id, value as 'pending' | 'completed' | 'cancelled')}
                              >
                                <SelectTrigger 
                                  className="w-[120px] h-9 text-sm transition-all duration-200"
                                  style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--border)', 
                                    color: 'var(--text)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {task.due_date ? (() => {
                                try {
                                  return format(new Date(task.due_date), 'dd-MM-yyyy');
                                } catch {
                                  return 'Invalid Date';
                                }
                              })() : 'N/A'}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                              <Select
                                value={task.assigned_to || ''}
                                onValueChange={(value) => handleAssignedChange(task.id, value)}
                              >
                                <SelectTrigger 
                                  className="w-[160px] h-9 text-sm transition-all duration-200"
                                  style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--border)', 
                                    color: 'var(--text)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <SelectValue placeholder="Not Assigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Not Assigned</SelectItem>
                                  {(users || []).map((user) => {
                                    if (!user || !user.id) return null;
                                    const displayName = getUserDisplayName(user.id);
                                    return (
                                      <SelectItem key={user.id} value={user.id}>
                                        {displayName}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {task.assigned_to && task.created_at 
                                ? (() => {
                                    try {
                                      return format(new Date(task.created_at), 'dd-MM-yyyy');
                                    } catch {
                                      return 'Invalid Date';
                                    }
                                  })()
                                : 'N/A'}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                              {editingNotesId === task.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editingNotesText}
                                    onChange={(e) => setEditingNotesText(e.target.value)}
                                    className="flex-1 h-8 text-sm"
                                    style={{ 
                                      backgroundColor: 'var(--card-bg)', 
                                      borderColor: 'var(--border)', 
                                      color: 'var(--text)',
                                      borderRadius: '6px'
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateNotes(task.id);
                                      } else if (e.key === 'Escape') {
                                        setEditingNotesId(null);
                                        setEditingNotesText('');
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateNotes(task.id)}
                                    style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: '6px' }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingNotesId(null);
                                      setEditingNotesText('');
                                    }}
                                    style={{ color: 'var(--text)' }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div 
                                  className="text-sm cursor-pointer hover:bg-opacity-10 p-2 rounded transition-colors"
                                  style={{ color: 'var(--text)', minWidth: '150px' }}
                                  onClick={() => {
                                    setEditingNotesId(task.id);
                                    setEditingNotesText(task.notes || '');
                                  }}
                                  title="Click to edit"
                                >
                                  {task.notes || <span style={{ color: 'var(--subtext)', fontStyle: 'italic' }}>Click to add notes</span>}
                                </div>
                              )}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'right' }}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 w-9 p-0 rounded-lg" 
                                    style={{ 
                                      color: 'var(--text)',
                                      borderRadius: '8px'
                                    }}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end" 
                                  style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--border)',
                                    color: 'var(--text)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <DropdownMenuItem 
                                    style={{ color: 'var(--text)' }}
                                    onClick={() => task && handleEditTask(task)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    style={{ color: '#ef4444' }}
                                    onClick={() => task?.id && handleDeleteTask(task.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    style={{ color: 'var(--text)' }}
                                    onClick={() => task?.id && handleMarkAsSold(task.id)}
                                  >
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Mark as Sold
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      }).filter(Boolean) : (
                        <TableRow>
                          <TableCell colSpan={10} style={{ padding: '24px', textAlign: 'center', color: 'var(--subtext)' }}>
                            No tasks found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {vehicleTasks && vehicleTasks.length > tasksPerPage && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                    Showing {(currentPage - 1) * tasksPerPage + 1} to {Math.min(currentPage * tasksPerPage, vehicleTasks.length)} of {vehicleTasks.length} tasks
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
                      }}
                    >
                      Previous
                    </Button>
                    <div className="text-sm" style={{ color: 'var(--text)' }}>
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Task Modal */}
              <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onSubmit={handleAddTask}
                preSelectedVehicleId={vehicle.id}
              />

              {/* Edit Task Modal */}
              {editingTask && (
                <EditTaskModal
                  task={editingTask}
                  isOpen={isEditTaskModalOpen}
                  onClose={() => {
                    setIsEditTaskModalOpen(false);
                    setEditingTask(null);
                  }}
                  onTaskUpdated={() => {
                    // Reload tasks
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
                  }}
                />
              )}
            </div>
          )}

          {/* Assessment Tab */}
          {activeTab === 'assessment' && (
            <div className="space-y-4">
              {/* Header with Add Assessment Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Vehicle Assessments</h4>
                </div>
                <Button
                  onClick={() => {
                    setEditingAssessment(null);
                    setIsAddAssessmentModalOpen(true);
                  }}
                  size="sm"
                  style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assessment
                </Button>
              </div>

              {/* Assessments Table */}
              {isLoadingAssessments ? (
                <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                  Loading assessments...
                </div>
              ) : assessments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--subtext)', opacity: 0.5 }} />
                  <div className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>No assessments found</div>
                  <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                    Get started by adding your first assessment for this vehicle.
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)', borderRadius: '12px' }}>
                  <Table className="min-w-[1000px]">
                    <TableHeader>
                      <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>#</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Vehicle</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Assessment Date</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Assessment Time</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Conducted Name</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Status</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Icon</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>File</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)', textAlign: 'right' }}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAssessments.map((assessment, index) => {
                        const isPending = assessment.status === 'Pending';
                        const rowIndex = (assessmentsCurrentPage - 1) * assessmentsPerPage + index + 1;
                        
                        return (
                          <motion.tr
                            key={assessment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="transition-all duration-200"
                            style={{
                              borderColor: 'var(--border)',
                              backgroundColor: isPending ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (!isPending) {
                                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isPending) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.boxShadow = 'none';
                              }
                            }}
                          >
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {rowIndex}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {vehicleYear} {vehicleMake} {vehicleModel}
                              {vehicle?.trim && <span className="ml-1" style={{ color: 'var(--subtext)' }}>({vehicle.trim})</span>}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {assessment.assessment_date ? format(new Date(assessment.assessment_date), 'dd-MM-yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {assessment.assessment_time || 'N/A'}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                              {assessment.conducted_name || 'N/A'}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                              <Select
                                value={assessment.status || 'Pending'}
                                onValueChange={async (value) => {
                                  try {
                                    const response = await fetch(`/api/vehicles/${vehicle.id}/assessments/${assessment.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: value }),
                                    });
                                    if (response.ok) {
                                      const { data } = await response.json();
                                      setAssessments(prev => prev.map(a => a.id === assessment.id ? data : a));
                                      toast.success('Status updated');
                                    }
                                  } catch (error: any) {
                                    toast.error('Failed to update status');
                                  }
                                }}
                              >
                                <SelectTrigger 
                                  className="w-[120px] h-9 text-sm"
                                  style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--border)', 
                                    color: 'var(--text)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                              {assessment.status === 'Completed' ? (
                                <CheckCircle className="w-5 h-5 mx-auto" style={{ color: '#10b981' }} />
                              ) : (
                                <AlertCircle className="w-5 h-5 mx-auto" style={{ color: '#f59e0b' }} />
                              )}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                              {assessment.assessment_file_url ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadAssessment(assessment)}
                                  style={{ color: 'var(--accent)' }}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  View File
                                </Button>
                              ) : (
                                <span style={{ color: 'var(--subtext)' }}>No file</span>
                              )}
                            </TableCell>
                            <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'right' }}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 w-9 p-0 rounded-lg" 
                                    style={{ 
                                      color: 'var(--text)',
                                      borderRadius: '8px'
                                    }}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end" 
                                  style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--border)',
                                    color: 'var(--text)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <DropdownMenuItem 
                                    style={{ color: 'var(--text)' }}
                                    onClick={() => handleEditAssessment(assessment)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    style={{ color: '#ef4444' }}
                                    onClick={() => handleDeleteAssessment(assessment.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                  {assessment.assessment_file_url && (
                                    <DropdownMenuItem 
                                      style={{ color: 'var(--text)' }}
                                      onClick={() => handleDownloadAssessment(assessment)}
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {assessments.length > assessmentsPerPage && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                    Showing {(assessmentsCurrentPage - 1) * assessmentsPerPage + 1} to {Math.min(assessmentsCurrentPage * assessmentsPerPage, assessments.length)} of {assessments.length} assessments
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssessmentsCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={assessmentsCurrentPage === 1}
                      style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
                      }}
                    >
                      Previous
                    </Button>
                    <div className="text-sm" style={{ color: 'var(--text)' }}>
                      Page {assessmentsCurrentPage} of {assessmentsTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssessmentsCurrentPage(prev => Math.min(assessmentsTotalPages, prev + 1))}
                      disabled={assessmentsCurrentPage === assessmentsTotalPages}
                      style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Add/Edit Assessment Modal */}
              <AddAssessmentModal
                isOpen={isAddAssessmentModalOpen}
                onClose={() => {
                  setIsAddAssessmentModalOpen(false);
                  setEditingAssessment(null);
                }}
                onSubmit={handleAddOrUpdateAssessment}
                vehicleId={vehicle.id}
                vehicleName={`${vehicleYear} ${vehicleMake} ${vehicleModel}${vehicle?.trim ? ` ${vehicle.trim}` : ''}`}
                editingAssessment={editingAssessment}
              />
            </div>
          )}

          {/* Parts & Expenses Tab */}
          {activeTab === 'parts' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              {/* Header with Add Expense and Download Buttons */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Parts & Expenses</h4>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingExpense(null);
                      setIsAddExpenseModalOpen(true);
                    }}
                    size="sm"
                    className="dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
                    style={{ 
                      borderRadius: '8px',
                      border: '1px solid transparent'
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                  <Button
                    onClick={() => handleDownloadExpenses()}
                    variant="outline"
                    size="sm"
                    disabled={expenses.length === 0}
                    className="dark:bg-[var(--card-bg)] bg-white dark:border-[var(--border)] border-gray-300 dark:text-[var(--text)] text-gray-900 hover:bg-gray-50 dark:hover:bg-[var(--card-bg)]/80"
                    style={{ 
                      borderRadius: '8px',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Expenses Table */}
              {isLoadingExpenses ? (
                <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                  Loading expenses...
                </div>
              ) : expenses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--subtext)', opacity: 0.5 }} />
                  <div className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>No expenses found</div>
                  <div className="text-sm mb-4" style={{ color: 'var(--subtext)' }}>
                    Get started by adding your first expense for this vehicle.
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)', borderRadius: '12px' }}>
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>#</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Vehicle</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Expense</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Date</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Cost</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Note</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)', textAlign: 'right' }}>Options</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense, index) => (
                        <motion.tr
                          key={expense.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="transition-all duration-200"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {index + 1}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {vehicleYear} {vehicleMake} {vehicleModel}
                            {vehicle?.trim && <span className="ml-1" style={{ color: 'var(--subtext)' }}>({vehicle.trim})</span>}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)', fontWeight: '500' }}>
                            {expense.expense_description}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {expense.expense_date ? format(new Date(expense.expense_date), 'dd-MM-yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                            {editingExpenseCostId === expense.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={editingExpenseCostValue}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                    setEditingExpenseCostValue(value);
                                  }}
                                  className="w-24 h-8 text-sm"
                                  style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--border)', 
                                    color: 'var(--text)',
                                    borderRadius: '6px'
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateExpenseCost(expense.id);
                                    } else if (e.key === 'Escape') {
                                      setEditingExpenseCostId(null);
                                      setEditingExpenseCostValue('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateExpenseCost(expense.id)}
                                  className="dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
                                  style={{ 
                                    borderRadius: '6px',
                                    border: '1px solid transparent'
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingExpenseCostId(null);
                                    setEditingExpenseCostValue('');
                                  }}
                                  style={{ color: 'var(--text)' }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="text-sm cursor-pointer hover:bg-opacity-10 p-2 rounded transition-colors"
                                style={{ color: 'var(--text)', minWidth: '80px' }}
                                onClick={() => {
                                  setEditingExpenseCostId(expense.id);
                                  setEditingExpenseCostValue(expense.cost.toString());
                                }}
                                title="Click to edit"
                              >
                                ${parseFloat(expense.cost).toFixed(2)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                            {editingExpenseNoteId === expense.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingExpenseNoteValue}
                                  onChange={(e) => setEditingExpenseNoteValue(e.target.value)}
                                  className="flex-1 h-8 text-sm"
                                  style={{ 
                                    backgroundColor: 'var(--card-bg)', 
                                    borderColor: 'var(--border)', 
                                    color: 'var(--text)',
                                    borderRadius: '6px'
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateExpenseNote(expense.id);
                                    } else if (e.key === 'Escape') {
                                      setEditingExpenseNoteId(null);
                                      setEditingExpenseNoteValue('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateExpenseNote(expense.id)}
                                  className="dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
                                  style={{ 
                                    borderRadius: '6px',
                                    border: '1px solid transparent'
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingExpenseNoteId(null);
                                    setEditingExpenseNoteValue('');
                                  }}
                                  style={{ color: 'var(--text)' }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="text-sm cursor-pointer hover:bg-opacity-10 p-2 rounded transition-colors"
                                style={{ color: 'var(--text)', minWidth: '150px' }}
                                onClick={() => {
                                  setEditingExpenseNoteId(expense.id);
                                  setEditingExpenseNoteValue(expense.notes || '');
                                }}
                                title="Click to edit"
                              >
                                {expense.notes || <span style={{ color: 'var(--subtext)', fontStyle: 'italic' }}>Click to add note</span>}
                              </div>
                            )}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'right' }}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-9 w-9 p-0 rounded-lg" 
                                  style={{ 
                                    color: 'var(--text)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end" 
                                style={{ 
                                  backgroundColor: 'var(--card-bg)', 
                                  borderColor: 'var(--border)',
                                  color: 'var(--text)',
                                  borderRadius: '8px'
                                }}
                              >
                                <DropdownMenuItem 
                                  style={{ color: 'var(--text)' }}
                                  onClick={() => {
                                    setEditingExpense(expense);
                                    setIsAddExpenseModalOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  style={{ color: '#ef4444' }}
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Add/Edit Expense Modal */}
              <AddExpenseModal
                isOpen={isAddExpenseModalOpen}
                onClose={() => {
                  setIsAddExpenseModalOpen(false);
                  setEditingExpense(null);
                }}
                onSubmit={handleAddOrUpdateExpense}
                vehicleId={vehicle.id}
                expenseToEdit={editingExpense}
              />
            </div>
          )}

          {/* Central Dispatch Tab */}
          {activeTab === 'dispatch' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Central Dispatch</h4>
                </div>
              </div>

              {/* Dispatch Form */}
              <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <h5 className="font-medium mb-4" style={{ color: 'var(--text)' }}>{editingDispatch ? 'Edit Dispatch Record' : 'Add New Dispatch Record'}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      Location <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={dispatchForm.location}
                      onChange={(e) => setDispatchForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location"
                      className="w-full"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      Transport Company <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={dispatchForm.transportCompany}
                      onChange={(e) => setDispatchForm(prev => ({ ...prev, transportCompany: e.target.value }))}
                      placeholder="Enter transport company"
                      className="w-full"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      Transport Cost
                    </label>
                    <Input
                      type="number"
                      value={dispatchForm.transportCost}
                      onChange={(e) => setDispatchForm(prev => ({ ...prev, transportCost: e.target.value }))}
                      placeholder="0.00"
                      className="w-full"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      Address
                    </label>
                    <Input
                      value={dispatchForm.address}
                      onChange={(e) => setDispatchForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                      className="w-full"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      State
                    </label>
                    <Input
                      value={dispatchForm.state}
                      onChange={(e) => setDispatchForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Enter state"
                      className="w-full"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      ZIP
                    </label>
                    <Input
                      value={dispatchForm.zip}
                      onChange={(e) => setDispatchForm(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="Enter ZIP code"
                      className="w-full"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      AC/ASSIGN-CARRIER
                    </label>
                    <Input
                      value={dispatchForm.acAssignCarrier}
                      onChange={(e) => setDispatchForm(prev => ({ ...prev, acAssignCarrier: e.target.value }))}
                      placeholder="Enter AC/ASSIGN-CARRIER"
                      className="w-full"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      Upload File (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={dispatchFileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setDispatchFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="dispatch-file-upload"
                      />
                      <label
                        htmlFor="dispatch-file-upload"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        {dispatchFile ? dispatchFile.name : 'Choose File'}
                      </label>
                      {dispatchFile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDispatchFile(null);
                            if (dispatchFileInputRef.current) {
                              dispatchFileInputRef.current.value = '';
                            }
                          }}
                          style={{ color: 'var(--text)' }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    Notes
                  </label>
                  <Textarea
                    value={dispatchForm.notes}
                    onChange={(e) => setDispatchForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter notes"
                    rows={3}
                    className="w-full"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleSubmitDispatch}
                    disabled={isSubmittingDispatch}
                    className="dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
                    style={{ borderRadius: '8px' }}
                  >
                    {isSubmittingDispatch ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                  {editingDispatch && (
                    <Button
                      onClick={() => {
                        setEditingDispatch(null);
                        setDispatchForm({
                          location: '',
                          transportCompany: '',
                          transportCost: '',
                          notes: '',
                          address: '',
                          state: '',
                          zip: '',
                          acAssignCarrier: '',
                        });
                        setDispatchFile(null);
                        if (dispatchFileInputRef.current) {
                          dispatchFileInputRef.current.value = '';
                        }
                      }}
                      variant="outline"
                      style={{ 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Dispatch Records Table */}
              {isLoadingDispatch ? (
                <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                  Loading dispatch records...
                </div>
              ) : dispatchRecords.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <Truck className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--subtext)', opacity: 0.5 }} />
                  <div className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>No dispatch records found</div>
                  <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                    Get started by adding your first dispatch record.
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)', borderRadius: '12px' }}>
                  <Table className="min-w-[1000px]">
                    <TableHeader>
                      <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>#</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Vehicle</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Location</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Transport Company</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Address</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>ST/ZIP</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>AC/ASSIGN-CARRIER</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>File</TableHead>
                        <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)', textAlign: 'right' }}>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispatchRecords.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="transition-all duration-200"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {index + 1}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {vehicleYear} {vehicleMake} {vehicleModel}
                            {vehicle?.trim && <span className="ml-1" style={{ color: 'var(--subtext)' }}>({vehicle.trim})</span>}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)', fontWeight: '500' }}>
                            {record.location}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {record.transport_company}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {record.address || 'N/A'}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {record.state && record.zip ? `${record.state}/${record.zip}` : record.state || record.zip || 'N/A'}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {record.ac_assign_carrier || 'N/A'}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                            {record.file_url ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadDispatchFile(record.file_url, record.file_name || 'dispatch-document')}
                                className="flex items-center gap-1"
                                style={{ color: 'var(--accent)' }}
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                            ) : (
                              <span style={{ color: 'var(--subtext)' }}>No file</span>
                            )}
                          </TableCell>
                          <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'right' }}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-9 w-9 p-0 rounded-lg" 
                                  style={{ 
                                    color: 'var(--text)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end" 
                                style={{ 
                                  backgroundColor: 'var(--card-bg)', 
                                  borderColor: 'var(--border)',
                                  color: 'var(--text)',
                                  borderRadius: '8px'
                                }}
                              >
                                <DropdownMenuItem 
                                  style={{ color: 'var(--text)' }}
                                  onClick={() => handleEditDispatch(record)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  style={{ color: '#ef4444' }}
                                  onClick={() => handleDeleteDispatch(record.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Activity Timeline</h4>
                </div>
              </div>

              {/* Timeline Table */}
              {isLoadingTimeline ? (
                <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                  Loading timeline...
                </div>
              ) : timelineEntries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--subtext)', opacity: 0.5 }} />
                  <div className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>No timeline entries found</div>
                  <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                    Timeline entries will appear here as actions are performed on this vehicle.
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="rounded-xl border overflow-x-auto mb-4" style={{ borderColor: 'var(--border)', borderRadius: '12px' }}>
                    <Table className="min-w-[1000px]">
                      <TableHeader>
                        <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>#</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Action</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>User</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Date</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Time</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Cost</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Expense</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Note</TableHead>
                          <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timelineEntries
                          .slice((timelineCurrentPage - 1) * timelinePerPage, timelineCurrentPage * timelinePerPage)
                          .map((entry, index) => (
                            <motion.tr
                              key={entry.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="transition-all duration-200"
                              style={{
                                borderColor: 'var(--border)',
                                backgroundColor: 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                                {(timelineCurrentPage - 1) * timelinePerPage + index + 1}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)', fontWeight: '500' }}>
                                {entry.action}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                                {entry.profiles?.username || entry.profiles?.email?.split('@')[0] || 'System'}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                                {entry.action_date ? format(new Date(entry.action_date), 'yyyy-MM-dd') : entry.created_at ? format(new Date(entry.created_at), 'yyyy-MM-dd') : 'N/A'}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                                {entry.action_time || (entry.created_at ? format(new Date(entry.created_at), 'HH:mm:ss') : 'N/A')}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                                {entry.cost ? `$${parseFloat(entry.cost).toFixed(2)}` : 'N/A'}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                                {entry.expense_value ? `$${parseFloat(entry.expense_value).toFixed(2)}` : 'N/A'}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                                {entry.note || 'N/A'}
                              </TableCell>
                              <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                                {entry.status ? (
                                  <Badge className="text-xs" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                                    {entry.status}
                                  </Badge>
                                ) : (
                                  <span style={{ color: 'var(--subtext)' }}>N/A</span>
                                )}
                              </TableCell>
                            </motion.tr>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {Math.ceil(timelineEntries.length / timelinePerPage) > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                        Showing {(timelineCurrentPage - 1) * timelinePerPage + 1} to {Math.min(timelineCurrentPage * timelinePerPage, timelineEntries.length)} of {timelineEntries.length} entries
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTimelineCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={timelineCurrentPage === 1}
                          style={{ 
                            borderColor: 'var(--border)', 
                            color: 'var(--text)',
                            borderRadius: '8px'
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTimelineCurrentPage(prev => Math.min(Math.ceil(timelineEntries.length / timelinePerPage), prev + 1))}
                          disabled={timelineCurrentPage >= Math.ceil(timelineEntries.length / timelinePerPage)}
                          style={{ 
                            borderColor: 'var(--border)', 
                            color: 'var(--text)',
                            borderRadius: '8px'
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
