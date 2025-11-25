'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Loader2 } from 'lucide-react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface ArbitrationData {
  month: string;
  totalArbs: number;
  denied: number;
  withdrawn: {
    count: number;
    avgTransportCost: number;
  };
  priceAdjusted: {
    count: number;
    avgPercent: number;
    avgAmount: number;
  };
}

export function ArbitrationReport() {
  const [data, setData] = useState<ArbitrationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', format(dateFrom, 'yyyy-MM-dd'));
      if (dateTo) params.append('dateTo', format(dateTo, 'yyyy-MM-dd'));

      const response = await fetch(`/api/reports/arbitration?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load data');
      
      const { data: reportData } = await response.json();
      setData(reportData || []);
    } catch (error) {
      console.error('Error loading arbitration report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = data.map(item => ({
      'Month': item.month,
      'Total ARBs': item.totalArbs,
      'Denied': item.denied,
      'Withdrawn Count': item.withdrawn.count,
      'Avg Transport Cost': item.withdrawn.avgTransportCost,
      'Price Adjusted Count': item.priceAdjusted.count,
      'Avg Adjustment %': item.priceAdjusted.avgPercent,
      'Avg Adjustment Amount': item.priceAdjusted.avgAmount,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Arbitration Report');
    XLSX.writeFile(wb, `arbitration-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Report exported successfully');
  };

  const chartData = data.map(item => ({
    month: item.month,
    total: item.totalArbs,
    denied: item.denied,
    withdrawn: item.withdrawn.count,
    priceAdjusted: item.priceAdjusted.count,
  }));

  const totalArbs = data.reduce((sum, item) => sum + item.totalArbs, 0);
  const totalDenied = data.reduce((sum, item) => sum + item.denied, 0);
  const totalWithdrawn = data.reduce((sum, item) => sum + item.withdrawn.count, 0);
  const totalPriceAdjusted = data.reduce((sum, item) => sum + item.priceAdjusted.count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total ARBs</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {totalArbs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Denied</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {totalDenied}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Withdrawn</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {totalWithdrawn}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Price Adjusted</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {totalPriceAdjusted}
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
              <CardTitle style={{ color: 'var(--accent)' }}>Arbitration Report (Sold ARBs)</CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Monthly breakdown of Sold ARB cases and outcomes
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-48 justify-start text-left font-normal"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'PPP') : 'Date From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border)'
              }}>
                <Calendar
                  mode="single"
                  selected={dateFrom || undefined}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-48 justify-start text-left font-normal"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'PPP') : 'Date To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border)'
              }}>
                <Calendar
                  mode="single"
                  selected={dateTo || undefined}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Chart */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
              <span className="ml-2" style={{ color: 'var(--subtext)' }}>Loading chart...</span>
            </div>
          ) : chartData.length > 0 ? (
            <>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="var(--text)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="var(--text)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#f59e0b" name="Total ARBs" />
                    <Line type="monotone" dataKey="denied" stroke="#6b7280" name="Denied" />
                    <Line type="monotone" dataKey="withdrawn" stroke="#10b981" name="Withdrawn" />
                    <Line type="monotone" dataKey="priceAdjusted" stroke="#3b82f6" name="Price Adjusted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--border)' }}>
                      <TableHead style={{ color: 'var(--text)' }}>Month</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Total ARBs</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Denied</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Withdrawn</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Avg Transport Cost</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Price Adjusted</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Avg % Adjustment</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Avg $ Adjustment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.month} style={{ borderColor: 'var(--border)' }}>
                        <TableCell style={{ color: 'var(--text)' }}>{item.month}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>{item.totalArbs}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>{item.denied}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>{item.withdrawn.count}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          {item.withdrawn.avgTransportCost > 0 
                            ? `$${item.withdrawn.avgTransportCost.toLocaleString()}` 
                            : '-'}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>{item.priceAdjusted.count}</TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          {item.priceAdjusted.avgPercent > 0 
                            ? `${item.priceAdjusted.avgPercent.toFixed(2)}%` 
                            : '-'}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          {item.priceAdjusted.avgAmount > 0 
                            ? `$${item.priceAdjusted.avgAmount.toLocaleString()}` 
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

