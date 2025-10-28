'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  RotateCcw
} from 'lucide-react';

// Mock data for demonstration
const mockVehicles = [
  {
    id: 1,
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    vin: '1HGCV1F30MA123456',
    status: 'Active',
    askingPrice: 18500,
    location: 'Los Angeles, CA',
    titleStatus: 'Present',
    daysListed: 15,
    image: '/api/placeholder/100/75',
  },
  {
    id: 2,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1FA6P8TH5L5123456',
    status: 'Pending',
    askingPrice: 22000,
    location: 'San Francisco, CA',
    titleStatus: 'Absent',
    daysListed: 8,
    image: '/api/placeholder/100/75',
  },
  {
    id: 3,
    make: 'Ford',
    model: 'F-150',
    year: 2019,
    vin: '1FTFW1ET5DFC12345',
    status: 'Sold',
    askingPrice: 35000,
    location: 'Austin, TX',
    titleStatus: 'Present',
    daysListed: 22,
    image: '/api/placeholder/100/75',
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-400 bg-green-900/20';
    case 'pending':
      return 'text-yellow-400 bg-yellow-900/20';
    case 'sold':
      return 'text-blue-400 bg-blue-900/20';
    default:
      return 'text-slate-400 bg-slate-900/20';
  }
};

export default function SellerInventoryPage() {
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
            My Inventory
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your vehicle listings and track performance
          </p>
        </div>
        <Button className="gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Total Vehicles</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Active Listings</p>
                  <p className="text-2xl font-bold text-white">18</p>
                </div>
                <Package className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Sold This Month</p>
                  <p className="text-2xl font-bold text-white">6</p>
                </div>
                <Package className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Avg. Days Listed</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <Package className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Filters & Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Search, filter, and manage your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by make, model, VIN, or location..."
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vehicle Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Vehicle Inventory</CardTitle>
            <CardDescription className="text-slate-400">
              Showing {mockVehicles.length} vehicles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Asking Price</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Title Status</th>
                    <th className="py-3 px-4">Days Listed</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockVehicles.map((vehicle) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-slate-400">
                              VIN: {vehicle.vin}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        ${vehicle.askingPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {vehicle.location}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.titleStatus === 'Present' 
                            ? 'text-green-400 bg-green-900/20' 
                            : 'text-red-400 bg-red-900/20'
                        }`}>
                          {vehicle.titleStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {vehicle.daysListed} days
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
