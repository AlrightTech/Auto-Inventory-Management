'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Upload, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assessmentData: any) => void;
  vehicleId: string;
  vehicleName: string;
  editingAssessment?: any;
}


export function AddAssessmentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  vehicleId, 
  vehicleName,
  editingAssessment 
}: AddAssessmentModalProps) {
  const [activeTab, setActiveTab] = useState('vehicle-info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [assessmentTime, setAssessmentTime] = useState('');
  const [conductedName, setConductedName] = useState('');
  const [milesIn, setMilesIn] = useState('');
  const [color, setColor] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [assessmentFile, setAssessmentFile] = useState<File | null>(null);
  const [assessmentFileUrl, setAssessmentFileUrl] = useState<string | null>(null);
  const supabase = createClient();

  // Load editing assessment data
  useEffect(() => {
    if (editingAssessment && isOpen) {
      setSelectedDate(editingAssessment.assessment_date ? new Date(editingAssessment.assessment_date) : new Date());
      setAssessmentTime(editingAssessment.assessment_time || '');
      setConductedName(editingAssessment.conducted_name || '');
      setMilesIn(editingAssessment.miles_in?.toString() || '');
      setColor(editingAssessment.color || '');
      setCrNumber(editingAssessment.cr_number || '');
      setAssessmentFileUrl(editingAssessment.assessment_file_url || null);
      setUploadedImageUrls(editingAssessment.images || []);
    } else if (!editingAssessment && isOpen) {
      // Reset form for new assessment
      setSelectedDate(new Date());
      setAssessmentTime('');
      setConductedName('');
      setMilesIn('');
      setColor('');
      setCrNumber('');
      setSelectedImages([]);
      setUploadedImageUrls([]);
      setAssessmentFile(null);
      setAssessmentFileUrl(null);
      setActiveTab('vehicle-info');
    }
  }, [editingAssessment, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const handleImageUpload = async () => {
    if (selectedImages.length === 0) return;

    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${vehicleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('vehicle-assessments')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('vehicle-assessments')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setUploadedImageUrls(prev => [...prev, ...uploadedUrls]);
      setSelectedImages([]);
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicleId}/assessment-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('vehicle-assessments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-assessments')
        .getPublicUrl(fileName);

      setAssessmentFileUrl(publicUrl);
      setAssessmentFile(file);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedDate || !assessmentTime || !conductedName) {
      toast.error('Please fill in all required fields (Date, Time, and Conducted Name)');
      return;
    }

    setIsSubmitting(true);
    try {
      const assessmentData = {
        assessment_date: format(selectedDate, 'yyyy-MM-dd'),
        assessment_time: assessmentTime,
        conducted_name: conductedName,
        miles_in: milesIn ? parseInt(milesIn) : null,
        color: color || null,
        cr_number: crNumber || null,
        damage_markers: [],
        pre_accident_defects: null,
        other_defects: null,
        work_requested: [],
        owner_instructions: [],
        fuel_level: null,
        assessment_file_url: assessmentFileUrl,
        assessment_file_name: assessmentFile?.name || null,
        images: uploadedImageUrls,
      };

      await onSubmit(assessmentData);
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast.error(error.message || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            {editingAssessment ? 'Edit Assessment' : 'Add New Assessment'}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            {vehicleName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <TabsTrigger value="vehicle-info" style={{ color: 'var(--text)' }}>Vehicle Info</TabsTrigger>
          </TabsList>

          {/* Vehicle Info Tab */}
          <TabsContent value="vehicle-info" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Assessment Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Assessment Time *</Label>
                <Input
                  type="time"
                  value={assessmentTime}
                  onChange={(e) => setAssessmentTime(e.target.value)}
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label style={{ color: 'var(--text)' }}>Conducted Name *</Label>
                <Input
                  value={conductedName}
                  onChange={(e) => setConductedName(e.target.value)}
                  placeholder="Inspector name or email"
                  className="vehicle-details-field"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Miles In</Label>
                <Input
                  type="number"
                  value={milesIn}
                  onChange={(e) => setMilesIn(e.target.value)}
                  placeholder="Optional"
                  className="vehicle-details-field"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Color</Label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Optional"
                  className="vehicle-details-field"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>CR #</Label>
                <Input
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  placeholder="Optional"
                  className="vehicle-details-field"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label style={{ color: 'var(--text)' }}>Assessment File (PDF, Image, etc.)</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="vehicle-details-field"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                {assessmentFileUrl && (
                  <div className="mt-2">
                    <a href={assessmentFileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                      View uploaded file
                    </a>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDate || !assessmentTime || !conductedName}
            className="submit-assessment-btn"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Assessment'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

