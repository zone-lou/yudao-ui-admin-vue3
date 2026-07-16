<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="申请用户" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入申请用户"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="外出时间" prop="outingTime">
        <el-date-picker
          v-model="queryParams.outingTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          :shortcuts="defaultShortcuts"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办理状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择办理状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getBusinessStatusOptions()"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="出发地" prop="startPlace">
        <el-input
          v-model="queryParams.startPlace"
          placeholder="请输入出发地"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="目的地" prop="endPlace">
        <el-input
          v-model="queryParams.endPlace"
          placeholder="请输入目的地"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="外出事由" prop="reason">
        <el-input
          v-model="queryParams.reason"
          placeholder="请输入外出事由"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
    </el-form>
    <div class="search-actions">
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      <el-button type="primary" @click="handleQuery">
        <Icon icon="ep:search" class="mr-5px" /> 搜索
      </el-button>
    </div>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <div class="mb-15px flex items-center justify-end gap-8px">
      <BpmColumnSetting
        v-model="checkedColumnKeys"
        :columns="columnOptions"
        @reset="resetColumns"
      />
      <el-button
        type="success"
        plain
        @click="handleExport"
        :loading="exportLoading"
        v-hasPermi="['bpm:time-explain:export']"
      >
        <Icon icon="ep:download" class="mr-5px" /> 导出
      </el-button>
    </div>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      border
      header-cell-class-name="nowrap-table-header"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" fixed="left" resizable />
      <el-table-column v-if="visibleColumn('nickName')" label="申请用户" align="center" prop="nickName" width="120" sortable="custom" resizable />
      <el-table-column
        v-if="visibleColumn('checkBegin')"
        label="开始时间"
        align="center"
        prop="checkBegin"
        :formatter="dateTimeFormatter"
        width="180px"
        sortable="custom"
        resizable
      />
      <el-table-column
        v-if="visibleColumn('checkEnd')"
        label="结束时间"
        align="center"
        prop="checkEnd"
        :formatter="dateTimeFormatter"
        width="180px"
        sortable="custom"
        resizable
      />
      <el-table-column v-if="visibleColumn('startPlace')" label="出发地" align="center" prop="startPlace" min-width="130" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('endPlace')" label="目的地" align="center" prop="endPlace" min-width="130" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('reason')" label="外出事由" align="center" prop="reason" min-width="180" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('days')" label="外出天数" align="center" prop="days" width="120" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('status')" label="办理状态" align="center" prop="status" width="120" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="visibleColumn('checkDate')"
        label="申请时间"
        align="center"
        prop="checkDate"
        :formatter="dateTimeFormatter"
        width="180px"
        sortable="custom"
        resizable
      />
      <el-table-column label="操作" align="center" width="180px" fixed="right" resizable>
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)"> 详情 </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:time-explain:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
            v-hasPermi="['bpm:time-explain:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <TimeExplainForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { getBusinessStatusOptions } from '@/utils/businessStatus'
import { defaultShortcuts, formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import { TimeExplainApi, TimeExplain } from '@/api/bpm/timeexplain'
import TimeExplainForm from './TimeExplainForm.vue'
import { useRouter } from 'vue-router'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'
import BpmColumnSetting from '@/views/bpm/components/BpmColumnSetting.vue'
import { useBpmColumnSetting } from '@/hooks/bpm/useBpmColumnSetting'

/** 外出请假补假 列表 */
defineOptions({ name: 'TimeExplain' })

const message = useMessage() // 消息弹窗
const router = useRouter()

const loading = ref(true) // 列表的加载中
const list = ref<TimeExplain[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  actinstId: undefined,
  userId: undefined,
  nickName: undefined as string | undefined,
  outingTime: [],
  status: undefined,
  startPlace: undefined,
  endPlace: undefined,
  reason: undefined,
  orderField: undefined as string | undefined,
  orderDirection: undefined as string | undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const { columnOptions, checkedColumnKeys, visibleColumn, resetColumns } = useBpmColumnSetting(
  'bpm:timeexplain:columns',
  [
    { key: 'nickName', label: '申请用户' },
    { key: 'checkBegin', label: '开始时间' },
    { key: 'checkEnd', label: '结束时间' },
    { key: 'startPlace', label: '出发地' },
    { key: 'endPlace', label: '目的地' },
    { key: 'reason', label: '外出事由' },
    { key: 'days', label: '外出天数' },
    { key: 'status', label: '办理状态' },
    { key: 'checkDate', label: '申请时间' }
  ],
  [
    'nickName',
    'checkBegin',
    'checkEnd',
    'startPlace',
    'endPlace',
    'reason',
    'days',
    'status',
    'checkDate'
  ]
)

const dateTimeFormatter = (_row: any, _column: any, cellValue: any) => {
  return cellValue ? formatDate(cellValue, 'YYYY-MM-DD HH:mm') : ''
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TimeExplainApi.getTimeExplainPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const handleSortChange = ({ prop, order }: any) => {
  queryParams.orderField = order ? prop : undefined
  queryParams.orderDirection = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined
  handleQuery()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const { handleInvalidate: handleDelete } = useBpmInvalidate(
  TimeExplainApi.deleteTimeExplain,
  getList
)

/** 详情跳转 */
const handleDetail = (row: any) => {
  if (row.projectId) {
    router.push({
      name: 'BpmHistoryWorkflowDetail',
      query: { processInstanceId: row.processInstanceId, projectId: row.projectId }
    })
    return
  }
  router.push({
    name: 'BpmProcessInstanceDetail',
    query: { id: row.processInstanceId }
  })
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await TimeExplainApi.exportTimeExplain(queryParams)
    download.excel(data, '外出请假补假.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 激活时 **/
onActivated(() => {
  getList()
})

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  margin-bottom: -18px;
}

.search-form :deep(.el-form-item) {
  margin-right: 0;
}

.search-form :deep(.el-form-item__content > .el-input),
.search-form :deep(.el-form-item__content > .el-select),
.search-form :deep(.el-form-item__content > .el-date-editor) {
  width: 240px !important;
  max-width: 240px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  padding-top: 16px;
}

:deep(.nowrap-table-header .cell) {
  white-space: nowrap;
}
</style>
