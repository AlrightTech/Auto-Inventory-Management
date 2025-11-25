'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ARBDetails {
  id: string;
  vehicleId: string;
  vehicle: string;
  vin: string;
  arbType: 'Sold ARB' | 'Inventory ARB';
  outcome: string;
  adjustmentAmount?: number;
  transportType?: string;
  transportLocation?: string;
  transportDate?: string;
  transportCost?: number;
  notes?: string;
  createdAt: string;
  createdBy?: {
    id: string;
    username: string;
    email: string;
  };
  soldDate?: string;
  soldPrice?: number;
  buyerName: string;
}

interface ARBApiResponse {
  id: string;
  vehicle_id: string;
  arb_type: 'Sold ARB' | 'Inventory ARB';
  outcome: string;
  adjustment_amount?: number;
  transport_type?: string;
  transport_location?: string;
  transport_date?: string;
  transport_cost?: number;
  notes?: string;
  created_at: string;
  vehicle?: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    vin?: string;
    status: string;
    sale_date?: string;
    sale_invoice?: number;
    buyer_contact_name?: string;
    buyer_dealership?: string;
  };
  created_by_user?: {
    id: string;
    username: string;
    email: string;
  };
}

export default function ARBDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const arbId = params?.arbId as string;
  const [details, setDetails] = useState<ARBDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!arbId) {
      setError('ARB record ID is required');
      setIsLoading(false);
      return;
    }

    loadARBDetails();
  }, [arbId]);

  const loadARBDetails = async () => {
    if (!arbId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/arb/${arbId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to load ARB details';
        console.error('ARB Details API error:', errorMessage, errorData);
        
        if (response.status === 404) {
          setError('ARB record not found');
          toast.error(errorMessage || 'This ARB record does not exist or has been removed.');
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
        return;
      }

      const { data }: { data: ARBApiResponse } = await response.json();
      
      // Transform the API response to match the expected format
      const transformedData: ARBDetails = {
        id: data.id,
        vehicleId: data.vehicle_id,
        vehicle: data.vehicle
          ? `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}${data.vehicle.trim ? ` (${data.vehicle.trim})` : ''}`
          : 'Unknown Vehicle',
        vin: data.vehicle?.vin || 'N/A',
        arbType: data.arb_type,
        outcome: data.outcome,
        adjustmentAmount: data.adjustment_amount,
        transportType: data.transport_type,
        transportLocation: data.transport_location,
        transportDate: data.transport_date,
        transportCost: data.transport_cost,
        notes: data.notes,
        createdAt: data.created_at,
        createdBy: data.created_by_user,
        soldDate: data.vehicle?.sale_date,
        soldPrice: data.vehicle?.sale_invoice,
        buyerName: data.vehicle?.buyer_contact_name || data.vehicle?.buyer_dealership || 'N/A',
      };
      
      setDetails(transformedData);
    } catch (err: any) {
      console.error('Error loading ARB details:', err);
      setError(err.message || 'Failed to load ARB details');
      toast.error(err.message || 'Failed to load ARB details');
    } finally {
      setIsLoading(false);
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Denied':
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
      case 'Price Adjustment':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'Buyer Withdrew':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'Withdrawn':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--text)' }}>Loading ARB details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
            {error || 'ARB record not found'}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Button
              onClick={() => router.push('/admin/arb')}
              variant="outline"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to ARB Management
            </Button>
            <Button
              onClick={loadARBDetails}
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            ARB Details
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Complete ARB record information
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/arb')}
          variant="outline"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to ARB Management
        </Button>
      </div>

      {/* Vehicle Information */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span style={{ color: 'var(--subtext)' }} className="text-sm">Vehicle:</span>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{details.vehicle}</p>
            </div>
            <div>
              <span style={{ color: 'var(--subtext)' }} className="text-sm">VIN:</span>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{details.vin || 'N/A'}</p>
            </div>
            {details.buyerName && (
              <div>
                <span style={{ color: 'var(--subtext)' }} className="text-sm">Buyer:</span>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>{details.buyerName}</p>
              </div>
            )}
            {details.soldDate && (
              <div>
                <span style={{ color: 'var(--subtext)' }} className="text-sm">Sold Date:</span>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  {format(new Date(details.soldDate), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            {details.soldPrice && (
              <div>
                <span style={{ color: 'var(--subtext)' }} className="text-sm">Sold Price:</span>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  ${details.soldPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ARB Information */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>ARB Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span style={{ color: 'var(--subtext)' }} className="text-sm">ARB Type:</span>
              <div className="mt-1">
                <Badge variant="outline" style={{
                  backgroundColor: details.arbType === 'Sold ARB' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: details.arbType === 'Sold ARB' ? '#3b82f6' : '#10b981',
                  borderColor: details.arbType === 'Sold ARB' ? '#3b82f6' : '#10b981'
                }}>
                  {details.arbType}
                </Badge>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--subtext)' }} className="text-sm">Outcome:</span>
              <div className="mt-1">
                <Badge variant="outline" className={getOutcomeColor(details.outcome)}>
                  {details.outcome}
                </Badge>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--subtext)' }} className="text-sm">Created:</span>
              <p style={{ color: 'var(--text)' }}>
                {format(new Date(details.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            {details.createdBy && (
              <div>
                <span style={{ color: 'var(--subtext)' }} className="text-sm">Created By:</span>
                <p style={{ color: 'var(--text)' }}>
                  {details.createdBy.username || details.createdBy.email}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      {(details.adjustmentAmount || details.transportCost) && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.adjustmentAmount && (
                <div>
                  <span style={{ color: 'var(--subtext)' }} className="text-sm">Adjustment Amount:</span>
                  <p className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                    ${details.adjustmentAmount.toLocaleString()}
                  </p>
                </div>
              )}
              {details.transportCost && (
                <div>
                  <span style={{ color: 'var(--subtext)' }} className="text-sm">Transport Cost:</span>
                  <p className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                    ${details.transportCost.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transport Information */}
      {details.transportType && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Transport Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span style={{ color: 'var(--subtext)' }} className="text-sm">Transport Type:</span>
                <p style={{ color: 'var(--text)' }}>{details.transportType}</p>
              </div>
              {details.transportLocation && (
                <div>
                  <span style={{ color: 'var(--subtext)' }} className="text-sm">Location:</span>
                  <p style={{ color: 'var(--text)' }}>{details.transportLocation}</p>
                </div>
              )}
              {details.transportDate && (
                <div>
                  <span style={{ color: 'var(--subtext)' }} className="text-sm">Date:</span>
                  <p style={{ color: 'var(--text)' }}>
                    {format(new Date(details.transportDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {details.notes && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--text)' }} className="whitespace-pre-wrap">{details.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => router.push(`/admin/arb/${arbId}/history`)}
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          View ARB History
        </Button>
        <Button
          onClick={() => router.push('/admin/arb')}
          variant="outline"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Back to ARB Management
        </Button>
      </div>
    </div>
  );
}

