'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Download,
  CalendarIcon
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ProfitSummaryData {
  period: string;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  vehiclesSold: number;
  averageProfit: number;
  vehicles: any[];
}

interface ProfitSummaryReportProps {
  defaultPeriod?: 'weekly' | 'monthly';
}

export function ProfitSummaryReport({ defaultPeriod = 'weekly' }: ProfitSummaryReportProps) {
  const [data, setData] = useState<ProfitSummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>(defaultPeriod);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('period', period);
      
      if (dateFrom) {
        params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
      }
      if (dateTo) {
        params.append('dateTo', dateTo.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/reports/profit-summary?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load report data');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error loading profit summary report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, dateFrom, dateTo]);

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Period', 'Total Profit', 'Total Loss', 'Net Profit', 'Vehicles Sold', 'Average Profit'];
      const rows = data.map(item => [
        item.period,
        item.totalProfit,
        item.totalLoss,
        item.netProfit,
        item.vehiclesSold,
        item.averageProfit,
      ]);

      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, period === 'weekly' ? 'Weekly Summary' : 'Monthly Summary');
      XLSX.writeFile(wb, `profit-summary-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export report');
    }
  };

  const totalNetProfit = data.reduce((sum, item) => sum + item.netProfit, 0);
  const totalVehicles = data.reduce((sum, item) => sum + item.vehiclesSold, 0);

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
              <Label style={{ color: 'var(--text)' }}>Period</Label>
              <Select value={period} onValueChange={(value: 'weekly' | 'monthly') => setPeriod(value)}>
                <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <SelectItem value="weekly" style={{ color: 'var(--text)' }}>Weekly</SelectItem>
                  <SelectItem value="monthly" style={{ color: 'var(--text)' }}>Monthly</SelectItem>
                </SelectContent>
              </Select>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>Total Net Profit</p>
            <p className="text-2xl font-bold" style={{ color: totalNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
              ${totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>Total Vehicles Sold</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {totalVehicles}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--subtext)' }}>Average Profit per Vehicle</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              ${totalVehicles > 0 ? (totalNetProfit / totalVehicles).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>
            {period === 'weekly' ? 'Weekly' : 'Monthly'} Profit/Loss Summary
          </CardTitle>
          <CardDescription style={{ color: 'var(--subtext)' }}>
            Aggregated profit and loss by {period === 'weekly' ? 'week' : 'month'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8">
              <TableSkeleton rows={10} cols={6} />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700/50">
                    <TableHead style={{ color: 'var(--text)' }}>Period</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Total Profit</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Total Loss</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Net Profit</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Vehicles Sold</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Avg Profit/Vehicle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.period} className="border-slate-200 dark:border-slate-700/50">
                      <TableCell style={{ color: 'var(--text)' }}>{item.period}</TableCell>
                      <TableCell style={{ color: '#10b981' }}>
                        ${item.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell style={{ color: '#ef4444' }}>
                        ${item.totalLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell style={{ color: item.netProfit >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        ${item.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.vehiclesSold}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        ${item.averageProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

