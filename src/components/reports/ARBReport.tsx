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
  Loader2,
  CalendarIcon
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ARBReportData {
  month: string;
  totalCount: number;
  outcomeBreakdown: {
    denied: number;
    priceAdjusted: number;
    buyerWithdrew: number;
  };
  withdrawnCases: {
    count: number;
    avgTransportCost: number;
  };
  priceAdjustedCases: {
    count: number;
    avgPercentageAdjusted: number;
    avgAdjustmentAmount: number;
  };
  vehicles: any[];
}

export function ARBReport() {
  const [data, setData] = useState<ARBReportData[]>([]);
  const [overallAverages, setOverallAverages] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [outcome, setOutcome] = useState<string>('');

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
      if (outcome) {
        params.append('outcome', outcome);
      }

      const response = await fetch(`/api/reports/arb?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load report data');
      }

      const result = await response.json();
      setData(result.data || []);
      setOverallAverages(result.overallAverages || null);
    } catch (error) {
      console.error('Error loading ARB report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo, outcome]);

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Month', 'Total ARB Count', 'Denied', 'Price Adjusted', 'Buyer Withdrew', 'Avg Transport Cost', 'Avg % Adjusted', 'Avg Adjustment Amount'];
      const rows = data.map(item => [
        item.month,
        item.totalCount,
        item.outcomeBreakdown.denied,
        item.outcomeBreakdown.priceAdjusted,
        item.outcomeBreakdown.buyerWithdrew,
        item.withdrawnCases.avgTransportCost,
        item.priceAdjustedCases.avgPercentageAdjusted,
        item.priceAdjustedCases.avgAdjustmentAmount,
      ]);

      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ARB Report');
      XLSX.writeFile(wb, `arb-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export report');
    }
  };

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
              <Label style={{ color: 'var(--text)' }}>Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <SelectItem value="" style={{ color: 'var(--text)' }}>All Outcomes</SelectItem>
                  <SelectItem value="denied" style={{ color: 'var(--text)' }}>Denied</SelectItem>
                  <SelectItem value="price_adjustment" style={{ color: 'var(--text)' }}>Price Adjusted</SelectItem>
                  <SelectItem value="buyer_withdrew" style={{ color: 'var(--text)' }}>Buyer Withdrew</SelectItem>
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

      {/* Overall Averages */}
      {overallAverages && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>Avg Transport Cost (Withdrawn)</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                ${overallAverages.avgTransportCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>Avg % of Sale Price Adjusted</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {overallAverages.avgPercentageAdjusted.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>Avg Adjustment Amount</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                ${overallAverages.avgAdjustmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>ARB Reports (Sold Section ARB Only)</CardTitle>
          <CardDescription style={{ color: 'var(--subtext)' }}>
            Monthly breakdown of arbitration activity and financial impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.map((item) => (
                <div key={item.month} className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    {format(new Date(item.month + '-01'), 'MMMM yyyy')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Card className="dashboard-card">
                      <CardContent className="p-4">
                        <p className="text-sm" style={{ color: 'var(--subtext)' }}>Total ARB Count</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{item.totalCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="dashboard-card">
                      <CardContent className="p-4">
                        <p className="text-sm" style={{ color: 'var(--subtext)' }}>Denied</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{item.outcomeBreakdown.denied}</p>
                      </CardContent>
                    </Card>
                    <Card className="dashboard-card">
                      <CardContent className="p-4">
                        <p className="text-sm" style={{ color: 'var(--subtext)' }}>Price Adjusted</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{item.outcomeBreakdown.priceAdjusted}</p>
                      </CardContent>
                    </Card>
                    <Card className="dashboard-card">
                      <CardContent className="p-4">
                        <p className="text-sm" style={{ color: 'var(--subtext)' }}>Buyer Withdrew</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{item.outcomeBreakdown.buyerWithdrew}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {item.withdrawnCases.count > 0 && (
                    <p style={{ color: 'var(--subtext)' }}>
                      Withdrawn Cases - Avg Transport Cost: ${item.withdrawnCases.avgTransportCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}

                  {item.priceAdjustedCases.count > 0 && (
                    <p style={{ color: 'var(--subtext)' }}>
                      Price Adjusted Cases - Average {item.priceAdjustedCases.avgPercentageAdjusted.toFixed(1)}% of sale price, average ${item.priceAdjustedCases.avgAdjustmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700/50">
                          <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                          <TableHead style={{ color: 'var(--text)' }}>VIN</TableHead>
                          <TableHead style={{ color: 'var(--text)' }}>Sold Price</TableHead>
                          <TableHead style={{ color: 'var(--text)' }}>Adjustment Amount</TableHead>
                          <TableHead style={{ color: 'var(--text)' }}>% Adjusted</TableHead>
                          <TableHead style={{ color: 'var(--text)' }}>Transport Cost</TableHead>
                          <TableHead style={{ color: 'var(--text)' }}>Final Outcome</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.vehicles.map((vehicle) => (
                          <TableRow key={vehicle.id} className="border-slate-200 dark:border-slate-700/50">
                            <TableCell style={{ color: 'var(--text)' }}>{vehicle.vehicle}</TableCell>
                            <TableCell style={{ color: 'var(--text)' }}>{vehicle.vin}</TableCell>
                            <TableCell style={{ color: 'var(--text)' }}>
                              ${vehicle.soldPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell style={{ color: 'var(--text)' }}>
                              {vehicle.adjustmentAmount ? `$${vehicle.adjustmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                            </TableCell>
                            <TableCell style={{ color: 'var(--text)' }}>
                              {vehicle.percentageAdjusted ? `${vehicle.percentageAdjusted.toFixed(1)}%` : '-'}
                            </TableCell>
                            <TableCell style={{ color: 'var(--text)' }}>
                              {vehicle.transportCost ? `$${vehicle.transportCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                            </TableCell>
                            <TableCell style={{ color: 'var(--text)' }}>
                              {vehicle.finalOutcome ? vehicle.finalOutcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

