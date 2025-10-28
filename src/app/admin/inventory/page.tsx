'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddVehicleModal } from '@/components/inventory/AddVehicleModal';
import { ImportModal } from '@/components/inventory/ImportModal';
import { VehicleTable } from '@/components/inventory/VehicleTable';
import { Plus, Car, AlertTriangle, MapPin, Search, Filter, RotateCcw, Upload, Download, FileText } from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { textStyles } from '@/lib/typography';

export default function InventoryPage() {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [vehicles, setVehicles] = useState<VehicleWithRelations[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load vehicles for stats
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoadingStats(true);
        const response = await fetch('/api/vehicles');
        
        if (response.ok) {
          const { data } = await response.json();
          setVehicles(data || []);
        }
      } catch (error) {
        console.error('Error loading vehicles for stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadVehicles();
  }, [refreshTrigger]);

  // Calculate stats
  const stats = {
    totalVehicles: vehicles.length,
    missingTitles: vehicles.filter(v => v.title_status === 'Absent').length,
    missingCars: vehicles.filter(v => !v.vehicle_location && !v.pickup_location_city).length,
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
          <h1 className={textStyles.h1}>
            Inventory Management
          </h1>
          <p className={textStyles.subtitle}>
            Manage your vehicle inventory with comprehensive tracking and analytics.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddVehicleModalOpen(true)}
          className="gradient-primary hover:opacity-90 glow-border"
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
          <Card className="card-enhanced hover:shadow-blue-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Vehicles</p>
                  <p className="text-3xl font-bold text-black dark:text-white">
                    {isLoadingStats ? '...' : stats.totalVehicles}
                  </p>
                </div>
                <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-enhanced hover:shadow-red-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Missing Titles</p>
                  <p className="text-3xl font-bold text-black dark:text-white">
                    {isLoadingStats ? '...' : stats.missingTitles}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-enhanced hover:shadow-amber-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Missing Cars</p>
                  <p className="text-3xl font-bold text-black dark:text-white">
                    {isLoadingStats ? '...' : stats.missingCars}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-amber-500 dark:text-amber-400" />
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    placeholder="Search by make, model, or VIN..."
                    className="pl-9 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  onClick={() => setIsImportModalOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV/PDF
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
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
        <VehicleTable 
          onVehicleAdded={() => setRefreshTrigger(prev => prev + 1)} 
          refreshTrigger={refreshTrigger}
        />
      </motion.div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal 
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onVehicleAdded={() => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </div>
  );
}
