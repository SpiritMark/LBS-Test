<template>
  <div class="folding-markers">
    <div 
      v-for="point in foldingPoints" 
      :key="`${point.start}-${point.end}`"
      class="fold-marker"
      :style="{ top: `${point.start * 21}px` }"
      @click="$emit('toggle', point.start, point.end)"
    >
      <i class="icon-fold"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  foldingPoints: Array<{start: number, end: number}>
}>()

defineEmits<{
  (e: 'toggle', start: number, end: number): void
}>()
</script>

<style scoped>
.folding-markers {
  position: absolute;
  left: 40px;
  top: 0;
  width: 12px;
  height: 100%;
}

.fold-marker {
  position: absolute;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s;
}

.fold-marker:hover {
  color: rgba(255, 255, 255, 0.8);
}
</style> 