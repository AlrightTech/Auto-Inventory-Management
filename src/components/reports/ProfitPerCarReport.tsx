'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  FileText,
  ChevronLeft,
  ChevronRight,
  CalendarIcon
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ProfitPerCarData {
  id: string;
  vehicle: string;
  vin: string;
  purchasePrice: number;
  buyFee: number;
  otherCharges: number;
  soldPrice: number;
  totalExpenses: number;
  arbAdjustment: number;
  profit: number;
  saleDate: string | null;
  status: string;
  arbType: string | null;
  arbOutcome: string | null;
}

export function ProfitPerCarReport() {
  const [data, setData] = useState<ProfitPerCarData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchVin, setSearchVin] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '50');
      
      if (searchVin) {
        params.append('vin', searchVin);
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
      }
      if (dateTo) {
        params.append('dateTo', dateTo.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/reports/profit-per-car?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load report data');
      }

      const result = await response.json();
      setData(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading profit per car report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const memoizedLoadData = useCallback(loadData, [page, searchVin, dateFrom, dateTo]);

  useEffect(() => {
    memoizedLoadData();
  }, [memoizedLoadData]);

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Vehicle', 'VIN', 'Purchase Price', 'Buy Fee', 'Other Charges', 'Sold Price', 'Total Expenses', 'ARB Adjustment', 'Profit', 'Sale Date', 'Status'];
      const rows = data.map(item => [
        item.vehicle,
        item.vin,
        item.purchasePrice,
        item.buyFee,
        item.otherCharges,
        item.soldPrice,
        item.totalExpenses,
        item.arbAdjustment,
        item.profit,
        item.saleDate || '',
        item.status,
      ]);

      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Profit Per Car');
      XLSX.writeFile(wb, `profit-per-car-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export report');
    }
  };

  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.totalExpenses, 0);
  const totalARBAdjustments = data.reduce((sum, item) => sum + item.arbAdjustment, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="vin" style={{ color: 'var(--text)' }}>VIN Search</Label>
              <Input
                id="vin"
                placeholder="Search by VIN..."
                value={searchVin}
                onChange={(e) => setSearchVin(e.target.value)}
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--text)' }}>Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'MM/dd/yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <Calendar
                    mode="single"
                    selected={dateFrom || undefined}
                    onSelect={(date) => setDateFrom(date || null)}
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
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'MM/dd/yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <Calendar
                    mode="single"
                    selected={dateTo || undefined}
                    onSelect={(date) => setDateTo(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleExportCSV}
                className="w-full"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>Total Profit</p>
            <p className="text-2xl font-bold" style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
              ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>Total Expenses</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>ARB Adjustments</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              ${totalARBAdjustments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>Vehicles</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {data.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Profit Per Car Report</CardTitle>
          <CardDescription style={{ color: 'var(--subtext)' }}>
            Detailed profit calculation for each vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8">
              <TableSkeleton rows={10} cols={11} />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No data available</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700/50">
                      <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>VIN</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Purchase Price</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Sold Price</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Total Expenses</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>ARB Adjustment</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Profit</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Sale Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id} className="border-slate-200 dark:border-slate-700/50">
                        <TableCell style={{ color: 'var(--text)' }}>{item.vehicle}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>{item.vin}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          ${item.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          ${item.soldPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          ${item.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          {item.arbAdjustment !== 0 ? (
                            <span style={{ color: item.arbAdjustment > 0 ? '#10b981' : '#ef4444' }}>
                              {item.arbAdjustment > 0 ? '+' : ''}${item.arbAdjustment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell style={{ color: item.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                          ${item.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          {item.saleDate ? format(new Date(item.saleDate), 'MM/dd/yyyy') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p style={{ color: 'var(--subtext)' }}>
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1 || isLoading}
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages || isLoading}
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

