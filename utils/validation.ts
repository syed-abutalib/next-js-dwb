import { z } from "zod";

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    ),

  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters long")
    .max(100, "Email must not exceed 100 characters"),

  company: z
    .string()
    .max(200, "Company name must not exceed 200 characters")
    .optional()
    .default(""),

  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters long")
    .max(200, "Subject must not exceed 200 characters"),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(5000, "Message must not exceed 5000 characters"),

  contactType: z.enum(
    [
      "general",
      "editorial",
      "advertising",
      "partnership",
      "technical",
      "other",
    ],
    {
      message: "Please select a valid inquiry type",
    },
  ),
});

// Subscriber validation schema
export const subscriberSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters long")
    .max(100, "Email must not exceed 100 characters"),
});

// Type inference (optional, for TypeScript)
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type SubscriberData = z.infer<typeof subscriberSchema>;
