'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Download, 
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ProfitPerCarData {
  stockNumber: string;
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  purchasePrice: number;
  buyFee: number;
  otherCharges: number;
  salePrice: number;
  totalExpenses: number;
  inventoryArbAdjustments: number;
  netProfit: number;
  saleDate: string;
  location: string;
  status: string;
  expenses: Array<{ description: string; cost: number; date: string }>;
  arbActions: Array<{ type: string; outcome: string; adjustmentAmount: number | null; transportCost: number | null; date: string }>;
}

export function ProfitPerCarReport() {
  const [data, setData] = useState<ProfitPerCarData[]>([]);
  const [filteredData, setFilteredData] = useState<ProfitPerCarData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    location: '',
    status: '',
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.make) params.append('make', filters.make);
      if (filters.model) params.append('model', filters.model);
      if (filters.location) params.append('location', filters.location);
      if (filters.dateFrom) params.append('dateFrom', format(filters.dateFrom, 'yyyy-MM-dd'));
      if (filters.dateTo) params.append('dateTo', format(filters.dateTo, 'yyyy-MM-dd'));

      const response = await fetch(`/api/reports/profit-per-car?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load data');
      
      const { data: reportData } = await response.json();
      setData(reportData || []);
      setFilteredData(reportData || []);
    } catch (error) {
      console.error('Error loading profit per car report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        `${item.year} ${item.make} ${item.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stockNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleExportCSV = () => {
    const exportData = filteredData.map(item => ({
      'Stock Number': item.stockNumber,
      'Year': item.year,
      'Make': item.make,
      'Model': item.model,
      'VIN': item.vin,
      'Purchase Price': item.purchasePrice,
      'Buy Fee': item.buyFee,
      'Other Charges': item.otherCharges,
      'Total Expenses': item.totalExpenses,
      'Inventory ARB Adjustments': item.inventoryArbAdjustments,
      'Sale Price': item.salePrice,
      'Net Profit': item.netProfit,
      'Sale Date': item.saleDate,
      'Location': item.location,
      'Status': item.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profit Per Car');
    XLSX.writeFile(wb, `profit-per-car-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Report exported successfully');
  };

  const toggleRowExpansion = (vehicleId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
    }
    setExpandedRows(newExpanded);
  };

  const totalProfit = filteredData.reduce((sum, item) => sum + item.netProfit, 0);
  const totalSales = filteredData.reduce((sum, item) => sum + item.salePrice, 0);
  const totalExpenses = filteredData.reduce((sum, item) => sum + item.totalExpenses, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Vehicles</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {filteredData.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Sales</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  ${totalSales.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Net Profit</p>
                <p className="text-3xl font-bold" style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
                  ${totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ color: 'var(--accent)' }}>Profit Per Car Report</CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Detailed profit analysis for each sold vehicle
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--subtext)' }} />
              <Input
                placeholder="Search by vehicle, VIN, or stock number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <div>
                  <Label style={{ color: 'var(--text)' }}>Make</Label>
                  <Input
                    value={filters.make}
                    onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                    placeholder="Filter by make"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                <div>
                  <Label style={{ color: 'var(--text)' }}>Model</Label>
                  <Input
                    value={filters.model}
                    onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                    placeholder="Filter by model"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                <div>
                  <Label style={{ color: 'var(--text)' }}>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)'
                        }}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)'
                    }}>
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom || undefined}
                        onSelect={(date) => setFilters({ ...filters, dateFrom: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label style={{ color: 'var(--text)' }}>Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)'
                        }}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)'
                    }}>
                      <Calendar
                        mode="single"
                        selected={filters.dateTo || undefined}
                        onSelect={(date) => setFilters({ ...filters, dateTo: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="col-span-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        make: '',
                        model: '',
                        dateFrom: null,
                        dateTo: null,
                        location: '',
                        status: '',
                      });
                      loadData();
                    }}
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={loadData}
                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card className="glass-card">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
              <span className="ml-2" style={{ color: 'var(--subtext)' }}>Loading report...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: 'var(--border)' }}>
                    <TableHead style={{ color: 'var(--text)' }}></TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Stock #</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Purchase Price</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Sale Price</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Total Expenses</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>ARB Adjustments</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Net Profit</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <>
                      <TableRow
                        key={item.vehicleId}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/30"
                        onClick={() => toggleRowExpansion(item.vehicleId)}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <TableCell>
                          {expandedRows.has(item.vehicleId) ? (
                            <ChevronUp className="w-4 h-4" style={{ color: 'var(--text)' }} />
                          ) : (
                            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text)' }} />
                          )}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>{item.stockNumber}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          {item.year} {item.make} {item.model}
                          {item.trim && ` (${item.trim})`}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>${item.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>${item.salePrice.toLocaleString()}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>${item.totalExpenses.toLocaleString()}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          {item.inventoryArbAdjustments > 0 ? `-$${item.inventoryArbAdjustments.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell style={{ 
                          color: item.netProfit >= 0 ? '#10b981' : '#ef4444',
                          fontWeight: 'bold'
                        }}>
                          ${item.netProfit.toLocaleString()}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>{item.status}</TableCell>
                      </TableRow>
                      {expandedRows.has(item.vehicleId) && (
                        <TableRow style={{ borderColor: 'var(--border)' }}>
                          <TableCell colSpan={9} className="bg-slate-50 dark:bg-slate-900/50">
                            <div className="p-4 space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Expenses</h4>
                                <div className="space-y-1">
                                  {item.expenses.length > 0 ? (
                                    item.expenses.map((exp, idx) => (
                                      <div key={idx} className="text-sm" style={{ color: 'var(--subtext)' }}>
                                        {exp.description}: ${exp.cost.toLocaleString()} ({exp.date})
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm" style={{ color: 'var(--subtext)' }}>No expenses recorded</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>ARB Actions</h4>
                                <div className="space-y-1">
                                  {item.arbActions.length > 0 ? (
                                    item.arbActions.map((arb, idx) => (
                                      <div key={idx} className="text-sm" style={{ color: 'var(--subtext)' }}>
                                        {arb.type} - {arb.outcome}
                                        {arb.adjustmentAmount && `: $${arb.adjustmentAmount.toLocaleString()}`}
                                        {arb.transportCost && ` (Transport: $${arb.transportCost.toLocaleString()})`}
                                        {' - '}{new Date(arb.date).toLocaleDateString()}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm" style={{ color: 'var(--subtext)' }}>No ARB actions</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

