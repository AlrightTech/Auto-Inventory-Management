'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Download, 
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Trash2,
  DollarSign,
  FileText,
  Car
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { VehicleWithRelations } from '@/types/vehicle';
import { toast } from 'sonner';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useRouter } from 'next/navigation';

// carLocationOptions will be fetched dynamically
const titleStatusOptions = ['Absent', 'Released', 'Received', 'Present', 'In Transit', 'Available not Received', 'Validated', 'Sent but not Validated'];
const statusOptions = ['Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'];

interface VehicleTableProps {
  onVehicleAdded?: () => void;
  refreshTrigger?: number;
  showFilters?: boolean;
  onExportCSV?: (filteredVehicles: VehicleWithRelations[]) => void;
  onExportPDF?: (filteredVehicles: VehicleWithRelations[]) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Complete':
      return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800';
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    case 'ARB':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    case 'Sold':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Complete':
      return <CheckCircle className="w-4 h-4" />;
    case 'Pending':
      return <Clock className="w-4 h-4" />;
    case 'ARB':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

interface FilterState {
  status: string[];
  carLocation: string[];
  titleStatus: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
}

export function VehicleTable({ onVehicleAdded, refreshTrigger, showFilters: showFiltersProp, onExportCSV, onExportPDF }: VehicleTableProps) {
  const router = useRouter();
  // Fetch car location options dynamically
  const { options: carLocationOptions, isLoading: isLoadingLocations } = useDropdownOptions('car_location', true);
  const [vehicles, setVehicles] = useState<VehicleWithRelations[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isMarkingAsSold, setIsMarkingAsSold] = useState<string | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [updatingLocation, setUpdatingLocation] = useState<string | null>(null);
  const [updatingTitleStatus, setUpdatingTitleStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    carLocation: [],
    titleStatus: [],
    dateFrom: null,
    dateTo: null,
  });
  const [showFilters, setShowFilters] = useState(showFiltersProp || false);
  
  useEffect(() => {
    if (showFiltersProp !== undefined) {
      setShowFilters(showFiltersProp);
    }
  }, [showFiltersProp]);
  const [contextMenuCell, setContextMenuCell] = useState<{ vehicleId: string; field: string; value: any } | null>(null);
  const [editingCell, setEditingCell] = useState<{ vehicleId: string; field: string } | null>(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  // Load vehicles from API
  useEffect(() => {
    let isMounted = true;
    
    const loadVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles');
        
        if (!response.ok) {
          throw new Error('Failed to load vehicles');
        }
        
        const { data } = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setVehicles(data || []);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
        if (isMounted) {
          toast.error('Failed to load vehicles');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVehicles();
    
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Filter vehicles based on search term and filters
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) {
      setFilteredVehicles([]);
      return;
    }
    
    let filtered = [...vehicles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        (vehicle.make && vehicle.make.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.model && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.vin && vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(vehicle => filters.status.includes(vehicle.status));
    }

    // Car Location filter
    if (filters.carLocation.length > 0) {
      filtered = filtered.filter(vehicle => 
        vehicle.vehicle_location && filters.carLocation.includes(vehicle.vehicle_location)
      );
    }

    // Title Status filter
    if (filters.titleStatus.length > 0) {
      filtered = filtered.filter(vehicle => filters.titleStatus.includes(vehicle.title_status));
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(vehicle => {
        if (!vehicle.sale_date) return false;
        const vehicleDate = new Date(vehicle.sale_date);
        return vehicleDate >= filters.dateFrom!;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(vehicle => {
        if (!vehicle.sale_date) return false;
        const vehicleDate = new Date(vehicle.sale_date);
        return vehicleDate <= filters.dateTo!;
      });
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, filters]);

  // Handle vehicle deletion
  const handleDeleteVehicle = async (vehicleId: string, vehicleInfo: string) => {
    if (!confirm(`Are you sure you want to delete ${vehicleInfo}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(vehicleId);
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vehicle');
      }

      // Remove vehicle from local state
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success('Vehicle deleted successfully');
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete vehicle');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleView = (vehicle: VehicleWithRelations) => {
    router.push(`/admin/inventory/${vehicle.id}`);
  };

  const handleEdit = (vehicle: VehicleWithRelations) => {
    router.push(`/admin/inventory/edit/${vehicle.id}`);
  };

  // Handle mark as sold
  const handleMarkAsSold = async (vehicleId: string, vehicleInfo: string) => {
    if (!confirm(`Mark ${vehicleInfo} as Sold?`)) {
      return;
    }

    try {
      setIsMarkingAsSold(vehicleId);
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Sold' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle status');
      }

      // Update local state
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, status: 'Sold' as const } : v
      ));
      toast.success('Vehicle marked as Sold');
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error marking vehicle as sold:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mark vehicle as sold');
    } finally {
      setIsMarkingAsSold(null);
    }
  };

  // Handle checkbox selection
  const handleSelectVehicle = (vehicleId: string, checked: boolean) => {
    setSelectedVehicles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(vehicleId);
      } else {
        newSet.delete(vehicleId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVehicles(new Set(filteredVehicles.map(v => v.id)));
    } else {
      setSelectedVehicles(new Set());
    }
  };

  // Handle car location update
  const handleLocationChange = async (vehicleId: string, newLocation: string) => {
    try {
      setUpdatingLocation(vehicleId);
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicle_location: newLocation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update location');
      }

      // Get updated data from API response
      const responseData = await response.json();
      const updatedData = responseData.data || responseData;
      
      // Update local state with API response data, ensuring the new location is set
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, ...updatedData, vehicle_location: newLocation } : v
      ));
      toast.success('Location updated successfully');
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update location');
    } finally {
      setUpdatingLocation(null);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedVehicles.size === 0) {
      toast.error('Please select at least one vehicle');
      return;
    }

    try {
      const updates = Array.from(selectedVehicles).map(async (vehicleId) => {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update vehicle ${vehicleId}`);
        }
        return response.json();
      });

      await Promise.all(updates);
      toast.success(`Updated ${selectedVehicles.size} vehicle(s) to ${newStatus}`);
      setSelectedVehicles(new Set());
      setBulkActionOpen(false);
      
      // Reload vehicles
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const { data } = await response.json();
        setVehicles(data || []);
      }
      
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error updating vehicles:', error);
      toast.error('Failed to update vehicles');
    }
  };

  // Handle bulk location update
  const handleBulkLocationUpdate = async (newLocation: string) => {
    if (selectedVehicles.size === 0) {
      toast.error('Please select at least one vehicle');
      return;
    }

    try {
      const updates = Array.from(selectedVehicles).map(async (vehicleId) => {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vehicle_location: newLocation }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update vehicle ${vehicleId}`);
        }
        return response.json();
      });

      await Promise.all(updates);
      toast.success(`Updated ${selectedVehicles.size} vehicle(s) location to ${newLocation}`);
      setSelectedVehicles(new Set());
      setBulkActionOpen(false);
      
      // Reload vehicles
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const { data } = await response.json();
        setVehicles(data || []);
      }
      
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error updating vehicles:', error);
      toast.error('Failed to update vehicles');
    }
  };

  // Handle inline cell edit
  const handleCellEdit = (vehicleId: string, field: string, value: any) => {
    setEditingCell({ vehicleId, field });
    setContextMenuCell(null);
  };

  // Handle cell value update
  const handleCellUpdate = async (vehicleId: string, field: string, value: any) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle');
      }

      // Update local state
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, [field]: value } : v
      ));
      toast.success('Field updated successfully');
      setEditingCell(null);
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update field');
      setEditingCell(null);
    }
  };

  // Handle status update
  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      setUpdatingStatus(vehicleId);
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      // Get updated data from API response
      const responseData = await response.json();
      const updatedData = responseData.data || responseData;
      
      // Update local state with API response data, ensuring the new status is set
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, ...updatedData, status: newStatus } : v
      ));
      toast.success('Status updated successfully');
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle title status update
  const handleTitleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      setUpdatingTitleStatus(vehicleId);
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title_status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update title status');
      }

      // Get updated data from API response
      const responseData = await response.json();
      const updatedData = responseData.data || responseData;
      
      // Update local state with API response data, ensuring the new title status is set
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, ...updatedData, title_status: newStatus } : v
      ));
      toast.success('Title status updated successfully');
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error updating title status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update title status');
    } finally {
      setUpdatingTitleStatus(null);
    }
  };

  // Handle download vehicle
  const handleDownloadVehicle = (vehicle: VehicleWithRelations) => {
    try {
      // Helper function to escape CSV values
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

  return (
    <Card className="dashboard-card neon-glow instrument-cluster">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>Vehicle Inventory</CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Showing {filteredVehicles.length} vehicles
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--subtext)' }} />
            <Input
              placeholder="Search by make, model, or VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 control-panel"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--border)', 
                color: 'var(--text)' 
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Status</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !filters.status.includes(value)) {
                      setFilters(prev => ({ ...prev, status: [...prev.status, value] }));
                    }
                  }}
                >
                  <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
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
                {filters.status.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.status.map((status) => (
                      <Badge key={status} variant="outline" className="cursor-pointer" onClick={() => {
                        setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                      }}>
                        {status} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Car Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Car Location</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !filters.carLocation.includes(value)) {
                      setFilters(prev => ({ ...prev, carLocation: [...prev.carLocation, value] }));
                    }
                  }}
                >
                  <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    {isLoadingLocations ? (
                      <SelectItem value="loading" disabled style={{ color: 'var(--text)' }}>
                        Loading...
                      </SelectItem>
                    ) : carLocationOptions.length === 0 ? (
                      <SelectItem value="no-options" disabled style={{ color: 'var(--text)' }}>
                        No options available
                      </SelectItem>
                    ) : (
                      carLocationOptions.map((location) => (
                        <SelectItem key={location.value} value={location.value} style={{ color: 'var(--text)' }}>
                          {location.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filters.carLocation.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.carLocation.map((location) => (
                      <Badge key={location} variant="outline" className="cursor-pointer" onClick={() => {
                        setFilters(prev => ({ ...prev, carLocation: prev.carLocation.filter(l => l !== location) }));
                      }}>
                        {location} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Title Status</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !filters.titleStatus.includes(value)) {
                      setFilters(prev => ({ ...prev, titleStatus: [...prev.titleStatus, value] }));
                    }
                  }}
                >
                  <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
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
                {filters.titleStatus.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.titleStatus.map((status) => (
                      <Badge key={status} variant="outline" className="cursor-pointer" onClick={() => {
                        setFilters(prev => ({ ...prev, titleStatus: prev.titleStatus.filter(s => s !== status) }));
                      }}>
                        {status} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {filters.dateFrom ? format(filters.dateFrom, 'MM/dd/yyyy') : 'From'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom || undefined}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date || null }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {filters.dateTo ? format(filters.dateTo, 'MM/dd/yyyy') : 'To'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                      <Calendar
                        mode="single"
                        selected={filters.dateTo || undefined}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date || null }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ status: [], carLocation: [], titleStatus: [], dateFrom: null, dateTo: null });
                }}
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        <div className="vehicle-inventory-table rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)', borderRadius: '12px', minWidth: '100%' }}>
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', width: '50px', padding: '16px' }}>
                  <input
                    type="checkbox"
                    checked={filteredVehicles.length > 0 && selectedVehicles.size === filteredVehicles.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-600"
                    style={{ cursor: 'pointer' }}
                  />
                </TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px' }}>Vehicle</TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px' }}>Purchase Date</TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px' }}>Status</TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px' }}>Odometer</TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px' }}>Car Location</TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px' }}>Bought Price</TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px' }}>Title Status</TableHead>
                <TableHead className="dark:text-white text-gray-900" style={{ fontWeight: '600', padding: '16px', textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
                      <span style={{ color: 'var(--subtext)' }}>Loading vehicles...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center gap-3"
                    >
                      <Car className="w-12 h-12" style={{ color: 'var(--subtext)', opacity: 0.5 }} />
                      <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                        No vehicles found
                      </div>
                      <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                        {searchTerm 
                          ? 'Try adjusting your search or filters to find vehicles.' 
                          : 'Get started by adding your first vehicle to the inventory.'}
                      </div>
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="transition-all duration-200 hover:bg-opacity-50"
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
                      <TableCell style={{ padding: '16px', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={selectedVehicles.has(vehicle.id)}
                          onChange={(e) => handleSelectVehicle(vehicle.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-600"
                          style={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <TableCell className="dark:text-white text-gray-900" style={{ padding: '16px', verticalAlign: 'middle' }}>
                            <div>
                              <div className="font-medium" style={{ color: 'var(--text)' }}>
                                {vehicle.year} {vehicle.make} {vehicle.model}
                                {vehicle.trim && <span className="ml-1" style={{ color: 'var(--subtext)' }}>({vehicle.trim})</span>}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                                VIN: {vehicle.vin || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleCellEdit(vehicle.id, 'make', vehicle.make)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Vehicle Info
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <TableCell className="dark:text-white text-gray-900" style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {vehicle.sale_date ? new Date(vehicle.sale_date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleCellEdit(vehicle.id, 'sale_date', vehicle.sale_date)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Purchase Date
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                      {updatingStatus === vehicle.id ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                        </div>
                      ) : (
                        <Select
                          value={vehicle.status || 'Pending'}
                          onValueChange={(value) => handleStatusChange(vehicle.id, value)}
                        >
                          <SelectTrigger 
                            className="w-[140px] h-9 text-sm transition-all duration-200"
                            style={{ 
                              backgroundColor: 'var(--card-bg)', 
                              borderColor: 'var(--border)', 
                              color: 'var(--text)',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent 
                            style={{ 
                              backgroundColor: 'var(--card-bg)', 
                              borderColor: 'var(--border)'
                            }}
                          >
                            {statusOptions.map((status) => (
                              <SelectItem 
                                key={status} 
                                value={status}
                                style={{ color: 'var(--text)' }}
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <TableCell className="dark:text-white text-gray-900" style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} mi` : 'N/A'}
                          </TableCell>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleCellEdit(vehicle.id, 'odometer', vehicle.odometer)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Odometer
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        {updatingLocation === vehicle.id ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                          </div>
                        ) : (
                          <Select
                            value={vehicle.vehicle_location || 'Missing'}
                            onValueChange={(value) => handleLocationChange(vehicle.id, value)}
                          >
                            <SelectTrigger 
                              className="w-[140px] h-9 text-sm transition-all duration-200"
                              style={{ 
                                backgroundColor: 'var(--card-bg)', 
                                borderColor: 'var(--border)', 
                                color: 'var(--text)',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent 
                              style={{ 
                                backgroundColor: 'var(--card-bg)', 
                                borderColor: 'var(--border)'
                              }}
                            >
                              {carLocationOptions.map((location) => (
                                <SelectItem 
                                  key={location.value} 
                                  value={location.value}
                                  style={{ color: 'var(--text)' }}
                                >
                                  {location.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <TableCell className="dark:text-white text-gray-900" style={{ padding: '16px', verticalAlign: 'middle', color: 'var(--text)' }}>
                            {vehicle.bought_price ? `$${vehicle.bought_price.toLocaleString()}` : 'N/A'}
                          </TableCell>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleCellEdit(vehicle.id, 'bought_price', vehicle.bought_price)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Bought Price
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      <TableCell style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        {updatingTitleStatus === vehicle.id ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                          </div>
                        ) : (
                          <Select
                            value={vehicle.title_status || 'Absent'}
                            onValueChange={(value) => handleTitleStatusChange(vehicle.id, value)}
                          >
                            <SelectTrigger 
                              className="w-[140px] h-9 text-sm transition-all duration-200"
                              style={{ 
                                backgroundColor: 'var(--card-bg)', 
                                borderColor: 'var(--border)', 
                                color: 'var(--text)',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent 
                              style={{ 
                                backgroundColor: 'var(--card-bg)', 
                                borderColor: 'var(--border)'
                              }}
                            >
                              {titleStatusOptions.map((status) => (
                                <SelectItem 
                                  key={status} 
                                  value={status}
                                  style={{ color: 'var(--text)' }}
                                >
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                              color: 'var(--text)'
                            }}
                          >
                            <DropdownMenuItem 
                              style={{ color: 'var(--text)' }}
                              onClick={() => handleView(vehicle)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              style={{ color: 'var(--text)' }}
                              onClick={() => handleEdit(vehicle)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Vehicle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
                              disabled={isDeleting === vehicle.id}
                              style={{ color: isDeleting === vehicle.id ? 'var(--subtext)' : '#ef4444' }}
                            >
                              {isDeleting === vehicle.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              {isDeleting === vehicle.id ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleMarkAsSold(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
                              disabled={isMarkingAsSold === vehicle.id || vehicle.status === 'Sold'}
                              style={{ color: isMarkingAsSold === vehicle.id ? 'var(--subtext)' : 'var(--text)' }}
                            >
                              {isMarkingAsSold === vehicle.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <DollarSign className="mr-2 h-4 w-4" />
                              )}
                              {isMarkingAsSold === vehicle.id ? 'Updating...' : 'Mark as Sold'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              style={{ color: 'var(--text)' }}
                              onClick={() => handleDownloadVehicle(vehicle)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>


    </Card>
  );
}

