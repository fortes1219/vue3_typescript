import { createI18n } from 'vue-i18n';

const getStorageLangCode = (): string => {
  return localStorage.getItem('langCode') || 'en-US';
};

/**
 * 語言 JSON 未來會動態載入的關係，可以先給 {}。
 */
const i18n = createI18n({
  legacy: false, // 使用 Composition API
  globalInjection: true, // 允許在模板中直接用 $t
  locale: getStorageLangCode(), // 預設語系，可依需求變更
  fallbackLocale: 'en-US', // 沒有對應翻譯時使用的備用語系
  messages: {
    // 先給個空，之後從後端fetch後再動態 setLocaleMessage
    'zh-TW': {},
    'zh-CN': {},
    'en-US': {}
  }
});

export default i18n;
