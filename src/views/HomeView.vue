<template>
  <main>{{ page }}</main>
  <div v-for="item in langMap" :key="item.key" class="language-selector__label" @click="changeLanguage(item.value)">
    {{ item.label }}
  </div>
  <h1>Login</h1>
  <div class="form-items">
    <label for="username">{{ t('field.username') }}:</label>
    <input v-model="loginForm.Account" type="text" />
  </div>
  <div class="form-items">
    <label for="password">{{ t('field.password') }}:</label>
    <input v-model="loginForm.Password" type="password" />
  </div>
  <button type="submit" @click="handleLogin(loginForm)">Login</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from './composables';
import i18n from '@/plugins/i18n';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { loginForm, handleLogin } = useAuth();

const page = ref('home');

type Language = 'zh-TW' | 'zh-CN' | 'en-US';

const langMap: { label: string; value: Language; key: Language; display: string }[] = [
  {
    label: '繁體中文',
    value: 'zh-TW',
    key: 'zh-TW',
    display: 'TW'
  },
  {
    label: '简体中文',
    value: 'zh-CN',
    key: 'zh-CN',
    display: 'CN'
  },
  {
    label: 'English',
    value: 'en-US',
    key: 'en-US',
    display: 'EN'
  }
];

const changeLanguage = (lang: 'zh-TW' | 'zh-CN' | 'en-US') => {
  localStorage.setItem('langCode', lang);
  i18n.global.locale.value = lang;
  // refresh page
  window.location.reload();
};
</script>

<style lang="scss" scoped>
.form-items {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1rem;
  label {
    display: block;
    margin-right: 0.5rem;
    min-width: 100px;
  }
}

.language-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

  &__label {
    display: block;
    text-align: center;
    width: 100%;
    font-size: 16px;
    color: #666;
    border-radius: 4px;
    padding: 0.5rem 0;

    &:hover {
      background-color: #f0f0f0;
    }
  }
}
</style>
