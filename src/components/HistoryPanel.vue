<template>
  <div class="history-panel">
    <div class="history-header">
      <h2>{{ t('history.title') }}</h2>
      <a-button type="primary" danger @click="clearHistory">
        {{ t('history.clear') }}
      </a-button>
    </div>

    <div class="history-list">
      <a-empty v-if="history.length === 0" :description="t('history.empty')" />
      <a-list v-else>
        <a-list-item v-for="(record, index) in history" :key="index">
          <div class="history-item">
            <div class="request-info">
              <a-tag :color="getMethodColor(record.method)">{{ record.method }}</a-tag>
              <span class="url">{{ record.url }}</span>
            </div>
            <div class="actions">
              <a-button type="primary" @click="loadRequest(record)">
                {{ t('history.load') }}
              </a-button>
            </div>
          </div>
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { HistoryManager, type HistoryRecord } from '../utils/historyManager'

const { t } = useI18n()
const router = useRouter()
const history = ref<HistoryRecord[]>([])
const historyManager = new HistoryManager()

// 加载历史记录
const loadHistory = () => {
  history.value = historyManager.getHistory()
}

// 清空历史记录
const clearHistory = () => {
  historyManager.clear()
  history.value = []
  message.success(t('history.clearSuccess'))
}

// 获取请求方法的颜色
const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'cyan'
  }
  return colors[method] || 'default'
}

// 加载请求记录
const loadRequest = async (record: HistoryRecord) => {
  try {
    // 跳转到请求页面
    await router.push('/request');
    
    // 等待一下确保组件已经挂载
    await nextTick();
    
    // 获取请求组件实例
    const requestPanel = document.querySelector('#request-panel');
    if (requestPanel && 'loadRequest' in requestPanel) {
      (requestPanel as any).loadRequest(record);
      message.success(t('history.loadSuccess'));
    } else {
      console.error('Request panel not found or loadRequest method not available');
    }
  } catch (error) {
    console.error('Failed to load request:', error);
    message.error(t('history.loadError'));
  }
};

// 添加自动刷新历史记录的功能
const refreshHistory = () => {
  history.value = historyManager.getHistory();
  console.log('History loaded:', history.value); // 添加调试日志
};

onMounted(() => {
  refreshHistory();
  // 定期刷新历史记录
  const interval = setInterval(refreshHistory, 5000);
  
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
.history-panel {
  padding: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.url {
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 8px;
}
</style> 