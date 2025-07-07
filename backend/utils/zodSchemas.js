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

// Profile update schema for name, bio, skills, education, avatar, socialLinks
const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string().trim().max(500, { message: 'Bio cannot exceed 500 characters' }).optional(),
  skills: z.array(z.string().trim().min(1, { message: 'Skill cannot be empty' })).optional(),
  education: z.array(z.object({
    institution: z.string().trim().min(1, { message: 'Institution is required' }),
    degree: z.string().trim().min(1, { message: 'Degree is required' }),
    fieldOfStudy: z.string().trim().min(1, { message: 'Field of study is required' }),
    startYear: z.number().int().min(1900).max(new Date().getFullYear() + 10, { message: 'Invalid start year' }),
    endYear: z.number().int().min(1900).max(new Date().getFullYear() + 10, { message: 'Invalid end year' })
  })).optional(),
  avatar: z.string().url({ message: 'Avatar must be a valid URL' }).optional().or(z.literal('')),
  socialLinks: z.object({
    github: z.string().url({ message: 'GitHub must be a valid URL' }).optional().or(z.literal('')),
    linkedin: z.string().url({ message: 'LinkedIn must be a valid URL' }).optional().or(z.literal('')),
    twitter: z.string().url({ message: 'Twitter must be a valid URL' }).optional().or(z.literal('')),
    website: z.string().url({ message: 'Website must be a valid URL' }).optional().or(z.literal(''))
  }).optional()
}).refine((data) => {
  // Ensure at least one field is provided
  return data.name !== undefined || data.bio !== undefined || data.skills !== undefined || data.education !== undefined || 
         data.avatar !== undefined || data.socialLinks !== undefined;
}, {
  message: 'At least one profile field must be provided'
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
  profileUpdateSchema,
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
