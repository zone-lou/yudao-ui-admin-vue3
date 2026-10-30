<template>
  <section v-loading="loading">
    <el-result v-if="loadFailed" icon="error" title="阅办单加载失败">
      <template #extra><el-button @click="load">重新加载</el-button></template>
    </el-result>
    <template v-else>
      <LandSheet :ref="setSheetRef" v-model="record" :editable="canEditRegistration">
        <template #toolbar>
          <div class="registration-actions">
            <CommentTemplatePicker
              v-if="canEditOpinion"
              :ref="setPickerRef"
              v-model="currentOpinion"
              :task-id="taskId"
            />
            <LandTaskAttachments
              :ref="setAttachmentsRef"
              :land-id="record.id"
              :task-id="taskId"
              :can-upload="canEditOpinion"
            />
            <el-button
              v-if="canEditRegistration"
              type="primary"
              size="small"
              :loading="saving"
              @click="saveRegistration"
              >保存修改</el-button
            >
          </div>
        </template>
        <template v-for="section in sections" :key="section.nodeId">
          <tr>
            <th scope="row" :rowspan="opinionRows(section.nodeId).length + 1">{{
              section.label
            }}</th>
            <td colspan="3" class="opinion-column-heading">办理意见</td>
            <td class="opinion-column-heading">办理人员</td>
            <td class="opinion-column-heading">办理日期</td>
          </tr>
          <tr v-for="row in opinionRows(section.nodeId)" :key="row.key" class="opinion-row">
            <td colspan="3" class="opinion-cell">
              <div v-if="row.editing" class="opinion-editor">
                <el-input
                  v-model="currentOpinion"
                  :aria-label="section.label"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 12 }"
                  placeholder="请输入办理意见"
                  @dblclick="pickerRef?.open()"
                />
              </div>
              <div v-else-if="row.task" class="opinion-text">{{ row.task.reason || '' }}</div>
            </td>
            <td class="handler-cell">{{
              row.task?.assigneeUser?.nickname || (row.editing ? userStore.getUser.nickname : '')
            }}</td>
            <td class="date-cell">
              <div class="task-date">
                <span>{{
                  row.editing ? formatDate(editingTime) : formatDate(row.task?.endTime)
                }}</span>
                <el-button
                  v-if="row.task && taskAttachmentsRef?.count(attachmentTaskIds(row.task))"
                  class="opinion-attachment-button"
                  type="primary"
                  size="small"
                  @click="taskAttachmentsRef?.show(attachmentTaskIds(row.task))"
                  >附件({{ taskAttachmentsRef?.count(attachmentTaskIds(row.task)) }})</el-button
                >
              </div>
            </td>
          </tr>
        </template>
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
import { selectOpinionTasks } from '@/hooks/bpm/taskOpinion'
import CommentTemplatePicker from '@/components/CommentTemplatePicker/index.vue'
import LandSheet from './components/LandSheet.vue'
import LandTaskAttachments from './components/LandTaskAttachments.vue'

defineOptions({ name: 'BpmLandDetail' })
const emit = defineEmits<{ 'title-updated': [title: string] }>()
interface LandTask {
  id: string
  taskDefinitionKey?: string
  status: number
  reason?: string
  endTime?: number | string
  startTime?: number | string
  createTime?: number | string
  attachmentTaskIds?: string[]
  restoredFromTaskId?: string
  assigneeUser?: { id?: number; nickname?: string; deptName?: string }
}
interface LandNode {
  id: string
  name?: string
  startTime?: number | string
  endTime?: number | string
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
const taskAttachmentsRef = ref<InstanceType<typeof LandTaskAttachments>>()
const setAttachmentsRef = (element: Element | ComponentPublicInstance | null) => {
  taskAttachmentsRef.value = element as InstanceType<typeof LandTaskAttachments> | undefined
}
const editingTime = ref(Date.now())
watch(
  () => props.taskId,
  () => {
    editingTime.value = Date.now()
  }
)
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
      if ((task.taskDefinitionKey || node.id) !== nodeId) continue
      const id = String(task.id)
      const previous = unique.get(id)
      // 公共审批详情把历史任务的时间放在外层节点，按对应任务补齐，避免多人会签日期为空。
      unique.set(id, {
        ...task,
        startTime: task.startTime ?? node.startTime ?? previous?.startTime,
        endTime: task.endTime ?? node.endTime ?? previous?.endTime
      })
    }
  return [...unique.values()]
}
// 恢复任务替代其精确来源；不能按人员去重，避免吞掉同一人的其他独立办理意见。
const visibleApprovedTaskIds = computed(
  () => new Set(selectOpinionTasks(props.activityNodes).map(({ task }) => String(task.id)))
)
const completedTasks = (nodeId: string) =>
  tasksFor(nodeId)
    .filter((task) =>
      [TaskStatusEnum.APPROVE, TaskStatusEnum.REJECT, TaskStatusEnum.RETURN].includes(task.status)
    )
    .filter(
      (task) =>
        task.status !== TaskStatusEnum.APPROVE || visibleApprovedTaskIds.value.has(String(task.id))
    )
    .sort((a, b) => dayjs(a.endTime || 0).valueOf() - dayjs(b.endTime || 0).valueOf())
const formatDate = (value?: number | string) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : ''
const attachmentTaskIds = (task: LandTask) => [
  ...new Set([String(task.id), ...(task.attachmentTaskIds || []).map(String)])
]
interface OpinionRow {
  key: string
  task?: LandTask
  editing: boolean
}
const opinionRows = (nodeId: string): OpinionRow[] => {
  const rows: OpinionRow[] = []
  if (canEditOpinion.value && activeNodeId.value === nodeId && activeTask.value) {
    rows.push({ key: `active-${activeTask.value.id}`, task: activeTask.value, editing: true })
  }
  for (const task of completedTasks(nodeId))
    rows.push({ key: String(task.id), task, editing: false })
  return rows.length ? rows : [{ key: `empty-${nodeId}`, editing: false }]
}
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
  taskAttachmentsRef.value?.validateUploads()
  if (canEditRegistration.value) await persistRegistration()
  return {}
}
watch(() => props.id, load, { immediate: true })
defineExpose({
  open: load,
  processInstanceSuccess: async () => {
    await load()
    await taskAttachmentsRef.value?.load()
  },
  getOpinion: () => (canEditOpinion.value ? currentOpinion.value : undefined),
  getFormValues,
  getDetailData: () => record.value
})
</script>

<style scoped>
.registration-actions {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.opinion-column-heading,
.handler-cell,
.date-cell {
  text-align: center;
}

.opinion-row {
  height: 70px;
}

.opinion-editor,
.opinion-text {
  padding: 6px 8px;
}

.opinion-text {
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.opinion-editor :deep(.el-textarea__inner) {
  padding: 5px 11px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.task-date {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.opinion-attachment-button {
  position: absolute;
  top: 50%;
  left: calc(100% + 20px);
  white-space: nowrap;
  transform: translateY(-50%);
}

@media print {
  .registration-actions,
  .opinion-editor,
  .opinion-attachment-button {
    display: none;
  }
}
</style>
