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
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Mock sold vehicles data
const mockSoldVehicles = [
  {
    id: '1',
    vehicle: '2021 Chevrolet Silverado',
    vin: '1GCHK29U4XZ123456',
    purchaseDate: '2024-10-10',
    saleDate: '2024-10-15',
    boughtPrice: 25000,
    soldPrice: 32000,
    netProfit: 7000,
    titleStatus: 'Present',
    arbStatus: 'Absent',
    status: 'Sold',
    location: 'Auction',
    buyerName: 'John Smith',
    paymentStatus: 'Received'
  },
  {
    id: '2',
    vehicle: '2020 Ford F-150',
    vin: '1FTFW1ET5DFC12345',
    purchaseDate: '2024-10-09',
    saleDate: '2024-10-14',
    boughtPrice: 28000,
    soldPrice: 35000,
    netProfit: 7000,
    titleStatus: 'Present',
    arbStatus: 'Present',
    status: 'ARB',
    location: 'Shop/Mechanic',
    buyerName: 'Sarah Johnson',
    paymentStatus: 'Pending'
  },
  {
    id: '3',
    vehicle: '2019 Honda Civic',
    vin: '2HGFC2F59KH123456',
    purchaseDate: '2024-10-08',
    saleDate: '2024-10-13',
    boughtPrice: 18000,
    soldPrice: 22000,
    netProfit: 4000,
    titleStatus: 'In Transit',
    arbStatus: 'Present',
    status: 'Sold',
    location: 'Missing',
    buyerName: 'Mike Wilson',
    paymentStatus: 'Received'
  },
];

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
  const [vehicles, setVehicles] = useState(mockSoldVehicles);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = vehicles.reduce((sum, vehicle) => sum + vehicle.soldPrice, 0);
  const totalPurchases = vehicles.reduce((sum, vehicle) => sum + vehicle.boughtPrice, 0);
  const totalProfit = vehicles.reduce((sum, vehicle) => sum + vehicle.netProfit, 0);
  const avgPrice = vehicles.length > 0 ? totalSales / vehicles.length : 0;

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, status: newStatus }
        : vehicle
    ));
  };

  const handlePriceChange = (vehicleId: string, field: 'soldPrice' | 'boughtPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setVehicles(prev => prev.map(vehicle => {
      if (vehicle.id === vehicleId) {
        const updatedVehicle = { ...vehicle, [field]: numValue };
        // Recalculate net profit
        updatedVehicle.netProfit = updatedVehicle.soldPrice - updatedVehicle.boughtPrice;
        return updatedVehicle;
      }
      return vehicle;
    }));
  };

  const handleMoveToARB = (vehicleId: string) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, status: 'ARB' }
        : vehicle
    ));
  };

  const handleMoveToWithdrew = (vehicleId: string) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, status: 'Withdrew' }
        : vehicle
    ));
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
          <h1 className="text-3xl font-bold text-white glow-text">
            Sold Vehicles
          </h1>
          <p className="text-slate-400 mt-1">
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
          <Button variant="outline" className="border-slate-600 text-slate-300">
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
          <Card className="glass-card border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Sales</p>
                  <p className="text-3xl font-bold text-white">
                    ${totalSales.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Purchases</p>
                  <p className="text-3xl font-bold text-white">
                    ${totalPurchases.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Net Profit</p>
                  <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${totalProfit.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Avg Price</p>
                  <p className="text-3xl font-bold text-white">
                    ${avgPrice.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-400" />
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by vehicle, VIN, or buyer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
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
            <CardTitle className="text-white">Sold Vehicles ({filteredVehicles.length})</CardTitle>
            <CardDescription className="text-slate-400">
              Manage sold vehicles and track financial performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50">
                  <TableHead className="text-slate-300">Vehicle</TableHead>
                  <TableHead className="text-slate-300">Purchase Date</TableHead>
                  <TableHead className="text-slate-300">Sale Date</TableHead>
                  <TableHead className="text-slate-300">Bought Price</TableHead>
                  <TableHead className="text-slate-300">Sold Price</TableHead>
                  <TableHead className="text-slate-300">Net Profit</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Payment</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{vehicle.vehicle}</div>
                        <div className="text-sm text-slate-400">VIN: {vehicle.vin}</div>
                        <div className="text-sm text-slate-400">Buyer: {vehicle.buyerName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(vehicle.purchaseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(vehicle.saleDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={vehicle.boughtPrice}
                        onChange={(e) => handlePriceChange(vehicle.id, 'boughtPrice', e.target.value)}
                        className="w-24 bg-slate-800 border-slate-600 text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={vehicle.soldPrice}
                        onChange={(e) => handlePriceChange(vehicle.id, 'soldPrice', e.target.value)}
                        className="w-24 bg-slate-800 border-slate-600 text-white"
                      />
                    </TableCell>
                    <TableCell className={`font-bold ${vehicle.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                          className="border-slate-600 text-slate-300"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-600">
                            <DropdownMenuItem
                              onClick={() => handleMoveToARB(vehicle.id)}
                              className="text-slate-300 hover:bg-slate-700"
                            >
                              Move to ARB
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMoveToWithdrew(vehicle.id)}
                              className="text-slate-300 hover:bg-slate-700"
                            >
                              Mark as Withdrew
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}