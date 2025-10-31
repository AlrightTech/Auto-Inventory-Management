'use client';

import { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';

// Mock ARB data
const mockARBVehicles = [
  {
    id: '1',
    vehicle: '2021 Chevrolet Silverado',
    vin: '1GCHK29U4XZ123456',
    soldDate: '2024-10-15',
    soldPrice: 32000,
    buyerName: 'John Smith',
    arbDate: '2024-10-20',
    outcome: 'pending',
    adjustmentAmount: null,
    buyerHistory: true
  },
  {
    id: '2',
    vehicle: '2020 Ford F-150',
    vin: '1FTFW1ET5DFC12345',
    soldDate: '2024-10-14',
    soldPrice: 35000,
    buyerName: 'Sarah Johnson',
    arbDate: '2024-10-19',
    outcome: 'buyer_withdrew',
    adjustmentAmount: null,
    buyerHistory: false
  },
  {
    id: '3',
    vehicle: '2019 Honda Civic',
    vin: '2HGFC2F59KH123456',
    soldDate: '2024-10-13',
    soldPrice: 22000,
    buyerName: 'Mike Wilson',
    arbDate: '2024-10-18',
    outcome: 'buyer_bought',
    adjustmentAmount: 1500,
    buyerHistory: true
  },
];

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case 'buyer_withdrew':
      return 'bg-green-500/20 text-green-400 border-green-500';
    case 'buyer_bought':
      return 'bg-blue-500/20 text-blue-400 border-blue-500';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500';
  }
};

export default function ARBPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState(mockARBVehicles);
  const [showBuyerHistory, setShowBuyerHistory] = useState(false);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOutcomeChange = (vehicleId: string, outcome: string) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, outcome, adjustmentAmount: outcome === 'buyer_bought' ? 0 : null }
        : vehicle
    ));
  };

  const handleAdjustmentAmountChange = (vehicleId: string, amount: string) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, adjustmentAmount: parseFloat(amount) || 0 }
        : vehicle
    ));
  };

  const handleMoveToInventory = (vehicleId: string) => {
    // In a real implementation, this would move the vehicle back to inventory
    console.log('Moving vehicle to inventory:', vehicleId);
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
  };

  const handleMoveToSold = (vehicleId: string) => {
    // In a real implementation, this would move the vehicle back to sold
    console.log('Moving vehicle to sold:', vehicleId);
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
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
            ARB Management
          </h1>
          <p className="text-slate-400 mt-1">
            Handle ARB (Arbitration) cases and buyer disputes with comprehensive tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300">
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
          <Card className="glass-card border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total ARB Cases</p>
                  <p className="text-3xl font-bold text-white">{vehicles.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
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
                  <p className="text-sm font-medium text-slate-300">Pending</p>
                  <p className="text-3xl font-bold text-white">
                    {vehicles.filter(v => v.outcome === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
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
                  <p className="text-sm font-medium text-slate-300">Buyer Withdrew</p>
                  <p className="text-3xl font-bold text-white">
                    {vehicles.filter(v => v.outcome === 'buyer_withdrew').length}
                  </p>
                </div>
                <ArrowLeft className="h-8 w-8 text-green-400" />
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
                  <p className="text-sm font-medium text-slate-300">Buyer Bought</p>
                  <p className="text-3xl font-bold text-white">
                    {vehicles.filter(v => v.outcome === 'buyer_bought').length}
                  </p>
                </div>
                <ArrowRight className="h-8 w-8 text-blue-400" />
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

      {/* ARB Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">ARB Cases ({filteredVehicles.length})</CardTitle>
            <CardDescription className="text-slate-400">
              Manage ARB outcomes and track buyer disputes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50">
                  <TableHead className="text-slate-300">Vehicle</TableHead>
                  <TableHead className="text-slate-300">Buyer</TableHead>
                  <TableHead className="text-slate-300">Sold Date</TableHead>
                  <TableHead className="text-slate-300">Sold Price</TableHead>
                  <TableHead className="text-slate-300">ARB Date</TableHead>
                  <TableHead className="text-slate-300">Outcome</TableHead>
                  <TableHead className="text-slate-300">Adjustment</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <TableRow
                    key={vehicle.id}
                    className="border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{vehicle.vehicle}</div>
                        <div className="text-sm text-slate-400">VIN: {vehicle.vin}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{vehicle.buyerName}</TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(vehicle.soldDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      ${vehicle.soldPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(vehicle.arbDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge 
                          variant="outline" 
                          className={`${getOutcomeColor(vehicle.outcome)} flex items-center gap-1 w-fit`}
                        >
                          {vehicle.outcome.replace('_', ' ')}
                        </Badge>
                        {vehicle.outcome === 'pending' && (
                          <select
                            value={vehicle.outcome}
                            onChange={(e) => handleOutcomeChange(vehicle.id, e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                          >
                            <option value="pending">Select Outcome</option>
                            <option value="buyer_withdrew">Buyer Withdrew</option>
                            <option value="buyer_bought">Buyer Bought</option>
                          </select>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.outcome === 'buyer_bought' ? (
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={vehicle.adjustmentAmount || ''}
                          onChange={(e) => handleAdjustmentAmountChange(vehicle.id, e.target.value)}
                          className="w-24 bg-slate-800 border-slate-600 text-white"
                        />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {vehicle.buyerHistory && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBuyerHistory(true)}
                            className="border-slate-600 text-slate-300"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
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
                            {vehicle.outcome === 'buyer_withdrew' && (
                              <DropdownMenuItem
                                onClick={() => handleMoveToInventory(vehicle.id)}
                                style={{ color: 'var(--text)' }}
                              >
                                Move to Inventory
                              </DropdownMenuItem>
                            )}
                            {vehicle.outcome === 'buyer_bought' && (
                              <DropdownMenuItem
                                onClick={() => handleMoveToSold(vehicle.id)}
                                style={{ color: 'var(--text)' }}
                              >
                                Move to Sold
                              </DropdownMenuItem>
                            )}
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}