import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const leaveRequestSchema = z.object({
  leaveType: z.enum(['casual', 'sick', 'earned', 'lwp'], {
    errorMap: () => ({ message: 'Invalid leave type' }),
  }),
  startDate: z.string().regex(dateRegex, 'Invalid start date format'),
  endDate: z.string().regex(dateRegex, 'Invalid end date format'),
  isHalfDay: z.boolean(),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500, 'Reason must be under 500 characters'),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const policySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().max(1000, 'Description must be under 1000 characters').optional().or(z.literal('')),
  category: z.enum(['Leave', 'Attendance', 'Work Hours', 'Holidays', 'General'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  content: z.string().max(50000, 'Content must be under 50000 characters').optional().or(z.literal('')),
});

export function validateLeaveDays(days: number): string | null {
  if (days < 0.5 || days > 365) return 'Invalid leave duration';
  return null;
}
