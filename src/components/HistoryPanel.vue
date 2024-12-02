<template>
  <div class="history-panel">
    <div class="history-header">
      <h2>{{ t('history.title') }}</h2>
      <a-button type="text" @click="clearHistory">{{ t('history.clear') }}</a-button>
    </div>
    <div class="history-content">
      <a-empty v-if="history.length === 0" :description="t('history.empty')" />
      <a-list v-else>
        <a-list-item v-for="item in history" :key="item.id">
          <div class="history-item">
            <div class="history-item-header">
              <span class="history-item-name">{{ item.name || item.url }}</span>
              <div class="history-item-actions">
                <a-button type="text" @click="editRequest(item)">
                  <template #icon><edit-outlined /></template>
                </a-button>
                <a-button type="text" @click="deleteRequest(item)">
                  <template #icon><delete-outlined /></template>
                </a-button>
              </div>
            </div>
            <div class="history-item-info">
              <a-tag :color="getMethodColor(item.method)">{{ item.method }}</a-tag>
              <span class="history-item-url">{{ item.url }}</span>
            </div>
            <div class="history-item-time">
              {{ new Date(item.updatedAt).toLocaleString() }}
            </div>
          </div>
        </a-list-item>
      </a-list>
    </div>

    <a-modal
      v-model:visible="saveModalVisible"
      :title="t('history.save')"
      @ok="saveRequest"
    >
      <a-form>
        <a-form-item :label="t('history.name')">
          <a-input v-model:value="requestName" :placeholder="t('history.namePlaceholder')" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../store/app'
import { useI18n } from 'vue-i18n'
import { message, Modal } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { RequestHistory } from '../types/history'
import { HistoryManager } from '../utils/historyManager'

const { t } = useI18n()
const appStore = useAppStore()
const historyManager = new HistoryManager()
const history = ref<RequestHistory[]>([])
const saveModalVisible = ref(false)
const requestName = ref('')
const currentEditId = ref('')

const props = defineProps<{
  currentRequest: {
    method: string
    url: string
    headers: { key: string; value: string }[]
    params: { key: string; value: string }[]
    bodyType: 'none' | 'json' | 'form-data'
    jsonBody?: string
    formData?: { key: string; value: string }[]
  }
}>()

const emit = defineEmits<{
  (e: 'load', request: RequestHistory): void
}>()

const loadHistory = () => {
  history.value = historyManager.getAll()
}

onMounted(() => {
  loadHistory()
})

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: '#61affe',
    POST: '#49cc90',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#50e3c2',
    HEAD: '#9012fe',
    OPTIONS: '#0d5aa7'
  }
  return colors[method] || '#666'
}

const saveRequest = () => {
  if (!requestName.value.trim()) {
    message.error(t('history.nameRequired'))
    return
  }

  if (currentEditId.value) {
    historyManager.update(currentEditId.value, {
      name: requestName.value,
      ...props.currentRequest,
    })
    message.success(t('history.updateSuccess'))
  } else {
    historyManager.add({
      name: requestName.value,
      ...props.currentRequest,
    })
    message.success(t('history.saveSuccess'))
  }

  saveModalVisible.value = false
  requestName.value = ''
  currentEditId.value = ''
  loadHistory()
}

const editRequest = (item: RequestHistory) => {
  currentEditId.value = item.id
  requestName.value = item.name
  saveModalVisible.value = true
}

const deleteRequest = (item: RequestHistory) => {
  Modal.confirm({
    title: t('history.deleteTitle'),
    content: t('history.deleteMessage'),
    onOk: () => {
      historyManager.delete(item.id)
      message.success(t('history.deleteSuccess'))
      loadHistory()
    },
  })
}

const clearHistory = () => {
  Modal.confirm({
    title: t('history.clearTitle'),
    content: t('history.clearMessage'),
    onOk: () => {
      historyManager.clear()
      message.success(t('history.clearSuccess'))
      loadHistory()
    },
  })
}
</script>

<style scoped>
.history-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-container);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.history-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.history-header h2 {
  margin: 0;
  color: var(--color-text);
}

.history-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.history-item {
  width: 100%;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-item-name {
  font-weight: 500;
  color: var(--color-text);
}

.history-item-actions {
  display: flex;
  gap: 8px;
}

.history-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.history-item-url {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.history-item-time {
  color: var(--color-text-secondary);
  font-size: 12px;
}

:deep(.ant-list-item) {
  padding: 16px !important;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

:deep(.ant-list-item:hover) {
  background: var(--color-bg-layout);
}
</style> 