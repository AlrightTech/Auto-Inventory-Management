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
  Download, 
  AlertTriangle,
  History,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { ARBOutcomeModal } from '@/components/arb/ARBOutcomeModal';

interface ARBRecord {
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

export default function ARBPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<ARBRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [arbModalOpen, setArbModalOpen] = useState(false);
  const [selectedVehicleForArb, setSelectedVehicleForArb] = useState<{ id: string; type: 'Sold ARB' | 'Inventory ARB' } | null>(null);
  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedArbRecordId, setSelectedArbRecordId] = useState<string | null>(null);
  const [selectedVehicleIdForHistory, setSelectedVehicleIdForHistory] = useState<string | null>(null);

  // Load ARB records
  useEffect(() => {
    const loadARBRecords = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/arb');
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('ARB records endpoint not found');
            setVehicles([]);
            return;
          }
          throw new Error('Failed to load ARB records');
        }
        
        const { data } = await response.json();
        setVehicles(data || []);
      } catch (error: any) {
        console.error('Error loading ARB records:', error);
        toast.error(error.message || 'Failed to load ARB records');
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadARBRecords();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.buyerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterOutcome === 'all' || vehicle.outcome === filterOutcome;
    
    return matchesSearch && matchesFilter;
  });

  const handleProcessOutcome = (vehicleId: string, arbType: 'Sold ARB' | 'Inventory ARB') => {
    try {
      if (!vehicleId) {
        toast.error('Invalid vehicle ID');
        return;
      }
      setSelectedVehicleForArb({ id: vehicleId, type: arbType });
      setArbModalOpen(true);
    } catch (error: any) {
      console.error('Error opening Process Outcome modal:', error);
      toast.error('Failed to open Process Outcome dialog');
    }
  };

  const handleViewDetails = (arbRecordId: string, vehicleId: string) => {
    try {
      if (!arbRecordId) {
        toast.error('ARB record ID is missing');
        return;
      }
      setSelectedArbRecordId(arbRecordId);
      setDetailsModalOpen(true);
    } catch (error: any) {
      console.error('Error opening ARB Details:', error);
      toast.error('Failed to open ARB details');
    }
  };

  const handleViewHistory = (vehicleId: string) => {
    try {
      if (!vehicleId) {
        toast.error('Vehicle ID is missing');
        return;
      }
      setSelectedVehicleIdForHistory(vehicleId);
      setHistoryModalOpen(true);
    } catch (error: any) {
      console.error('Error opening ARB History:', error);
      toast.error('Failed to open ARB history');
    }
  };

  const handleARBOutcomeSuccess = () => {
    // Reload ARB records
    const loadARBRecords = async () => {
      try {
        const response = await fetch('/api/arb');
        if (response.ok) {
          const { data } = await response.json();
          setVehicles(data || []);
        }
      } catch (error) {
        console.error('Error reloading ARB records:', error);
      }
    };
    loadARBRecords();
  };

  const pendingCount = vehicles.filter(v => v.outcome === 'Pending').length;
  const buyerWithdrewCount = vehicles.filter(v => v.outcome === 'Buyer Withdrew').length;
  const priceAdjustmentCount = vehicles.filter(v => v.outcome === 'Price Adjustment').length;
  const withdrawnCount = vehicles.filter(v => v.outcome === 'Withdrawn').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            ARB Management
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Handle ARB (Arbitration) cases and buyer disputes with comprehensive tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* ARB Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Pending</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : pendingCount}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8" style={{ color: '#eab308' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Buyer Withdrew</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : buyerWithdrewCount}
                  </p>
                </div>
                <ArrowLeft className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Price Adjustments</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : priceAdjustmentCount}
                  </p>
                </div>
                <ArrowRight className="h-8 w-8" style={{ color: '#3b82f6' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--subtext)' }} />
                <Input
                  placeholder="Search by vehicle, VIN, or buyer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                />
              </div>
              <select
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value)}
                className="px-4 py-2 rounded border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              >
                <option value="all">All Outcomes</option>
                <option value="Pending">Pending</option>
                <option value="Denied">Denied</option>
                <option value="Price Adjustment">Price Adjustment</option>
                <option value="Buyer Withdrew">Buyer Withdrew</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ARB Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
              ARB Cases ({filteredVehicles.length})
            </CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Manage ARB outcomes and track buyer disputes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="ml-2" style={{ color: 'var(--subtext)' }}>Loading ARB records...</span>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--subtext)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No ARB records found</h3>
                <p style={{ color: 'var(--subtext)' }}>
                  {vehicles.length === 0 
                    ? "No ARB cases have been initiated yet."
                    : "No ARB records match your search criteria. Try adjusting your search terms."}
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
                {filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell style={{ color: 'var(--text)' }}>
                      <div>
                        <div className="font-medium">{vehicle.vehicle}</div>
                        <div className="text-sm" style={{ color: 'var(--subtext)' }}>VIN: {vehicle.vin}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{
                        backgroundColor: vehicle.arbType === 'Sold ARB' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: vehicle.arbType === 'Sold ARB' ? '#3b82f6' : '#10b981',
                        borderColor: vehicle.arbType === 'Sold ARB' ? '#3b82f6' : '#10b981'
                      }}>
                        {vehicle.arbType}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text)' }}>{vehicle.buyerName}</TableCell>
                    <TableCell style={{ color: 'var(--text)' }}>
                      {vehicle.soldDate ? new Date(vehicle.soldDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text)' }}>
                      {vehicle.soldPrice ? `$${vehicle.soldPrice.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text)' }}>
                      {new Date(vehicle.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getOutcomeColor(vehicle.outcome)} flex items-center gap-1 w-fit`}
                      >
                        {vehicle.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text)' }}>
                      {vehicle.adjustmentAmount 
                        ? `$${vehicle.adjustmentAmount.toLocaleString()}` 
                        : vehicle.transportCost 
                          ? `Transport: $${vehicle.transportCost.toLocaleString()}`
                          : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {vehicle.outcome === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProcessOutcome(vehicle.vehicleId, vehicle.arbType)}
                            style={{
                              borderColor: 'var(--border)',
                              color: 'var(--text)'
                            }}
                          >
                            Process Outcome
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" style={{
                              borderColor: 'var(--border)',
                              color: 'var(--text)'
                            }}>
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
                            <DropdownMenuItem 
                              style={{ color: 'var(--text)' }}
                              onClick={() => handleViewDetails(vehicle.id, vehicle.vehicleId)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              style={{ color: 'var(--text)' }}
                              onClick={() => handleViewHistory(vehicle.vehicleId)}
                            >
                              <History className="w-4 h-4 mr-2" />
                              View History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ARB Outcome Modal */}
      {selectedVehicleForArb && (
        <ARBOutcomeModal
          isOpen={arbModalOpen}
          onClose={() => {
            setArbModalOpen(false);
            setSelectedVehicleForArb(null);
          }}
          vehicleId={selectedVehicleForArb.id}
          arbType={selectedVehicleForArb.type}
          onSuccess={handleARBOutcomeSuccess}
        />
      )}

      {/* ARB Details Modal */}
      {selectedArbRecordId && (
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedArbRecordId(null);
          }}
          arbRecordId={selectedArbRecordId}
          vehicleId={vehicles.find(v => v.id === selectedArbRecordId)?.vehicleId || ''}
        />
      )}

      {/* ARB History Modal */}
      {selectedVehicleIdForHistory && (
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedVehicleIdForHistory(null);
          }}
          vehicleId={selectedVehicleIdForHistory}
        />
      )}
    </div>
  );
}

