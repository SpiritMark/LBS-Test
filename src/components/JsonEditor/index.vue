<template>
  <div class="json-editor-container glass-effect">
    <div class="editor-header">
      <div class="editor-title">JSON Editor</div>
      <div class="editor-actions">
        <button class="action-btn" @click="formatJson">
          <i class="icon-format"></i>
          格式化
        </button>
      </div>
    </div>
    
    <div class="editor-content">
      <LineNumbers :count="lineCount" />
      <EditorArea
        v-model="content"
        @update:content="handleContentChange"
        ref="editorRef"
      />
      <FoldingMarkers
        :foldingPoints="foldingPoints"
        @toggle="toggleFold"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LineNumbers from './LineNumbers.vue'
import EditorArea from './EditorArea.vue'
import FoldingMarkers from './FoldingMarkers.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const editorRef = ref()
const lineCount = ref(1)
const foldingPoints = ref<Array<{start: number, end: number}>>([])

const handleContentChange = (value: string) => {
  content.value = value
  lineCount.value = value.split('\n').length
  detectFoldingPoints(value)
}

const detectFoldingPoints = (text: string) => {
  // 检测可折叠点 (对象和数组的开始结束位置)
  const points = []
  const lines = text.split('\n')
  let stack = []
  
  lines.forEach((line, index) => {
    if (line.includes('{') || line.includes('[')) {
      stack.push({type: line.includes('{') ? '}' : ']', start: index})
    }
    if (line.includes('}') || line.includes(']')) {
      const last = stack.pop()
      if (last) {
        points.push({start: last.start, end: index})
      }
    }
  })
  
  foldingPoints.value = points
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(content.value)
    content.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    console.error('Invalid JSON')
  }
}

const toggleFold = (start: number, end: number) => {
  editorRef.value?.toggleFold(start, end)
}
</script>

<style scoped>
.json-editor-container {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 200%;
  overflow: hidden;
}

.editor-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.editor-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.editor-content {
  display: flex;
  flex: 1;
  height: 500px;
  overflow: hidden;
  position: relative;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>