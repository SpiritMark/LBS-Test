<template>
  <div class="line-numbers" ref="lineNumbersRef">
    <div 
      v-for="n in count" 
      :key="n" 
      class="line-number"
    >
      {{ n }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number
}>()
</script>

<style scoped>
.line-numbers {
  padding: 8px 0;
  background: rgba(0, 0, 0, 0.2);
  min-width: 40px;
  text-align: right;
  user-select: none;
  overflow-y: hidden;
}

.line-number {
  padding: 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Fira Code', monospace;
}
</style> 