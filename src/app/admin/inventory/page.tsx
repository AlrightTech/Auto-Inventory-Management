'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehicleTable } from '@/components/inventory/VehicleTable';
import { Plus, Car, AlertTriangle, MapPin, Search, Filter, RotateCcw, Download, FileText, CalendarIcon } from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as XLSX from 'xlsx';

function InventoryPageContent() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [vehicles, setVehicles] = useState<VehicleWithRelations[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState<Date | null>(null);
  const [exportDateTo, setExportDateTo] = useState<Date | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { hasPermission } = usePermissions();
  
  const canAdd = hasPermission('inventory.add');

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

  // Export to CSV with date range and filters
  const handleExportCSV = (filteredVehicles?: VehicleWithRelations[], dateFrom?: Date | null, dateTo?: Date | null) => {
    const vehiclesToExport = filteredVehicles || vehicles;
    
    if (vehiclesToExport.length === 0) {
      toast.error('No vehicles to export');
      return;
    }

    // Apply date range filter if provided
    let vehiclesToExportFiltered = vehiclesToExport;
    if (dateFrom || dateTo) {
      vehiclesToExportFiltered = vehiclesToExport.filter(vehicle => {
        if (!vehicle.sale_date) return false;
        const vehicleDate = new Date(vehicle.sale_date);
        if (dateFrom && vehicleDate < dateFrom) return false;
        if (dateTo && vehicleDate > dateTo) return false;
        return true;
      });
    }

    if (vehiclesToExportFiltered.length === 0) {
      toast.error('No vehicles match the selected date range');
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
        ...vehiclesToExportFiltered.map(vehicle => [
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
      const dateRange = dateFrom || dateTo 
        ? `-${dateFrom ? format(dateFrom, 'yyyy-MM-dd') : 'all'}-${dateTo ? format(dateTo, 'yyyy-MM-dd') : 'all'}`
        : '';
      link.download = `inventory${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${vehiclesToExportFiltered.length} vehicles to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Export to PDF with date range and filters
  const handleExportPDF = (filteredVehicles?: VehicleWithRelations[], dateFrom?: Date | null, dateTo?: Date | null) => {
    const vehiclesToExport = filteredVehicles || vehicles;
    
    if (vehiclesToExport.length === 0) {
      toast.error('No vehicles to export');
      return;
    }

    // Apply date range filter if provided
    let vehiclesToExportFiltered = vehiclesToExport;
    if (dateFrom || dateTo) {
      vehiclesToExportFiltered = vehiclesToExport.filter(vehicle => {
        if (!vehicle.sale_date) return false;
        const vehicleDate = new Date(vehicle.sale_date);
        if (dateFrom && vehicleDate < dateFrom) return false;
        if (dateTo && vehicleDate > dateTo) return false;
        return true;
      });
    }

    if (vehiclesToExportFiltered.length === 0) {
      toast.error('No vehicles match the selected date range');
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
        ...vehiclesToExportFiltered.map(vehicle => [
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
      const dateRange = dateFrom || dateTo 
        ? `-${dateFrom ? format(dateFrom, 'yyyy-MM-dd') : 'all'}-${dateTo ? format(dateTo, 'yyyy-MM-dd') : 'all'}`
        : '';
      XLSX.writeFile(wb, `inventory${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(`Exported ${vehiclesToExportFiltered.length} vehicles. Open the Excel file and use "Save As PDF" to create a PDF.`);
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
          onClick={() => router.push('/admin/inventory/add')}
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
        <Card className="dashboard-card neon-glow instrument-cluster">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--subtext)' }} />
                  <Input
                    placeholder="Search by make, model, or VIN..."
                    className="pl-9"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text)',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 px-4"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 px-4"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                  }}
                  onClick={() => {
                    setShowFilters(false);
                    setExportDateFrom(null);
                    setExportDateTo(null);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Popover open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 px-4"
                      style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
                      }}
                      disabled={vehicles.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px' }}>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Date Range (Optional)</label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {exportDateFrom ? format(exportDateFrom, 'MM/dd/yyyy') : 'From'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                              <Calendar
                                mode="single"
                                selected={exportDateFrom || undefined}
                                onSelect={(date) => setExportDateFrom(date || null)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {exportDateTo ? format(exportDateTo, 'MM/dd/yyyy') : 'To'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                              <Calendar
                                mode="single"
                                selected={exportDateTo || undefined}
                                onSelect={(date) => setExportDateTo(date || null)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            handleExportCSV(undefined, exportDateFrom, exportDateTo);
                            setShowExportDialog(false);
                          }}
                          style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px' }}
                        >
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setExportDateFrom(null);
                            setExportDateTo(null);
                            setShowExportDialog(false);
                          }}
                          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '8px' }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 px-4"
                      style={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text)',
                        borderRadius: '8px'
                      }}
                      disabled={vehicles.length === 0}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px' }}>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Date Range (Optional)</label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {exportDateFrom ? format(exportDateFrom, 'MM/dd/yyyy') : 'From'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                              <Calendar
                                mode="single"
                                selected={exportDateFrom || undefined}
                                onSelect={(date) => setExportDateFrom(date || null)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {exportDateTo ? format(exportDateTo, 'MM/dd/yyyy') : 'To'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                              <Calendar
                                mode="single"
                                selected={exportDateTo || undefined}
                                onSelect={(date) => setExportDateTo(date || null)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            handleExportPDF(undefined, exportDateFrom, exportDateTo);
                          }}
                          style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px' }}
                        >
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setExportDateFrom(null);
                            setExportDateTo(null);
                          }}
                          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '8px' }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
        className="mt-6"
      >
        <VehicleTable 
          onVehicleAdded={() => setRefreshTrigger(prev => prev + 1)} 
          refreshTrigger={refreshTrigger}
          showFilters={showFilters}
          onExportCSV={(filteredVehicles) => handleExportCSV(filteredVehicles, exportDateFrom, exportDateTo)}
          onExportPDF={(filteredVehicles) => handleExportPDF(filteredVehicles, exportDateFrom, exportDateTo)}
        />
      </motion.div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ProtectedRoute requiredPermission="inventory.view">
      <InventoryPageContent />
    </ProtectedRoute>
  );
}
