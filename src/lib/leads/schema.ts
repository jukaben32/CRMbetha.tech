import { z } from "zod";

export const leadSchema = z.object({
  project: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  email: z.email().max(200).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  source: z.string().max(50).optional().or(z.literal("")),
  utm_source: z.string().max(100).optional().or(z.literal("")),
  utm_medium: z.string().max(100).optional().or(z.literal("")),
  utm_campaign: z.string().max(100).optional().or(z.literal("")),
  fbclid: z.string().max(200).optional().or(z.literal("")),
  landing_url: z.url().max(500).optional().or(z.literal("")),
  // Honeypot: un campo que ningún humano llena; los bots suelen rellenar todo.
  company_website: z.string().max(200).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;
