<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
  </header>

  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import i18n from '@/plugins/i18n';

const { locale, t } = useI18n();
const route = useRoute();
const currentLocale = localStorage.getItem('langCode') || 'en-US';

/**
 * 如果你用的是element plus，就引入他們的型別包和語言包來搭配使用
 */

// import enLocale from 'element-plus/es/locale/lang/en';
// import zhCNLocale from 'element-plus/es/locale/lang/zh-cn';
// import zhTWLocale from 'element-plus/es/locale/lang/zh-tw';
// import type { Language } from 'element-plus/es/locale';
// const currentElementLocale = ref<Language>(enLocale);

// const initLocale = () => {
//   const langCode = localStorage.getItem('langCode') || 'en-US';
//   updateElementLocale(langCode);
// };

// function updateElementLocale(lang: string) {
//   currentElementLocale.value = localeMap[lang] || enLocale;
// }

// const localeMap = {
//   'en-US': enLocale,
//   'zh-CN': zhCNLocale,
//   'zh-TW': zhTWLocale
// };

/** 針對網頁標題作監聽處理 */

// 翻譯標題
const translateTitle = () => {
  if (!route.meta.title) return '';

  const titleKey = route.meta.title as string;
  let title = t(titleKey);

  if (route.params && Object.keys(route.params).length > 0) {
    Object.keys(route.params).forEach(param => {
      const pattern = new RegExp(`{${param}}`, 'g');
      title = title.replace(pattern, route.params[param] as string);
    });
  }

  return title;
};

const updateDocumentTitle = () => {
  const title = translateTitle();
  if (title) {
    document.title = title;
  }
};

watch(
  () => route.fullPath,
  () => {
    updateDocumentTitle();
  },
  { immediate: true }
);

watch(
  () => locale.value,
  () => {
    updateDocumentTitle();
  }
);

onMounted(async () => {
  try {
    // 載入 i18n 語言包
    const localResp = await fetch(`/lang/${currentLocale}.json`);
    if (!localResp.ok) throw new Error('Local fetch i18n error');
    const localData = await localResp.json();
    i18n.global.setLocaleMessage(currentLocale, localData);
    locale.value = currentLocale;
    // initLocale(); // 初始化 Element Plus 語言包
  } catch (err) {
    console.error('初始化失敗:', err);
  }
});
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
