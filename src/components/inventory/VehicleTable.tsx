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
  Edit, 
  Download, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

// Mock data for demonstration
const mockVehicles = [
  {
    id: '1',
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2021,
    vin: '1GCHK29U4XZ123456',
    purchaseDate: '2024-10-15',
    status: 'Pending',
    odometer: 45000,
    boughtPrice: 25000,
    titleStatus: 'Absent',
    arbStatus: 'Absent',
    location: 'Auction',
  },
  {
    id: '2',
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    vin: '1FTFW1ET5DFC12345',
    purchaseDate: '2024-10-14',
    status: 'Complete',
    odometer: 52000,
    boughtPrice: 28000,
    titleStatus: 'Present',
    arbStatus: 'Present',
    location: 'Shop/Mechanic',
  },
  {
    id: '3',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    vin: '2HGFC2F59KH123456',
    purchaseDate: '2024-10-13',
    status: 'ARB',
    odometer: 38000,
    boughtPrice: 18000,
    titleStatus: 'In Transit',
    arbStatus: 'Present',
    location: 'Missing',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Complete':
      return 'bg-green-500/20 text-green-400 border-green-500';
    case 'Pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    case 'ARB':
      return 'bg-red-500/20 text-red-400 border-red-500';
    case 'Sold':
      return 'bg-blue-500/20 text-blue-400 border-blue-500';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Complete':
      return <CheckCircle className="w-4 h-4" />;
    case 'Pending':
      return <Clock className="w-4 h-4" />;
    case 'ARB':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export function VehicleTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles] = useState(mockVehicles);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="glass-card border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">Vehicle Inventory</CardTitle>
            <CardDescription className="text-slate-400">
              Showing {filteredVehicles.length} vehicles
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by make, model, or VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
                <TableHead className="text-slate-300 font-medium">Vehicle</TableHead>
                <TableHead className="text-slate-300 font-medium">Purchase Date</TableHead>
                <TableHead className="text-slate-300 font-medium">Status</TableHead>
                <TableHead className="text-slate-300 font-medium">Odometer</TableHead>
                <TableHead className="text-slate-300 font-medium">Location</TableHead>
                <TableHead className="text-slate-300 font-medium">Bought Price</TableHead>
                <TableHead className="text-slate-300 font-medium">Title Status</TableHead>
                <TableHead className="text-slate-300 font-medium">Actions</TableHead>
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
                      <div className="font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-slate-400">
                        VIN: {vehicle.vin}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(vehicle.purchaseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(vehicle.status)} flex items-center gap-1 w-fit`}
                    >
                      {getStatusIcon(vehicle.status)}
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} mi` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {vehicle.location}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {vehicle.boughtPrice ? `$${vehicle.boughtPrice.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <Badge 
                      variant="outline" 
                      className={vehicle.titleStatus === 'Absent' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-green-500/20 text-green-400 border-green-500'}
                    >
                      {vehicle.titleStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-slate-700">
                        <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Vehicle
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Sold
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

