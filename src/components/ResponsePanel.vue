<template>
  <div class="response-panel">
    <!-- 响应状态栏 -->
    <div class="status-bar">
      <div class="status-info">
        <span class="status-code" :class="getStatusClass">{{ status || '-' }}</span>
        <span class="status-text">{{ responseTime }}ms</span>
        <span class="size-text">{{ formatSize(responseSize) }}</span>
      </div>
    </div>

    <!-- 响应内容区域 -->
    <div class="response-content">
      <!-- 行号区域 -->
      <div class="line-numbers" ref="lineNumbers">
        <div v-for="i in lineCount" :key="i" class="line-number">{{ i }}</div>
      </div>
      
      <!-- JSON内容区域 -->
      <div class="json-viewer">
        <pre class="json-content" ref="jsonContent" @scroll="syncScroll"><code v-html="highlightedContent"></code></pre>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <button @click="copyContent" class="tool-btn">
        <span class="icon">📋</span>复制
      </button>
      <button @click="downloadContent" class="tool-btn">
        <span class="icon">⬇️</span>下载
      </button>
      <button @click="formatContent" class="tool-btn">
        <span class="icon">🔍</span>格式化
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github-dark.css'

// 注册 JSON 语法高亮
hljs.registerLanguage('json', json)

const props = defineProps<{
  content: string
  status?: number
  responseSize?: number
  responseTime?: number
}>()

const jsonContent = ref<HTMLElement | null>(null)
const lineNumbers = ref<HTMLElement | null>(null)
const lineCount = ref(1)

// 格式化并高亮 JSON 内容
const highlightedContent = computed(() => {
  try {
    if (!props.content) return ''
    const parsed = JSON.parse(props.content)
    const formatted = JSON.stringify(parsed, null, 2)
    return hljs.highlight(formatted, { language: 'json' }).value
  } catch (e) {
    return props.content
  }
})

// 计算行数
watch(highlightedContent, (newContent) => {
  if (newContent) {
    lineCount.value = (newContent.match(/\n/g) || []).length + 1
  }
})

// 同步滚动
const syncScroll = (e: Event) => {
  if (lineNumbers.value && e.target) {
    const target = e.target as HTMLElement
    lineNumbers.value.scrollTop = target.scrollTop
  }
}

// 复制内容
const copyContent = () => {
  navigator.clipboard.writeText(props.content)
  message.success('已复制到剪贴板')
}

// 下载内容
const downloadContent = () => {
  const blob = new Blob([props.content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'response.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 格式化内容
const formatContent = () => {
  try {
    const parsed = JSON.parse(props.content)
    const formatted = JSON.stringify(parsed, null, 2)
    navigator.clipboard.writeText(formatted)
    message.success('已格式化并复制到剪贴板')
  } catch (e) {
    message.error('格式化失败：无效的 JSON 格式')
  }
}

// 格式化文件大小
const formatSize = (bytes?: number) => {
  if (!bytes || typeof bytes !== 'number') return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let size = Math.abs(bytes)  // 确保是正数
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${Number(size).toFixed(2)} ${units[unitIndex]}`
}

// 状态样式
const getStatusClass = computed(() => {
  if (!props.status) return ''
  if (props.status >= 200 && props.status < 300) return 'success'
  if (props.status >= 400 && props.status < 500) return 'error'
  if (props.status >= 500) return 'fatal'
  return ''
})
</script>

<style scoped>
.response-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-container);
  border-radius: 8px;
  overflow: hidden;
}

.status-bar {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--color-border);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.status-code {
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-code.success { 
  background: rgba(0, 200, 0, 0.1);
  color: #00b300; 
}

.status-code.error { 
  background: rgba(255, 0, 0, 0.1);
  color: #ff4d4d; 
}

.status-code.fatal { 
  background: rgba(128, 0, 0, 0.1);
  color: #cc0000; 
}

.response-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  background: var(--color-bg-container);
}

.line-numbers {
  padding: 8px 0;
  background: rgba(0, 0, 0, 0.02);
  border-right: 1px solid var(--color-border);
  overflow-y: hidden;
  user-select: none;
}

.line-number {
  padding: 0 8px;
  min-width: 40px;
  text-align: right;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.json-viewer {
  flex: 1;
  overflow: auto; /* 确保内容过长时可以滚动 */
  position: relative;
  padding: 8px 16px; /* 添加内边距 */
  box-sizing: border-box; /* 确保内边距和滚动条计算在内 */
}

.json-content {
  margin: 0;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre; /* 保持换行符 */
  overflow-wrap: break-word; /* 自动换行以避免内容超出 */
  word-wrap: break-word;
  word-break: break-word;
  color: var(--color-text-primary);
}


/* 添加滚动条样式 */
.json-viewer::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.json-viewer::-webkit-scrollbar-track {
  background: transparent;
}

.json-viewer::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.json-viewer::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.toolbar {
  padding: 8px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid var(--color-border);
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

.icon {
  font-size: 14px;
}

/* 暗色主题适配 */
:root[data-theme="dark"] .response-panel {
  background: var(--color-bg-container-dark);
}

:root[data-theme="dark"] .line-numbers {
  background: rgba(255, 255, 255, 0.02);
}

:root[data-theme="dark"] .tool-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* 代码高亮主题定制 */
:deep(.hljs) {
  background: transparent;
  color: var(--color-text-primary);
}

:deep(.hljs-attr) {
  color: #79b8ff;
}

:deep(.hljs-string) {
  color: #9ecbff;
}

:deep(.hljs-number) {
  color: #f8c555;
}

:deep(.hljs-boolean) {
  color: #85e89d;
}

:deep(.hljs-null) {
  color: #f97583;
}
</style>