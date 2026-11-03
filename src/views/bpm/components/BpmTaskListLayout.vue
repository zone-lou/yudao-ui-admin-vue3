<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const pageHeight = computed(() => {
  const tagsHeight = appStore.getTagsView ? 'var(--tags-view-height)' : '0px'
  const footerHeight = appStore.getFooter ? 'var(--app-footer-height)' : '0px'
  const paddingCount = appStore.getFooter ? 1 : 2
  return `calc(100vh - var(--top-tool-height) - ${tagsHeight} - ${footerHeight} - var(--app-content-padding) * ${paddingCount})`
})
</script>

<template>
  <div class="bpm-task-list-layout" :style="{ height: pageHeight }">
    <slot></slot>
  </div>
</template>

<style scoped>
.bpm-task-list-layout {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.bpm-task-list-layout > :deep(.el-card:first-child) {
  flex-shrink: 0;
}

.bpm-task-list-layout > :deep(.el-card:last-child) {
  display: flex;
  min-height: 0;
  margin-bottom: 0;
  flex: 1;
  flex-direction: column;
}

.bpm-task-list-layout > :deep(.el-card:last-child > .el-card__body) {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

:deep(.bpm-task-table) {
  min-height: 0;
  flex: 1;
}

:deep(.el-pagination) {
  flex-shrink: 0;
  align-self: flex-end;
}
</style>
