<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h2>{{ t('settings.title') }}</h2>
    </div>
    
    <div class="settings-content">
      <div class="settings-section">
        <h3>{{ t('settings.appearance') }}</h3>
        
        <!-- 主题设置 -->
        <div class="setting-item">
          <div class="setting-label">{{ t('settings.theme') }}</div>
          <div class="theme-previews">
            <div
              v-for="theme in themes"
              :key="theme.name"
              class="theme-preview"
              :class="{ active: currentTheme === theme.name }"
              @click="handleThemeChange(theme.name)"
            >
              <div class="theme-colors">
                <div class="color-block" :style="{ background: theme.colors.primary }"></div>
                <div class="color-block" :style="{ background: theme.colors.secondary }"></div>
                <div class="color-block" :style="{ background: theme.colors.background }"></div>
              </div>
              <div class="theme-name">{{ t(`theme.${theme.name}`) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 语言设置 -->
        <div class="setting-item">
          <div class="setting-label">{{ t('settings.language') }}</div>
          <a-radio-group v-model:value="currentLocale" button-style="solid">
            <a-radio-button value="zh-CN">简体中文</a-radio-button>
            <a-radio-button value="en-US">English</a-radio-button>
          </a-radio-group>
        </div>
        
        <!-- 布局设置 -->
        <div class="setting-item">
          <div class="setting-label">{{ t('settings.layout') }}</div>
          <div class="layout-previews">
            <div
              v-for="layout in layouts"
              :key="layout.name"
              class="layout-preview"
              :class="{ active: currentLayout === layout.name }"
              @click="handleLayoutChange(layout.name)"
            >
              <div class="layout-icon" v-html="layout.icon"></div>
              <div class="layout-name">{{ t(`layout.${layout.name}`) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>{{ t('settings.editor') }}</h3>
        
        <!-- 编辑器设置 -->
        <div class="setting-item">
          <div class="setting-label">{{ t('settings.fontSize') }}</div>
          <div class="font-size-control">
            <a-button size="small" @click="decreaseFontSize">
              <template #icon><minus-outlined /></template>
            </a-button>
            <span class="font-size-value">{{ fontSize }}px</span>
            <a-button size="small" @click="increaseFontSize">
              <template #icon><plus-outlined /></template>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { storageManager } from '@/utils/storage'
import type { UserSettings } from '@/utils/storage'

const { t, locale } = useI18n()

// 主题配置
const themes = [
  {
    name: 'light',
    colors: {
      primary: '#1890ff',
      secondary: '#52c41a',
      background: '#ffffff'
    }
  },
  {
    name: 'dark',
    colors: {
      primary: '#177ddc',
      secondary: '#49aa19',
      background: '#141414'
    }
  },
  {
    name: 'system',
    colors: {
      primary: '#1890ff',
      secondary: '#52c41a',
      background: '#f0f2f5'
    }
  }
]

// 布局配置
const layouts = [
  {
    name: 'default',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/></svg>`
  },
  {
    name: 'compact',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm2 2v6h14V5H5zm0 8v6h14v-6H5z"/></svg>`
  }
]

// 当前设置
const settings = computed(() => storageManager.getSettings())
const currentTheme = computed({
  get: () => settings.value.theme,
  set: (value) => storageManager.saveSettings({ theme: value })
})
const currentLocale = computed({
  get: () => locale.value,
  set: (value) => {
    locale.value = value
    storageManager.saveSettings({ language: value })
  }
})
const currentLayout = computed({
  get: () => settings.value.layout,
  set: (value) => storageManager.saveSettings({ layout: value })
})
const fontSize = computed({
  get: () => settings.value.editor.fontSize,
  set: (value) => storageManager.saveSettings({ editor: { ...settings.value.editor, fontSize: value } })
})

// 处理主题切换
const handleThemeChange = (theme: string) => {
  currentTheme.value = theme
}

// 处理布局切换
const handleLayoutChange = (layout: string) => {
  currentLayout.value = layout
}

// 字体大小控制
const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
  }
}
</script>

<style scoped>
.settings-panel {
  height: 100%;
  background: var(--color-bg-container);
  border-radius: var(--border-radius);
  padding: 16px;
  overflow: auto;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text);
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
}

.setting-item {
  margin-bottom: 24px;
}

.setting-label {
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.theme-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.theme-preview {
  cursor: pointer;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  transition: all 0.3s;
}

.theme-preview:hover {
  border-color: var(--color-primary);
}

.theme-preview.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.theme-colors {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.color-block {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.theme-name {
  font-size: 12px;
  text-align: center;
  color: var(--color-text);
}

.layout-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.layout-preview {
  cursor: pointer;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  transition: all 0.3s;
  text-align: center;
}

.layout-preview:hover {
  border-color: var(--color-primary);
}

.layout-preview.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.layout-icon {
  margin-bottom: 8px;
  color: var(--color-text);
}

.layout-name {
  font-size: 12px;
  color: var(--color-text);
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-size-value {
  min-width: 40px;
  text-align: center;
  color: var(--color-text);
}
</style> 