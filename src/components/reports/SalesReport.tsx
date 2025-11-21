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
  CalendarIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface SalesReportData {
  weekKey: string;
  weekRange: string;
  totalCarsSold: number;
  vehicles: any[];
}

export function SalesReport() {
  const [data, setData] = useState<SalesReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (dateFrom) {
        params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
      }
      if (dateTo) {
        params.append('dateTo', dateTo.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/reports/sales?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load report data');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error loading sales report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Week Range', 'Total Cars Sold', 'Vehicle', 'VIN', 'Sale Date', 'Sold Price', 'Status'];
      const rows: any[] = [];
      
      data.forEach(week => {
        week.vehicles.forEach(vehicle => {
          rows.push([
            week.weekRange,
            week.totalCarsSold,
            vehicle.vehicle,
            vehicle.vin,
            vehicle.saleDate,
            vehicle.soldPrice,
            vehicle.status,
          ]);
        });
      });

      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
      XLSX.writeFile(wb, `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export report');
    }
  };

  const toggleWeek = (weekKey: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekKey)) {
      newExpanded.delete(weekKey);
    } else {
      newExpanded.add(weekKey);
    }
    setExpandedWeeks(newExpanded);
  };

  const totalCarsSold = data.reduce((sum, week) => sum + week.totalCarsSold, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <Card className="dashboard-card">
        <CardContent className="p-4">
          <p className="text-sm" style={{ color: 'var(--subtext)' }}>Total Cars Sold (All Weeks)</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {totalCarsSold}
          </p>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Weekly Sales Report</CardTitle>
          <CardDescription style={{ color: 'var(--subtext)' }}>
            Weekly volume trends with vehicle details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8">
              <TableSkeleton rows={10} cols={4} />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((week) => (
                <div key={week.weekKey} className="border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between hover:bg-opacity-50"
                    style={{ backgroundColor: 'var(--card-bg)' }}
                    onClick={() => toggleWeek(week.weekKey)}
                  >
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{week.weekRange}</h3>
                      <p className="text-sm" style={{ color: 'var(--subtext)' }}>
                        {week.totalCarsSold} {week.totalCarsSold === 1 ? 'car' : 'cars'} sold
                      </p>
                    </div>
                    {expandedWeeks.has(week.weekKey) ? (
                      <ChevronUp className="w-5 h-5" style={{ color: 'var(--text)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5" style={{ color: 'var(--text)' }} />
                    )}
                  </div>
                  
                  {expandedWeeks.has(week.weekKey) && (
                    <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-200 dark:border-slate-700/50">
                              <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                              <TableHead style={{ color: 'var(--text)' }}>VIN</TableHead>
                              <TableHead style={{ color: 'var(--text)' }}>Sale Date</TableHead>
                              <TableHead style={{ color: 'var(--text)' }}>Sold Price</TableHead>
                              <TableHead style={{ color: 'var(--text)' }}>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {week.vehicles.map((vehicle) => (
                              <TableRow key={vehicle.id} className="border-slate-200 dark:border-slate-700/50">
                                <TableCell style={{ color: 'var(--text)' }}>{vehicle.vehicle}</TableCell>
                                <TableCell style={{ color: 'var(--text)' }}>{vehicle.vin}</TableCell>
                                <TableCell style={{ color: 'var(--text)' }}>
                                  {vehicle.saleDate ? format(new Date(vehicle.saleDate), 'MM/dd/yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell style={{ color: 'var(--text)' }}>
                                  ${vehicle.soldPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell style={{ color: 'var(--text)' }}>{vehicle.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

