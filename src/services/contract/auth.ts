import { loginSchema } from '@/services/schema';
import type { AppRoute } from '@ts-rest/core';

export const getOtpResponse = {
  method: 'GET',
  path: '/admin/otp', // 根據實際 API 路徑調整
  responses: {
    200: loginSchema.otpResponse
  },
  summary: 'Login'
} satisfies AppRoute;

export const loginRequest = {
  method: 'POST',
  path: '/admin/login',
  body: loginSchema.payload,
  summary: 'Logout',
  responses: {
    200: loginSchema.response
  }
} satisfies AppRoute;

export const authContract = {
  getOtpResponse,
  loginRequest
} satisfies Record<string, AppRoute>;
