import { z } from "zod";

const schema = z.object({
  ADMIN_USERNAME: z.string().min(1).optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  SITE_DISABLED: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  LEAD_NOTIFY_FROM: z.string().optional(),
  LEAD_NOTIFY_TO: z.string().optional()
});

export const env = schema.parse(process.env);

