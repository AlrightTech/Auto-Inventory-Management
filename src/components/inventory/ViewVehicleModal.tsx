'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Calendar, DollarSign, MapPin, User, FileText, CheckCircle, AlertCircle, ClipboardList, ClipboardCheck, Wrench, Truck, Clock, Upload, Download } from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { TaskWithRelations } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ViewVehicleModalProps {
  vehicle: VehicleWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewVehicleModal({ vehicle, isOpen, onClose }: ViewVehicleModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [vehicleTasks, setVehicleTasks] = useState<TaskWithRelations[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  if (!vehicle) return null;

  // Load tasks for this vehicle
  useEffect(() => {
    if (isOpen && vehicle?.id) {
      const loadTasks = async () => {
        try {
          setIsLoadingTasks(true);
          const response = await fetch(`/api/tasks?vehicleId=${vehicle.id}&limit=100`);
          if (response.ok) {
            const { data } = await response.json();
            setVehicleTasks(data || []);
          }
        } catch (error) {
          console.error('Error loading tasks:', error);
        } finally {
          setIsLoadingTasks(false);
        }
      };
      loadTasks();
    }
  }, [isOpen, vehicle?.id]);

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    { id: 'parts', label: 'Parts & Expenses', icon: Wrench },
    { id: 'dispatch', label: 'Central Dispatch', icon: Truck },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  const handleDownload = () => {
    try {
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const headers = [
        'VIN', 'Year', 'Make', 'Model', 'Trim', 'Exterior Color', 'Interior Color',
        'Status', 'Odometer', 'Title Status', 'PSI Status', 'Dealshield Arbitration Status',
        'Bought Price', 'Buy Fee', 'Sale Invoice', 'Other Charges', 'Total Vehicle Cost',
        'Sale Date', 'Lane', 'Run', 'Channel', 'Facilitating Location', 'Vehicle Location',
        'Pickup Location Address1', 'Pickup Location City', 'Pickup Location State',
        'Pickup Location Zip', 'Pickup Location Phone', 'Seller Name', 'Buyer Dealership',
        'Buyer Contact Name', 'Buyer AA ID', 'Sale Invoice Status'
      ];

      const csvRow = [
        vehicle.vin || '',
        vehicle.year || '',
        vehicle.make || '',
        vehicle.model || '',
        vehicle.trim || '',
        vehicle.exterior_color || '',
        vehicle.interior_color || '',
        vehicle.status || '',
        vehicle.odometer || '',
        vehicle.title_status || '',
        vehicle.psi_status || '',
        vehicle.dealshield_arbitration_status || '',
        vehicle.bought_price || '',
        vehicle.buy_fee || '',
        vehicle.sale_invoice || '',
        vehicle.other_charges || '',
        vehicle.total_vehicle_cost || '',
        vehicle.sale_date || '',
        vehicle.lane || '',
        vehicle.run || '',
        vehicle.channel || '',
        vehicle.facilitating_location || '',
        vehicle.vehicle_location || '',
        vehicle.pickup_location_address1 || '',
        vehicle.pickup_location_city || '',
        vehicle.pickup_location_state || '',
        vehicle.pickup_location_zip || '',
        vehicle.pickup_location_phone || '',
        vehicle.seller_name || '',
        vehicle.buyer_dealership || '',
        vehicle.buyer_contact_name || '',
        vehicle.buyer_aa_id || '',
        vehicle.sale_invoice_status || ''
      ];

      const csvContent = [
        headers.map(escapeCsvValue).join(','),
        csvRow.map(escapeCsvValue).join(',')
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${vehicle.year}-${vehicle.make}-${vehicle.model}-${vehicle.vin || 'vehicle'}`.replace(/\s+/g, '-');
      link.href = url;
      link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Vehicle data downloaded successfully');
    } catch (error) {
      console.error('Error downloading vehicle:', error);
      toast.error('Failed to download vehicle data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400';
      case 'ARB':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'Sold':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            <div className="flex items-center">
              <Car className="w-6 h-6 mr-2" />
              Vehicle Details
            </div>
            {activeTab === 'details' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-slate-600 hover:bg-slate-700/50"
                  onClick={() => toast.info('Upload Title feature coming soon')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Title
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-slate-600 hover:bg-slate-700/50"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            Complete information about this vehicle
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-none border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--subtext)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <>
              {/* Vehicle Header */}
              <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.trim && <span className="ml-2" style={{ color: 'var(--subtext)' }}>({vehicle.trim})</span>}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`flex items-center gap-1 ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </Badge>
                {vehicle.vin && (
                  <Badge variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                    VIN: {vehicle.vin}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Basic Information</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Year:</span>
                  <span style={{ color: 'var(--text)' }}>{vehicle.year}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Make:</span>
                  <span style={{ color: 'var(--text)' }}>{vehicle.make}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Model:</span>
                  <span style={{ color: 'var(--text)' }}>{vehicle.model}</span>
                </div>
                {vehicle.trim && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--subtext)' }}>Trim:</span>
                    <span style={{ color: 'var(--text)' }}>{vehicle.trim}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Odometer:</span>
                  <span style={{ color: 'var(--text)' }}>
                    {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} miles` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Exterior:</span>
                  <span style={{ color: 'var(--text)' }}>{vehicle.exterior_color || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Interior:</span>
                  <span style={{ color: 'var(--text)' }}>{vehicle.interior_color || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Status Information</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Title Status:</span>
                  <Badge 
                    variant="outline" 
                    className={vehicle.title_status === 'Absent' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-green-500/20 text-green-600 dark:text-green-400'}
                  >
                    {vehicle.title_status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>PSI Status:</span>
                  <span style={{ color: 'var(--text)' }}>{vehicle.psi_status || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>ARB Status:</span>
                  <span style={{ color: 'var(--text)' }}>{vehicle.dealshield_arbitration_status || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--subtext)' }}>Invoice Status:</span>
                  <Badge 
                    variant="outline" 
                    className={vehicle.sale_invoice_status === 'UNPAID' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-green-500/20 text-green-600 dark:text-green-400'}
                  >
                    {vehicle.sale_invoice_status || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Financial Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div style={{ color: 'var(--subtext)' }}>Bought Price</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  {vehicle.bought_price ? `$${vehicle.bought_price.toLocaleString()}` : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--subtext)' }}>Buy Fee</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  {vehicle.buy_fee ? `$${vehicle.buy_fee.toLocaleString()}` : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--subtext)' }}>Other Charges</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  {vehicle.other_charges ? `$${vehicle.other_charges.toLocaleString()}` : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--subtext)' }}>Total Cost</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  {vehicle.total_vehicle_cost 
                    ? `$${vehicle.total_vehicle_cost.toLocaleString()}` 
                    : vehicle.bought_price && vehicle.buy_fee
                    ? `$${((vehicle.bought_price || 0) + (vehicle.buy_fee || 0) + (vehicle.other_charges || 0)).toLocaleString()}`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--subtext)' }}>Sale Invoice</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  {vehicle.sale_invoice ? `$${vehicle.sale_invoice.toLocaleString()}` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {(vehicle.facilitating_location || vehicle.vehicle_location || vehicle.pickup_location_city) && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Location Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {vehicle.facilitating_location && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Facilitating Location</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.facilitating_location}</div>
                  </div>
                )}
                {vehicle.vehicle_location && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Vehicle Location</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.vehicle_location}</div>
                  </div>
                )}
                {vehicle.pickup_location_address1 && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Pickup Address</div>
                    <div style={{ color: 'var(--text)' }}>
                      {vehicle.pickup_location_address1}
                      {vehicle.pickup_location_city && `, ${vehicle.pickup_location_city}`}
                      {vehicle.pickup_location_state && `, ${vehicle.pickup_location_state}`}
                      {vehicle.pickup_location_zip && ` ${vehicle.pickup_location_zip}`}
                    </div>
                  </div>
                )}
                {vehicle.pickup_location_phone && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Phone</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.pickup_location_phone}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sale Information */}
          {(vehicle.sale_date || vehicle.seller_name || vehicle.buyer_dealership) && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Sale Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {vehicle.sale_date && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Sale Date</div>
                    <div style={{ color: 'var(--text)' }}>
                      {format(new Date(vehicle.sale_date), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                )}
                {vehicle.lane && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Lane</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.lane}</div>
                  </div>
                )}
                {vehicle.run && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Run</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.run}</div>
                  </div>
                )}
                {vehicle.seller_name && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Seller</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.seller_name}</div>
                  </div>
                )}
                {vehicle.buyer_dealership && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Buyer Dealership</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.buyer_dealership}</div>
                  </div>
                )}
                {vehicle.buyer_contact_name && (
                  <div>
                    <div style={{ color: 'var(--subtext)' }}>Buyer Contact</div>
                    <div style={{ color: 'var(--text)' }}>{vehicle.buyer_contact_name}</div>
                  </div>
                )}
              </div>
            </div>
          )}
            </>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Vehicle Tasks</h4>
              </div>
              {isLoadingTasks ? (
                <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>Loading tasks...</div>
              ) : vehicleTasks.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>No tasks assigned to this vehicle.</div>
              ) : (
                <div className="space-y-3">
                  {vehicleTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1" style={{ color: 'var(--text)' }}>{task.task_name}</h5>
                          {task.notes && (
                            <p className="text-sm mb-2" style={{ color: 'var(--subtext)' }}>{task.notes}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--subtext)' }}>
                            <span>Category: {task.category || 'N/A'}</span>
                            <span>Due: {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A'}</span>
                            <Badge
                              variant="outline"
                              className={
                                task.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : task.status === 'cancelled'
                                  ? 'bg-gray-500/20 text-gray-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assessment Tab */}
          {activeTab === 'assessment' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <ClipboardCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Vehicle Assessment</h4>
              </div>
              <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                Assessment information will be displayed here.
              </div>
            </div>
          )}

          {/* Parts & Expenses Tab */}
          {activeTab === 'parts' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Wrench className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Parts & Expenses</h4>
              </div>
              <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                Parts and expenses information will be displayed here.
              </div>
            </div>
          )}

          {/* Central Dispatch Tab */}
          {activeTab === 'dispatch' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Central Dispatch</h4>
              </div>
              <div className="text-center py-8" style={{ color: 'var(--subtext)' }}>
                Dispatch and delivery information will be displayed here.
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Activity Timeline</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--accent)' }} />
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: 'var(--text)' }}>Vehicle Created</div>
                    <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                      {vehicle.created_at ? format(new Date(vehicle.created_at), 'MMMM dd, yyyy HH:mm') : 'N/A'}
                    </div>
                  </div>
                </div>
                {vehicle.updated_at && vehicle.updated_at !== vehicle.created_at && (
                  <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--accent)' }} />
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: 'var(--text)' }}>Last Updated</div>
                      <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                        {format(new Date(vehicle.updated_at), 'MMMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

