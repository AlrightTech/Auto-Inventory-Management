'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Download, 
  AlertTriangle,
  History,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface ARBVehicle {
  id: string;
  vehicle: string;
  vin: string;
  soldDate: string | null;
  soldPrice: number;
  boughtPrice: number;
  buyerName: string;
  arbDate: string | null;
  arbType: 'sold_arb' | 'inventory_arb';
  outcome: string | null;
  adjustmentAmount: number | null;
  transportType: string | null;
  transportCompany: string | null;
  transportCost: number | null;
  status: string;
  originalStatus: string;
}

const getOutcomeColor = (outcome: string | null) => {
  if (!outcome || outcome === 'pending') {
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
  }
  switch (outcome) {
    case 'denied':
      return 'bg-gray-500/20 text-gray-400 border-gray-500';
    case 'price_adjustment':
      return 'bg-blue-500/20 text-blue-400 border-blue-500';
    case 'buyer_withdrew':
      return 'bg-green-500/20 text-green-400 border-green-500';
    case 'withdrawn':
      return 'bg-red-500/20 text-red-400 border-red-500';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500';
  }
};

const getARBTypeLabel = (arbType: string) => {
  return arbType === 'sold_arb' ? 'Sold ARB' : 'Inventory ARB';
};

export default function ARBPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<ARBVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<ARBVehicle | null>(null);
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);
  const [outcome, setOutcome] = useState<string>('');
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [transportType, setTransportType] = useState<string>('');
  const [transportCompany, setTransportCompany] = useState<string>('');
  const [transportCost, setTransportCost] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load ARB vehicles
  useEffect(() => {
    const loadARBVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles/arb');
        
        if (!response.ok) {
          throw new Error('Failed to load ARB vehicles');
        }
        
        const { data } = await response.json();
        setVehicles(data || []);
      } catch (error) {
        console.error('Error loading ARB vehicles:', error);
        toast.error('Failed to load ARB vehicles');
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadARBVehicles();
  }, [refreshTrigger]);

  const handleSaveOutcome = async () => {
    if (!selectedVehicle || !outcome) {
      toast.error('Please select an outcome');
      return;
    }

    // Validate required fields based on outcome
    if (outcome === 'price_adjustment' && !adjustmentAmount) {
      toast.error('Adjustment amount is required for price adjustment');
      return;
    }

    if (outcome === 'buyer_withdrew' && (!transportType || !transportCompany || !transportCost)) {
      toast.error('Transport type, company, and cost are required for buyer withdrawal');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/vehicles/arb/${selectedVehicle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outcome,
          adjustmentAmount: outcome === 'price_adjustment' ? adjustmentAmount : null,
          transportType: outcome === 'buyer_withdrew' ? transportType : null,
          transportCompany: outcome === 'buyer_withdrew' ? transportCompany : null,
          transportCost: outcome === 'buyer_withdrew' ? transportCost : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save ARB outcome');
      }

      toast.success('ARB outcome saved successfully');
      setShowOutcomeDialog(false);
      setSelectedVehicle(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error saving ARB outcome:', error);
      toast.error(error.message || 'Failed to save ARB outcome');
    } finally {
      setIsSaving(false);
    }
  };

  const getOutcomeOptions = (arbType: string) => {
    if (arbType === 'sold_arb') {
      return [
        { value: 'denied', label: 'Denied' },
        { value: 'price_adjustment', label: 'Price Adjustment' },
        { value: 'buyer_withdrew', label: 'Buyer Withdrew' },
      ];
    } else {
      return [
        { value: 'withdrawn', label: 'Withdrawn' },
        { value: 'price_adjustment', label: 'Price Adjustment' },
        { value: 'denied', label: 'Denied' },
      ];
    }
  };

  const pendingCount = vehicles.filter(v => !v.outcome || v.outcome === 'pending').length;
  const soldARBCount = vehicles.filter(v => v.arbType === 'sold_arb').length;
  const inventoryARBCount = vehicles.filter(v => v.arbType === 'inventory_arb').length;

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle =>
      vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  const handleOpenOutcomeDialog = useCallback((vehicle: ARBVehicle) => {
    setSelectedVehicle(vehicle);
    setOutcome(vehicle.outcome || '');
    setAdjustmentAmount(vehicle.adjustmentAmount?.toString() || '');
    setTransportType(vehicle.transportType || '');
    setTransportCompany(vehicle.transportCompany || '');
    setTransportCost(vehicle.transportCost?.toString() || '');
    setShowOutcomeDialog(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            ARB Management
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Handle ARB (Arbitration) cases from Sold and Inventory sections with comprehensive tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* ARB Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total ARB Cases</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : vehicles.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8" style={{ color: '#f59e0b' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Pending</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : pendingCount}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8" style={{ color: '#fbbf24' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Sold ARB</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : soldARBCount}
                  </p>
                </div>
                <ArrowRight className="h-8 w-8" style={{ color: '#3b82f6' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Inventory ARB</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : inventoryARBCount}
                  </p>
                </div>
                <ArrowLeft className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div>
        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--subtext)' }} />
                <Input
                  placeholder="Search by vehicle, VIN, or buyer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ARB Table */}
      <div>
        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardHeader>
            <CardTitle style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
              ARB Cases ({filteredVehicles.length})
            </CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Manage ARB outcomes and track disputes from both Sold and Inventory sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="ml-2" style={{ color: 'var(--subtext)' }}>Loading ARB vehicles...</span>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--subtext)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No ARB cases found</h3>
                <p style={{ color: 'var(--subtext)' }}>
                  {vehicles.length === 0 
                    ? "No vehicles are currently in ARB status. Initiate ARB from Sold or Inventory sections."
                    : "No vehicles match your search criteria. Try adjusting your search terms."
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700/50">
                    <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>ARB Type</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Buyer</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Sold Date</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Sold Price</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>ARB Date</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Outcome</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Adjustment</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow
                      key={vehicle.id}
                      className="border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/30"
                    >
                      <TableCell style={{ color: 'var(--text)' }}>
                        <div>
                          <div className="font-medium">{vehicle.vehicle}</div>
                          <div className="text-sm" style={{ color: 'var(--subtext)' }}>VIN: {vehicle.vin}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${vehicle.arbType === 'sold_arb' ? 'bg-blue-500/20 text-blue-400 border-blue-500' : 'bg-green-500/20 text-green-400 border-green-500'} flex items-center gap-1 w-fit`}
                        >
                          {getARBTypeLabel(vehicle.arbType)}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{vehicle.buyerName}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        {vehicle.soldDate ? new Date(vehicle.soldDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        ${vehicle.soldPrice.toLocaleString()}
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        {vehicle.arbDate ? new Date(vehicle.arbDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getOutcomeColor(vehicle.outcome)} flex items-center gap-1 w-fit`}
                        >
                          {vehicle.outcome ? vehicle.outcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        {vehicle.adjustmentAmount ? `$${vehicle.adjustmentAmount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenOutcomeDialog(vehicle)}
                            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                          >
                            {vehicle.outcome ? 'Update Outcome' : 'Set Outcome'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              style={{ 
                                backgroundColor: 'var(--card-bg)', 
                                borderColor: 'var(--border)',
                                color: 'var(--text)'
                              }}
                            >
                              <DropdownMenuItem style={{ color: 'var(--text)' }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outcome Dialog */}
      <Dialog open={showOutcomeDialog} onOpenChange={setShowOutcomeDialog}>
        <DialogContent className="max-w-2xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text)' }}>
              Set ARB Outcome - {selectedVehicle && getARBTypeLabel(selectedVehicle.arbType)}
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--subtext)' }}>
              {selectedVehicle && (
                selectedVehicle.arbType === 'sold_arb'
                  ? 'Select the outcome for this Sold ARB case. Price Adjustment will add an expense, Buyer Withdrew will move vehicle to Inventory.'
                  : 'Select the outcome for this Inventory ARB case. Price Adjustment reduces purchase cost, Withdrawn removes vehicle from inventory.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="outcome" style={{ color: 'var(--text)' }}>ARB Outcome *</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger 
                  id="outcome"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  {selectedVehicle && getOutcomeOptions(selectedVehicle.arbType).map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      style={{ color: 'var(--text)' }}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {outcome === 'price_adjustment' && (
              <div>
                <Label htmlFor="adjustmentAmount" style={{ color: 'var(--text)' }}>
                  Adjustment Amount * {selectedVehicle?.arbType === 'inventory_arb' && '(Positive - reduces cost)'}
                </Label>
                <Input
                  id="adjustmentAmount"
                  type="number"
                  step="0.01"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="Enter adjustment amount"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                {selectedVehicle?.arbType === 'inventory_arb' && (
                  <p className="text-sm mt-1" style={{ color: 'var(--subtext)' }}>
                    This positive adjustment will reduce the effective purchase price in profit calculations.
                  </p>
                )}
                {selectedVehicle?.arbType === 'sold_arb' && (
                  <p className="text-sm mt-1" style={{ color: 'var(--subtext)' }}>
                    This amount will be added as an expense (Arbitration Modified) and reduce profit.
                  </p>
                )}
              </div>
            )}

            {outcome === 'buyer_withdrew' && (
              <>
                <div>
                  <Label htmlFor="transportType" style={{ color: 'var(--text)' }}>Transport Type *</Label>
                  <Input
                    id="transportType"
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    placeholder="e.g., Truck, Trailer, etc."
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <Label htmlFor="transportCompany" style={{ color: 'var(--text)' }}>Transport Company *</Label>
                  <Input
                    id="transportCompany"
                    value={transportCompany}
                    onChange={(e) => setTransportCompany(e.target.value)}
                    placeholder="Enter transport company name"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <Label htmlFor="transportCost" style={{ color: 'var(--text)' }}>Transport Cost *</Label>
                  <Input
                    id="transportCost"
                    type="number"
                    step="0.01"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    placeholder="Enter transport cost"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <p className="text-sm mt-1" style={{ color: 'var(--subtext)' }}>
                    This cost will be added to expenses and the vehicle will move to Inventory → Buyer Withdrew tab.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOutcomeDialog(false)}
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOutcome}
              disabled={isSaving || !outcome}
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Outcome
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
