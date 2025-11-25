'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Download, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface MissingTitleData {
  vehicleId: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  seller: string;
  purchaseOrSaleDate: string;
  daysMissing: number;
  currentStatus: string;
  titleStatus: string;
  location: string;
}

export function MissingTitlesReport() {
  const [data, setData] = useState<MissingTitleData[]>([]);
  const [filteredData, setFilteredData] = useState<MissingTitleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [section, setSection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'daysMissing' | 'status' | 'date'>('daysMissing');

  useEffect(() => {
    loadData();
  }, [section]);

  useEffect(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        `${item.year} ${item.make} ${item.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stockNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'daysMissing') {
        return b.daysMissing - a.daysMissing;
      } else if (sortBy === 'status') {
        return a.currentStatus.localeCompare(b.currentStatus);
      } else {
        return new Date(b.purchaseOrSaleDate).getTime() - new Date(a.purchaseOrSaleDate).getTime();
      }
    });

    setFilteredData(filtered);
  }, [searchTerm, data, sortBy]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (section !== 'all') params.append('section', section);

      const response = await fetch(`/api/reports/missing-titles?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load data');
      
      const { data: reportData } = await response.json();
      setData(reportData || []);
      setFilteredData(reportData || []);
    } catch (error) {
      console.error('Error loading missing titles report:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredData.map(item => ({
      'Stock Number': item.stockNumber,
      'Year': item.year,
      'Make': item.make,
      'Model': item.model,
      'VIN': item.vin,
      'Seller': item.seller,
      'Purchase/Sale Date': item.purchaseOrSaleDate,
      'Days Missing': item.daysMissing,
      'Current Status': item.currentStatus,
      'Title Status': item.titleStatus,
      'Location': item.location,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Missing Titles');
    XLSX.writeFile(wb, `missing-titles-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Report exported successfully');
  };

  const inventoryCount = data.filter(item => item.currentStatus === 'Inventory').length;
  const soldCount = data.filter(item => item.currentStatus === 'Sold').length;
  const arbCount = data.filter(item => item.currentStatus === 'ARB').length;
  const totalCount = data.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Total Missing</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {totalCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8" style={{ color: '#f59e0b' }} />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Inventory</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {inventoryCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>Sold</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {soldCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>ARB</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {arbCount}
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
              <CardTitle style={{ color: 'var(--accent)' }}>Missing Titles Report</CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Track vehicles missing titles across all sections
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
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
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
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="w-48" style={{
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
                  <SelectItem value="all" style={{ color: 'var(--text)' }}>All Sections</SelectItem>
                  <SelectItem value="inventory" style={{ color: 'var(--text)' }}>Inventory</SelectItem>
                  <SelectItem value="sold" style={{ color: 'var(--text)' }}>Sold</SelectItem>
                  <SelectItem value="arb" style={{ color: 'var(--text)' }}>ARB</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'daysMissing' | 'status' | 'date') => setSortBy(value)}>
                <SelectTrigger className="w-48" style={{
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
                  <SelectItem value="daysMissing" style={{ color: 'var(--text)' }}>Sort by Days Missing</SelectItem>
                  <SelectItem value="status" style={{ color: 'var(--text)' }}>Sort by Status</SelectItem>
                  <SelectItem value="date" style={{ color: 'var(--text)' }}>Sort by Date</SelectItem>
                </SelectContent>
              </Select>
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
              <p style={{ color: 'var(--subtext)' }}>No missing titles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: 'var(--border)' }}>
                    <TableHead style={{ color: 'var(--text)' }}>Stock #</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Vehicle</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>VIN</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Seller</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Purchase/Sale Date</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Days Missing</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Status</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Title Status</TableHead>
                    <TableHead style={{ color: 'var(--text)' }}>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.vehicleId} style={{ borderColor: 'var(--border)' }}>
                      <TableCell style={{ color: 'var(--text)' }}>{item.stockNumber}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        {item.year} {item.make} {item.model}
                        {item.trim && ` (${item.trim})`}
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.vin}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.seller}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        {new Date(item.purchaseOrSaleDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell style={{ 
                        color: item.daysMissing > 30 ? '#ef4444' : item.daysMissing > 14 ? '#f59e0b' : 'var(--text)',
                        fontWeight: item.daysMissing > 30 ? 'bold' : 'normal'
                      }}>
                        {item.daysMissing} days
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.currentStatus}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.titleStatus}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{item.location}</TableCell>
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

