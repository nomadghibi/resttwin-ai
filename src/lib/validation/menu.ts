import { z } from 'zod';

export const MenuItemFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Required').max(100),
  category: z.string().min(1, 'Required').max(50),
  priceDollars: z.coerce.number().min(0.01, 'Min $0.01'),
  foodCostDollars: z.coerce.number().min(0, 'Min $0'),
  prepMinutes: z.coerce.number().int().min(1, 'Min 1').max(480),
  popularityWeight: z.coerce.number().min(0.1, 'Min 0.1').max(10, 'Max 10'),
});

export type MenuItemFormInput = z.infer<typeof MenuItemFormSchema>;
