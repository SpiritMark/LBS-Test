<template>
  <a-layout class="app-container">
    <a-layout-sider
      v-model:collapsed="sidebarCollapsed"
      class="app-sider"
      :trigger="null"
      collapsible
    >
      <div class="sidebar-content">
        <div class="sidebar-top">
          <div class="logo">
            <api-outlined class="logo-icon" />
            <span v-if="!sidebarCollapsed" class="logo-text">LBS Test</span>
          </div>
          <a-menu
            v-model:selectedKeys="selectedKeys"
            mode="inline"
            :inline-collapsed="sidebarCollapsed"
          >
            <a-menu-item key="request" @click="switchView('request')">
              <template #icon><api-outlined /></template>
              <span>{{ t('nav.request') }}</span>
            </a-menu-item>
            <a-menu-item key="collection" @click="switchView('collection')">
              <template #icon><folder-outlined /></template>
              <span>{{ t('nav.collection') }}</span>
            </a-menu-item>
            <a-menu-item key="history" @click="switchView('history')">
              <template #icon><history-outlined /></template>
              <span>{{ t('nav.history') }}</span>
            </a-menu-item>
          </a-menu>
        </div>
        
        <div class="sidebar-bottom">
          <a-menu
            mode="inline"
            :inline-collapsed="sidebarCollapsed"
            :selectedKeys="[]"
          >
            <a-menu-item key="settings" @click="switchView('settings')">
              <template #icon><setting-outlined /></template>
              <span>{{ t('nav.settings') }}</span>
            </a-menu-item>
          </a-menu>
          <div class="collapse-trigger" @click="sidebarCollapsed = !sidebarCollapsed">
            <menu-fold-outlined v-if="!sidebarCollapsed" />
            <menu-unfold-outlined v-else />
          </div>
        </div>
      </div>
    </a-layout-sider>

    <a-layout>
      <a-layout-content class="app-content">
        <request-panel
          v-show="activeView === 'request'"
          ref="requestPanelRef"
        />
        <collection-panel
          v-show="activeView === 'collection'"
          :current-request="currentRequest"
          @load="handleLoadRequest"
        />
        <history-panel
          v-show="activeView === 'history'"
          :current-request="currentRequest"
          @load="handleLoadRequest"
        />
        <settings-panel
          v-show="activeView === 'settings'"
        />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.app-container {
  height: 100vh;
}

.app-sider {
  background: var(--color-bg-container);
  border-right: 1px solid var(--color-border);
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-top {
  flex: 1;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
  color: var(--color-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
}

.sidebar-bottom {
  border-top: 1px solid var(--color-border);
}

.collapse-trigger {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  transition: color 0.3s;
}

.collapse-trigger:hover {
  color: var(--color-primary);
}

.app-content {
  padding: 16px;
  background: var(--color-bg-layout);
}
</style>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ApiOutlined,
  FolderOutlined,
  HistoryOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons-vue'
import RequestPanel from '@/components/RequestPanel.vue'
import CollectionPanel from '@/components/CollectionPanel.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { storageManager } from '@/utils/storage'
import type { UserSettings } from '@/utils/storage'

const { t } = useI18n()
const activeView = ref('request')
const selectedKeys = ref<string[]>(['request'])
const sidebarCollapsed = ref(false)
const requestPanelRef = ref()
const currentRequest = ref(null)

// 切换视图
const switchView = (view: string) => {
  activeView.value = view
  selectedKeys.value = [view]
}

// 加载请求
const handleLoadRequest = (request: any) => {
  currentRequest.value = request
  requestPanelRef.value?.loadRequest(request)
  switchView('request')
}

// 初始化
const settings = storageManager.getSettings()
sidebarCollapsed.value = settings.sidebarCollapsed

// 监听侧边栏状态变化
watch(sidebarCollapsed, (value) => {
  storageManager.saveSettings({ sidebarCollapsed: value })
})
</script> 