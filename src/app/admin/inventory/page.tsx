'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddVehicleModal } from '@/components/inventory/AddVehicleModal';
import { VehicleTable } from '@/components/inventory/VehicleTable';
import { Plus, Car, AlertTriangle, MapPin, Search, Filter, RotateCcw, Download, FileText } from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function InventoryPage() {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [vehicles, setVehicles] = useState<VehicleWithRelations[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Helper function to escape CSV values
  const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (vehicles.length === 0) {
      toast.error('No vehicles to export');
      return;
    }

    try {
      const headers = [
        'VIN', 'Year', 'Make', 'Model', 'Trim', 'Exterior Color', 'Interior Color',
        'Status', 'Odometer', 'Title Status', 'PSI Status', 'Dealshield Arbitration Status',
        'Bought Price', 'Buy Fee', 'Sale Invoice', 'Other Charges', 'Total Vehicle Cost',
        'Sale Date', 'Lane', 'Run', 'Channel', 'Facilitating Location', 'Vehicle Location',
        'Pickup Location Address1', 'Pickup Location City', 'Pickup Location State',
        'Pickup Location Zip', 'Pickup Location Phone', 'Seller Name', 'Buyer Dealership',
        'Buyer Contact Name', 'Buyer AA ID', 'Sale Invoice Status'
      ];

      const csvRows = [
        headers.map(escapeCsvValue).join(','),
        ...vehicles.map(vehicle => [
          vehicle.vin || '',
          vehicle.year || '',
          vehicle.make || '',
          vehicle.model || '',
          vehicle.trim || '',
          vehicle.exterior_color || '',
          vehicle.interior_color || '',
          vehicle.status || '',
          vehicle.odometer || '',
          vehicle.title_status || '',
          vehicle.psi_status || '',
          vehicle.dealshield_arbitration_status || '',
          vehicle.bought_price || '',
          vehicle.buy_fee || '',
          vehicle.sale_invoice || '',
          vehicle.other_charges || '',
          vehicle.total_vehicle_cost || '',
          vehicle.sale_date || '',
          vehicle.lane || '',
          vehicle.run || '',
          vehicle.channel || '',
          vehicle.facilitating_location || '',
          vehicle.vehicle_location || '',
          vehicle.pickup_location_address1 || '',
          vehicle.pickup_location_city || '',
          vehicle.pickup_location_state || '',
          vehicle.pickup_location_zip || '',
          vehicle.pickup_location_phone || '',
          vehicle.seller_name || '',
          vehicle.buyer_dealership || '',
          vehicle.buyer_contact_name || '',
          vehicle.buyer_aa_id || '',
          vehicle.sale_invoice_status || ''
        ].map(escapeCsvValue).join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${vehicles.length} vehicles to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (vehicles.length === 0) {
      toast.error('No vehicles to export');
      return;
    }

    try {
      // Create a workbook
      const wsData = [
        [
          'VIN', 'Year', 'Make', 'Model', 'Trim', 'Exterior Color', 'Interior Color',
          'Status', 'Odometer', 'Title Status', 'PSI Status', 'Dealshield Arbitration Status',
          'Bought Price', 'Buy Fee', 'Sale Invoice', 'Other Charges', 'Total Vehicle Cost',
          'Sale Date', 'Lane', 'Run', 'Channel', 'Facilitating Location', 'Vehicle Location',
          'Pickup Location Address1', 'Pickup Location City', 'Pickup Location State',
          'Pickup Location Zip', 'Pickup Location Phone', 'Seller Name', 'Buyer Dealership',
          'Buyer Contact Name', 'Buyer AA ID', 'Sale Invoice Status'
        ],
        ...vehicles.map(vehicle => [
          vehicle.vin || '',
          vehicle.year || '',
          vehicle.make || '',
          vehicle.model || '',
          vehicle.trim || '',
          vehicle.exterior_color || '',
          vehicle.interior_color || '',
          vehicle.status || '',
          vehicle.odometer || '',
          vehicle.title_status || '',
          vehicle.psi_status || '',
          vehicle.dealshield_arbitration_status || '',
          vehicle.bought_price || '',
          vehicle.buy_fee || '',
          vehicle.sale_invoice || '',
          vehicle.other_charges || '',
          vehicle.total_vehicle_cost || '',
          vehicle.sale_date || '',
          vehicle.lane || '',
          vehicle.run || '',
          vehicle.channel || '',
          vehicle.facilitating_location || '',
          vehicle.vehicle_location || '',
          vehicle.pickup_location_address1 || '',
          vehicle.pickup_location_city || '',
          vehicle.pickup_location_state || '',
          vehicle.pickup_location_zip || '',
          vehicle.pickup_location_phone || '',
          vehicle.seller_name || '',
          vehicle.buyer_dealership || '',
          vehicle.buyer_contact_name || '',
          vehicle.buyer_aa_id || '',
          vehicle.sale_invoice_status || ''
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

      // Export as PDF (XLSX can be opened in Excel and saved as PDF)
      // For true PDF, we'll create an Excel file that can be converted
      XLSX.writeFile(wb, `inventory-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(`Exported ${vehicles.length} vehicles. Open the Excel file and use "Save As PDF" to create a PDF.`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export. Please try exporting as CSV instead.');
    }
  };

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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Inventory Management
          </h1>
          <p style={{ color: 'var(--subtext)' }}>
            Manage your vehicle inventory with comprehensive tracking and analytics.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddVehicleModalOpen(true)}
          className="control-panel neon-glow"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: '25px',
            fontWeight: '500',
            transition: '0.3s'
          }}
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
          <Card className="dashboard-card neon-glow instrument-cluster">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Vehicles</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoadingStats ? '...' : stats.totalVehicles}
                  </p>
                </div>
                <Car className="h-8 w-8" style={{ color: 'var(--accent)' }} />
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
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Missing Titles</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoadingStats ? '...' : stats.missingTitles}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8" style={{ color: '#ef4444' }} />
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
                  <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Missing Cars</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {isLoadingStats ? '...' : stats.missingCars}
                  </p>
                </div>
                <MapPin className="h-8 w-8" style={{ color: '#f59e0b' }} />
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
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-white hover:bg-slate-100 dark:hover:bg-slate-700/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-white hover:bg-slate-100 dark:hover:bg-slate-700/50">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  onClick={handleExportCSV}
                  disabled={vehicles.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  onClick={handleExportPDF}
                  disabled={vehicles.length === 0}
                >
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

    </div>
  );
}
