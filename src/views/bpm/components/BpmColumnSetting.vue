<template>
  <el-popover trigger="click" placement="bottom-end" width="220">
    <template #reference>
      <el-button plain class="column-setting__button">
        <Icon icon="ep:setting" class="mr-5px" />
        列设置
      </el-button>
    </template>

    <div class="column-setting">
      <div class="column-setting__header">
        <span>显示列</span>
        <el-button link type="primary" @click="$emit('reset')">恢复默认</el-button>
      </div>
      <el-checkbox-group :model-value="modelValue" @update:model-value="handleChange">
        <el-checkbox
          v-for="column in columns"
          :key="column.key"
          :label="column.key"
          class="column-setting__item"
        >
          {{ column.label }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import type { BpmColumnOption } from '@/hooks/bpm/useBpmColumnSetting'

defineProps<{
  columns: BpmColumnOption[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'reset'): void
}>()

const handleChange = (value: string[]) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.column-setting {
  max-height: 360px;
  overflow: auto;
}

.column-setting__button {
  min-width: 86px;
}

.column-setting__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.column-setting__item {
  display: flex;
  margin-right: 0;
  height: 28px;
}
</style>
