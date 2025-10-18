import { z } from 'zod';

export const taskSchema = z.object({
  vehicle_id: z.string().optional(),
  task_name: z.string().min(1, 'Task name is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
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
