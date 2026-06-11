import { z } from 'zod';

export const RestaurantProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  restaurantType: z.string().min(1, 'Type is required').max(50),
  addressText: z.string().max(200).default(''),
  city: z.string().max(100).default(''),
  state: z.string().max(100).default(''),
  postalCode: z.string().max(20).default(''),
  country: z.string().max(2).default('US'),
  businessModel: z.enum(['DINE_IN', 'TAKEOUT', 'DELIVERY', 'HYBRID']),
  seatingCapacity: z.coerce.number().int().min(1, 'Min 1').max(10_000),
  avgTableTurnMinutes: z.coerce.number().int().min(5, 'Min 5 min').max(480),
  // Form sends dollar amounts; service converts to cents
  monthlyRentDollars: z.coerce.number().min(0, 'Min $0'),
  monthlyUtilitiesDollars: z.coerce.number().min(0, 'Min $0'),
  monthlyOtherDollars: z.coerce.number().min(0, 'Min $0'),
  targetFoodCostPct: z.coerce.number().min(1).max(100),
  targetLaborCostPct: z.coerce.number().min(1).max(100),
});

export type RestaurantProfileInput = z.infer<typeof RestaurantProfileSchema>;

const HourRowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm'),
});

export const OperatingHoursSchema = z.array(HourRowSchema).length(7, 'Must have 7 days');

export type HourRowInput = z.infer<typeof HourRowSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').max(100),
  orgName: z.string().min(1, 'Restaurant name is required').max(100),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
