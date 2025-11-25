'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ARBHistoryRecord {
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
  updated_at?: string;
  created_by_user?: {
    id: string;
    username: string;
    email: string;
  };
}

export default function ARBHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const arbId = params?.arbId as string;
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [history, setHistory] = useState<ARBHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!arbId) {
      setError('ARB record ID is required');
      setIsLoading(false);
      return;
    }

    // First, get the ARB record to get the vehicle ID
    loadARBRecord();
  }, [arbId]);

  const loadARBRecord = async () => {
    if (!arbId) return;
    
    try {
      const response = await fetch(`/api/arb/${arbId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('ARB record not found');
          toast.error('This ARB record does not exist or has been removed.');
        } else {
          setError('Failed to load ARB record');
          toast.error('Failed to load ARB record');
        }
        return;
      }

      const { data } = await response.json();
      if (data && data.vehicle_id) {
        setVehicleId(data.vehicle_id);
        loadARBHistory(data.vehicle_id);
      } else {
        setError('Vehicle ID not found in ARB record');
      }
    } catch (err: any) {
      console.error('Error loading ARB record:', err);
      setError(err.message || 'Failed to load ARB record');
      toast.error(err.message || 'Failed to load ARB record');
    }
  };

  const loadARBHistory = async (vid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/vehicles/${vid}/arb/history`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to load ARB history';
        console.error('ARB History API error:', errorMessage, errorData);
        
        if (response.status === 404) {
          setError('ARB history not found');
          toast.error(errorMessage || 'ARB history not found for this vehicle.');
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
        return;
      }

      const { data } = await response.json();
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error loading ARB history:', err);
      setError(err.message || 'Failed to load ARB history');
      toast.error(err.message || 'Failed to load ARB history');
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
          <p style={{ color: 'var(--text)' }}>Loading ARB history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>{error}</p>
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
              onClick={() => {
                if (vehicleId) {
                  loadARBHistory(vehicleId);
                } else {
                  loadARBRecord();
                }
              }}
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
            ARB History
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Complete ARB history for this vehicle
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/admin/arb/${arbId}`)}
            variant="outline"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ARB Details
          </Button>
          <Button
            onClick={() => router.push('/admin/arb')}
            variant="outline"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ARB Management
          </Button>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--subtext)' }} />
              <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No ARB History</p>
              <p style={{ color: 'var(--subtext)' }}>No ARB records found for this vehicle.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <Card key={record.id} className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" style={{
                      backgroundColor: record.arb_type === 'Sold ARB' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: record.arb_type === 'Sold ARB' ? '#3b82f6' : '#10b981',
                      borderColor: record.arb_type === 'Sold ARB' ? '#3b82f6' : '#10b981'
                    }}>
                      {record.arb_type}
                    </Badge>
                    <Badge variant="outline" className={getOutcomeColor(record.outcome)}>
                      {record.outcome}
                    </Badge>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                    {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {record.adjustment_amount && (
                    <div>
                      <span style={{ color: 'var(--subtext)' }}>Adjustment:</span>
                      <span className="ml-2 font-semibold" style={{ color: 'var(--text)' }}>
                        ${record.adjustment_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {record.transport_cost && (
                    <div>
                      <span style={{ color: 'var(--subtext)' }}>Transport Cost:</span>
                      <span className="ml-2 font-semibold" style={{ color: 'var(--text)' }}>
                        ${record.transport_cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {record.transport_type && (
                    <div>
                      <span style={{ color: 'var(--subtext)' }}>Transport Type:</span>
                      <span className="ml-2" style={{ color: 'var(--text)' }}>{record.transport_type}</span>
                    </div>
                  )}
                  {record.transport_location && (
                    <div>
                      <span style={{ color: 'var(--subtext)' }}>Location:</span>
                      <span className="ml-2" style={{ color: 'var(--text)' }}>{record.transport_location}</span>
                    </div>
                  )}
                  {record.transport_date && (
                    <div>
                      <span style={{ color: 'var(--subtext)' }}>Transport Date:</span>
                      <span className="ml-2" style={{ color: 'var(--text)' }}>
                        {format(new Date(record.transport_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {record.created_by_user && (
                    <div>
                      <span style={{ color: 'var(--subtext)' }}>Created By:</span>
                      <span className="ml-2" style={{ color: 'var(--text)' }}>
                        {record.created_by_user.username || record.created_by_user.email}
                      </span>
                    </div>
                  )}
                </div>
                
                {record.notes && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{record.notes}</p>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    onClick={() => router.push(`/admin/arb/${record.id}`)}
                    variant="outline"
                    size="sm"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

