import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(16),
  AUTH_TRUST_HOST: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Zenvora Invite"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  COMPANY_EMAIL: z.string().email().default("hello@example.com"),
  COMPANY_ADDRESS: z.string().optional(),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  LOCAL_UPLOAD_DIR: z.string().default("uploads"),
  S3_ENDPOINT: z.string().url().optional().or(z.literal("")),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional().or(z.literal("")),
  PAYMENT_PROVIDER: z.enum(["mock", "midtrans", "xendit"]).default("mock")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  COMPANY_EMAIL: process.env.COMPANY_EMAIL,
  COMPANY_ADDRESS: process.env.COMPANY_ADDRESS,
  STORAGE_DRIVER: process.env.STORAGE_DRIVER,
  LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER
});
