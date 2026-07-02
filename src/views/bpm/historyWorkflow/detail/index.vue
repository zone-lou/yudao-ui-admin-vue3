<template>
  <ContentWrap :bodyStyle="{ padding: '10px 20px 0' }" class="position-relative !mb-0px">
    <div class="history-detail-main" v-loading="loading">
      <el-scrollbar>
        <div class="flex items-center items-center">
          <div class="text-26px font-bold mb-5px mr-10px">
            {{ processInfo.name || processInfo.proinstName || '历史流程详情' }}
          </div>
          <div class="flex items-center gap-5 mr-10px text-13px h-35px">
            <div
              v-if="submitterName"
              class="bg-gray-100 h-35px rounded-3xl flex items-center p-8px gap-2 dark:color-gray-600"
            >
              <el-avatar :size="28">
                {{ String(submitterName).substring(0, 1) }}
              </el-avatar>
              {{ submitterName }}
            </div>
            <div class="text-#878c93">
              {{ formatDate(processInfo.startTime || processInfo.startDate) }} 提交
            </div>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="办理单" name="form">
            <div class="history-scroll-area">
              <el-scrollbar>
                <el-row>
                  <el-col :span="24" class="!flex !flex-col formCol">
                    <div class="form-box flex flex-col mb-30px flex-1">
                      <component
                        v-if="BusinessFormComponent && businessId"
                        :is="BusinessFormComponent"
                        :key="`${business?.type || business?.businessType || 'business'}-${businessId}`"
                        :id="businessId"
                        :process-instance="processInfo"
                        :activity-nodes="activityNodesWithComments"
                        :attachments="historyAttachments"
                      />

                      <el-empty
                        v-else-if="!businessFields.length"
                        description="暂无历史业务表单数据"
                      />

                      <el-descriptions v-else :column="2" border>
                        <el-descriptions-item
                          v-for="field in businessFields"
                          :key="field.label"
                          :label="field.label"
                        >
                          {{ formatValue(field.value) }}
                        </el-descriptions-item>
                      </el-descriptions>

<!--                      <div v-if="commentGroups.length" class="history-comment-box">-->
<!--                        <div class="history-comment-main-title">历史意见</div>-->
<!--                        <div-->
<!--                          v-for="group in commentGroups"-->
<!--                          :key="group.key"-->
<!--                          class="history-comment-group"-->
<!--                        >-->
<!--                          <div class="history-comment-title">{{ group.name }}</div>-->
<!--                          <div-->
<!--                            v-for="item in group.list"-->
<!--                            :key="item.id || `${group.key}-${item.userName}-${item.commentDate}`"-->
<!--                            class="history-comment-item"-->
<!--                          >-->
<!--                            <div class="history-comment-meta">-->
<!--                              <span>{{ item.userName || '&#45;&#45;' }}</span>-->
<!--                              <span>{{ formatDate(item.commentDate) }}</span>-->
<!--                            </div>-->
<!--                            <div class="history-comment-content" v-html="item.commentDetail || '已阅'"></div>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </div>-->
                    </div>
                  </el-col>
                </el-row>
              </el-scrollbar>
            </div>
          </el-tab-pane>

          <el-tab-pane label="流转记录" name="record">
            <div class="history-scroll-area">
              <el-scrollbar>
                <el-table :data="recordList" border header-cell-class-name="table-header-gray" style="width: 100%">
                  <el-table-column label="环节名称" prop="name" width="250" align="center" fixed />
                  <el-table-column label="办理人员" width="100" align="center">
                    <template #default="scope">
                      {{
                        scope.row.assigneeUser?.nickname ||
                        scope.row.ownerUser?.nickname ||
                        scope.row.transactor ||
                        '--'
                      }}
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="办理状态" prop="status" width="100">
                    <template #default="scope">
                      <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status || 2" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    :formatter="dateFormatter"
                    align="center"
                    label="开始时间"
                    prop="createTime"
                    width="200"
                  />
                  <el-table-column
                    :formatter="dateFormatter"
                    align="center"
                    label="结束时间"
                    prop="endTime"
                    width="200"
                  />
                  <el-table-column
                    :formatter="dateFormatter"
                    align="center"
                    label="办理时限"
                    prop="dueDate"
                    width="200"
                  />
                  <el-table-column align="center" label="转入环节" width="200">
                    <template #default="scope">
                      <el-button type="primary" link icon="ep:back" @click="handleTrace(scope.row, 1)">
                        转入环节
                      </el-button>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="转出环节" width="200">
                    <template #default="scope">
                      <el-button
                        v-if="scope.row.endTime"
                        type="primary"
                        link
                        icon="ep:right"
                        @click="handleTrace(scope.row, 2)"
                      >
                        转出环节
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="!recordList.length" description="暂无流转记录" />
              </el-scrollbar>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-scrollbar>
    </div>
  </ContentWrap>

  <Dialog :title="traceType === 1 ? '转入环节' : '转出环节'" v-model="traceVisible" width="1200px">
    <el-table :data="traceNodeList" border style="width: 100%">
      <el-table-column prop="taskName" label="环节名称" align="center" />
      <el-table-column
        prop="taskName"
        :label="traceType === 1 ? '转入条件' : '转出条件'"
        align="center"
      >
        <template #default="scope">
          <span v-if="traceType === 1"> 转{{ currentClickedTaskName }} </span>
          <span v-else> 转{{ scope.row.taskName }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="assigneeName" label="办理人员" align="center" width="120" />
      <el-table-column prop="status" label="办理状态" align="center" width="120">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status || 2" />
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" align="center" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" align="center" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
    </el-table>

    <div v-if="traceType === 1 && traceNodeList.length === 0" class="text-center py-6 text-gray-500">
      <Icon icon="ep:flag" class="mr-1" /> 当前为流程起始节点 (发起点)
    </div>

    <div v-if="traceType === 2 && traceNodeList.length === 0" class="text-center py-6 text-gray-500">
      <Icon icon="ep:circle-check" class="mr-1" /> 流程已结束或无后续任务
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { registerComponent } from '@/utils/routerHelper'
import { HistoryWorkflowApi, HistoryWorkflowField } from '@/api/bpm/historyWorkflow'
import ReceiveDocDetail from '@/views/bpm/receivedoc/detail.vue'
import LeaveDetail from '@/views/bpm/leave/detail.vue'
import TimeExplainDetail from '@/views/bpm/timeexplain/detail.vue'
import ConfflowDetail from '@/views/bpm/confflow/detail.vue'
import XzfyDetail from '@/views/bpm/xzfy/detail.vue'
import XzssDetail from '@/views/bpm/xzss/detail.vue'

defineOptions({ name: 'BpmHistoryWorkflowDetail' })

const props = defineProps<{
  processInstanceId?: string
  projectId?: string
}>()

const loading = ref(false)
const activeTab = ref('form')
const detail = ref<any>({})
const BusinessFormComponent = shallowRef<any>(null)
const traceVisible = ref(false)
const traceType = ref(1)
const traceNodeList = ref<any[]>([])
const currentClickedTaskName = ref('')

const processInfo = computed(() => detail.value?.processInstance || {})
const business = computed(() => detail.value?.business || {})
const businessId = computed(() => business.value?.id)
const activityNodes = computed(() => detail.value?.activityNodes || [])
const historyComments = computed(() => detail.value?.comments || [])
const historyAttachments = computed(() => detail.value?.attachments || [])
const commentGroups = computed(() => buildCommentGroups(historyComments.value, business.value?.type))
const resolveCommentTaskId = (comment: any) => comment.closed || comment.taskId || comment.task_id || comment.id
const resolveCommentAttachmentTaskIds = (comment: any) =>
  [comment.id, comment.closed, comment.nodeName, comment.taskId, comment.task_id]
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map(String)
const activityNodesWithComments = computed(() => {
  const nodes = [...activityNodes.value]
  commentGroups.value.forEach((group) => {
    group.list.forEach((comment: any) => {
      const taskId = resolveCommentTaskId(comment)
      nodes.push({
        id: `history-comment-${comment.id || `${group.key}-${comment.closed || ''}`}`,
        name: group.name,
        endTime: comment.commentDate,
        tasks: [
          {
            id: taskId,
            attachmentTaskIds: resolveCommentAttachmentTaskIds(comment),
            commentId: comment.id,
            closed: comment.closed,
            status: 2,
            reason: comment.commentDetail || '已阅',
            endTime: comment.commentDate,
            name: group.name,
            assigneeUser: {
              id: comment.userId,
              nickname: comment.userName
            }
          }
        ]
      })
    })
  })
  return nodes
})
const recordList = computed(() => normalizeRecords(detail.value?.records || []))
const submitterName = computed(() => {
  const processSubmitter =
    processInfo.value?.startUserName || processInfo.value?.creator || processInfo.value?.intransactor
  if (processSubmitter) {
    return processSubmitter
  }
  const firstTask = recordList.value.find((item: any) => item.id !== 'StartEvent')
  return firstTask?.assigneeUser?.nickname || firstTask?.transactor || firstTask?.userName
})
const routeRecords = computed(() => detail.value?.routeRecords || [])
const recordMap = computed(() => {
  const map = new Map<string, any>()
  recordList.value.forEach((item: any) => {
    map.set(String(item.id), item)
    if (item.actinstId) {
      map.set(String(item.actinstId), item)
    }
  })
  return map
})
const businessFields = computed<HistoryWorkflowField[]>(() => {
  if (business.value?.fields?.length) {
    return business.value.fields
  }
  const data = business.value?.data
  if (!data) {
    return []
  }
  return Object.keys(data)
    .filter((key) => !['id', 'deleted', 'tenantId', 'creator', 'updater'].includes(key))
    .map((key) => ({ label: key, value: data[key] }))
})

const businessComponentMap: Record<string, any> = {
  receive_doc: ReceiveDocDetail,
  receivedoc: ReceiveDocDetail,
  receiveDoc: ReceiveDocDetail,
  leave: LeaveDetail,
  time_explain: TimeExplainDetail,
  timeExplain: TimeExplainDetail,
  confflow: ConfflowDetail,
  xzfy: XzfyDetail,
  xzss: XzssDetail
}

const commentLabelMap: Record<string, Record<string, string>> = {
  receive_doc: {
    DIRECTOR: '拟办意见',
    FUGLE: '局长批示',
    DealInfo: '分管领导批示',
    Comment: '阅办者',
    DealInfo2: '领导意见'
  },
  confflow: {
    DIRECTOR: '科室负责人意见',
    FUGLE: '分管领导意见',
    DealInfo: '主要领导意见',
    Comment: '阅办者',
    tybm: '科室负责人意见',
    fgld: '分管领导意见',
    zyld: '主要领导意见'
  },
  leave: {
    unitOpinion: '科室(单位)负责人意见',
    jbgsOpinion: '办公室意见',
    fjzOpinion: '局分管领导意见',
    cwfjzOpinion: '办公室意见',
    jzOpinion: '局主要领导意见',
    DEPT_DIRECTOR: '科室(单位)负责人意见',
    JUB_DIRECTOR: '办公室意见',
    CHARGE_DIRECTOR: '局分管领导意见',
    CORE_DIRECTOR: '办公室意见',
    JUZ_DIRECTOR: '局主要领导意见'
  },
  time_explain: {
    deptDirectorIdea: '科室(单位)负责人意见',
    jubDirectorIdea: '办公室意见',
    chargeDirectorIdea: '局分管领导意见',
    coreDirectorIdea: '局分管领导意见',
    juzDirectorIdea: '局主要领导意见',
    DEPT_DIRECTOR: '科室(单位)负责人意见',
    JUB_DIRECTOR: '办公室意见',
    CHARGE_DIRECTOR: '局分管领导意见',
    CORE_DIRECTOR: '局分管领导意见',
    JUZ_DIRECTOR: '局主要领导意见'
  },
  xzfy: {
    nb: '拟办意见',
    jz: '局长意见',
    DealInfo: '局领导意见',
    Comment: '科室单位办理意见'
  },
  xzss: {
    nb: '拟办意见',
    jz: '局长意见',
    DealInfo: '局领导意见',
    Comment: '科室单位办理意见'
  }
}

const defaultCommentLabelMap: Record<string, string> = {
  DIRECTOR: '拟办意见',
  FUGLE: '局长批示',
  DealInfo: '分管领导批示',
  DealInfo2: '领导意见',
  Comment: '阅办者',
  nb: '拟办意见',
  jz: '局长意见'
}

const buildCommentGroups = (comments: any[], businessType?: string) => {
  const groups = new Map<string, any>()
  const labels = commentLabelMap[businessType || ''] || {}
  comments
    .filter((item) => item?.commentDetail)
    .forEach((item) => {
      const key = item.formMultiRecordName || item.recordName || item.docType || '其他意见'
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name: labels[key] || defaultCommentLabelMap[key] || key,
          list: []
        })
      }
      groups.get(key).list.push(item)
    })
  return Array.from(groups.values())
}

const resolveBusinessComponent = () => {
  const type = business.value?.type || business.value?.businessType
  if (type && businessComponentMap[type]) {
    BusinessFormComponent.value = businessComponentMap[type]
    return
  }

  const viewPath = business.value?.viewPath
  if (viewPath) {
    BusinessFormComponent.value = registerComponent(viewPath.replace(/\.vue$/, ''))
    if (BusinessFormComponent.value) {
      return
    }
  }

  BusinessFormComponent.value = null
}

const formatValue = (value: any) => {
  if (value === undefined || value === null || value === '') {
    return '--'
  }
  if (Array.isArray(value)) {
    return value.join('、')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}

const normalizeRecords = (records: any[]) => {
  return records.map((record) => {
    const assigneeName =
      record.assigneeUser?.nickname || record.ownerUser?.nickname || record.transactor || record.userName
    return {
      ...record,
      id: record.id || record.actinstId || record.routeinstId,
      name: record.name || record.actinstName || record.toActinstName || '--',
      createTime: record.createTime || record.startTime || record.startDate,
      endTime: record.endTime || record.endDate || record.passTime,
      dueDate: record.dueDate || record.willFinishDate,
      status: record.status || 2,
      assigneeUser: record.assigneeUser || (assigneeName ? { nickname: assigneeName } : undefined)
    }
  })
}

const toTraceNode = (task: any) => {
  return {
    taskId: task?.id,
    taskName: task?.name || '--',
    assigneeName: task?.assigneeUser?.nickname || task?.transactor || '--',
    status: task?.status || 2,
    startTime: task?.createTime,
    endTime: task?.endTime
  }
}

const handleTrace = (row: any, type: number) => {
  traceType.value = type
  currentClickedTaskName.value = row.name
  traceVisible.value = true

  if (row.id === 'StartEvent') {
    traceNodeList.value = type === 1 ? [] : findFirstTasks().map(toTraceNode)
    return
  }

  const currentId = String(row.actinstId || row.id)
  const matchedRoutes = routeRecords.value.filter((route: any) => {
    return type === 1
      ? String(route.toActinst) === currentId
      : String(route.fromActinst) === currentId
  })

  traceNodeList.value = matchedRoutes
    .map((route: any) => {
      const targetId = type === 1 ? route.fromActinst : route.toActinst
      const task = recordMap.value.get(String(targetId))
      if (task) {
        return toTraceNode(task)
      }
      return {
        taskId: targetId,
        taskName: type === 1 ? route.fromActinstName : route.toActinstName,
        assigneeName: '--',
        status: route.status || 2,
        startTime: route.passTime,
        endTime: route.passTime
      }
    })
}

const findFirstTasks = () => {
  const incomingIds = new Set(routeRecords.value.map((route: any) => String(route.toActinst)))
  const tasks = recordList.value.filter((task: any) => task.id !== 'StartEvent')
  const firstTasks = tasks.filter((task: any) => !incomingIds.has(String(task.actinstId || task.id)))
  return firstTasks.length ? firstTasks : tasks.slice(0, 1)
}

const getDetail = async () => {
  loading.value = true
  try {
    detail.value = await HistoryWorkflowApi.getDetail({
      processInstanceId: props.processInstanceId,
      projectId: props.projectId
    })
    resolveBusinessComponent()
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.processInstanceId, props.projectId],
  () => getDetail(),
  { immediate: true }
)
</script>

<style lang="scss" scoped>
$process-header-height: 73px;

.history-detail-main {
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) + 25px
  );
  max-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) + 25px
  );
  overflow: auto;

  .history-scroll-area {
    display: flex;
    height: calc(
      100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) - 10px -
        $process-header-height - 40px
    );
    max-height: calc(
      100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) - 10px -
        $process-header-height - 40px
    );
    overflow: auto;
    flex-direction: column;
  }
}

.form-box {
  :deep(.el-card) {
    border: none;
  }
}

.history-comment-box {
  margin-top: 18px;
  border: 1px solid var(--el-border-color);
}

.history-comment-main-title {
  height: 38px;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 600;
  line-height: 38px;
  background: var(--el-fill-color-light);
}

.history-comment-group {
  border-top: 1px solid var(--el-border-color);
}

.history-comment-title {
  height: 34px;
  padding: 0 12px;
  font-weight: 600;
  line-height: 34px;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
}

.history-comment-item {
  padding: 10px 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.history-comment-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--el-color-primary);
}

.history-comment-content {
  min-height: 22px;
  line-height: 22px;
  color: var(--el-color-danger);
  white-space: pre-wrap;
}
</style>
