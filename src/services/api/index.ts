import { initContract } from '@ts-rest/core';
import type { ClientInferRequest } from '@ts-rest/core';
import { LoginAPI } from './auth';

/**
 * @description ts-rest 驗證用的 API 合約
 */

export const apiContract = initContract().router(
  {
    LoginAPI
  }
  // {
  //   pathPrefix: '/api'
  // }
);

export type ApiContract = ClientInferRequest<typeof apiContract>;

export * from './auth';
