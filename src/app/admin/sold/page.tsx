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
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SoldVehicle {
  id: string;
  vehicle: string;
  vin: string;
  purchaseDate: string;
  saleDate: string;
  boughtPrice: number;
  buyFee?: number;
  otherCharges?: number;
  totalCost?: number;
  soldPrice: number;
  netProfit: number;
  titleStatus: string;
  arbStatus: string;
  status: string;
  location: string;
  buyerName: string;
  paymentStatus: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Sold':
      return 'bg-green-500/20 text-green-400 border-green-500';
    case 'ARB':
      return 'bg-red-500/20 text-red-400 border-red-500';
    case 'Withdrew':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    case 'Cancelled':
      return 'bg-gray-500/20 text-gray-400 border-gray-500';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'Received':
      return 'bg-green-500/20 text-green-400 border-green-500';
    case 'Pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    case 'Failed':
      return 'bg-red-500/20 text-red-400 border-red-500';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500';
  }
};

export default function SoldPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<SoldVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load sold vehicles from API
  useEffect(() => {
    const loadSoldVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles/sold');
        
        if (!response.ok) {
          throw new Error('Failed to load sold vehicles');
        }
        
        const { data } = await response.json();
        setVehicles(data || []);
      } catch (error) {
        console.error('Error loading sold vehicles:', error);
        toast.error('Failed to load sold vehicles');
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSoldVehicles();
  }, [refreshTrigger]);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = vehicles.reduce((sum, vehicle) => sum + (vehicle.soldPrice || 0), 0);
  const totalPurchases = vehicles.reduce((sum, vehicle) => sum + ((vehicle.boughtPrice || 0) + (vehicle.buyFee || 0) + (vehicle.otherCharges || 0)), 0);
  const totalProfit = vehicles.reduce((sum, vehicle) => sum + (vehicle.netProfit || 0), 0);
  const avgPrice = vehicles.length > 0 ? totalSales / vehicles.length : 0;

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle status');
      }

      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
      toast.success('Vehicle status updated successfully');
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast.error('Failed to update vehicle status');
    }
  };

  const handlePriceChange = async (vehicleId: string, field: 'soldPrice' | 'boughtPrice' | 'buyFee' | 'otherCharges', value: string) => {
    const numValue = parseFloat(value) || 0;
    let updateField: string;
    
    switch (field) {
      case 'soldPrice':
        updateField = 'sale_invoice';
        break;
      case 'boughtPrice':
        updateField = 'bought_price';
        break;
      case 'buyFee':
        updateField = 'buy_fee';
        break;
      case 'otherCharges':
        updateField = 'other_charges';
        break;
      default:
        updateField = 'bought_price';
    }
    
    // Update local state immediately for dynamic insights
    setVehicles(prevVehicles => {
      return prevVehicles.map(vehicle => {
        if (vehicle.id === vehicleId) {
          const updatedVehicle = { ...vehicle };
          
          switch (field) {
            case 'soldPrice':
              updatedVehicle.soldPrice = numValue;
              break;
            case 'boughtPrice':
              updatedVehicle.boughtPrice = numValue;
              break;
            case 'buyFee':
              updatedVehicle.buyFee = numValue;
              break;
            case 'otherCharges':
              updatedVehicle.otherCharges = numValue;
              break;
          }
          
          // Recalculate totalCost and netProfit
          const boughtPrice = updatedVehicle.boughtPrice || 0;
          const buyFee = updatedVehicle.buyFee || 0;
          const otherCharges = updatedVehicle.otherCharges || 0;
          const soldPrice = updatedVehicle.soldPrice || 0;
          updatedVehicle.totalCost = boughtPrice + buyFee + otherCharges;
          updatedVehicle.netProfit = soldPrice - updatedVehicle.totalCost;
          
          return updatedVehicle;
        }
        return vehicle;
      });
    });
    
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [updateField]: numValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle price');
      }

      // Refresh the data to ensure sync with server
      setRefreshTrigger(prev => prev + 1);
      toast.success('Vehicle price updated successfully');
    } catch (error) {
      console.error('Error updating vehicle price:', error);
      toast.error('Failed to update vehicle price');
      // Revert on error by refreshing
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleMoveToARB = (vehicleId: string) => {
    handleStatusChange(vehicleId, 'ARB');
  };

  const handleMoveToWithdrew = (vehicleId: string) => {
    handleStatusChange(vehicleId, 'Withdrew');
  };

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
            Sold Vehicles
          </h1>
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Track sold vehicles, profit calculations, and payment status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Financial Summary */}
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
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Sales</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : `$${totalSales.toLocaleString()}`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8" style={{ color: '#10b981' }} />
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
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Purchases</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : `$${totalPurchases.toLocaleString()}`}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8" style={{ color: '#ef4444' }} />
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
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Net Profit</p>
                  <p className="text-3xl font-bold" style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : `$${totalProfit.toLocaleString()}`}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8" style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }} />
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
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Avg Price</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} /> : `$${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8" style={{ color: '#a855f7' }} />
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
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder="Search by vehicle, VIN, or buyer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sold Vehicles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>Sold Vehicles ({filteredVehicles.length})</CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Manage sold vehicles and track financial performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="ml-2" style={{ color: 'var(--subtext)' }}>Loading sold vehicles...</span>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--subtext)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No sold vehicles yet</h3>
                <p style={{ color: 'var(--subtext)' }}>
                  {vehicles.length === 0 
                    ? "No vehicles have been marked as sold. Add vehicles to your inventory and mark them as sold to see them here."
                    : "No vehicles match your search criteria. Try adjusting your search terms."
                  }
                </p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700/50">
                    <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Purchase Date</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Sale Date</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Bought Price</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Sold Price</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Net Profit</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Status</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Payment</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell style={{ color: 'var(--text)' }}>
                      <div>
                        <div className="font-medium">{vehicle.vehicle}</div>
                        <div className="text-sm" style={{ color: 'var(--subtext)' }}>VIN: {vehicle.vin}</div>
                        <div className="text-sm" style={{ color: 'var(--subtext)' }}>Buyer: {vehicle.buyerName}</div>
                      </div>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text)' }}>
                      {vehicle.purchaseDate && vehicle.purchaseDate !== 'N/A' ? new Date(vehicle.purchaseDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text)' }}>
                      {vehicle.saleDate && vehicle.saleDate !== 'N/A' ? new Date(vehicle.saleDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={vehicle.boughtPrice || 0}
                        onChange={(e) => handlePriceChange(vehicle.id, 'boughtPrice', e.target.value)}
                        className="w-24 control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={vehicle.soldPrice || 0}
                        onChange={(e) => handlePriceChange(vehicle.id, 'soldPrice', e.target.value)}
                        className="w-24 control-panel"
                        style={{ 
                          backgroundColor: 'var(--card-bg)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text)' 
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-bold" style={{ color: vehicle.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                      ${(vehicle.netProfit || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(vehicle.status)} flex items-center gap-1 w-fit`}
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getPaymentStatusColor(vehicle.paymentStatus)} flex items-center gap-1 w-fit`}
                      >
                        {vehicle.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                            <DropdownMenuItem
                              onClick={() => handleMoveToARB(vehicle.id)}
                              style={{ color: 'var(--text)' }}
                            >
                              Move to ARB
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMoveToWithdrew(vehicle.id)}
                              style={{ color: 'var(--text)' }}
                            >
                              Mark as Withdrew
                            </DropdownMenuItem>
                            <DropdownMenuItem style={{ color: 'var(--text)' }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem style={{ color: 'var(--text)' }}>
                              <FileText className="w-4 h-4 mr-2" />
                              Add Notes
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
    </div>
  );
}