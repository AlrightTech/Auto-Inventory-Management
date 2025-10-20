'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  isLoading?: boolean;
}

export function DeleteEventModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventTitle, 
  isLoading = false 
}: DeleteEventModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="glass-card-strong border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
                Delete Event
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                This action cannot be undone. This will permanently delete the event.
              </DialogDescription>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  Are you sure you want to delete the event <strong>"{eventTitle}"</strong>?
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isLoading ? 'Deleting...' : 'Delete Event'}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
