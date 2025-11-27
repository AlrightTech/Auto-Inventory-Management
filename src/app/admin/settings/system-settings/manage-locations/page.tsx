'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Location {
  id: string;
  category: string;
  label: string;
  value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function ManageLocationsPageContent() {
  const router = useRouter();
  const { confirm } = useConfirmation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [editLocationName, setEditLocationName] = useState('');

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dropdown-settings?category=car_location&active_only=false');
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const { data } = await response.json();
      setLocations(data || []);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations. Please try again.');
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle add location
  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      toast.error('Location name is required');
      return;
    }

    // Check for duplicate
    const duplicate = locations.find(
      loc => loc.label.toLowerCase() === newLocationName.trim().toLowerCase()
    );
    if (duplicate) {
      toast.error('A location with this name already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/dropdown-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'car_location',
          label: newLocationName.trim(),
          value: newLocationName.trim(),
          is_active: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add location');
      }

      toast.success('Location added successfully', {
        description: `The location "${newLocationName.trim()}" has been added and is now available in all dropdowns.`,
        duration: 4000,
      });

      setNewLocationName('');
      fetchLocations();
    } catch (error: any) {
      console.error('Error adding location:', error);
      toast.error(error.message || 'Failed to add location');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit location
  const handleStartEdit = (location: Location) => {
    setEditingId(location.id);
    setEditLocationName(location.label);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLocationName('');
  };

  const handleSaveEdit = async (locationId: string) => {
    if (!editLocationName.trim()) {
      toast.error('Location name is required');
      return;
    }

    // Check for duplicate (excluding current location)
    const duplicate = locations.find(
      loc => loc.id !== locationId && loc.label.toLowerCase() === editLocationName.trim().toLowerCase()
    );
    if (duplicate) {
      toast.error('A location with this name already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dropdown-settings/${locationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editLocationName.trim(),
          value: editLocationName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update location');
      }

      toast.success('Location updated successfully', {
        description: `The location has been renamed to "${editLocationName.trim()}".`,
        duration: 4000,
      });

      setEditingId(null);
      setEditLocationName('');
      fetchLocations();
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast.error(error.message || 'Failed to update location');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete location
  const handleDelete = async (location: Location) => {
    try {
      const confirmed = await confirm({
        title: 'Delete Location',
        description: `Are you sure you want to delete the location "${location.label}"? This action cannot be undone and will remove it from all dropdowns across the system.`,
        variant: 'danger',
        confirmText: 'Delete Location',
        cancelText: 'Cancel',
        onConfirm: async () => {
          setIsDeleting(location.id);
          
          try {
            const response = await fetch(`/api/dropdown-settings/${location.id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Failed to delete location');
            }

            // Optimistically remove from list
            setLocations(prev => prev.filter(loc => loc.id !== location.id));
            
            toast.success('Location deleted successfully', {
              description: `The location "${location.label}" has been removed from all dropdowns.`,
              duration: 4000,
            });
          } catch (error: any) {
            console.error('Error deleting location:', error);
            toast.error(error.message || 'Failed to delete location');
            // Reload to ensure sync
            fetchLocations();
            throw error;
          } finally {
            setIsDeleting(null);
          }
        },
      });

      if (!confirmed) {
        return;
      }
    } catch (error: any) {
      // Error already handled in onConfirm
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/settings')}
            style={{ color: 'var(--text)' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Settings
          </Button>
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8" style={{ color: 'var(--accent)' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
                Manage Locations
              </h1>
              <p style={{ color: 'var(--subtext)' }} className="mt-1">
                Add, edit, and delete car locations used across the system
              </p>
            </div>
          </div>
        </motion.div>

        {/* Add Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--accent)' }}>
                Add New Location
              </CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Add a new location that will appear in all car location dropdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="new-location" style={{ color: 'var(--text)' }}>
                    Enter Location Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new-location"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="e.g., Shop/Mechanic, Auction, PDR, etc."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSubmitting) {
                        handleAddLocation();
                      }
                    }}
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddLocation}
                    disabled={isSubmitting || !newLocationName.trim()}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'white'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Locations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--accent)' }}>
                Existing Locations ({locations.length})
              </CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Manage all car locations used throughout the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                  <span className="ml-2" style={{ color: 'var(--subtext)' }}>Loading locations...</span>
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--subtext)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No locations found</h3>
                  <p style={{ color: 'var(--subtext)' }}>
                    Add your first location using the form above.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--border)' }}>
                      <TableHead style={{ color: 'var(--text)' }}>Location Name</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Status</TableHead>
                      <TableHead style={{ color: 'var(--text)' }}>Created</TableHead>
                      <TableHead style={{ color: 'var(--text)', textAlign: 'right' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow
                        key={location.id}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <TableCell style={{ color: 'var(--text)' }}>
                          {editingId === location.id ? (
                            <Input
                              value={editLocationName}
                              onChange={(e) => setEditLocationName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isSubmitting) {
                                  handleSaveEdit(location.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                                width: '200px'
                              }}
                              disabled={isSubmitting}
                              autoFocus
                            />
                          ) : (
                            location.label
                          )}
                        </TableCell>
                        <TableCell style={{ color: 'var(--text)' }}>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              location.is_active
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-gray-500/20 text-gray-500'
                            }`}
                          >
                            {location.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell style={{ color: 'var(--subtext)' }}>
                          {new Date(location.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {editingId === location.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveEdit(location.id)}
                                disabled={isSubmitting}
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--text)'
                                }}
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--text)'
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartEdit(location)}
                                disabled={isDeleting === location.id || isSubmitting}
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--text)'
                                }}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(location)}
                                disabled={isDeleting === location.id || isSubmitting || editingId !== null}
                                style={{
                                  borderColor: '#ef4444',
                                  color: '#ef4444'
                                }}
                              >
                                {isDeleting === location.id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-1" />
                                )}
                                Delete
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function ManageLocationsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <ManageLocationsPageContent />
    </ProtectedRoute>
  );
}

