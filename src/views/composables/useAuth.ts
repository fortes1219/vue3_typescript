import { ref, onMounted, nextTick } from 'vue';
import { getOtp, userLogin } from '@/services/api';
import type { LoginRequest, LoginResponse } from '@/services/api';
import to from 'await-to-js';
import { apiContract } from '@/services/api';

export type LoginForm = LoginRequest;

export function useAuth() {
  const loginForm = ref<LoginForm>({
    Account: '',
    Password: '',
    OTP: ''
  });

  /**
   * @description 取得登入OTP碼
   */

  const initOtp = async () => {
    const [err, res] = await to(getOtp());
    console.log('OTP:', res);
    if (res.Code !== 200) {
      console.error('Failed to get OTP:', err);
      return;
    }
    loginForm.value.OTP = res.Data.OTP;
  };

  /**
   * @description Login
   */

  const handleLogin = async (data: LoginForm) => {
    const [err, res] = await to(userLogin(data));
    const validation = apiContract.LoginAPI.login.responses[200];
    console.log('Login request:', data);

    if (res.Code !== 200) {
      console.error('Login failed with status:', err);
      return;
    }

    if (validation.parse(res) && res.Code === 200) {
      const loginResponse: LoginResponse = res;
      console.log('Login successful:', loginResponse);
      localStorage.setItem('token', loginResponse.Data.Token);
    } else {
      console.error('Login response validation failed:', res, err);
    }
  };

  onMounted(async () => {
    await nextTick();
    initOtp();
  });

  return {
    loginForm,
    handleLogin
  };
}
