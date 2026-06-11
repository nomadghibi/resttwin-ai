import { z } from 'zod';

export const StaffRoleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Required').max(100),
  hourlyWageDollars: z.coerce.number().min(0, 'Min $0'),
  capacityImpact: z.enum(['KITCHEN', 'SERVICE', 'CASHIER', 'DELIVERY']),
  defaultProductivity: z.coerce.number().min(0.1, 'Min 0.1').max(5, 'Max 5'),
});

export type StaffRoleFormInput = z.infer<typeof StaffRoleFormSchema>;

export const StaffShiftFormSchema = z
  .object({
    id: z.string().optional(),
    staffRoleId: z.string().min(1, 'Select a role'),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm'),
    quantity: z.coerce.number().int().min(1, 'Min 1').max(20, 'Max 20'),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type StaffShiftFormInput = z.infer<typeof StaffShiftFormSchema>;
