<template>
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
          @click="appStore.setLocale(locale)"
        >
          {{ locale === 'zh-CN' ? '中文' : 'English' }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
import { GlobalOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '../store/app'
import type { Locale } from '../store/app'

const appStore = useAppStore()
const locales = ['zh-CN', 'en-US'] as const
</script> 