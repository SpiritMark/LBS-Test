<template>
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
          @click="appStore.setLayout(layout)"
        >
          {{ t(`layouts.${layout}`) }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
import { ColumnWidthOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '../store/app'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const appStore = useAppStore()
const layouts = ['horizontal', 'vertical'] as const
</script> 