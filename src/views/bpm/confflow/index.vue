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
      <el-form-item label="会议名称" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入会议名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会议时间" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
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
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_TASK_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="召集单位" prop="joinUnit">
        <el-input
          v-model="queryParams.joinUnit"
          placeholder="请输入召集单位或召集人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会议地点" prop="venue">
        <el-input
          v-model="queryParams.venue"
          placeholder="请输入会议地点"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="参会科室" prop="offerUnit">
        <el-input
          v-model="queryParams.offerUnit"
          placeholder="请输入我局参会科室"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
    </el-form>
    <div class="search-actions">
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
      <el-button type="primary" @click="handleQuery">
        <Icon icon="ep:search" class="mr-5px" />查询
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
    </div>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      border
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" fixed="left" resizable />
      <!--      <el-table-column label="申请人" align="center" prop="userName" />-->
      <!--      <el-table-column label="申请人部门" align="center" prop="deptName" />-->

      <el-table-column v-if="visibleColumn('title')" label="会议名称" prop="title" min-width="280" show-overflow-tooltip sortable="custom" resizable>
        <template #default="scope">
          <span class="link-type" @click="handleRecord(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('startDate')" label="会议时间" align="center" prop="startDate" width="165" sortable="custom" resizable>
        <template #default="scope">
          {{ scope.row.startDate ? dateUtil(scope.row.startDate).format('YYYY-MM-DD HH:mm') : '' }}
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('venue')" label="会议地点" prop="venue" min-width="180" show-overflow-tooltip sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('joinUnit')" label="召集单位" prop="joinUnit" min-width="150" show-overflow-tooltip sortable="custom" resizable />
      <el-table-column
        v-if="visibleColumn('offerUnit')"
        label="我局参会科室"
        prop="offerUnit"
        min-width="220"
        show-overflow-tooltip
        sortable="custom"
        resizable
      />
      <el-table-column v-if="visibleColumn('status')" label="办理状态" align="center" prop="status" width="110" sortable="custom" resizable>
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-tag v-if="scope.row.status === 0 || !scope.row.processInstanceId" type="info">
              草稿
            </el-tag>
            <dict-tag
              v-else
              class="ml-2"
              :type="DICT_TYPE.BPM_TASK_STATUS"
              :value="scope.row.status !== null ? scope.row.status : 0"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('userName')" label="申请人" align="center" prop="userName" width="120" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('deptName')" label="申请人部门" align="center" prop="deptName" min-width="140" show-overflow-tooltip sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('applyDate')" label="申请日期" align="center" prop="applyDate" width="165" sortable="custom" resizable>
        <template #default="scope">
          {{ scope.row.applyDate ? dateUtil(scope.row.applyDate).format('YYYY-MM-DD HH:mm') : '' }}
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('offerPerson')" label="我局参会人员" prop="offerPerson" min-width="180" show-overflow-tooltip sortable="custom" resizable />
      <el-table-column label="操作" align="center" width="180" fixed="right" resizable>
        <template #default="scope">
          <el-button
            v-if="!scope.row.processInstanceId"
            link
            type="primary"
            @click="handleEdit(scope.row.id)"
            v-hasPermi="['bpm:confflow:update']"
          >
            编辑
          </el-button>
          <el-button v-else link type="primary" @click="handleDetail(scope.row)">
            详情
          </el-button>
          <el-button
            v-if="scope.row.processInstanceId"
            link
            type="warning"
            @click="handleEdit(scope.row.id)"
            v-hasPermi="['bpm:confflow:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
            v-hasPermi="['bpm:confflow:delete']"
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
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { ConfflowApi, Confflow } from '@/api/bpm/confflow'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultShortcuts } from '@/utils/formatTime'
import { useRouter } from 'vue-router'
import BpmColumnSetting from '@/views/bpm/components/BpmColumnSetting.vue'
import { useBpmColumnSetting } from '@/hooks/bpm/useBpmColumnSetting'

/** 会议报告单 列表 */
defineOptions({ name: 'Confflow' })

const { push } = useRouter()

const loading = ref(true) // 列表的加载中
const list = ref<Confflow[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  userName: undefined,
  deptId: undefined,
  deptName: undefined,
  applyDate: [],
  startDate: [],
  title: undefined,
  content: undefined,
  remark: undefined,
  venue: undefined,
  joinUnit: undefined,
  offerUnit: undefined,
  offerPerson: undefined,
  status: undefined,
  orderField: undefined as string | undefined,
  orderDirection: undefined as string | undefined
})
const queryFormRef = ref() // 搜索的表单
const { columnOptions, checkedColumnKeys, visibleColumn, resetColumns } = useBpmColumnSetting(
  'bpm:confflow:columns',
  [
    { key: 'title', label: '会议名称' },
    { key: 'startDate', label: '会议时间' },
    { key: 'venue', label: '会议地点' },
    { key: 'joinUnit', label: '召集单位' },
    { key: 'offerUnit', label: '我局参会科室' },
    { key: 'status', label: '办理状态' },
    { key: 'userName', label: '申请人' },
    { key: 'deptName', label: '申请人部门' },
    { key: 'applyDate', label: '申请日期' },
    { key: 'offerPerson', label: '我局参会人员' }
  ],
  ['title', 'startDate', 'venue', 'joinUnit', 'offerUnit', 'status']
)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ConfflowApi.getConfflowPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const { handleInvalidate: handleDelete } = useBpmInvalidate(ConfflowApi.deleteConfflow, getList)

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

/** 草稿编辑 */
const handleEdit = (id: number) => {
  push({ name: 'OAconfflowCreate', query: { id } })
}

/** 办理中、已办结记录进入流程详情 */
const handleDetail = (row: Confflow) => {
  push({
    name: 'BpmProcessInstanceDetail',
    query: { id: row.processInstanceId }
  })
}

/** 点击会议名称时，根据是否发起流程进入对应页面 */
const handleRecord = (row: Confflow) => {
  if (row.processInstanceId) {
    handleDetail(row)
    return
  }
  handleEdit(row.id)
}

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
</style>
