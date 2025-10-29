import { z } from 'zod';

export const taskSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle selection is required'),
  task_name: z.string().min(1, 'Task name is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  assigned_to: z.string().min(1, 'User assignment is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
});

export const taskFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
