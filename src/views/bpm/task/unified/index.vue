<template>
  <ContentWrap>
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="auto">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="办件名称" prop="name" class="w-full">
            <el-input
              v-model="queryParams.name"
              placeholder="模糊搜索"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="办件编号" prop="processInstanceId" class="w-full">
            <el-input
              v-model="queryParams.processInstanceId"
              placeholder="精确编号"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="来文单位" prop="startDeptName" class="w-full">
            <el-input
              v-model="queryParams.startDeptName"
              placeholder="模糊搜索单位"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="超期天数" prop="overdueDays" class="w-full">
            <el-input-number
              v-model="queryParams.overdueDays"
              :min="1"
              controls-position="right"
              placeholder="已超期多少天"
              class="w-full"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="办件类型" prop="processDefinitionKey" class="w-full">
            <el-select
              v-model="queryParams.processDefinitionKey"
              placeholder="请选择类型"
              clearable
              @change="handleQuery"
              class="w-full"
            >
              <el-option
                v-for="item in processDefinitionList"
                :key="item.key"
                :label="item.name"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="办理状态" prop="status" class="w-full">
            <el-select v-model="queryParams.status" placeholder="全部" clearable class="w-full">
              <el-option label="办理中" :value="1" />
              <el-option label="已办结" :value="2" />
              <el-option label="审批不通过" :value="3" />
              <el-option label="已取消" :value="4" />
              <el-option label="已作废" :value="5" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="数据类型" prop="dataType" class="w-full">
            <el-select
              v-model="queryParams.dataType"
              placeholder="全部"
              clearable
              class="w-full"
            >
              <el-option label="现有数据" value="现有数据" />
              <el-option label="历史已办结" value="历史已办结" />
              <el-option label="历史未办结" value="历史未办结" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="受理日期" prop="createTime" class="w-full">
            <el-date-picker
              v-model="queryParams.createTime"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" class="text-right">
          <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" />查询</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
        </el-col>
      </el-row>
    </el-form>
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
      stripe
      highlight-current-row
      height="600"
      style="width: 100%"
      border
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序号" width="55" align="center" fixed="left" resizable />

      <el-table-column
        v-if="visibleColumn('name')"
        label="办件名称"
        align="left"
        prop="name"
        width="300"
        fixed="left"
        show-overflow-tooltip
        sortable="custom"
        resizable
      >
        <template #default="scope">
          <span class="link-type" @click="handleDetail(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="visibleColumn('category')" label="办件类型" align="center" prop="category" width="120" sortable="custom" resizable />
      <el-table-column
        v-if="visibleColumn('sourceUnit')"
        label="来文单位"
        align="center"
        prop="sourceUnit"
        width="150"
        show-overflow-tooltip
        sortable="custom"
        resizable
      >
        <template #default="scope"> {{ scope.row.sourceUnit || '-' }} </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('source')" label="来源" align="center" prop="source" width="130" sortable="custom" resizable>
        <template #default="scope">
          <el-tag v-if="scope.row.source" effect="plain">{{ scope.row.source }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('urgencyDegree')" label="紧急程度" align="center" prop="urgencyDegree" width="120" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.urgencyDegree"
            :type="DICT_TYPE.BPM_EMERGENCY_DEGREE"
            :value="scope.row.urgencyDegree"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('createTime')" label="开始日期" align="center" prop="createTime" width="160" sortable="custom" resizable>
        <template #default="scope"
          ><span>{{ parseTime(scope.row.createTime, 'YYYY-MM-DD HH:mm') }}</span></template
        >
      </el-table-column>
      <el-table-column v-if="visibleColumn('deadlineDate')" label="办结时限" align="center" prop="deadlineDate" width="160" sortable="custom" resizable>
        <template #default="scope"
          ><span>{{ parseTime(scope.row.deadlineDate, 'YYYY-MM-DD HH:mm') || '-' }}</span></template
        >
      </el-table-column>

      <el-table-column v-if="visibleColumn('status')" label="办件状态" align="center" prop="status" width="120" sortable="custom" resizable>
        <template #default="scope">
          <el-tooltip
            :content="scope.row.processReason || '无详细原因'"
            placement="top"
            :disabled="!scope.row.processReason"
          >
            <div style="display: inline-block">
              <el-tag v-if="scope.row.status === 1" type="primary" effect="plain">办理中</el-tag>
              <el-tag v-else-if="scope.row.status === 2" type="success">已办结</el-tag>
              <el-tag v-else-if="scope.row.status === 3" type="danger">审批不通过</el-tag>
              <el-tag v-else-if="scope.row.status === 4" type="info">已取消</el-tag>
              <el-tag v-else-if="scope.row.status === 5" type="info">已作废</el-tag>
              <el-tag v-else type="danger">异常结束</el-tag>
            </div>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column
        v-if="visibleColumn('currTaskName')"
        label="在办环节"
        align="center"
        prop="currTaskName"
        width="150"
        show-overflow-tooltip
        sortable="custom"
        resizable
      >
        <template #default="scope">
          <span v-if="scope.row.status === 1" style="color: #409eff">{{
            scope.row.currTaskName
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="visibleColumn('currTaskAssignee')"
        label="在办人员"
        align="center"
        prop="currTaskAssignee"
        width="120"
        show-overflow-tooltip
        sortable="custom"
        resizable
      >
        <template #default="scope">
          <span v-if="scope.row.status === 1">{{ scope.row.currTaskAssignee }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('dataType')" label="数据类型" align="center" prop="dataType" width="130" sortable="custom" resizable>
        <template #default="scope">
          <el-tag
            :type="scope.row.dataType === '现有数据' ? 'primary' : scope.row.dataType === '历史已办结' ? 'success' : 'warning'"
            effect="plain"
          >
            {{ scope.row.dataType }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getUnifiedProcessInstancePage } from '@/api/bpm/processInstance'
import * as DefinitionApi from '@/api/bpm/definition'
import { DICT_TYPE } from '@/utils/dict'
import BpmColumnSetting from '@/views/bpm/components/BpmColumnSetting.vue'
import { useBpmColumnSetting } from '@/hooks/bpm/useBpmColumnSetting'

defineOptions({ name: 'BpmProcessInstanceList' })
const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const processDefinitionList = ref<any[]>([])
const { columnOptions, checkedColumnKeys, visibleColumn, resetColumns } = useBpmColumnSetting(
  'bpm:task:unified:columns',
  [
    { key: 'name', label: '办件名称' },
    { key: 'category', label: '办件类型' },
    { key: 'sourceUnit', label: '来文单位' },
    { key: 'source', label: '来源' },
    { key: 'urgencyDegree', label: '紧急程度' },
    { key: 'createTime', label: '开始日期' },
    { key: 'deadlineDate', label: '办结时限' },
    { key: 'status', label: '办件状态' },
    { key: 'currTaskName', label: '在办环节' },
    { key: 'currTaskAssignee', label: '在办人员' },
    { key: 'dataType', label: '数据类型' }
  ],
  [
    'name',
    'category',
    'sourceUnit',
    'source',
    'urgencyDegree',
    'createTime',
    'deadlineDate',
    'status',
    'currTaskName',
    'currTaskAssignee',
    'dataType'
  ]
)
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

const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  name: '',
  processInstanceId: '',
  processDefinitionKey: '',
  startDeptName: '',
  overdueDays: undefined,
  status: null,
  dataType: '',
  createTime: [],
  orderField: undefined as string | undefined,
  orderDirection: undefined as string | undefined
})

const parseTime = (time: any, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return null
  return dayjs(time).format(pattern)
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getUnifiedProcessInstancePage(queryParams)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const handleSortChange = ({ prop, order }: any) => {
  queryParams.orderField = order ? prop : undefined
  queryParams.orderDirection = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined
  handleQuery()
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.processInstanceId = ''
  queryParams.processDefinitionKey = ''
  queryParams.startDeptName = ''
  queryParams.overdueDays = undefined
  queryParams.status = null
  queryParams.dataType = ''
  queryParams.createTime = []
  queryParams.orderField = undefined
  queryParams.orderDirection = undefined
  handleQuery()
}

const handleDetail = (row: any) => {
  if (row.isHistory) {
    router.push({
      name: 'BpmHistoryWorkflowDetail',
      query: { processInstanceId: row.id, projectId: row.projectId }
    })
    return
  }
  router.push({ path: '/bpm/process-instance/detail', query: { id: row.id } })
}

onMounted(async () => {
  await getList()
  const definitions = await DefinitionApi.getSimpleProcessDefinitionList()
  processDefinitionList.value = mergeProcessDefinitionList(definitions)
})

onActivated(async () => {
  await getList()
})
</script>

<style scoped>
.app-container {
  padding: 10px;
  background-color: #f5f7fa;
}
.w-full {
  width: 100%;
}
.link-type {
  color: #337ab7;
  text-decoration: underline;
  cursor: pointer;
}
.link-type:hover {
  color: #20a0ff;
}
.text-right {
  text-align: right;
}
</style>
