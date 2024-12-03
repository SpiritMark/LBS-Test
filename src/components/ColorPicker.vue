<template>
  <div class="color-picker">
    <div class="color-panel">
      <canvas ref="canvas" class="color-canvas" @mousedown="startPicking" />
      <div class="color-pointer" :style="pointerStyle" />
    </div>
    <div class="hue-slider">
      <div class="hue-track" ref="hueTrack" @mousedown="startPickingHue">
        <div class="hue-thumb" :style="{ left: `${hue / 360 * 100}%` }" />
      </div>
    </div>
    <div class="color-inputs">
      <div class="hex-input">
        <span class="input-label">#</span>
        <input
          v-model="hexValue"
          type="text"
          maxlength="6"
          @input="updateFromHex"
          @blur="formatHex"
        >
      </div>
      <div class="rgb-inputs">
        <input
          v-for="(value, index) in rgbValues"
          :key="index"
          type="number"
          min="0"
          max="255"
          v-model.number="rgbValues[index]"
          @input="updateFromRgb"
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'

const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const hueTrack = ref<HTMLDivElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

const hue = ref(0)
const saturation = ref(100)
const value = ref(100)
const rgbValues = ref([255, 0, 0])
const hexValue = ref('FF0000')

const pointerStyle = computed(() => ({
  left: `${saturation.value}%`,
  top: `${100 - value.value}%`
}))

// 初始化颜色面板
const initColorPanel = () => {
  if (!canvas.value || !ctx.value) return
  
  const width = canvas.value.width
  const height = canvas.value.height
  
  // 绘制颜色面板
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const s = x / width * 100
      const v = (height - y) / height * 100
      const color = hsvToRgb(hue.value, s, v)
      ctx.value.fillStyle = `rgb(${color.join(',')})`
      ctx.value.fillRect(x, y, 1, 1)
    }
  }
}

// HSV 转 RGB
const hsvToRgb = (h: number, s: number, v: number): number[] => {
  s = s / 100
  v = v / 100
  const i = Math.floor(h / 60)
  const f = h / 60 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  
  let r = 0, g = 0, b = 0
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
  }
  
  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ]
}

// RGB 转 HSV
const rgbToHsv = (r: number, g: number, b: number): number[] => {
  r = r / 255
  g = g / 255
  b = b / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  
  if (d === 0) h = 0
  else if (max === r) h = 60 * ((g - b) / d % 6)
  else if (max === g) h = 60 * ((b - r) / d + 2)
  else if (max === b) h = 60 * ((r - g) / d + 4)
  
  if (h < 0) h += 360
  
  const s = max === 0 ? 0 : d / max * 100
  const v = max * 100
  
  return [h, s, v]
}

// 更新颜色
const updateColor = () => {
  const rgb = hsvToRgb(hue.value, saturation.value, value.value)
  rgbValues.value = rgb
  hexValue.value = rgb.map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
  emit('change', `#${hexValue.value}`)
  initColorPanel()
}

// 开始拾取颜色
const startPicking = (e: MouseEvent) => {
  const pick = (e: MouseEvent) => {
    if (!canvas.value) return
    const rect = canvas.value.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))
    
    saturation.value = x / rect.width * 100
    value.value = (rect.height - y) / rect.height * 100
    updateColor()
  }
  
  pick(e)
  
  const stopPicking = () => {
    document.removeEventListener('mousemove', pick)
    document.removeEventListener('mouseup', stopPicking)
  }
  
  document.addEventListener('mousemove', pick)
  document.addEventListener('mouseup', stopPicking)
}

// 开始拾取色相
const startPickingHue = (e: MouseEvent) => {
  const pickHue = (e: MouseEvent) => {
    if (!hueTrack.value) return
    const rect = hueTrack.value.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    
    hue.value = x / rect.width * 360
    updateColor()
  }
  
  pickHue(e)
  
  const stopPickingHue = () => {
    document.removeEventListener('mousemove', pickHue)
    document.removeEventListener('mouseup', stopPickingHue)
  }
  
  document.addEventListener('mousemove', pickHue)
  document.addEventListener('mouseup', stopPickingHue)
}

// 从十六进制更新
const updateFromHex = () => {
  if (hexValue.value.length !== 6) return
  const r = parseInt(hexValue.value.slice(0, 2), 16)
  const g = parseInt(hexValue.value.slice(2, 4), 16)
  const b = parseInt(hexValue.value.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return
  
  rgbValues.value = [r, g, b]
  const hsv = rgbToHsv(r, g, b)
  hue.value = hsv[0]
  saturation.value = hsv[1]
  value.value = hsv[2]
  updateColor()
}

// 从 RGB 更新
const updateFromRgb = () => {
  const hsv = rgbToHsv(...rgbValues.value)
  hue.value = hsv[0]
  saturation.value = hsv[1]
  value.value = hsv[2]
  updateColor()
}

// 格式化十六进制值
const formatHex = () => {
  hexValue.value = hexValue.value.padEnd(6, '0').toUpperCase()
}

// 监听外部值变化
watch(() => props.value, (newValue) => {
  if (newValue.startsWith('#')) {
    hexValue.value = newValue.slice(1).toUpperCase()
    updateFromHex()
  }
}, { immediate: true })

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = 200
    canvas.value.height = 200
    ctx.value = canvas.value.getContext('2d')
    initColorPanel()
  }
})
</script>

<style scoped>
.color-picker {
  padding: 12px;
  background: var(--color-bg-container);
  border-radius: var(--border-radius);
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-panel {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
}

.color-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.color-pointer {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.hue-slider {
  padding: 8px 0;
}

.hue-track {
  position: relative;
  height: 12px;
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
  border-radius: 6px;
  cursor: pointer;
}

.hue-thumb {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.color-inputs {
  display: flex;
  gap: 8px;
}

.hex-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-bg-container);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0 8px;
}

.input-label {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.hex-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font-family: monospace;
  padding: 4px;
  width: 0;
}

.rgb-inputs {
  display: flex;
  gap: 4px;
}

.rgb-inputs input {
  width: 40px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  outline: none;
  text-align: center;
  color: var(--color-text);
  background: var(--color-bg-container);
}

.rgb-inputs input::-webkit-inner-spin-button {
  display: none;
}
</style> 