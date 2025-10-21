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
  Plus,
  Upload,
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<SoldVehicle | null>(null);
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

  const totalSales = vehicles.reduce((sum, vehicle) => sum + vehicle.soldPrice, 0);
  const totalPurchases = vehicles.reduce((sum, vehicle) => sum + vehicle.boughtPrice, 0);
  const totalProfit = vehicles.reduce((sum, vehicle) => sum + vehicle.netProfit, 0);
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

  const handlePriceChange = async (vehicleId: string, field: 'soldPrice' | 'boughtPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    const updateField = field === 'soldPrice' ? 'sold_price' : 'bought_price';
    
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

      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
      toast.success('Vehicle price updated successfully');
    } catch (error) {
      console.error('Error updating vehicle price:', error);
      toast.error('Failed to update vehicle price');
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white glow-text">
            Sold Vehicles
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track sold vehicles, profit calculations, and payment status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="gradient-primary hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
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
          <Card className="glass-card border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Sales</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : `$${totalSales.toLocaleString()}`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Purchases</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : `$${totalPurchases.toLocaleString()}`}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Net Profit</p>
                  <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : `$${totalProfit.toLocaleString()}`}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Price</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : `$${avgPrice.toLocaleString()}`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500 dark:text-purple-400" />
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
            <CardTitle className="text-slate-900 dark:text-white">Sold Vehicles ({filteredVehicles.length})</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage sold vehicles and track financial performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-600 dark:text-slate-400">Loading sold vehicles...</span>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No sold vehicles yet</h3>
                <p className="text-slate-500 dark:text-slate-500">
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
                    <TableHead className="text-slate-700 dark:text-slate-300">Vehicle</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Purchase Date</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Sale Date</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Bought Price</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Sold Price</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Net Profit</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Payment</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Actions</TableHead>
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
                    <TableCell className="text-slate-900 dark:text-white">
                      <div>
                        <div className="font-medium">{vehicle.vehicle}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">VIN: {vehicle.vin}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Buyer: {vehicle.buyerName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {new Date(vehicle.purchaseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {new Date(vehicle.saleDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={vehicle.boughtPrice}
                        onChange={(e) => handlePriceChange(vehicle.id, 'boughtPrice', e.target.value)}
                        className="w-24 bg-white/50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={vehicle.soldPrice}
                        onChange={(e) => handlePriceChange(vehicle.id, 'soldPrice', e.target.value)}
                        className="w-24 bg-white/50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </TableCell>
                    <TableCell className={`font-bold ${vehicle.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${vehicle.netProfit.toLocaleString()}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVehicle(vehicle)}
                          className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                            <DropdownMenuItem
                              onClick={() => handleMoveToARB(vehicle.id)}
                              className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              Move to ARB
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMoveToWithdrew(vehicle.id)}
                              className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              Mark as Withdrew
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
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