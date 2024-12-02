<template>
  <a-config-provider :theme="themes[appStore.theme]">
    <div class="app-container" :class="{ 'theme-dark': appStore.theme === 'dark' }">
      <a-layout :class="{ 'layout-horizontal': appStore.layout === 'horizontal' }">
        <a-layout-header class="header">
          <div class="header-content">
            <div class="logo-section">
              <div class="logo-animation"></div>
              <h1>{{ appStore.currentLocale().app.title }}</h1>
            </div>
            <div class="header-actions">
              <a-tooltip :title="t('layouts.horizontal')" placement="bottom">
                <a-button
                  class="action-button"
                  :type="appStore.layout === 'horizontal' ? 'primary' : 'text'"
                  @click="toggleLayout"
                >
                  <template #icon><ColumnHeightOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip :title="t('app.theme')" placement="bottom">
                <a-button
                  class="action-button"
                  :type="appStore.theme === 'dark' ? 'primary' : 'text'"
                  @click="toggleTheme"
                >
                  <template #icon>
                    <BulbOutlined v-if="appStore.theme === 'light'" />
                    <BulbFilled v-else />
                  </template>
                </a-button>
              </a-tooltip>
              <a-tooltip :title="t('app.language')" placement="bottom">
                <a-button
                  class="action-button"
                  :type="appStore.locale === 'en-US' ? 'primary' : 'text'"
                  @click="toggleLocale"
                >
                  <template #icon>
                    <TranslationOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </div>
          </div>
        </a-layout-header>
        <a-layout-content :style="contentStyle">
          <request-panel />
        </a-layout-content>
      </a-layout>
    </div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import RequestPanel from './components/RequestPanel.vue'
import { useAppStore } from './store/app'
import { themes } from './styles/themes'
import {
  BulbOutlined,
  BulbFilled,
  TranslationOutlined,
  ColumnHeightOutlined,
} from '@ant-design/icons-vue'

const appStore = useAppStore()

const contentStyle = computed(() => ({
  padding: '24px',
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: appStore.theme === 'dark' ? '#141414' : '#f0f5ff',
}))

const t = (key: string) => {
  const keys = key.split('.')
  let value = appStore.currentLocale()
  for (const k of keys) {
    value = value[k]
  }
  return value
}

const toggleTheme = () => {
  appStore.setTheme(appStore.theme === 'light' ? 'dark' : 'light')
}

const toggleLayout = () => {
  appStore.setLayout(appStore.layout === 'vertical' ? 'horizontal' : 'vertical')
}

const toggleLocale = () => {
  appStore.setLocale(appStore.locale === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
  transition: all 0.3s;
  background: linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%);
}

.theme-dark .app-container {
  background: linear-gradient(135deg, #141414 0%, #1f1f1f 100%);
}

.header {
  padding: 0 24px;
  background: linear-gradient(90deg, #1d39c4 0%, #2F54EB 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.theme-dark .header {
  background: linear-gradient(90deg, #141414 0%, #1f1f1f 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-animation {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  position: relative;
  animation: pulse 2s infinite;
}

.logo-animation::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  animation: ripple 2s infinite;
}

.header h1 {
  color: white;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-button:not(.ant-btn-primary) {
  color: rgba(255, 255, 255, 0.85);
  border: none;
}

.action-button:not(.ant-btn-primary):hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.action-button.ant-btn-primary {
  background: rgba(255, 255, 255, 0.2);
  border: none;
}

.action-button.ant-btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.layout-horizontal {
  display: flex;
  flex-direction: row;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }

  .header h1 {
    font-size: 16px;
  }

  .logo-animation {
    width: 24px;
    height: 24px;
  }
}
</style> 