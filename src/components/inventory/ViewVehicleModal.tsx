'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Car, Calendar, DollarSign, MapPin, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { VehicleWithRelations } from '@/types/vehicle';
import { format } from 'date-fns';

interface ViewVehicleModalProps {
  vehicle: VehicleWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewVehicleModal({ vehicle, isOpen, onClose }: ViewVehicleModalProps) {
  if (!vehicle) return null;

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
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            <Car className="w-6 h-6 mr-2" />
            Vehicle Details
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            Complete information about this vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

