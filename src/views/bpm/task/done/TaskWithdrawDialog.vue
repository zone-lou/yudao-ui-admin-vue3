<template>
  <el-dialog
    v-model="visible" title="撤回派发" width="min(900px, calc(100vw - 32px))"
    append-to-body destroy-on-close draggable :close-on-click-modal="false"
    :close-on-press-escape="!submitting" :before-close="beforeClose"
  >
    <el-alert type="info" :closable="false" class="mb-16px">
      请选择需要撤回的未完成人员。已办结果保留；仅当本次派发及追加全部撤销、且无人已办时，才恢复来源待办。
    </el-alert>
    <div v-loading="loading" class="min-h-[220px]">
      <el-alert v-if="loadError" type="error" :closable="false" title="加载失败，请重试">
        <el-button link type="primary" @click="load">重新加载</el-button>
      </el-alert>
      <el-table
        v-else :data="targets" :row-key="rowKey" max-height="430"
        @selection-change="selection = $event"
      >
        <el-table-column type="selection" width="50" :selectable="canSelect" />
        <el-table-column prop="nodeName" label="目标环节" min-width="150" />
        <el-table-column prop="nickname" label="办理人" min-width="120" />
        <el-table-column label="状态" min-width="200">
          <template #default="{ row }">
            <span v-if="row.withdrawable">{{ row.queued ? '等待顺序办理' : '待办理' }}</span>
            <span v-else class="text-gray-400">{{ row.disabledReason }}</span>
          </template>
        </el-table-column>
        <template #empty>没有可识别的派发记录，无法撤回；不会按时间或节点名称推测任务。</template>
      </el-table>
    </div>
    <el-form label-width="80px" class="mt-16px">
      <el-form-item label="撤回原因">
        <el-input v-model="reason" type="textarea" :rows="3" maxlength="1000" :disabled="submitting" placeholder="请输入撤回原因（选填）" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="mr-16px">已选 {{ selection.length }} 人</span>
      <el-button :disabled="submitting" @click="visible = false">取消</el-button>
      <el-button type="warning" :loading="submitting" :disabled="loading || loadError || !selection.length" @click="submit">确认撤回</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import * as TaskApi from '@/api/bpm/task'
const emit = defineEmits(['success'])
const message = useMessage()
const visible = ref(false)
const loading = ref(false)
const loadError = ref(false)
const submitting = ref(false)
const sourceTaskId = ref('')
const reason = ref('')
const targets = ref<TaskApi.WithdrawTarget[]>([])
const selection = ref<TaskApi.WithdrawTarget[]>([])
let requestVersion = 0
const rowKey = (row: TaskApi.WithdrawTarget) => `${row.executionId}:${row.nodeId}:${row.userId}`
const canSelect = (row: TaskApi.WithdrawTarget) => row.withdrawable && !submitting.value
const beforeClose = (done: () => void) => { if (!submitting.value) done() }
watch(visible, value => { if (!value) requestVersion++ })
const load = async () => {
  const version = ++requestVersion
  loading.value = true
  loadError.value = false
  selection.value = []
  targets.value = []
  try {
    const result = await TaskApi.getWithdrawTargets(sourceTaskId.value)
    if (version === requestVersion) targets.value = result
  } catch {
    if (version === requestVersion) loadError.value = true
  } finally {
    if (version === requestVersion) loading.value = false
  }
}
const open = async (taskId: string) => {
  if (submitting.value) return
  sourceTaskId.value = taskId
  reason.value = ''
  visible.value = true
  await load()
}
const submit = async () => {
  if (loading.value || submitting.value || loadError.value || !selection.value.length) return
  submitting.value = true
  try {
    await TaskApi.withdrawMembers({
      sourceTaskId: sourceTaskId.value,
      members: selection.value.map(row => ({ executionId: row.executionId, userId: row.userId })),
      reason: reason.value
    })
    message.success('撤回成功')
    visible.value = false
    emit('success')
  } catch {
    // 并发办理可能使候选状态变化，重新加载，禁止沿用旧选择重试。
    await load()
  } finally {
    submitting.value = false
  }
}
defineExpose({ open })
</script>
