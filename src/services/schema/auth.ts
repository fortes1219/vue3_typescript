import { z } from 'zod';

const otpResponseSchema = z.object({
  Code: z.number(),
  Msg: z.string(),
  Data: z.object({
    OTP: z.string()
  }),
  TotalCount: z.number().optional()
});

const loginRequestSchema = z.object({
  Account: z.string(),
  Password: z.string(),
  OTP: z.string().optional()
});

const commonResponseSchema = z.object({
  Code: z.number(),
  Msg: z.string(),
  Data: z.object({}).passthrough()
});

const loginResponseSchema = z.object({
  ...commonResponseSchema.shape,
  Data: z.object({
    Token: z.string(),
    Info: z.object({
      ID: z.number(),
      DeletedAt: z.nullable(z.number()), // null | number
      CreatedAt: z.nullable(z.number()),
      Account: z.string(),
      Password: z.string(),
      OTP: z.string(),
      Name: z.string(),
      Email: z.string(),
      Phone: z.string()
    })
  })
});

export const loginSchema = {
  otpResponse: otpResponseSchema,
  payload: loginRequestSchema,
  response: loginResponseSchema
};
