import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().min(1, 'Event time is required'),
  assigned_to: z.string().optional(),
});

export const eventFiltersSchema = z.object({
  search: z.string().optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;
