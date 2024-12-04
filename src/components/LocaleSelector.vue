<template>
  <div class="locale-selector">
    <a-dropdown :trigger="['click']" placement="bottomRight">
      <a-button type="text" class="locale-button">
        <span class="locale-icon">{{ getLocaleInfo(currentLocale).icon }}</span>
        <span class="locale-name">{{ getLocaleInfo(currentLocale).name }}</span>
      </a-button>
      <template #overlay>
        <a-menu class="locale-menu">
          <a-menu-item
            v-for="(locale, key) in LOCALES"
            :key="key"
            @click="handleLocaleChange(key)"
            class="locale-menu-item"
          >
            <span class="locale-icon">{{ locale.icon }}</span>
            <span class="locale-name">{{ locale.name }}</span>
            <check-outlined v-if="currentLocale === key" class="check-icon" />
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from '../store/app'
import { CheckOutlined } from '@ant-design/icons-vue'

type LocaleType = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR'

const LOCALES = {
  'zh-CN': { name: '简体中文', icon: '🇨🇳' },
  'en-US': { name: 'English', icon: '🇺🇸' },
  'ja-JP': { name: '日本語', icon: '🇯🇵' },
  'ko-KR': { name: '한국어', icon: '🇰🇷' }
} as const

const appStore = useAppStore()
const currentLocale = computed(() => appStore.locale || 'zh-CN')

const getLocaleInfo = (locale: LocaleType) => {
  return LOCALES[locale] || LOCALES['zh-CN']
}

const handleLocaleChange = (locale: LocaleType) => {
  appStore.setLocale(locale)
}
</script>

<style scoped>
.locale-selector {
  position: relative;
}

.locale-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.locale-button:hover {
  background: var(--color-bg-elevated);
  transform: translateY(-1px);
}

.locale-icon {
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.locale-name {
  font-size: 14px;
  color: var(--color-text);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.locale-menu {
  min-width: 160px;
  padding: 4px;
  border-radius: 8px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.locale-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.locale-menu-item:hover {
  background: var(--color-primary);
}

.locale-menu-item:hover .locale-name {
  color: #fff;
}

.locale-menu-item:active {
  transform: scale(0.98);
}

.check-icon {
  position: absolute;
  right: 12px;
  color: var(--color-primary);
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.locale-menu-item:hover .check-icon {
  color: #fff;
}

.locale-menu-item .check-icon {
  opacity: 1;
  transform: scale(1);
}

/* 添加进入和离开动画 */
.locale-menu-enter-active,
.locale-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.locale-menu-enter-from,
.locale-menu-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 暗色主题适配 */
:deep([data-theme='dark']) .locale-menu {
  background: var(--color-bg-elevated);
  border-color: var(--color-border);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style> 