<template>
  <div class="theme-picker-container">
    <div class="theme-picker-panel glass-effect">
      <!-- 预设主题网格 -->
      <div class="theme-grid">
        <div
          v-for="theme in presetThemes"
          :key="theme.key"
          class="theme-block glass-effect"
          :class="{ active: currentTheme === theme.key }"
          @click="selectTheme(theme)"
        >
          <div class="theme-preview" :style="getThemePreviewStyle(theme)">
            <div class="theme-preview-content">
              <div class="preview-header" :style="{ backgroundColor: theme.colorPrimary }"></div>
              <div class="preview-body" :style="{ backgroundColor: theme.colorBg }">
                <div class="preview-line"></div>
                <div class="preview-line"></div>
              </div>
            </div>
          </div>
          <div class="theme-name">{{ theme.name }}</div>
          <check-outlined v-if="currentTheme === theme.key" class="check-icon" />
        </div>
      </div>

      <!-- 自定义主题 -->
      <div class="custom-theme-section">
        <div class="section-title">自定义主题</div>
        <div class="color-preview" :style="previewStyle">
          <div class="color-value">{{ modelValue }}</div>
          <div class="color-preview-overlay"></div>
        </div>
        <div class="custom-color-input glass-effect">
          <input
            type="color"
            :value="modelValue"
            @input="updateColor"
            class="color-input"
          />
          <span class="custom-color-text">选择颜色</span>
        </div>
        <div class="theme-options">
          <a-switch
            v-model:checked="isDark"
            checked-children="暗色"
            un-checked-children="亮色"
            class="theme-switch"
          />
        </div>
        <div class="actions">
          <a-button type="primary" @click="applyTheme" :loading="loading" class="action-button">
            应用主题
          </a-button>
          <a-button @click="resetTheme" class="action-button">重置</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { CheckOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '../store/app'
import { hexToRgba, themes } from '../styles/themes'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const loading = ref(false)
const isDark = ref(false)
const appStore = useAppStore()
const currentTheme = ref('default')

// 预设主题列表
const presetThemes = themes.map(theme => ({
  key: theme.key,
  name: theme.name,
  colorPrimary: theme.style.colorPrimary,
  colorBg: theme.style.colorBgContainer,
  colorBgLayout: theme.style.colorBgLayout,
  isDark: theme.style.colorBgContainer === '#1f1f1f'
}))

const previewStyle = computed(() => ({
  backgroundColor: props.modelValue,
  boxShadow: `0 8px 24px ${hexToRgba(props.modelValue, isDark.value ? 0.3 : 0.2)}`,
  border: `1px solid ${hexToRgba(props.modelValue, isDark.value ? 0.2 : 0.1)}`
}))

const getThemePreviewStyle = (theme: typeof presetThemes[0]) => ({
  backgroundColor: theme.colorBg,
  boxShadow: `0 8px 24px ${hexToRgba(theme.colorPrimary, theme.isDark ? 0.3 : 0.2)}`,
  border: `1px solid ${hexToRgba(theme.colorPrimary, theme.isDark ? 0.2 : 0.1)}`
})

const selectTheme = (theme: typeof presetThemes[0]) => {
  currentTheme.value = theme.key
  appStore.setTheme(theme.key)
  message.success({
    content: '主题应用成功',
    duration: 1,
    style: { marginTop: '20vh' }
  })
}

const selectColor = (color: string) => {
  const normalizedColor = color.toLowerCase()
  emit('update:modelValue', normalizedColor)
  emit('change', normalizedColor)
}

const updateColor = (e: Event) => {
  const input = e.target as HTMLInputElement
  const color = input.value.toLowerCase()
  emit('update:modelValue', color)
  emit('change', color)
}

const applyTheme = async () => {
  if (!props.modelValue) {
    message.warning({
      content: '请选择一个颜色',
      duration: 1,
      style: { marginTop: '20vh' }
    })
    return
  }

  loading.value = true
  try {
    await appStore.setCustomTheme(props.modelValue, isDark.value)
    currentTheme.value = 'custom'
    message.success({
      content: '主题应用成功',
      duration: 1,
      style: { marginTop: '20vh' }
    })
  } catch (error) {
    console.error('Theme application error:', error)
    message.error({
      content: '主题应用失败',
      duration: 1,
      style: { marginTop: '20vh' }
    })
  } finally {
    loading.value = false
  }
}

const resetTheme = () => {
  selectColor('#1890ff')
  isDark.value = false
  currentTheme.value = 'default'
  appStore.resetTheme()
  message.success({
    content: '主题已重置',
    duration: 1,
    style: { marginTop: '20vh' }
  })
}
</script>

<style scoped>
.theme-picker-container {
  position: relative;
  padding: 16px;
  perspective: 1000px;
}

.theme-picker-panel {
  background: var(--color-bg-glass);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 800px;
  transform-style: preserve-3d;
  transform: translateZ(0);
  transition: all 0.3s var(--motion-ease-in-out);
}

.glass-effect {
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--box-shadow-secondary);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  perspective: 1000px;
}

.theme-block {
  position: relative;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s var(--motion-ease-in-out);
  transform-style: preserve-3d;
}

.theme-block:hover {
  transform: translateY(-4px) translateZ(20px);
}

.theme-block.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.theme-preview {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin-bottom: 8px;
  transition: all 0.3s var(--motion-ease-in-out);
}

.theme-preview-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-header {
  height: 30%;
  width: 100%;
}

.preview-body {
  height: 70%;
  width: 100%;
  padding: 8px;
}

.preview-line {
  height: 8px;
  width: 80%;
  background: rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  border-radius: 4px;
}

.theme-name {
  font-size: 14px;
  color: var(--color-text);
  text-align: center;
  margin-top: 8px;
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--color-primary);
  font-size: 16px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s var(--motion-ease-in-out);
}

.theme-block.active .check-icon {
  opacity: 1;
  transform: scale(1);
}

.custom-theme-section {
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 16px;
}

.color-preview {
  height: 60px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s var(--motion-ease-in-out);
  transform: translateZ(20px);
}

.color-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.color-value {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  font-family: monospace;
  font-size: 16px;
  z-index: 2;
  transform: translateZ(10px);
}

.custom-color-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s var(--motion-ease-in-out);
}

.color-input {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  transition: all 0.3s var(--motion-ease-in-out);
  transform: translateZ(5px);
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 8px;
}

.custom-color-text {
  color: var(--color-text);
  font-size: 14px;
}

.theme-options {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.theme-switch {
  transition: all 0.3s var(--motion-ease-in-out);
}

.actions {
  display: flex;
  gap: 12px;
}

.action-button {
  flex: 1;
  height: 40px;
  transition: all 0.3s var(--motion-ease-in-out);
  transform: translateZ(5px);
}

.action-button:hover {
  transform: translateY(-2px) translateZ(10px);
  box-shadow: var(--box-shadow-secondary);
}

.action-button:active {
  transform: translateY(1px) translateZ(5px);
}

/* 暗色主题适配 */
:deep([data-theme='dark']) .theme-picker-panel {
  background: var(--color-bg-glass);
}

:deep([data-theme='dark']) .glass-effect {
  border-color: rgba(255, 255, 255, 0.1);
}

:deep([data-theme='dark']) .preview-line {
  background: rgba(255, 255, 255, 0.1);
}

/* 动画效果 */
@keyframes float {
  0% {
    transform: translateZ(0);
  }
  50% {
    transform: translateZ(20px);
  }
  100% {
    transform: translateZ(0);
  }
}

.theme-picker-panel {
  animation: float 6s ease-in-out infinite;
}

.theme-block {
  animation: float 4s ease-in-out infinite;
  animation-delay: calc(var(--index, 0) * 0.2s);
}
</style> 