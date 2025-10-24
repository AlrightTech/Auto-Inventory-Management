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
  Trash2
} from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { toast } from 'sonner';

interface VehicleTableProps {
  onVehicleAdded?: () => void;
  refreshTrigger?: number;
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

export function VehicleTable({ onVehicleAdded, refreshTrigger }: VehicleTableProps) {
  const [vehicles, setVehicles] = useState<VehicleWithRelations[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load vehicles from API
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles');
        
        if (!response.ok) {
          throw new Error('Failed to load vehicles');
        }
        
        const { data } = await response.json();
        setVehicles(data || []);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        toast.error('Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, [onVehicleAdded, refreshTrigger]);

  // Filter vehicles based on search term
  useEffect(() => {
    let filtered = [...vehicles];

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.vin && vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm]);

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
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete vehicle');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card className="glass-card border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-900 dark:text-white">Vehicle Inventory</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Showing {filteredVehicles.length} vehicles
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Search by make, model, or VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/30">
                <TableHead className="text-black dark:text-gray-300 font-medium">Vehicle</TableHead>
                <TableHead className="text-black dark:text-gray-300 font-medium">Purchase Date</TableHead>
                <TableHead className="text-black dark:text-gray-300 font-medium">Status</TableHead>
                <TableHead className="text-black dark:text-gray-300 font-medium">Odometer</TableHead>
                <TableHead className="text-black dark:text-gray-300 font-medium">Location</TableHead>
                <TableHead className="text-black dark:text-gray-300 font-medium">Bought Price</TableHead>
                <TableHead className="text-black dark:text-gray-300 font-medium">Title Status</TableHead>
                <TableHead className="text-black dark:text-gray-300 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-blue-400" />
                      <span className="text-slate-600 dark:text-slate-400">Loading vehicles...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-slate-600 dark:text-slate-400">
                      {searchTerm ? 'No vehicles found matching your search.' : 'No vehicles in inventory yet.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="text-slate-900 dark:text-white">
                      <div>
                        <div className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                          {vehicle.trim && <span className="text-slate-500 dark:text-slate-400 ml-1">({vehicle.trim})</span>}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          VIN: {vehicle.vin || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {vehicle.sale_date ? new Date(vehicle.sale_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(vehicle.status)} flex items-center gap-1 w-fit`}
                      >
                        {getStatusIcon(vehicle.status)}
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} mi` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {vehicle.pickup_location_city || vehicle.facilitating_location || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {vehicle.bought_price ? `$${vehicle.bought_price.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      <Badge 
                        variant="outline" 
                        className={vehicle.title_status === 'Absent' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500' : 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500'}
                      >
                        {vehicle.title_status}
                      </Badge>
                    </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-slate-200 dark:border-slate-700">
                        <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Vehicle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
                          disabled={isDeleting === vehicle.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20 focus:bg-red-50 dark:focus:bg-red-500/20"
                        >
                          {isDeleting === vehicle.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          {isDeleting === vehicle.id ? 'Deleting...' : 'Delete Vehicle'}
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

