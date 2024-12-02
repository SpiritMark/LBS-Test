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
        </a-layout-sider>
        <a-layout>
          <a-layout-header class="app-header">
            <div class="header-actions">
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a-button type="text" class="action-button">
                  <template #icon>
                    <bg-colors-outlined />
                  </template>
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item 
                      v-for="theme in themes" 
                      :key="theme.key"
                      @click="appStore.setTheme(theme.key)"
                    >
                      <div class="theme-item">
                        <div class="theme-preview" :style="getThemePreviewStyle(theme)"></div>
                        {{ theme.name }}
                      </div>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a-button type="text" class="action-button">
                  <template #icon>
                    <global-outlined />
                  </template>
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item 
                      v-for="locale in locales" 
                      :key="locale"
                      @click="appStore.setLocale(locale as Locale)"
                    >
                      {{ locale === 'zh-CN' ? '中文' : 'English' }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a-button type="text" class="action-button">
                  <template #icon>
                    <column-width-outlined />
                  </template>
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item 
                      v-for="layout in layouts" 
                      :key="layout"
                      @click="appStore.setLayout(layout as 'horizontal' | 'vertical')"
                    >
                      {{ t(`layouts.${layout}`) }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
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
    </div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from './store/app'
import RequestPanel from './components/RequestPanel.vue'
import CollectionPanel from './components/CollectionPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import { themes, getThemeConfig } from './styles/themes'
import {
  ApiOutlined,
  FolderOutlined,
  HistoryOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  ColumnWidthOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import type { Locale } from './store/app'

const { t } = useI18n()
const appStore = useAppStore()
const requestPanelRef = ref()
const activeView = ref('request')

const locales = ['zh-CN', 'en-US'] as const
const layouts = ['horizontal', 'vertical'] as const

const currentTheme = computed(() => getThemeConfig(appStore.theme))

const containerStyle = computed(() => {
  const primaryColor = currentTheme.value.style.colorPrimary
  const rgb = primaryColor.match(/\w\w/g)?.map(x => parseInt(x, 16)).join(',')
  
  return {
    '--color-bg-layout': currentTheme.value.style.colorBgLayout,
    '--color-bg-container': currentTheme.value.style.colorBgContainer,
    '--color-bg-elevated': currentTheme.value.style.colorBgElevated,
    '--color-primary': primaryColor,
    '--color-primary-rgb': rgb,
    '--color-text': currentTheme.value.style.colorText,
    '--color-text-secondary': currentTheme.value.style.colorTextSecondary,
    '--border-radius': `${currentTheme.value.style.borderRadius}px`,
    '--box-shadow': currentTheme.value.style.boxShadow,
    '--color-border': currentTheme.value.style.colorBorder,
  }
})

const switchView = (view: string) => {
  activeView.value = view
}

const handleLoadRequest = (request: any) => {
  activeView.value = 'request'
  if (requestPanelRef.value) {
    requestPanelRef.value.loadRequest(request)
  }
}

const getThemePreviewStyle = (theme: typeof themes[0]) => ({
  background: theme.style.colorBgContainer,
  borderColor: theme.style.colorPrimary
})
</script>

<style>
.app-container {
  height: 100vh;
  background: var(--color-bg-layout);
}

.app-sider {
  background: var(--color-bg-elevated);
  box-shadow: var(--box-shadow);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
}

.app-logo {
  font-size: 32px;
  color: var(--color-primary);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
  flex: 1;
}

.nav-item {
  margin: 0 8px !important;
  height: 48px !important;
  line-height: 48px !important;
  border-radius: 8px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  background: rgba(var(--color-primary-rgb), 0.1) !important;
}

.nav-item :deep(.anticon) {
  font-size: 24px;
  transition: all 0.3s;
  color: var(--color-text-secondary);
}

.nav-item:hover :deep(.anticon) {
  color: var(--color-primary);
}

.nav-item.ant-menu-item-selected {
  background: rgba(var(--color-primary-rgb), 0.1) !important;
}

.nav-item.ant-menu-item-selected :deep(.anticon) {
  color: var(--color-primary) !important;
}

.sider-footer {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  border-top: 1px solid var(--color-border);
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
}

.action-button:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
}

.theme-preview {
  width: 16px;
  height: 16px;
  border: 2px solid;
  border-radius: 4px;
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

:deep(.ant-menu-inline-collapsed) {
  width: 64px !important;
}

:deep(.ant-menu-inline-collapsed .ant-menu-item) {
  padding: 0 !important;
  text-align: center;
}

:deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
}

:deep(.ant-menu) {
  border-inline-end: none !important;
  background: transparent !important;
}

:deep(.ant-menu-title-content) {
  margin-inline-start: 0 !important;
}

.app-header {
  background: var(--color-primary);
  padding: 0 16px;
  height: 48px;
  line-height: 48px;
  box-shadow: var(--box-shadow);
  z-index: 1;
}

.header-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s;
  border-radius: 6px;
}

.action-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.app-content {
  padding: 16px;
  overflow: auto;
  background: var(--color-bg-layout);
}

:deep(.ant-dropdown-menu) {
  padding: 4px;
  border-radius: 8px;
}

:deep(.ant-dropdown-menu-item) {
  border-radius: 4px;
  padding: 8px 12px;
}

:deep(.ant-dropdown-menu-item:hover) {
  background: rgba(var(--color-primary-rgb), 0.1);
}
</style> 