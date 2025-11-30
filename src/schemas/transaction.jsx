import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.date(),
  category: z.string().min(1, "Category is required"),
  type: z.enum(['income', 'expense']),
  userId: z.string().optional(), // Optional because it's added by the service
  createdAt: z.any().optional(), // Firebase server timestamp
});

export const transactionInputSchema = transactionSchema.omit({ 
  userId: true, 
  createdAt: true 
});
