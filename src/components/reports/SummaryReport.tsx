'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface SummaryData {
  period: string;
  vehicleCount: number;
  grossSales: number;
  totalExpenses: number;
  netProfit: number;
  vehicles: any[];
}

export function SummaryReport() {
  const [data, setData] = useState<SummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, [period, dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('period', period);
      if (dateFrom) params.append('dateFrom', format(dateFrom, 'yyyy-MM-dd'));
      if (dateTo) params.append('dateTo', format(dateTo, 'yyyy-MM-dd'));

      const response = await fetch(`/api/reports/summary?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load data');
      
      const { data: reportData } = await response.json();
      setData(reportData || []);
    } catch (error) {
      console.error('Error loading summary report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = data.map(item => ({
      'Period': item.period,
      'Vehicles Sold': item.vehicleCount,
      'Gross Sales': item.grossSales,
      'Total Expenses': item.totalExpenses,
      'Net Profit': item.netProfit,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, period === 'weekly' ? 'Weekly Summary' : 'Monthly Summary');
    XLSX.writeFile(wb, `${period}-summary-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Report exported successfully');
  };

  const chartData = data.map(item => ({
    period: item.period,
    profit: item.netProfit,
    sales: item.grossSales,
    expenses: item.totalExpenses,
  }));

  const totalVehicles = data.reduce((sum, item) => sum + item.vehicleCount, 0);
  const totalSales = data.reduce((sum, item) => sum + item.grossSales, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.totalExpenses, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.netProfit, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Vehicles</p>
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
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Gross Sales</p>
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
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Expenses</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  ${totalExpenses.toLocaleString()}
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

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ color: 'var(--accent)' }}>
                {period === 'weekly' ? 'Weekly' : 'Monthly'} Summary Report
              </CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Profit/Loss summary by {period === 'weekly' ? 'week' : 'month'}
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
            <Select value={period} onValueChange={(value: 'weekly' | 'monthly') => setPeriod(value)}>
              <SelectTrigger className="w-40" style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}>
                <SelectItem value="weekly" style={{ color: 'var(--text)' }}>Weekly</SelectItem>
                <SelectItem value="monthly" style={{ color: 'var(--text)' }}>Monthly</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="period" 
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
                  <Bar dataKey="profit" fill="#10b981" name="Net Profit" />
                  <Bar dataKey="sales" fill="#3b82f6" name="Gross Sales" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Total Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

