import { request } from '@/services/request';
import { initContract } from '@ts-rest/core';
import z from 'zod';

import { loginSchema } from '@/services/schema/auth';
import { authContract } from '@/services/contract/auth';

export const LoginAPI = initContract().router({
  login: authContract.loginRequest
});

/* 取得登入OTP碼 */

export type OtpResponse = z.infer<typeof loginSchema.otpResponse>;

export const getOtp = async () => {
  const response = await request<OtpResponse>({
    url: authContract.getOtpResponse.path,
    method: authContract.getOtpResponse.method,
    headers: { 'Content-Type': 'text/plain' }
  });
  return response.data;
};

/* 登入 */

export type LoginRequest = z.infer<typeof loginSchema.payload>;
export type LoginResponse = z.infer<typeof loginSchema.response>;

export const userLogin = async (data: LoginRequest) => {
  const response = await request({
    url: authContract.loginRequest.path,
    method: authContract.loginRequest.method,
    headers: { 'Content-Type': 'text/plain' },
    data
  });
  return response.data;
};
