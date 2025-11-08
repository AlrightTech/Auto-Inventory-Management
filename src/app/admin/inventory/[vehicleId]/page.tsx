'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VehicleWithRelations } from '@/types/vehicle';
import { ViewVehiclePage } from '@/components/inventory/ViewVehiclePage';
import { Loader2 } from 'lucide-react';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params?.vehicleId as string;
  const [vehicle, setVehicle] = useState<VehicleWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) {
      setError('Vehicle ID is required');
      setIsLoading(false);
      return;
    }

    const loadVehicle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Vehicle not found');
          } else {
            setError('Failed to load vehicle');
          }
          return;
        }

        const { data } = await response.json();
        setVehicle(data);
      } catch (err) {
        console.error('Error loading vehicle:', err);
        setError('Failed to load vehicle');
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicle();
  }, [vehicleId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--text)' }}>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{error || 'Vehicle not found'}</p>
          <button
            onClick={() => router.push('/admin/inventory')}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return <ViewVehiclePage vehicle={vehicle} />;
}

