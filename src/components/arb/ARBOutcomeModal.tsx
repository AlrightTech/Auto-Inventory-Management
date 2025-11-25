'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ARBOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  arbType: 'Sold ARB' | 'Inventory ARB';
  onSuccess: () => void;
}

export function ARBOutcomeModal({
  isOpen,
  onClose,
  vehicleId,
  arbType,
  onSuccess,
}: ARBOutcomeModalProps) {
  const [outcome, setOutcome] = useState<string>('');
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [transportType, setTransportType] = useState<string>('');
  const [transportLocation, setTransportLocation] = useState<string>('');
  const [transportDate, setTransportDate] = useState<Date | undefined>(undefined);
  const [transportCost, setTransportCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setOutcome('');
      setAdjustmentAmount('');
      setTransportType('');
      setTransportLocation('');
      setTransportDate(undefined);
      setTransportCost('');
      setNotes('');
    }
  }, [isOpen]);

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
      onSuccess();
      onClose();
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // Don't render if no vehicleId
  if (!vehicleId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        zIndex: 100
      }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--accent)' }}>
            Process ARB Outcome - {arbType}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            Select the outcome and provide required information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                color: 'var(--text)',
                zIndex: 101
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
                    borderColor: 'var(--border)',
                    zIndex: 101
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
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
      </DialogContent>
    </Dialog>
  );
}

