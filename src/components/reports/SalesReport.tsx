'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';

interface SalesData {
  week: string;
  vehicleCount: number;
  totalSales: number;
  avgSalePrice: number;
  totalProfit: number;
  vehicles: any[];
}

export function SalesReport() {
  const [data, setData] = useState<SalesData[]>([]);
  const [filteredData, setFilteredData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    location: '',
    buyerName: '',
    make: '',
    model: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...data];
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.week.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicles.some(v => 
          `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', format(filters.dateFrom, 'yyyy-MM-dd'));
      if (filters.dateTo) params.append('dateTo', format(filters.dateTo, 'yyyy-MM-dd'));
      if (filters.location) params.append('location', filters.location);
      if (filters.buyerName) params.append('buyerName', filters.buyerName);
      if (filters.make) params.append('make', filters.make);
      if (filters.model) params.append('model', filters.model);

      const response = await fetch(`/api/reports/sales?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load data');
      
      const { data: reportData } = await response.json();
      setData(reportData || []);
      setFilteredData(reportData || []);
    } catch (error) {
      console.error('Error loading sales report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData: any[] = [];
    filteredData.forEach(week => {
      week.vehicles.forEach(vehicle => {
        exportData.push({
          'Week': week.week,
          'Year': vehicle.year,
          'Make': vehicle.make,
          'Model': vehicle.model,
          'Sale Date': vehicle.saleDate,
          'Sale Price': vehicle.salePrice,
          'Profit': vehicle.profit,
          'Location': vehicle.location,
          'Buyer': vehicle.buyer,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Report exported successfully');
  };

  const totalVehicles = filteredData.reduce((sum, item) => sum + item.vehicleCount, 0);
  const totalSales = filteredData.reduce((sum, item) => sum + item.totalSales, 0);
  const totalProfit = filteredData.reduce((sum, item) => sum + item.totalProfit, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Vehicles Sold</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {totalVehicles}
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
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Profit</p>
                <p className="text-3xl font-bold" style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
                  ${totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ color: 'var(--accent)' }}>Sales Report</CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Weekly sales breakdown with filters
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={loadData}
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Apply Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--subtext)' }} />
              <Input
                placeholder="Search by week or vehicle..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Date From'}
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
                    {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Date To'}
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
              <Input
                placeholder="Buyer Name"
                value={filters.buyerName}
                onChange={(e) => setFilters({ ...filters, buyerName: e.target.value })}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              />
            </div>
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
                    <TableHead style={{ color: 'var(--text)' }}>Week</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Vehicles Sold</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Total Sales</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Avg Sale Price</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Total Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.week} style={{ borderColor: 'var(--border)' }}>
                      <TableCell style={{ color: 'var(--text)' }}>{item.week}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.vehicleCount}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>${item.totalSales.toLocaleString()}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>${item.avgSalePrice.toLocaleString()}</TableCell>
                      <TableCell style={{ 
                        color: item.totalProfit >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        ${item.totalProfit.toLocaleString()}
                      </TableCell>
                    </TableRow>
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

