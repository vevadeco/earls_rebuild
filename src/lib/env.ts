import { z } from "zod";

const schema = z.object({
  ADMIN_USERNAME: z.string().min(1).optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional()
});

export const env = schema.parse(process.env);

