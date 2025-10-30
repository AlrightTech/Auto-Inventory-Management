'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { VehicleInsert, ImportResult } from '@/types/vehicle';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (result: ImportResult) => void;
}

export function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.pdf')) {
      toast.error('Please select a valid CSV, Excel, or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/vehicles/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = 'Import failed';
        try {
          const errorData = await response.json();
          // Check if errorData has the ImportResult structure
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          } else {
            errorMessage = errorData.error || errorData.details || 'Import failed';
          }
        } catch (jsonError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || 'Import failed';
          } catch {
            errorMessage = 'Import failed with unknown error';
          }
        }
        throw new Error(errorMessage);
      }

      let result: ImportResult;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Error parsing import response:', jsonError);
        throw new Error('Invalid response from server');
      }
      setImportResult(result);

      if (result.success) {
        toast.success(`Successfully imported ${result.imported} vehicles`);
        if (onImportComplete) {
          onImportComplete(result);
        }
      } else {
        toast.error(`Import completed with ${result.errors.length} errors`);
      }

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      toast.error(errorMessage);
      setImportResult({
        success: false,
        imported: 0,
        errors: [errorMessage],
        vehicles: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="glass-card-strong border-slate-700 sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white glow-text flex items-center">
                <Upload className="w-6 h-6 mr-2" />
                Import Vehicles
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Upload a CSV, Excel, or PDF file to import vehicle data into your inventory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.pdf"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin" />
                    <div>
                      <p className="text-white font-medium">Processing file...</p>
                      <p className="text-slate-400 text-sm">Please wait while we import your data</p>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <FileSpreadsheet className="w-12 h-12 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Drop your file here or click to browse</p>
                      <p className="text-slate-400 text-sm">
                        Supports CSV, Excel (.xlsx), and PDF files up to 10MB
                      </p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              {/* Import Results */}
              {importResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className={`p-4 rounded-lg border ${
                    importResult.success 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {importResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <h3 className={`font-medium ${
                        importResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Import {importResult.success ? 'Successful' : 'Completed with Errors'}
                      </h3>
                    </div>
                    <p className="text-slate-300 text-sm mt-2">
                      {importResult.imported} vehicles imported successfully
                    </p>
                    {importResult.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-red-400 text-sm font-medium">Errors:</p>
                        <ul className="text-red-300 text-sm mt-1 space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {importResult ? 'Close' : 'Cancel'}
                </Button>
                {importResult && importResult.success && (
                  <Button
                    onClick={handleClose}
                    className="gradient-primary hover:opacity-90"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Done
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}




