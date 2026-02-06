<template>
  <ContentWrap>
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="70px">
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
          <el-form-item label="办件状态" prop="status" class="w-full">
            <el-select v-model="queryParams.status" placeholder="全部" clearable class="w-full">
              <el-option label="办理中" :value="1" />
              <el-option label="已办结" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
          <el-button  @click="resetQuery"
            ><Icon icon="ep:refresh" />重置</el-button
          >
        </el-col>
      </el-row>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      highlight-current-row
      height="600"
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />

      <el-table-column
        label="办件名称"
        align="left"
        prop="name"
        width="300"
        fixed="left"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="link-type" @click="handleDetail(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="办件类型" align="center" prop="category" width="120" />

      <el-table-column
        label="办件编号"
        align="center"
        prop="id"
        min-width="200"
        show-overflow-tooltip
      />

      <el-table-column
        label="来文单位"
        align="center"
        prop="sourceUnit"
        width="150"
        show-overflow-tooltip
      >
        <template #default="scope">
          {{ scope.row.sourceUnit || '-' }}
        </template>
      </el-table-column>

      <el-table-column label="紧急程度" align="center" prop="urgencyDegree" width="100">
        <template #default="scope">
          <dict-tag
            v-if="scope.row.urgencyDegree"
            :type="DICT_TYPE.BPM_EMERGENCY_DEGREE"
            :value="scope.row.urgencyDegree"
          />
        </template>
      </el-table-column>

      <el-table-column label="开始日期" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, 'YYYY-MM-DD HH:mm') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="办结时限" align="center" prop="deadlineDate" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deadlineDate, 'YYYY-MM-DD HH:mm') || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="办件状态" align="center" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 2" type="success" effect="dark">已办结</el-tag>
          <el-tag v-else type="primary" effect="plain">办理中</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="80" align="center">
        <template #header>
          <el-icon><Clock /></el-icon>
        </template>
        <template #default="scope">
          <el-tooltip :content="getTimeoutStatus(scope.row).label" placement="top">
            <div
              :style="{
                color: getTimeoutStatus(scope.row).color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }"
            >
              <el-icon size="16">
                <Clock />
              </el-icon>
            </div>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column
        label="在办环节"
        align="center"
        prop="currTaskName"
        width="150"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span v-if="scope.row.status === 1" style="color: #409eff">{{
            scope.row.currTaskName
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column
        label="在办人员"
        align="center"
        prop="currTaskAssignee"
        width="120"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span v-if="scope.row.status === 1">{{ scope.row.currTaskAssignee }}</span>
          <span v-else>-</span>
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
// ... script 部分代码保持不变，不需要修改 ...
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getUnifiedProcessInstancePage } from '@/api/bpm/processInstance'
import * as DefinitionApi from '@/api/bpm/definition'
import { Clock } from '@element-plus/icons-vue'
import { DICT_TYPE } from '@/utils/dict'

defineOptions({ name: 'BpmProcessInstanceList' })
const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const processDefinitionList = ref<any[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  name: '',
  processInstanceId: '',
  processDefinitionKey: '',
  startDeptName: '',
  overdueDays: undefined,
  status: null,
  createTime: []
})

const parseTime = (time: any, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return null
  return dayjs(time).format(pattern)
}

const getTimeoutStatus = (row: any) => {
  if (row.status === 2) {
    return { label: '已办结', color: '#67C23A' }
  }
  if (!row.deadlineDate) {
    return { label: '正常', color: '#909399' }
  }
  const now = dayjs()
  const due = dayjs(row.deadlineDate)
  if (due.isBefore(now, 'day')) {
    return { label: '已超时', color: '#F56C6C' }
  } else if (due.diff(now, 'day') <= 1) {
    return { label: '临期', color: '#E6A23C' }
  } else {
    return { label: '正常', color: '#67C23A' }
  }
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

const resetQuery = () => {
  queryParams.name = ''
  queryParams.processInstanceId = ''
  queryParams.processDefinitionKey = ''
  queryParams.startDeptName = ''
  queryParams.overdueDays = undefined
  queryParams.status = null
  queryParams.createTime = []
  handleQuery()
}

const handleDetail = (row: any) => {
  router.push({
    path: '/bpm/process-instance/detail',
    query: { id: row.id }
  })
}

onMounted(async () => {
  await getList()
  processDefinitionList.value = await DefinitionApi.getSimpleProcessDefinitionList()
})
</script>

<style scoped>
.app-container {
  background-color: #f5f7fa;
  padding: 10px;
}
.w-full {
  width: 100%;
}
.link-type {
  color: #337ab7;
  cursor: pointer;
  text-decoration: underline;
}
.link-type:hover {
  color: #20a0ff;
}
.text-right {
  text-align: right;
}
</style>
