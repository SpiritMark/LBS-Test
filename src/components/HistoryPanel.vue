<template>
  <div class="history-panel" :class="{ 'theme-dark': appStore.theme === 'dark' }">
    <div class="history-header">
      <a-input-search
        v-model:value="searchKeyword"
        :placeholder="t('history.search')"
        class="search-input"
      />
      <a-space>
        <a-button type="primary" @click="showSaveModal">{{ t('history.save') }}</a-button>
        <a-button danger @click="confirmClear">{{ t('history.clear') }}</a-button>
      </a-space>
    </div>

    <a-list
      class="history-list"
      :data-source="filteredHistory"
      :locale="{ emptyText: t('history.noData') }"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-card :bordered="false" style="width: 100%" class="history-card">
            <template #title>
              <div class="history-item-title">
                <span class="method-tag" :style="{ background: getMethodColor(item.method) }">
                  {{ item.method }}
                </span>
                <span class="history-name">{{ item.name }}</span>
              </div>
            </template>
            <template #extra>
              <a-space>
                <a-button type="link" @click="loadRequest(item)">{{ t('history.load') }}</a-button>
                <a-button type="link" @click="editRequest(item)">{{ t('history.edit') }}</a-button>
                <a-button type="link" danger @click="confirmDelete(item)">
                  {{ t('history.delete') }}
                </a-button>
              </a-space>
            </template>
            <div class="history-item-content">
              <div class="url">{{ item.url }}</div>
              <div class="time">
                {{ formatTime(item.updatedAt) }}
              </div>
            </div>
          </a-card>
        </a-list-item>
      </template>
    </a-list>

    <!-- 保存请求模态框 -->
    <a-modal
      v-model:visible="saveModalVisible"
      :title="t('history.saveRequest')"
      @ok="saveRequest"
      :okText="currentRequest ? t('history.edit') : t('history.save')"
      :cancelText="t('request.cancel')"
      class="save-modal"
    >
      <a-input
        v-model:value="requestName"
        :placeholder="t('history.enterName')"
        @pressEnter="saveRequest"
      />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../store/app'
import { HistoryManager } from '../utils/historyManager'
import type { RequestHistory } from '../types/history'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'

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

const appStore = useAppStore()
const t = (key: string) => {
  const keys = key.split('.')
  let value = appStore.currentLocale()
  for (const k of keys) {
    value = value[k]
  }
  return value
}

const historyManager = new HistoryManager()
const history = ref<RequestHistory[]>([])
const searchKeyword = ref('')
const saveModalVisible = ref(false)
const requestName = ref('')
const currentEditId = ref<string | null>(null)

const filteredHistory = computed(() => {
  if (!searchKeyword.value) return history.value
  return historyManager.search(searchKeyword.value)
})

const loadHistory = () => {
  history.value = historyManager.getAll()
}

onMounted(() => {
  loadHistory()
})

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const showSaveModal = () => {
  currentEditId.value = null
  requestName.value = ''
  saveModalVisible.value = true
}

const saveRequest = () => {
  if (!requestName.value.trim()) {
    message.error(t('history.enterName'))
    return
  }

  try {
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
    loadHistory()
  } catch (error) {
    message.error(String(error))
  }
}

const editRequest = (item: RequestHistory) => {
  currentEditId.value = item.id
  requestName.value = item.name
  saveModalVisible.value = true
}

const loadRequest = (item: RequestHistory) => {
  emit('load', item)
}

const confirmDelete = (item: RequestHistory) => {
  Modal.confirm({
    title: t('history.confirmDelete'),
    content: t('history.deleteMessage'),
    onOk: () => {
      historyManager.delete(item.id)
      message.success(t('history.deleteSuccess'))
      loadHistory()
    },
  })
}

const confirmClear = () => {
  Modal.confirm({
    title: t('history.confirmClear'),
    content: t('history.clearMessage'),
    onOk: () => {
      historyManager.clear()
      message.success(t('history.clearSuccess'))
      loadHistory()
    },
  })
}

// 添加方法颜色映射函数
const getMethodColor = (method: string) => {
  const colors = {
    GET: '#1890ff',
    POST: '#52c41a',
    PUT: '#faad14',
    DELETE: '#f5222d',
    PATCH: '#722ed1',
  }
  return colors[method as keyof typeof colors] || '#1890ff'
}
</script>

<style scoped>
.history-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  transition: all 0.3s;
  overflow: hidden;
}

.theme-dark.history-panel {
  background: rgba(255, 255, 255, 0.02);
}

.history-header {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.theme-dark .history-header {
  background: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.search-input {
  width: 100%;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.history-card {
  border-radius: 8px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.8);
}

.theme-dark .history-card {
  background: rgba(0, 0, 0, 0.2);
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-dark .history-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.history-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-tag {
  padding: 2px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.history-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-dark .history-name {
  color: rgba(255, 255, 255, 0.85);
}

.history-item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url {
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  word-break: break-all;
}

.time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.theme-dark .url,
.theme-dark .time {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-list-item) {
  padding: 0;
  margin-bottom: 8px;
}

.save-modal {
  :deep(.ant-modal-content) {
    border-radius: 16px;
  }
}

:deep(.ant-input-search) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-card-head) {
  min-height: 48px;
  padding: 0 12px;
  border-bottom: none;
}

:deep(.ant-card-body) {
  padding: 12px;
}

:deep(.ant-list-empty-text) {
  padding: 24px;
  color: rgba(0, 0, 0, 0.25);
}

.theme-dark :deep(.ant-list-empty-text) {
  color: rgba(255, 255, 255, 0.25);
}
</style> 