'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddVehicleModal } from '@/components/inventory/AddVehicleModal';
import { VehicleTable } from '@/components/inventory/VehicleTable';
import { Plus, Car, AlertTriangle, MapPin, Search, Filter, RotateCcw, Upload, Download, FileText } from 'lucide-react';

export default function InventoryPage() {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

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
            Inventory Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your vehicle inventory with comprehensive tracking and analytics.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddVehicleModalOpen(true)}
          className="gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </motion.div>

      {/* Inventory Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-slate-700/50 hover:shadow-blue-500/30 transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Vehicles</p>
                  <p className="text-3xl font-bold text-white">3</p>
                </div>
                <Car className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-slate-700/50 hover:shadow-red-500/30 transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Missing Titles</p>
                  <p className="text-3xl font-bold text-white">1</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-slate-700/50 hover:shadow-yellow-500/30 transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Missing Cars</p>
                  <p className="text-3xl font-bold text-white">1</p>
                </div>
                <MapPin className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by make, model, or VIN..."
                    className="pl-9 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
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
        transition={{ delay: 0.5 }}
      >
        <VehicleTable />
      </motion.div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal 
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
      />
    </div>
  );
}
