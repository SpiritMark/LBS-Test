<template>
  <div class="editor-area">
    <textarea
      ref="textareaRef"
      v-model="localContent"
      @input="handleInput"
      @keydown="handleKeydown"
      @scroll="handleScroll"
      spellcheck="false"
      class="editor-textarea"
    ></textarea>
    <pre 
      class="highlight-layer"
      v-html="highlightedContent"
      ref="highlightRef"
    ></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('json', json)

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:content', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const highlightRef = ref<HTMLPreElement>()
const localContent = ref(props.modelValue)

const textareaStyle = computed(() => ({
  height: `${highlightRef.value?.scrollHeight || 0}px`
}))

const highlightedContent = computed(() => {
  try {
    return hljs.highlight(localContent.value, { language: 'json' }).value
  } catch {
    return localContent.value
  }
})

const handleInput = () => {
  emit('update:modelValue', localContent.value)
  emit('update:content', localContent.value)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = textareaRef.value!.selectionStart
    const end = textareaRef.value!.selectionEnd
    
    localContent.value = 
      localContent.value.substring(0, start) + 
      '  ' + 
      localContent.value.substring(end)
      
    textareaRef.value!.selectionStart = textareaRef.value!.selectionEnd = start + 2
  }
}

const handleScroll = (e: Event) => {
  if (highlightRef.value && e.target) {
    const target = e.target as HTMLElement
    highlightRef.value.scrollTop = target.scrollTop
  }
}

// 折叠功能
const toggleFold = (start: number, end: number) => {
  const lines = localContent.value.split('\n')
  lines.splice(start + 1, end - start - 1)
  localContent.value = lines.join('\n')
}

defineExpose({ toggleFold })
</script>

<style scoped>
.editor-area {
  flex: 1;
  position: relative;
  overflow: auto;
}

.editor-textarea {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  white-space: pre;
  overflow: auto;
  z-index: 2;
}

.highlight-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 8px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  pointer-events: none;
  color: var(--color-text-primary);
  z-index: 1;
  background: transparent;
}

.editor-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-area::-webkit-scrollbar-track {
  background: transparent;
}

.editor-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.editor-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

:deep(.hljs-string) { color: #a8ff60; }
:deep(.hljs-number) { color: #ff9d00; }
:deep(.hljs-boolean) { color: #ff628c; }
:deep(.hljs-null) { color: #ff628c; }
:deep(.hljs-attr) { color: #ffd700; }
</style> 