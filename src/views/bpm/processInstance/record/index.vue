<template>
  <ContentWrap class="process-record-page">
    <div class="record-header">
      <div>
        <div class="record-title">{{ title || '流转记录' }}</div>
        <div class="record-subtitle">仅展示当前办件的流程流转信息</div>
      </div>
      <el-button @click="handleBack">
        <Icon icon="ep:back" class="mr-5px" />
        返回
      </el-button>
    </div>

    <ProcessInstanceTaskList :loading="recordLoading" :id="id" />
  </ContentWrap>
</template>

<script setup lang="ts">
import ProcessInstanceTaskList from '@/views/bpm/processInstance/detail/ProcessInstanceTaskList.vue'
import { propTypes } from '@/utils/propTypes'
import { useRouter } from 'vue-router'

defineOptions({ name: 'BpmProcessInstanceRecord' })

defineProps({
  id: propTypes.string.def(''),
  title: propTypes.string.def('')
})

const router = useRouter()
const recordLoading = ref(false)

const handleBack = () => {
  router.back()
}

onMounted(async () => {
  await nextTick()
  recordLoading.value = true
})
</script>

<style scoped>
.process-record-page {
  min-height: calc(100vh - 140px);
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.record-title {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.record-subtitle {
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
