'use client';

import { useState, useEffect } from 'react';
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
  Download,
  Search
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface MissingTitleData {
  id: string;
  vehicle: string;
  vin: string;
  section: string;
  daysMissing: number;
  currentTitleStatus: string;
  purchaseDate: string;
}

export function MissingTitlesReport() {
  const [data, setData] = useState<MissingTitleData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchVin, setSearchVin] = useState('');
  const [section, setSection] = useState<string>('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (searchVin) {
        params.append('vin', searchVin);
      }
      if (section) {
        params.append('section', section);
      }

      const response = await fetch(`/api/reports/missing-titles?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load report data');
      }

      const result = await response.json();
      setData(result.data || []);
      setSummary(result.summary || null);
    } catch (error) {
      console.error('Error loading missing titles report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchVin, section]);

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Vehicle', 'VIN', 'Section', 'Days Missing', 'Current Title Status', 'Purchase Date'];
      const rows = data.map(item => [
        item.vehicle,
        item.vin,
        item.section,
        item.daysMissing,
        item.currentTitleStatus,
        item.purchaseDate,
      ]);

      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Missing Titles');
      XLSX.writeFile(wb, `missing-titles-${new Date().toISOString().split('T')[0]}.xlsx`);
      
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label style={{ color: 'var(--text)' }}>Section</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <SelectItem value="" style={{ color: 'var(--text)' }}>All Sections</SelectItem>
                  <SelectItem value="inventory" style={{ color: 'var(--text)' }}>Inventory</SelectItem>
                  <SelectItem value="sold" style={{ color: 'var(--text)' }}>Sold</SelectItem>
                  <SelectItem value="arb" style={{ color: 'var(--text)' }}>ARB</SelectItem>
                </SelectContent>
              </Select>
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
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>Inventory Missing</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{summary.inventory}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>Sold Missing</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{summary.sold}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>ARB Missing</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{summary.arb}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>Total Missing</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{summary.total}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>Longest Missing</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{summary.longestMissing} days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Missing Titles Report</CardTitle>
          <CardDescription style={{ color: 'var(--subtext)' }}>
            Vehicles with missing titles across all sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8">
              <TableSkeleton rows={10} cols={6} />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--subtext)' }}>No missing titles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700/50">
                    <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>VIN</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Section</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Days Missing</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Current Title Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-slate-200 dark:border-slate-700/50">
                      <TableCell style={{ color: 'var(--text)' }}>{item.vehicle}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.vin}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.section}</TableCell>
                      <TableCell style={{ color: item.daysMissing > 30 ? '#ef4444' : item.daysMissing > 14 ? '#f59e0b' : 'var(--text)' }}>
                        {item.daysMissing} days
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.currentTitleStatus}</TableCell>
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

