<template>
  <section v-loading="loading">
    <el-result v-if="loadFailed" icon="error" title="阅办单加载失败">
      <template #extra><el-button @click="load">重新加载</el-button></template>
    </el-result>
    <template v-else>
      <LandSheet :ref="setSheetRef" v-model="record" :editable="canEditRegistration">
        <template #toolbar>
          <div v-if="canEditRegistration" class="registration-actions">
            <el-button type="primary" size="small" :loading="saving" @click="saveRegistration">
              保存修改
            </el-button>
          </div>
        </template>
        <tr v-for="section in sections" :key="section.nodeId">
          <th scope="row">{{ section.label }}</th>
          <td colspan="3" class="opinion-content">
            <div
              v-for="task in completedTasks(section.nodeId)"
              :key="task.id"
              class="opinion-entry"
            >
              <div class="opinion-text">{{ task.reason || '已办理' }}</div>
              <div class="opinion-signature"
                ><span>{{ task.assigneeUser?.deptName || '' }}</span
                ><span>办理人：{{ task.assigneeUser?.nickname || '—' }}</span
                ><span>{{ formatDate(task.endTime) }}</span></div
              >
            </div>
            <div v-if="canEditOpinion && activeNodeId === section.nodeId" class="opinion-editor">
              <CommentTemplatePicker
                :ref="setPickerRef"
                v-model="currentOpinion"
                :task-id="taskId"
              />
              <el-input
                v-model="currentOpinion"
                :aria-label="section.label"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 12 }"
                placeholder="请输入办理意见"
                @dblclick="pickerRef?.open()"
              />
            </div>
            <span v-else-if="!completedTasks(section.nodeId).length" class="pending-opinion">{{
              pendingCount(section.nodeId) ? `${pendingCount(section.nodeId)} 人办理中` : '—'
            }}</span>
          </td>
        </tr>
      </LandSheet>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import dayjs from 'dayjs'
import { TaskStatusEnum } from '@/api/bpm/task'
import { emptyLandRecord, landApi, LAND_REGISTER_NODE } from '@/api/bpm/land'
import { useUserStore } from '@/store/modules/user'
import { useMessage } from '@/hooks/web/useMessage'
import { useTaskOpinionDraft } from '@/hooks/bpm/useTaskOpinionDraft'
import CommentTemplatePicker from '@/components/CommentTemplatePicker/index.vue'
import LandSheet from './components/LandSheet.vue'

defineOptions({ name: 'BpmLandDetail' })
const emit = defineEmits<{ 'title-updated': [title: string] }>()
interface LandTask {
  id: string
  taskDefinitionKey?: string
  status: number
  reason?: string
  endTime?: number | string
  assigneeUser?: { id?: number; nickname?: string; deptName?: string }
}
interface LandNode {
  id: string
  name?: string
  tasks?: LandTask[]
}
const props = withDefaults(
  defineProps<{
    id?: number | string
    taskId?: string
    activityNodes?: LandNode[]
    currentNode?: LandNode
    historyMode?: boolean
  }>(),
  { activityNodes: () => [], historyMode: false }
)
const message = useMessage()
const userStore = useUserStore()
const record = ref(emptyLandRecord())
const loading = ref(false)
const saving = ref(false)
const loadFailed = ref(false)
const sheetRef = ref<InstanceType<typeof LandSheet>>()
const pickerRef = ref<InstanceType<typeof CommentTemplatePicker>>()
const setSheetRef = (element: Element | ComponentPublicInstance | null) => {
  sheetRef.value = element as InstanceType<typeof LandSheet> | undefined
}
const setPickerRef = (element: Element | ComponentPublicInstance | null) => {
  pickerRef.value = element as InstanceType<typeof CommentTemplatePicker> | undefined
}
const currentOpinion = useTaskOpinionDraft(
  () => props.taskId,
  () => props.activityNodes
)
const sections = [
  { nodeId: 'Activity_09u6oi7', label: '主办科室意见' },
  { nodeId: 'Activity_0nu44fi', label: '协办科室意见' },
  { nodeId: 'Activity_0knvtxp', label: '科室人员办理意见' },
  { nodeId: 'Activity_19v0hcm', label: '登记中心汇总意见' }
]
const activeNode = computed(
  () =>
    props.activityNodes.find((node) =>
      node.tasks?.some((task) => String(task.id) === String(props.taskId))
    ) || props.currentNode
)
const activeTask = computed(() =>
  activeNode.value?.tasks?.find((task) => String(task.id) === String(props.taskId))
)
const activeNodeId = computed(() => activeTask.value?.taskDefinitionKey || activeNode.value?.id)
// 编辑资格取自公共流程页传入的当前任务，不使用业务表状态判断。
const canHandle = computed(
  () =>
    !props.historyMode &&
    !loadFailed.value &&
    !loading.value &&
    Boolean(props.taskId) &&
    activeTask.value?.status === TaskStatusEnum.RUNNING &&
    String(activeTask.value.assigneeUser?.id) === String(userStore.getUser.id)
)
const canEditRegistration = computed(
  () => canHandle.value && activeNodeId.value === LAND_REGISTER_NODE
)
const canEditOpinion = computed(
  () => canHandle.value && sections.some((section) => section.nodeId === activeNodeId.value)
)
const tasksFor = (nodeId: string) => {
  const unique = new Map<string, LandTask>()
  for (const node of props.activityNodes)
    for (const task of node.tasks || []) {
      if ((task.taskDefinitionKey || node.id) === nodeId) unique.set(String(task.id), task)
    }
  return [...unique.values()]
}
const completedTasks = (nodeId: string) =>
  tasksFor(nodeId)
    .filter((task) => task.status === TaskStatusEnum.APPROVE)
    .sort((a, b) => dayjs(a.endTime || 0).valueOf() - dayjs(b.endTime || 0).valueOf())
const pendingCount = (nodeId: string) =>
  tasksFor(nodeId).filter((task) => task.status === TaskStatusEnum.RUNNING).length
const formatDate = (value?: number | string) => (value ? dayjs(value).format('YYYY年MM月DD日') : '')
let loadVersion = 0
const load = async () => {
  const version = ++loadVersion
  loading.value = true
  loadFailed.value = false
  try {
    const id = Number(props.id)
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('未提供有效的土地用途认定业务编号')
    const data = await landApi.get(id)
    if (version === loadVersion)
      record.value = { ...emptyLandRecord(), ...data, fileList: data.fileList || [] }
  } catch (error) {
    if (version === loadVersion) {
      loadFailed.value = true
      if (error instanceof Error) message.error(error.message)
    }
  } finally {
    if (version === loadVersion) loading.value = false
  }
}
const persistRegistration = async () => {
  if (!canEditRegistration.value) throw new Error('当前任务不能修改登记信息')
  if (!(await sheetRef.value?.validate())) throw new Error('请完善项目名称和坐落')
  const data = { ...record.value, fileList: sheetRef.value?.getFiles() || [] }
  await landApi.update(data)
  record.value = data
  emit('title-updated', data.projectName.trim())
}
const saveRegistration = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await persistRegistration()
    message.success('登记信息已保存')
  } catch (error) {
    if (error instanceof Error) message.warning(error.message)
  } finally {
    saving.value = false
  }
}
const getFormValues = async () => {
  if (loading.value || loadFailed.value) throw new Error('请先成功加载阅办单后再办理')
  if (canEditRegistration.value) await persistRegistration()
  return {}
}
watch(() => props.id, load, { immediate: true })
defineExpose({
  open: load,
  processInstanceSuccess: load,
  getOpinion: () => (canEditOpinion.value ? currentOpinion.value : undefined),
  getFormValues,
  getDetailData: () => record.value
})
</script>

<style scoped>
.registration-actions {
  display: flex;
  margin-bottom: 12px;
  justify-content: flex-end;
}

.opinion-content {
  height: 140px;
  vertical-align: top;
}

.opinion-entry + .opinion-entry {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px dashed #8cb4e0;
}

.opinion-text {
  white-space: pre-wrap;
}

.opinion-signature {
  display: flex;
  margin-top: 14px;
  font-size: 16px;
  color: #555;
  flex-wrap: wrap;
  gap: 8px 20px;
  justify-content: flex-end;
}

.opinion-editor {
  margin-top: 12px;
}

.pending-opinion {
  font-size: 14px;
  color: #909399;
}

@media print {
  .registration-actions,
  .opinion-editor {
    display: none;
  }
}
</style>
