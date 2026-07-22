<template>
  <ContentWrap>
    <div class="flex justify-between items-start">
      <div class="flex gap-2"> </div>

      <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px">
        <el-form-item prop="processDefinitionKey">
          <el-select
            v-model="queryParams.processDefinitionKey"
            placeholder="请选择办件类型"
            clearable
            @change="handleQuery"
            class="!w-390px"
          >
            <el-option
              v-for="item in processDefinitionList"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="processInstanceName">
          <el-input
            v-model="queryParams.processInstanceName"
            class="!w-200px"
            clearable
            placeholder="请输入办件名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="handleQuery">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-popover
            :visible="showPopover"
            persistent
            :width="400"
            :show-arrow="false"
            placement="bottom-end"
          >
            <template #reference>
              <el-button @click="showPopover = !showPopover">
                <Icon icon="ep:plus" class="mr-5px" />高级筛选
              </el-button>
            </template>

            <el-form-item label="发起时间" prop="createTime">
              <el-date-picker
                v-model="queryParams.createTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
                class="!w-full"
              />
            </el-form-item>

            <el-form-item label="办件名称" prop="processInstanceName">
              <el-input v-model="queryParams.processInstanceName" placeholder="请输入办件名称" />
            </el-form-item>

            <el-form-item label="紧急程度" prop="urgencyDegree">
              <el-select
                v-model="queryParams.urgencyDegree"
                placeholder="请选择紧急程度"
                clearable
                class="!w-full"
              >
                <el-option
                  v-for="dict in getDictOptions(DICT_TYPE.BPM_EMERGENCY_DEGREE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="办件编号" prop="processInstanceId">
              <el-input v-model="queryParams.processInstanceId" placeholder="请输入办件编号" />
            </el-form-item>

            <el-form-item label="来文单位" prop="sendingUnit">
              <el-input v-model="queryParams.sendingUnit" placeholder="请输入来文单位" />
            </el-form-item>

            <el-form-item label="环节时限" prop="dueDate">
              <el-date-picker
                v-model="queryParams.dueDate"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                start-placeholder="开始"
                end-placeholder="结束"
                class="!w-full"
              />
            </el-form-item>

            <el-form-item label="办结时限" prop="processDeadline">
              <el-date-picker
                v-model="queryParams.processDeadline"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                start-placeholder="开始"
                end-placeholder="结束"
                class="!w-full"
              />
            </el-form-item>

            <el-form-item class="font-bold" label-position="top">
              <div class="flex justify-end w-full">
                <el-button @click="resetQuery">清空</el-button>
                <el-button @click="showPopover = false">取消</el-button>
                <el-button type="primary" @click="handleQuery">确认</el-button>
              </div>
            </el-form-item>
          </el-popover>
        </el-form-item>
      </el-form>
    </div>
  </ContentWrap>

  <ContentWrap>
    <div class="mb-15px flex items-center justify-end gap-8px">
      <BpmColumnSetting
        v-model="checkedColumnKeys"
        :columns="columnOptions"
        @reset="resetColumns"
      />
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      border
      :default-sort="{ prop: 'processInstance.createTime', order: 'descending' }"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" fixed="left" resizable />
      <!--      <el-table-column v-if="visibleColumn('timeout')" label="状态" width="80" align="center" resizable>-->
      <!--        <template #header>-->
      <!--          <el-icon><Clock /></el-icon>-->
      <!--        </template>-->
      <!--        <template #default="scope">-->
      <!--          <div-->
      <!--            :style="{-->
      <!--              color: getTimeoutStatus(scope.row).color,-->
      <!--              display: 'flex',-->
      <!--              alignItems: 'center',-->
      <!--              justifyContent: 'center'-->
      <!--            }"-->
      <!--          >-->
      <!--            <el-icon style="margin-right: 5px">-->
      <!--              <Clock />-->
      <!--            </el-icon>-->
      <!--          </div>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <el-table-column
        v-if="visibleColumn('processInstanceName')"
        align="center"
        label="办件名称"
        prop="processInstance.name"
        width="250"
        sortable="custom"
        resizable
      />

      <!-- <el-table-column align="center" label="办件编号" prop="processInstanceId" width="250" /> -->

      <el-table-column
        v-if="visibleColumn('name')"
        align="center"
        label="环节名称"
        prop="name"
        width="150"
        sortable="custom"
        resizable
      />

      <el-table-column
        v-if="visibleColumn('taskName')"
        align="center"
        label="办件类型"
        prop="taskName"
        width="180"
        resizable
      />
      <el-table-column
        v-if="visibleColumn('urgencyDegree')"
        label="紧急程度"
        align="center"
        prop="urgencyDegree"
        width="120"
        sortable="custom"
        resizable
      >
        <template #default="scope">
          <dict-tag
            v-if="scope.row.urgencyDegree"
            :type="DICT_TYPE.BPM_EMERGENCY_DEGREE"
            :value="scope.row.urgencyDegree"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="visibleColumn('createTime')"
        :formatter="dateFormatter"
        align="center"
        label="发起时间"
        prop="processInstance.createTime"
        width="180"
        sortable="custom"
        resizable
      />

      <el-table-column
        v-if="visibleColumn('deadlineDate')"
        label="办结时限"
        prop="deadlineDate"
        width="180"
        align="center"
        sortable="custom"
        resizable
      >
        <template #default="scope">
          {{ formatProcessDeadline(scope.row) }}
        </template>
      </el-table-column>

      <el-table-column
        v-if="visibleColumn('endTime')"
        :formatter="dateFormatter"
        align="center"
        label="办理时间"
        prop="endTime"
        width="180"
        sortable="custom"
        resizable
      />

      <el-table-column
        v-if="visibleColumn('status')"
        align="center"
        label="办理状态"
        prop="status"
        width="120"
        resizable
      >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="visibleColumn('id')"
        label="任务编号"
        align="center"
        prop="id"
        min-width="220"
        show-overflow-tooltip
        resizable
      />
      <el-table-column
        v-if="visibleColumn('startUser')"
        label="发起人"
        align="center"
        prop="processInstance.startUser.nickname"
        width="120"
        resizable
      />
      <el-table-column
        v-if="visibleColumn('assigneeUser')"
        label="办理人"
        align="center"
        prop="assigneeUser.nickname"
        width="120"
        resizable
      />
      <el-table-column
        v-if="visibleColumn('durationInMillis')"
        label="耗时(ms)"
        align="center"
        prop="durationInMillis"
        width="120"
        sortable="custom"
        resizable
      />

      <el-table-column align="center" label="操作" fixed="right" width="150" resizable>
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.status === 2 && !scope.row.isHistory"
            link
            type="warning"
            @click="handleWithdraw(scope.row)"
            >撤回</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'
import { CategoryApi, CategoryVO } from '@/api/bpm/category'
import * as DefinitionApi from '@/api/bpm/definition'
import dayjs from 'dayjs'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import BpmColumnSetting from '@/views/bpm/components/BpmColumnSetting.vue'
import { useBpmColumnSetting } from '@/hooks/bpm/useBpmColumnSetting'

defineOptions({ name: 'BpmDoneTask' })

const { push } = useRouter()
const message = useMessage()

const getProcessDeadline = (row: any) => {
  if (row.deadlineDate) {
    return dayjs(row.deadlineDate)
  }
  const createTime = row.processInstance?.createTime
  const completionHours = row.completionTime
  if (!createTime || !completionHours) {
    return null
  }
  return dayjs(createTime).add(Number(completionHours), 'hour')
}

const formatProcessDeadline = (row: any) => {
  const deadline = getProcessDeadline(row)
  return deadline ? deadline.format('YYYY-MM-DD HH:mm:ss') : '--'
}

// --- 数据变量 ---
const loading = ref(true)
const total = ref(0)
const list = ref([])
const processDefinitionList = ref<any[]>([])
const categoryList = ref<CategoryVO[]>([])
const showPopover = ref(false)
// KeepAlive 组件首次挂载时也会触发 activated，避免首屏重复请求 done-page。
const mounted = ref(false)
const historyProcessDefinitionList = [
  { key: 'receive_doc', name: '收文', keywords: ['receive_doc', '收文'] },
  { key: 'leave', name: '请假管理', keywords: ['leave', 'oa_leave', '请假'] },
  { key: 'time_explain', name: '因公外出', keywords: ['time_explain', '公出', '外出'] },
  { key: 'confflow', name: '会议报告单', keywords: ['confflow', '会议'] },
  { key: 'xzfy', name: '行政复议', keywords: ['xzfy', '复议'] },
  { key: 'xzss', name: '行政诉讼', keywords: ['xzss', '诉讼'] }
]

const isSameBusinessDefinition = (definition: any, historyDefinition: any) => {
  const text = `${definition.key || ''}${definition.name || ''}`.toLowerCase()
  return historyDefinition.keywords.some((keyword: string) => text.includes(keyword.toLowerCase()))
}

const mergeProcessDefinitionList = (definitions: any[]) => {
  const nonHistoryDefinitions = definitions.filter(
    (definition) =>
      !historyProcessDefinitionList.some((historyDefinition) =>
        isSameBusinessDefinition(definition, historyDefinition)
      )
  )
  return [
    ...nonHistoryDefinitions,
    ...historyProcessDefinitionList.map(({ key, name }) => ({ key, name }))
  ]
}

// 查询参数 (保持与 Todo 一致的参数结构，用于后端 Filter)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  category: undefined,
  processDefinitionKey: '',
  processInstanceName: '',
  processInstanceId: '',
  urgencyDegree: undefined,
  sendingUnit: '',
  createTime: [],
  dueDate: [],
  processDeadline: [],
  orderField: 'processInstance.createTime' as string | undefined,
  orderDirection: 'desc' as string | undefined
})
const queryFormRef = ref()
const { columnOptions, checkedColumnKeys, visibleColumn, resetColumns } = useBpmColumnSetting(
  'bpm:task:done:columns',
  [
    { key: 'timeout', label: '状态标识' },
    { key: 'urgencyDegree', label: '紧急程度' },
    { key: 'processInstanceName', label: '办件名称' },
    { key: 'name', label: '环节名称' },
    { key: 'taskName', label: '办件类型' },
    { key: 'createTime', label: '发起时间' },
    { key: 'deadlineDate', label: '办结时限' },
    { key: 'endTime', label: '办理时间' },
    { key: 'status', label: '办理状态' },
    { key: 'id', label: '任务编号' },
    { key: 'startUser', label: '发起人' },
    { key: 'assigneeUser', label: '办理人' },
    { key: 'durationInMillis', label: '耗时(ms)' }
  ],
  [
    'timeout',
    'urgencyDegree',
    'processInstanceName',
    'name',
    'taskName',
    'createTime',
    'deadlineDate',
    'endTime',
    'status'
  ]
)

/** 查询已办任务列表 */
const getList = async () => {
  loading.value = true
  try {
    // 调用 Done Page 接口
    const data = await TaskApi.getTaskDonePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  showPopover.value = false
  getList()
}

const handleSortChange = ({ prop, order }: any) => {
  queryParams.orderField = order ? prop : undefined
  queryParams.orderDirection =
    order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined
  handleQuery()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  queryParams.orderField = 'processInstance.createTime'
  queryParams.orderDirection = 'desc'
  handleQuery()
}

/** 查看详情 (历史/流转记录) */
const handleDetail = (row: any) => {
  if (row.isHistory) {
    push({
      name: 'BpmHistoryWorkflowDetail',
      query: {
        processInstanceId: row.processInstance?.id || row.processInstanceId,
        projectId: row.projectId || row.processInstance?.projectId
      }
    })
    return
  }
  push({
    name: 'BpmProcessInstanceDetail',
    query: {
      id: row.processInstance.id,
      taskId: row.id // 传递 taskId 用于高亮当前节点或显示特定信息
    }
  })
}

/** 撤回操作 */
const handleWithdraw = async (row: any) => {
  try {
    await message.confirm('是否确认撤回该任务？')
    await TaskApi.withdrawTask(row.id)
    message.success('撤回成功')
    getList()
    push({
      name: 'BpmProcessInstanceDetail',
      query: {
        id: row.processInstance.id
      }
    })
  } catch {}
}

onActivated(() => {
  if (mounted.value) {
    getList()
  }
})

onMounted(async () => {
  await getList()
  mounted.value = true
  categoryList.value = await CategoryApi.getCategorySimpleList()
  const definitions = await DefinitionApi.getSimpleProcessDefinitionList()
  processDefinitionList.value = mergeProcessDefinitionList(definitions)
})
</script>
