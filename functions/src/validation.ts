import { z } from 'zod';

// Validation schemas for API endpoints
export const DetectPeopleRequestSchema = z.object({
  imageUrl: z.string().url('Invalid image URL format'),
});

export const IngestRequestSchema = z.object({
  imageUrl: z.string().url('Invalid image URL format'),
  userId: z.string().min(1, 'User ID is required'),
});

export const SparkRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  occasion: z.string().optional(),
  season: z.string().optional(),
});

export const PaletteRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  colorGoals: z.array(z.string()).optional(),
});

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}

// Common validation patterns
export const CommonSchemas = {
  userId: z.string().min(1, 'User ID is required'),
  imageUrl: z.string().url('Invalid image URL format'),
  optionalString: z.string().optional(),
  optionalArray: z.array(z.string()).optional(),
} as const;
