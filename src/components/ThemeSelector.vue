<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <a-button type="text" class="action-button">
      <template #icon>
        <bg-colors-outlined />
      </template>
    </a-button>
    <template #overlay>
      <div class="theme-dropdown">
        <div class="theme-section">
          <div class="section-title">{{ t('themes.preset') }}</div>
          <div class="preset-themes">
            <div
              v-for="theme in themes"
              :key="theme.key"
              class="theme-item"
              :class="{ active: appStore.theme === theme.key }"
              @click="appStore.setTheme(theme.key)"
            >
              <div class="theme-preview">
                <div class="preview-color" :style="{ background: theme.style.colorPrimary }" />
                <div class="preview-bg" :style="{ background: theme.style.colorBgContainer }" />
              </div>
              <span class="theme-name">{{ theme.name }}</span>
            </div>
          </div>
        </div>

        <a-divider style="margin: 8px 0" />

        <div class="theme-section">
          <div class="section-title">{{ t('themes.custom') }}</div>
          <div class="color-picker">
            <div class="color-row">
              <span class="color-label">{{ t('themes.primary') }}</span>
              <a-popover trigger="click" placement="bottom">
                <template #content>
                  <color-picker
                    :value="customTheme.colorPrimary"
                    @change="updatePrimaryColor"
                  />
                </template>
                <div class="color-preview" :style="{ background: customTheme.colorPrimary }" />
              </a-popover>
            </div>
            <div class="color-row">
              <span class="color-label">{{ t('themes.background') }}</span>
              <a-popover trigger="click" placement="bottom">
                <template #content>
                  <color-picker
                    :value="customTheme.colorBgContainer"
                    @change="updateBgColor"
                  />
                </template>
                <div class="color-preview" :style="{ background: customTheme.colorBgContainer }" />
              </a-popover>
            </div>
          </div>
          <div class="theme-actions">
            <a-button type="primary" size="small" @click="applyCustomTheme">
              {{ t('themes.apply') }}
            </a-button>
            <a-button size="small" @click="resetCustomTheme">
              {{ t('themes.reset') }}
            </a-button>
          </div>
        </div>

        <a-divider style="margin: 8px 0" />

        <div class="theme-section">
          <div class="section-title">{{ t('themes.mode') }}</div>
          <a-radio-group v-model:value="isDarkMode" button-style="solid" size="small">
            <a-radio-button :value="false">{{ t('themes.light') }}</a-radio-button>
            <a-radio-button :value="true">{{ t('themes.dark') }}</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { BgColorsOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '../store/app'
import { themes } from '../styles/themes'
import { useI18n } from 'vue-i18n'
import ColorPicker from './ColorPicker.vue'

const { t } = useI18n()
const appStore = useAppStore()

const isDarkMode = ref(appStore.theme.includes('dark'))
const customTheme = ref({
  colorPrimary: '#1890ff',
  colorBgContainer: '#ffffff'
})

const updatePrimaryColor = (color: string) => {
  customTheme.value.colorPrimary = color
}

const updateBgColor = (color: string) => {
  customTheme.value.colorBgContainer = color
}

const applyCustomTheme = () => {
  const theme = {
    key: 'custom',
    name: t('themes.custom'),
    config: {
      token: {
        colorPrimary: customTheme.value.colorPrimary,
        borderRadius: 6
      },
      algorithm: isDarkMode.value ? 'dark' : undefined
    },
    style: {
      colorBgContainer: customTheme.value.colorBgContainer,
      colorBgLayout: isDarkMode.value ? '#141414' : '#f5f5f5',
      colorBgElevated: customTheme.value.colorBgContainer,
      colorPrimary: customTheme.value.colorPrimary,
      colorText: isDarkMode.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: isDarkMode.value ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      colorBorder: isDarkMode.value ? '#303030' : '#f0f0f0'
    }
  }
  appStore.setCustomTheme(theme)
}

const resetCustomTheme = () => {
  customTheme.value = {
    colorPrimary: '#1890ff',
    colorBgContainer: '#ffffff'
  }
  isDarkMode.value = false
}
</script>

<style scoped>
.theme-dropdown {
  background: var(--color-bg-container);
  padding: 12px;
  width: 280px;
  border-radius: var(--border-radius);
}

.theme-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.preset-themes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.theme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.theme-item:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
}

.theme-item.active {
  background: rgba(var(--color-primary-rgb), 0.1);
}

.theme-preview {
  width: 48px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  position: relative;
}

.preview-color {
  height: 12px;
}

.preview-bg {
  height: 24px;
}

.theme-name {
  font-size: 12px;
  color: var(--color-text);
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-label {
  font-size: 13px;
  color: var(--color-text);
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s;
}

.color-preview:hover {
  transform: scale(1.1);
}

.theme-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style> 