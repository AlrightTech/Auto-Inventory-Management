'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddVehicleModal } from '@/components/inventory/AddVehicleModal';
import { VehicleTable } from '@/components/inventory/VehicleTable';
import { Plus, Car, AlertTriangle, MapPin } from 'lucide-react';

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

      {/* Vehicle Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
