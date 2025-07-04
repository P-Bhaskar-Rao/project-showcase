
const { z } = require('zod');

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

// Email validation schema
const emailSchema = z.string()
  .email({ message: 'Please enter a valid email address' })
  .toLowerCase()
  .trim();

// Password validation schema
const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(passwordRegex, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*(),.?":{}|<>)'
  });

// Name validation schema
const nameSchema = z.string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(50, { message: 'Name cannot exceed 50 characters' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' });

// Signup schema
const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

// Login schema
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' })
});

// Forgot password schema
const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Reset password schema
const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Resend verification email schema
const resendVerificationEmailSchema = z.object({
  email: emailSchema
});

// Change password schema (for authenticated users)
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword']
});

// Update profile schema
const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional()
}).refine((data) => data.name || data.email, {
  message: 'At least one field (name or email) must be provided'
});

// Email verification query schema
const emailVerificationQuerySchema = z.object({
  token: z.string().min(1, { message: 'Verification token is required' }),
  email: emailSchema
});

// Password reset query schema
const passwordResetQuerySchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  email: emailSchema
});

// Validation middleware factory for request body
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
      next(error);
    }
  };
};

// Query validation middleware factory
const validateQuery = (schema) => {
  return (req, res, next) => {
    
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Query validation failed',
          details: errors
        });
      }
      next(error);
    }
  };
};

module.exports = {
  // Schemas
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationEmailSchema,
  changePasswordSchema,
  updateProfileSchema,
  emailVerificationQuerySchema,
  passwordResetQuerySchema,
  
  // Validation middleware
  validateBody,
  validateQuery,
  
  // Individual field schemas (for reuse)
  emailSchema,
  passwordSchema,
  nameSchema
};
