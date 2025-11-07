'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VehicleWithRelations } from '@/types/vehicle';
import { toast } from 'sonner';
import { ViewVehicleModal } from './ViewVehicleModal';
import { AddVehicleModal } from './AddVehicleModal';
import { Package } from 'lucide-react';

interface BuyerWithdrewVehicleTableProps {
  refreshTrigger: number;
  searchTerm: string;
  onVehicleUpdated: () => void;
}

export function BuyerWithdrewVehicleTable({ 
  refreshTrigger, 
  searchTerm, 
  onVehicleUpdated 
}: BuyerWithdrewVehicleTableProps) {
  const [vehicles, setVehicles] = useState<VehicleWithRelations[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithRelations | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load vehicles from API and filter for 'Withdrew' status
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles');
        
        if (!response.ok) {
          throw new Error('Failed to load vehicles');
        }
        
        const { data } = await response.json();
        // Filter only vehicles with status 'Withdrew'
        const withdrewVehicles = (data || []).filter((v: VehicleWithRelations) => v.status === 'Withdrew');
        setVehicles(withdrewVehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        toast.error('Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, [refreshTrigger]);

  // Filter vehicles based on search term
  useEffect(() => {
    let filtered = [...vehicles];

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.vin && vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm]);

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

      onVehicleUpdated();
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete vehicle');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleView = (vehicle: VehicleWithRelations) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const handleEdit = (vehicle: VehicleWithRelations) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading vehicles...</p>
        </CardContent>
      </Card>
    );
  }

  if (filteredVehicles.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Withdrew Vehicles</h2>
          <p className="text-slate-400">
            {searchTerm 
              ? 'No vehicles match your search criteria.' 
              : 'There are no vehicles with "Withdrew" status at this time.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="dashboard-card neon-glow instrument-cluster">
        <CardHeader>
          <CardTitle className="text-xl" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Buyer Withdrew Vehicles
          </CardTitle>
          <CardDescription style={{ color: 'var(--subtext)' }}>
            Showing {filteredVehicles.length} withdrew vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left p-4 text-slate-300 font-medium">Vehicle</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Purchase Date</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Odometer</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Location</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Bought Price</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Title Status</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        {vehicle.vin && (
                          <div className="text-sm text-slate-400">VIN: {vehicle.vin}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500">
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.odometer ? vehicle.odometer.toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.vehicle_location || vehicle.pickup_location_city || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.bought_price ? `$${vehicle.bought_price.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.title_status || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(vehicle)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(vehicle)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Vehicle Modal */}
      {selectedVehicle && (
        <ViewVehicleModal
          vehicle={selectedVehicle}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {/* Edit Vehicle Modal */}
      {selectedVehicle && (
        <AddVehicleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedVehicle(null);
          }}
          vehicleToEdit={selectedVehicle}
          onVehicleAdded={() => {
            onVehicleUpdated();
            setIsEditModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </>
  );
}


