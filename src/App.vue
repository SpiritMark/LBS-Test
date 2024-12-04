<template>
  <a-config-provider :theme="currentTheme.config">
    <div class="app-container" :style="containerStyle">
      <a-layout>
        <a-layout-sider
          class="app-sider"
          :collapsed="true"
          :trigger="null"
          collapsible
          width="64"
        >
          <div class="logo">
            <thunderbolt-outlined class="app-logo" />
          </div>
          <a-menu mode="inline" :selected-keys="[activeView]" class="nav-menu">
            <a-menu-item key="request" @click="switchView('request')" class="nav-item">
              <template #icon>
                <api-outlined />
              </template>
            </a-menu-item>
            <a-menu-item key="collection" @click="switchView('collection')" class="nav-item">
              <template #icon>
                <folder-outlined />
              </template>
            </a-menu-item>
            <a-menu-item key="history" @click="switchView('history')" class="nav-item">
              <template #icon>
                <history-outlined />
              </template>
            </a-menu-item>
          </a-menu>
          <div class="sider-footer">
            <a-button type="text" class="action-button" @click="toggleSettingsDrawer">
              <template #icon>
                <setting-outlined />
              </template>
            </a-button>
          </div>
        </a-layout-sider>
        <a-layout>
          <a-layout-header class="app-header">
            <div class="header-content">
              <div class="header-title">
                {{ t(`nav.${activeView}`) }}
              </div>
              <div class="header-actions">
                <locale-selector />
                <div class="theme-actions">
                  <a-dropdown :trigger="['click']" placement="bottomRight">
                    <a-button type="text" class="action-button">
                      <template #icon>
                        <bg-colors-outlined />
                      </template>
                    </a-button>
                    <template #overlay>
                      <a-menu class="theme-menu">
                        <a-menu-item-group :title="t('app.theme')">
                          <a-menu-item 
                            v-for="theme in themes" 
                            :key="theme.key"
                            :class="{ 'theme-item-active': theme.key === appStore.theme }"
                            @click="handleThemeChange(theme.key)"
                          >
                            <div class="theme-item">
                              <div class="theme-preview" :style="getThemePreviewStyle(theme)"></div>
                              {{ theme.name }}
                            </div>
                          </a-menu-item>
                        </a-menu-item-group>
                        <a-menu-divider />
                        <div class="custom-theme">
                          <div class="custom-theme-title">{{ t('app.customTheme') }}</div>
                          <div class="custom-theme-colors">
                            <div class="color-item">
                              <span>{{ t('app.primary') }}</span>
                              <color-picker
                                v-model="customColors.primary"
                                @update:model-value="updateCustomTheme"
                              />
                            </div>
                            <div class="color-item">
                              <span>{{ t('app.background') }}</span>
                              <color-picker
                                v-model="customColors.background"
                                @update:model-value="updateCustomTheme"
                              />
                            </div>
                          </div>
                        </div>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </div>
            </div>
          </a-layout-header>
          <a-layout-content class="app-content">
            <div class="main-content">
              <collection-panel v-show="activeView === 'collection'" />
              <history-panel v-show="activeView === 'history'" />
              <request-panel 
                v-show="activeView === 'request'"
                ref="requestPanelRef"
                @load-request="handleLoadRequest"
              />
            </div>
          </a-layout-content>
        </a-layout>
      </a-layout>

      <a-drawer
        v-model:visible="showSettingsDrawer"
        :title="t('settings.title')"
        placement="right"
        width="320"
      >
        <div class="settings-content">
          <a-divider>{{ t('settings.appearance') }}</a-divider>
          <div class="settings-section">
            <div class="settings-item">
              <span>{{ t('settings.layout') }}</span>
              <a-select
                v-model:value="appStore.layout"
                :options="layouts.map(l => ({ value: l, label: t(`layouts.${l}`) }))"
                style="width: 120px"
              />
            </div>
          </div>
        </div>
      </a-drawer>
    </div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from './store/app'
import RequestPanel from './components/RequestPanel.vue'
import CollectionPanel from './components/CollectionPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import ColorPicker from './components/ColorPicker.vue'
import LocaleSelector from './components/LocaleSelector.vue'
import { themes, getThemeConfig } from './styles/themes'
import {
  ApiOutlined,
  FolderOutlined,
  HistoryOutlined,
  BgColorsOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import type { Theme } from './styles/themes'

const { t } = useI18n()
const appStore = useAppStore()
const requestPanelRef = ref()
const activeView = ref('request')
const showSettingsDrawer = ref(false)

const layouts = ['horizontal', 'vertical'] as const

const customColors = ref({
  primary: '#1890ff',
  background: '#f0f2f5'
})

const currentTheme = computed(() => getThemeConfig(appStore.theme))

watch(() => appStore.theme, () => {
  document.body.setAttribute('data-theme', appStore.theme)
})

const containerStyle = computed(() => ({
  '--color-bg-layout': currentTheme.value.style.colorBgLayout,
  '--color-bg-container': currentTheme.value.style.colorBgContainer,
  '--color-bg-elevated': currentTheme.value.style.colorBgElevated,
  '--color-primary': currentTheme.value.style.colorPrimary,
  '--color-text': currentTheme.value.style.colorText,
  '--color-text-secondary': currentTheme.value.style.colorTextSecondary,
  '--border-radius': `${currentTheme.value.style.borderRadius}px`,
  '--box-shadow': currentTheme.value.style.boxShadow,
  '--color-border': currentTheme.value.style.colorBorder,
}))

const switchView = (view: string) => {
  activeView.value = view
}

const handleLoadRequest = (request: any) => {
  activeView.value = 'request'
  if (requestPanelRef.value) {
    requestPanelRef.value.loadRequest(request)
  }
}

const handleThemeChange = (themeKey: string) => {
  appStore.setTheme(themeKey)
}

const updateCustomTheme = () => {
  const customTheme: Theme = {
    key: 'custom',
    name: t('app.customTheme'),
    config: {
      token: {
        colorPrimary: customColors.value.primary,
        borderRadius: 8,
        colorBgLayout: customColors.value.background,
        colorBgContainer: customColors.value.background === '#141414' ? '#1f1f1f' : '#ffffff',
        colorBgElevated: customColors.value.background === '#141414' ? '#1f1f1f' : '#ffffff',
        colorText: customColors.value.background === '#141414' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
        colorTextSecondary: customColors.value.background === '#141414' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
        colorBorder: customColors.value.background === '#141414' ? '#303030' : '#f0f0f0',
        boxShadow: customColors.value.background === '#141414' ? '0 2px 8px rgba(0, 0, 0, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.15)'
      }
    },
    style: {
      colorBgContainer: customColors.value.background === '#141414' ? '#1f1f1f' : '#ffffff',
      colorBgLayout: customColors.value.background,
      colorBgElevated: customColors.value.background === '#141414' ? '#1f1f1f' : '#ffffff',
      colorPrimary: customColors.value.primary,
      colorText: customColors.value.background === '#141414' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: customColors.value.background === '#141414' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      borderRadius: 8,
      boxShadow: customColors.value.background === '#141414' ? '0 2px 8px rgba(0, 0, 0, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
      colorBorder: customColors.value.background === '#141414' ? '#303030' : '#f0f0f0'
    }
  }
  appStore.setCustomTheme(customTheme)
}

const toggleSettingsDrawer = () => {
  showSettingsDrawer.value = !showSettingsDrawer.value
}

const getThemePreviewStyle = (theme: Theme) => ({
  background: theme.style.colorBgContainer,
  borderColor: theme.style.colorPrimary
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  background: var(--color-bg-layout);
}

.app-header {
  background: var(--color-bg-elevated);
  padding: 0 16px;
  height: 48px;
  line-height: 48px;
  box-shadow: var(--box-shadow);
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-menu {
  min-width: 280px;
  padding: 12px;
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

.theme-preview {
  width: 20px;
  height: 20px;
  border: 2px solid;
  border-radius: 4px;
}

.theme-item-active {
  color: var(--color-primary) !important;
  background: var(--color-bg-layout) !important;
}

.custom-theme {
  padding: 12px;
}

.custom-theme-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--color-text);
}

.custom-theme-colors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-theme-colors .color-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.nav-item {
  margin: 0 8px !important;
  height: 48px !important;
  line-height: 48px !important;
  border-radius: 8px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent !important;
}

.nav-item:hover {
  background: var(--color-bg-layout) !important;
}

.nav-item :deep(.anticon) {
  font-size: 24px;
  transition: all 0.3s;
}

.nav-item:hover :deep(.anticon) {
  color: var(--color-primary);
}

.nav-item.ant-menu-item-selected {
  background: var(--color-primary) !important;
}

.nav-item.ant-menu-item-selected :deep(.anticon) {
  color: #fff !important;
}

.sider-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.action-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-text-secondary);
  transition: all 0.3s;
  border-radius: 8px;
  background: transparent !important;
}

.action-button:hover {
  color: var(--color-primary);
  background: var(--color-bg-layout) !important;
}

.settings-content {
  padding: 0 12px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

:deep(.ant-menu) {
  flex: 1;
  border-inline-end: none !important;
  background: transparent !important;
}

:deep(.ant-menu-inline-collapsed) {
  width: 64px !important;
}

:deep(.ant-menu-inline-collapsed .ant-menu-item) {
  padding: 0 !important;
  text-align: center;
}

:deep(.ant-menu-item) {
  color: var(--color-text-secondary);
  transition: all 0.3s;
  margin: 0 !important;
}

:deep(.ant-menu-title-content) {
  margin-inline-start: 0 !important;
}

:deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
}

.app-sider {
  background: var(--color-bg-elevated);
  box-shadow: var(--box-shadow);
  z-index: 100;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.app-logo {
  font-size: 32px;
  color: var(--color-primary);
}

.app-content {
  padding: 16px;
  overflow: auto;
}

.main-content {
  height: 100%;
  display: flex;
  gap: 16px;
}
</style> 