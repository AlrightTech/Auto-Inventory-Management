'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Upload, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assessmentData: any) => void;
  vehicleId: string;
  vehicleName: string;
  editingAssessment?: any;
}

interface DamageMarker {
  id: string;
  x: number;
  y: number;
  type: 'dent' | 'scratch';
  notes?: string;
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
  const [damageMarkers, setDamageMarkers] = useState<DamageMarker[]>([]);
  const [markerType, setMarkerType] = useState<'dent' | 'scratch'>('dent');
  const [preAccidentDefects, setPreAccidentDefects] = useState('');
  const [otherDefects, setOtherDefects] = useState('');
  const [workRequested, setWorkRequested] = useState<string[]>(['']);
  const [ownerInstructions, setOwnerInstructions] = useState<string[]>(['']);
  const [fuelLevel, setFuelLevel] = useState(0);
  const [assessmentFile, setAssessmentFile] = useState<File | null>(null);
  const [assessmentFileUrl, setAssessmentFileUrl] = useState<string | null>(null);
  
  const carDiagramRef = useRef<HTMLDivElement>(null);
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
      setDamageMarkers(editingAssessment.damage_markers || []);
      setPreAccidentDefects(editingAssessment.pre_accident_defects || '');
      setOtherDefects(editingAssessment.other_defects || '');
      setWorkRequested(editingAssessment.work_requested?.length > 0 ? editingAssessment.work_requested : ['']);
      setOwnerInstructions(editingAssessment.owner_instructions?.length > 0 ? editingAssessment.owner_instructions : ['']);
      setFuelLevel(editingAssessment.fuel_level || 0);
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
      setDamageMarkers([]);
      setPreAccidentDefects('');
      setOtherDefects('');
      setWorkRequested(['']);
      setOwnerInstructions(['']);
      setFuelLevel(0);
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

  const handleCarDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carDiagramRef.current) return;
    
    const rect = carDiagramRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: DamageMarker = {
      id: Date.now().toString(),
      x,
      y,
      type: markerType,
    };

    setDamageMarkers(prev => [...prev, newMarker]);
  };

  const handleRemoveMarker = (id: string) => {
    setDamageMarkers(prev => prev.filter(m => m.id !== id));
  };

  const handleResetMarkers = () => {
    setDamageMarkers([]);
  };

  const handleAddWorkItem = () => {
    setWorkRequested(prev => [...prev, '']);
  };

  const handleRemoveWorkItem = (index: number) => {
    setWorkRequested(prev => prev.filter((_, i) => i !== index));
  };

  const handleWorkItemChange = (index: number, value: string) => {
    setWorkRequested(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleAddInstruction = () => {
    setOwnerInstructions(prev => [...prev, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    setOwnerInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, value: string) => {
    setOwnerInstructions(prev => prev.map((item, i) => i === index ? value : item));
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
        damage_markers: damageMarkers,
        pre_accident_defects: preAccidentDefects || null,
        other_defects: otherDefects || null,
        work_requested: workRequested.filter(item => item.trim() !== ''),
        owner_instructions: ownerInstructions.filter(item => item.trim() !== ''),
        fuel_level: fuelLevel,
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
          <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <TabsTrigger value="vehicle-info" style={{ color: 'var(--text)' }}>Vehicle Info</TabsTrigger>
            <TabsTrigger value="dents-scratches" style={{ color: 'var(--text)' }}>Dents & Scratches</TabsTrigger>
            <TabsTrigger value="defects-fuel" style={{ color: 'var(--text)' }}>Defects & Fuel</TabsTrigger>
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
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Color</Label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Optional"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>CR #</Label>
                <Input
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  placeholder="Optional"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label style={{ color: 'var(--text)' }}>Image Upload (JPG/PNG only)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={handleImageSelect}
                    className="flex-1"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  {selectedImages.length > 0 && (
                    <Button
                      onClick={handleImageUpload}
                      size="sm"
                      style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload ({selectedImages.length})
                    </Button>
                  )}
                </div>
                {uploadedImageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Assessment ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1"
                          onClick={() => handleRemoveImage(index)}
                          style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label style={{ color: 'var(--text)' }}>Assessment File (PDF, Image, etc.)</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
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

          {/* Dents & Scratches Tab */}
          <TabsContent value="dents-scratches" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label style={{ color: 'var(--text)' }}>Marker Type:</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={markerType === 'dent' ? 'default' : 'outline'}
                    onClick={() => setMarkerType('dent')}
                    style={{ 
                      backgroundColor: markerType === 'dent' ? '#ef4444' : 'var(--card-bg)',
                      color: markerType === 'dent' ? 'white' : 'var(--text)'
                    }}
                  >
                    Red (Dent)
                  </Button>
                  <Button
                    size="sm"
                    variant={markerType === 'scratch' ? 'default' : 'outline'}
                    onClick={() => setMarkerType('scratch')}
                    style={{ 
                      backgroundColor: markerType === 'scratch' ? '#3b82f6' : 'var(--card-bg)',
                      color: markerType === 'scratch' ? 'white' : 'var(--text)'
                    }}
                  >
                    Blue (Scratch)
                  </Button>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetMarkers}
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    Reset All
                  </Button>
                </div>
              </div>

              <div
                ref={carDiagramRef}
                className="relative w-full h-96 border-2 rounded-lg cursor-crosshair"
                style={{ 
                  backgroundColor: '#f3f4f6', 
                  borderColor: 'var(--border)',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 50 L150 50 L150 150 L50 150 Z\' fill=\'none\' stroke=\'%23ccc\' stroke-width=\'2\'/%3E%3C/svg%3E")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
                onClick={handleCarDiagramClick}
              >
                {damageMarkers.map((marker) => (
                  <motion.div
                    key={marker.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: marker.type === 'dent' ? '#ef4444' : '#3b82f6',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMarker(marker.id);
                    }}
                    title={marker.notes || `${marker.type}`}
                  />
                ))}
              </div>
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>
                Click on the car diagram to place markers. Click on a marker to remove it.
              </p>
            </div>
          </TabsContent>

          {/* Defects & Fuel Level Tab */}
          <TabsContent value="defects-fuel" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Pre-accident / Other Defects</Label>
                <Textarea
                  value={preAccidentDefects}
                  onChange={(e) => setPreAccidentDefects(e.target.value)}
                  placeholder="Describe any existing defects..."
                  rows={4}
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Other Defects</Label>
                <Textarea
                  value={otherDefects}
                  onChange={(e) => setOtherDefects(e.target.value)}
                  placeholder="Describe any other defects..."
                  rows={4}
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Work Requested / Owner Instructions</Label>
                {workRequested.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleWorkItemChange(index, e.target.value)}
                      placeholder={`Work item ${index + 1}`}
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    {workRequested.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveWorkItem(index)}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddWorkItem}
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Owner Instructions</Label>
                {ownerInstructions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      placeholder={`Instruction ${index + 1}`}
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    {ownerInstructions.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveInstruction(index)}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddInstruction}
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Instruction
                </Button>
              </div>

              <div className="space-y-2">
                <Label style={{ color: 'var(--text)' }}>Fuel Gauge: {fuelLevel}%</Label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs" style={{ color: 'var(--subtext)' }}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
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
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
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

