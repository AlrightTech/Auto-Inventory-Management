'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListChecks, Plus, Edit, Trash2, MoreHorizontal, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface DropdownSetting {
  id: string;
  category: string;
  label: string;
  value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'car_location', label: 'Car Location' },
  { value: 'title_status', label: 'Title Status' },
  { value: 'assessment_type', label: 'Assessment Type' },
  { value: 'status', label: 'Status' },
];

export default function DropdownManagerPage() {
  const [dropdowns, setDropdowns] = useState<DropdownSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('car_location');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DropdownSetting | null>(null);
  const [formData, setFormData] = useState({
    category: 'car_location',
    label: '',
    value: '',
    is_active: true,
  });

  // Fetch dropdown settings
  const fetchDropdowns = async (category?: string) => {
    try {
      setIsLoading(true);
      const url = category 
        ? `/api/dropdown-settings?category=${category}&active_only=false`
        : '/api/dropdown-settings?active_only=false';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch dropdown settings');
      }

      const { data } = await response.json();
      setDropdowns(data || []);
    } catch (error: any) {
      console.error('Error fetching dropdowns:', error);
      toast.error('Failed to load dropdown settings. Please try again.');
      setDropdowns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns(selectedCategory);
  }, [selectedCategory]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.label.trim()) {
      toast.error('Label is required');
      return;
    }
    if (!formData.value.trim()) {
      toast.error('Value is required');
      return;
    }

    try {
      if (editingItem) {
        // Update existing
        const response = await fetch(`/api/dropdown-settings/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update dropdown setting');
        }

        toast.success('Dropdown option updated successfully');
      } else {
        // Create new
        const response = await fetch('/api/dropdown-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create dropdown setting');
        }

        toast.success('Dropdown option added successfully');
      }

      // Reset form and refresh
      setFormData({
        category: selectedCategory,
        label: '',
        value: '',
        is_active: true,
      });
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchDropdowns(selectedCategory);
    } catch (error: any) {
      console.error('Error saving dropdown:', error);
      toast.error(error.message || 'Failed to save dropdown setting');
    }
  };

  // Handle edit
  const handleEdit = (item: DropdownSetting) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      label: item.label,
      value: item.value,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dropdown option?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dropdown-settings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dropdown setting');
      }

      toast.success('Dropdown option deleted successfully');
      fetchDropdowns(selectedCategory);
    } catch (error: any) {
      console.error('Error deleting dropdown:', error);
      toast.error(error.message || 'Failed to delete dropdown setting');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (item: DropdownSetting) => {
    try {
      const response = await fetch(`/api/dropdown-settings/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !item.is_active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dropdown setting');
      }

      toast.success(`Dropdown option ${!item.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchDropdowns(selectedCategory);
    } catch (error: any) {
      console.error('Error toggling active status:', error);
      toast.error(error.message || 'Failed to update dropdown setting');
    }
  };

  // Filter dropdowns by selected category
  const filteredDropdowns = dropdowns.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Dropdown Manager
          </h1>
          <p className="mt-1" style={{ color: 'var(--subtext)' }}>
            Manage dropdown options for various categories across the system.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setFormData({
              category: selectedCategory,
              label: '',
              value: '',
              is_active: true,
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  category: selectedCategory,
                  label: '',
                  value: '',
                  is_active: true,
                });
                setIsDialogOpen(true);
              }}
              className="dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
              style={{ borderRadius: '8px' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--text)' }}>
                {editingItem ? 'Edit Dropdown Option' : 'Add Dropdown Option'}
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--subtext)' }}>
                {editingItem ? 'Update the dropdown option details.' : 'Create a new dropdown option for the selected category.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category" style={{ color: 'var(--text)' }}>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  disabled={!!editingItem}
                >
                  <SelectTrigger
                    id="category"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        style={{ color: 'var(--text)' }}
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="label" style={{ color: 'var(--text)' }}>
                  Label <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Enter label"
                  required
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <Label htmlFor="value" style={{ color: 'var(--text)' }}>
                  Value <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter value"
                  required
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" style={{ color: 'var(--text)' }}>Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingItem(null);
                    setFormData({
                      category: selectedCategory,
                      label: '',
                      value: '',
                      is_active: true,
                    });
                  }}
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
                >
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Category Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: 'var(--text)' }}>
              <ListChecks className="w-5 h-5 mr-2" style={{ color: 'var(--accent)' }} />
              Select Category
            </CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Choose a category to manage its dropdown options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={selectedCategory === cat.value ? 'dark:bg-[var(--accent)] bg-black dark:text-white text-white' : ''}
                  style={{
                    borderColor: 'var(--border)',
                    color: selectedCategory === cat.value ? 'white' : 'var(--text)',
                    borderRadius: '8px'
                  }}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dropdown Options Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>
              {CATEGORIES.find(c => c.value === selectedCategory)?.label} Options
            </CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Manage dropdown options for {CATEGORIES.find(c => c.value === selectedCategory)?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                Loading dropdown options...
              </div>
            ) : filteredDropdowns.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>No options found</p>
                <p style={{ color: 'var(--subtext)' }}>Get started by adding your first dropdown option.</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Label</TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Value</TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Status</TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>Created</TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)', textAlign: 'right' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDropdowns.map((item) => (
                      <TableRow
                        key={item.id}
                        style={{ borderColor: 'var(--border)' }}
                        className="hover:bg-opacity-50"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          {item.label}
                        </TableCell>
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          {item.value}
                        </TableCell>
                        <TableCell style={{ padding: '16px' }}>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.is_active}
                              onCheckedChange={() => handleToggleActive(item)}
                            />
                            <span style={{ color: item.is_active ? 'var(--accent)' : 'var(--subtext)' }}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell style={{ padding: '16px', textAlign: 'right' }}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-lg"
                                style={{ color: 'var(--text)', borderRadius: '8px' }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                                borderRadius: '8px'
                              }}
                            >
                              <DropdownMenuItem
                                style={{ color: 'var(--text)' }}
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                style={{ color: '#ef4444' }}
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

