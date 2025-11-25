'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ARBApiResponse {
  id: string;
  vehicle_id: string;
  arb_type: 'Sold ARB' | 'Inventory ARB';
  outcome: string;
  vehicle?: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    vin?: string;
  };
}

export default function ProcessARBOutcomePage() {
  const params = useParams();
  const router = useRouter();
  const arbId = params?.arbId as string;
  
  const [vehicleId, setVehicleId] = useState<string>('');
  const [arbType, setArbType] = useState<'Sold ARB' | 'Inventory ARB'>('Sold ARB');
  const [vehicleInfo, setVehicleInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [outcome, setOutcome] = useState<string>('');
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [transportType, setTransportType] = useState<string>('');
  const [transportLocation, setTransportLocation] = useState<string>('');
  const [transportDate, setTransportDate] = useState<Date | undefined>(undefined);
  const [transportCost, setTransportCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!arbId) {
      setError('ARB record ID is required');
      setIsLoading(false);
      return;
    }

    loadARBRecord();
  }, [arbId]);

  const loadARBRecord = async () => {
    if (!arbId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/arb/${arbId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to load ARB record';
        console.error('ARB Process API error:', errorMessage, errorData);
        
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
      
      if (data.outcome !== 'Pending') {
        setError('This ARB record has already been processed');
        toast.error('This ARB record has already been processed. Only pending ARB records can be processed.');
        return;
      }
      
      setVehicleId(data.vehicle_id);
      setArbType(data.arb_type);
      
      if (data.vehicle) {
        const vehicleStr = `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}${data.vehicle.trim ? ` (${data.vehicle.trim})` : ''}`;
        setVehicleInfo(vehicleStr);
      }
    } catch (err: any) {
      console.error('Error loading ARB record:', err);
      setError(err.message || 'Failed to load ARB record');
      toast.error(err.message || 'Failed to load ARB record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate based on outcome
    if (!outcome) {
      toast.error('Please select an outcome');
      return;
    }

    if (arbType === 'Sold ARB') {
      if (outcome === 'Price Adjustment' && (!adjustmentAmount || parseFloat(adjustmentAmount) <= 0)) {
        toast.error('Please enter a valid adjustment amount');
        return;
      }
      if (outcome === 'Buyer Withdrew' && (!transportCost || parseFloat(transportCost) <= 0)) {
        toast.error('Please enter a valid transport cost');
        return;
      }
    } else if (arbType === 'Inventory ARB') {
      if (outcome === 'Price Adjustment' && (!adjustmentAmount || parseFloat(adjustmentAmount) <= 0)) {
        toast.error('Please enter a valid adjustment amount');
        return;
      }
    }

    if (!vehicleId) {
      toast.error('Vehicle ID is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/arb/outcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arb_type: arbType,
          outcome,
          adjustment_amount: adjustmentAmount ? parseFloat(adjustmentAmount) : null,
          transport_type: transportType || null,
          transport_location: transportLocation || null,
          transport_date: transportDate ? format(transportDate, 'yyyy-MM-dd') : null,
          transport_cost: transportCost ? parseFloat(transportCost) : null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process ARB outcome');
      }

      toast.success('ARB outcome processed successfully');
      router.push('/admin/arb');
    } catch (error: any) {
      console.error('Error processing ARB outcome:', error);
      toast.error(error.message || 'Failed to process ARB outcome');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOutcomeOptions = () => {
    if (arbType === 'Sold ARB') {
      return ['Denied', 'Price Adjustment', 'Buyer Withdrew'];
    } else {
      return ['Withdrawn', 'Price Adjustment', 'Denied'];
    }
  };

  const showAdjustmentAmount = () => {
    return outcome === 'Price Adjustment';
  };

  const showTransportFields = () => {
    return arbType === 'Sold ARB' && outcome === 'Buyer Withdrew';
  };

  const showWithdrawnConfirmation = () => {
    return arbType === 'Inventory ARB' && outcome === 'Withdrawn';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--text)' }}>Loading ARB record...</p>
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
              onClick={loadARBRecord}
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
            Process ARB Outcome
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Select the outcome and provide required information
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

      {/* Form Card */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>ARB Outcome Form</CardTitle>
          <CardDescription style={{ color: 'var(--subtext)' }}>
            Process the outcome for this ARB case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Vehicle Information */}
            {vehicleInfo && (
              <div>
                <Label style={{ color: 'var(--text)' }}>Vehicle</Label>
                <div className="mt-1 p-2 rounded" style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border)',
                  color: 'var(--text)'
                }}>
                  {vehicleInfo}
                </div>
              </div>
            )}

            {/* ARB Type Display */}
            <div>
              <Label style={{ color: 'var(--text)' }}>ARB Type</Label>
              <div className="mt-1 p-2 rounded" style={{ 
                backgroundColor: 'var(--card-bg)', 
                border: '1px solid var(--border)',
                color: 'var(--text)'
              }}>
                {arbType}
              </div>
            </div>

            {/* Outcome Selection */}
            <div>
              <Label htmlFor="outcome" style={{ color: 'var(--text)' }}>
                Outcome <span className="text-red-500">*</span>
              </Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger 
                  id="outcome"
                  className="mt-1"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}>
                  {getOutcomeOptions().map((option) => (
                    <SelectItem key={option} value={option} style={{ color: 'var(--text)' }}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Withdrawn Confirmation (Inventory ARB) */}
            {showWithdrawnConfirmation() && (
              <div className="p-4 rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  ⚠️ Warning: This will remove the vehicle from inventory completely.
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--subtext)' }}>
                  The vehicle will be marked as withdrawn and all purchase information will be cleared.
                </p>
              </div>
            )}

            {/* Adjustment Amount (Price Adjustment) */}
            {showAdjustmentAmount() && (
              <div>
                <Label htmlFor="adjustmentAmount" style={{ color: 'var(--text)' }}>
                  Adjustment Amount ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="adjustmentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="Enter adjustment amount"
                  className="mt-1"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>
                  {arbType === 'Sold ARB' 
                    ? 'This amount will be added as an expense (reduces profit)'
                    : 'This amount will reduce the purchase cost (increases profit when sold)'}
                </p>
              </div>
            )}

            {/* Transport Fields (Buyer Withdrew) */}
            {showTransportFields() && (
              <div className="space-y-4 p-4 rounded-lg" style={{ 
                backgroundColor: 'var(--card-bg)', 
                border: '1px solid var(--border)' 
              }}>
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                  Transportation Information
                </h3>
                
                <div>
                  <Label htmlFor="transportType" style={{ color: 'var(--text)' }}>
                    Transport Type
                  </Label>
                  <Input
                    id="transportType"
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    placeholder="e.g., Truck, Trailer, etc."
                    className="mt-1"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="transportLocation" style={{ color: 'var(--text)' }}>
                    Transport Location
                  </Label>
                  <Input
                    id="transportLocation"
                    value={transportLocation}
                    onChange={(e) => setTransportLocation(e.target.value)}
                    placeholder="Enter location"
                    className="mt-1"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="transportDate" style={{ color: 'var(--text)' }}>
                    Transport Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="transportDate"
                        variant="outline"
                        className="w-full mt-1 justify-start text-left font-normal"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)'
                        }}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {transportDate ? format(transportDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)'
                    }}>
                      <Calendar
                        mode="single"
                        selected={transportDate}
                        onSelect={setTransportDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="transportCost" style={{ color: 'var(--text)' }}>
                    Transport Cost ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="transportCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    placeholder="Enter transport cost"
                    className="mt-1"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>
                    This cost will be added as an expense
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes" style={{ color: 'var(--text)' }}>
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="mt-1"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/arb')}
                disabled={isSubmitting}
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !outcome}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Outcome'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

