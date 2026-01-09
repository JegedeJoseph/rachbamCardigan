import { z } from 'zod';

// Variant schema - ensures no empty strings for stock
const variantSchema = z.object({
  size: z.string().min(1, 'Size is required').trim(),
  color: z.string().min(1, 'Color is required').trim(),
  stock: z.number().int().min(0, 'Stock must be a non-negative number'),
  sku: z.string().optional()
});

// Product creation schema
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
  category: z.string().optional(),
  featured: z.boolean().optional()
});

// Product update schema (all fields optional)
export const updateProductSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  variants: z.array(variantSchema).optional(),
  category: z.string().optional(),
  featured: z.boolean().optional()
});

// Image upload schema
export const imageUploadSchema = z.object({
  images: z.array(z.string()).min(1, 'At least one image is required')
});

// Shipping rate schema
export const shippingRateSchema = z.object({
  state: z.string().min(1, 'State name is required').trim(),
  rate: z.number().min(0, 'Rate must be a non-negative number'),
  estimatedDays: z.string().optional()
});

// Update shipping rate schema
export const updateShippingRateSchema = z.object({
  rate: z.number().min(0, 'Rate must be a non-negative number').optional(),
  estimatedDays: z.string().optional()
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

