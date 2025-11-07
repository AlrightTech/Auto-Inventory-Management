'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Expense {
  id: string;
  vehicle_id: string;
  expense_description: string;
  expense_date: string;
  cost: number;
  notes?: string | null;
  created_at?: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expenseData: {
    expense_description: string;
    expense_date: string;
    cost: number;
    notes?: string;
  }) => Promise<void>;
  vehicleId: string;
  expenseToEdit?: Expense | null;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  vehicleId,
  expenseToEdit,
}: AddExpenseModalProps) {
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or expenseToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setExpenseDescription(expenseToEdit.expense_description);
        setExpenseDate(expenseToEdit.expense_date ? new Date(expenseToEdit.expense_date) : new Date());
        setCost(expenseToEdit.cost.toString());
        setNotes(expenseToEdit.notes || '');
      } else {
        setExpenseDescription('');
        setExpenseDate(new Date());
        setCost('');
        setNotes('');
      }
    }
  }, [isOpen, expenseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseDescription.trim()) {
      toast.error('Please enter an expense description');
      return;
    }

    if (!expenseDate) {
      toast.error('Please select a date');
      return;
    }

    if (!cost || isNaN(parseFloat(cost)) || parseFloat(cost) <= 0) {
      toast.error('Please enter a valid cost');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        expense_description: expenseDescription.trim(),
        expense_date: format(expenseDate, 'yyyy-MM-dd'),
        cost: parseFloat(cost),
        notes: notes.trim() || undefined,
      });
      
      // Reset form
      setExpenseDescription('');
      setExpenseDate(new Date());
      setCost('');
      setNotes('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting expense:', error);
      toast.error(error.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setCost(formatted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dashboard-card neon-glow instrument-cluster max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            {expenseToEdit ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            {expenseToEdit ? 'Update expense details' : 'Add a new expense for this vehicle'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>
              Expense <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="Description of the part or service"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              required
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>
              Date <span className="text-red-400">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expenseDate ? format(expenseDate, 'dd-MM-yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <Calendar
                  mode="single"
                  selected={expenseDate}
                  onSelect={setExpenseDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>
              Cost <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="0.00"
              value={cost}
              onChange={handleCostChange}
              required
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>
              Enter amount in dollars
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>
              Note
            </label>
            <Textarea
              placeholder="Additional context, references, or remarks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--border)', 
                color: 'var(--text)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 dark:bg-[var(--accent)] bg-black dark:text-white text-white hover:bg-gray-800 dark:hover:bg-[var(--accent)]/90"
              disabled={isSubmitting}
              style={{ 
                border: '1px solid transparent'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {expenseToEdit ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                expenseToEdit ? 'Update' : 'Submit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

