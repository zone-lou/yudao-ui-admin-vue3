<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="年份" prop="year">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="YYYY"
          placeholder="选择年份"
          class="!w-240px"
          :clearable="false"
        />
      </el-form-item>

      <el-form-item label="月份" prop="month">
        <el-select v-model="queryParams.month" placeholder="选择月份" clearable class="!w-240px">
          <el-option v-for="m in 12" :key="m" :label="m + '月'" :value="m" />
        </el-select>
      </el-form-item>

      <el-form-item label="部门" prop="deptId">
        <el-tree-select
          v-model="queryParams.deptId"
          :data="deptOptions"
          :props="defaultProps"
          check-strictly
          default-expand-all
          placeholder="请选择部门"
          clearable
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item label="姓名" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入姓名"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="请假类型" prop="qxjType">
        <el-select v-model="queryParams.qxjType" placeholder="全部类型" clearable class="!w-240px">
          <el-option
            v-for="dict in leaveDicts"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery"> <Icon icon="ep:search" class="mr-5px" /> 搜索 </el-button>
        <el-button @click="resetQuery"> <Icon icon="ep:refresh" class="mr-5px" /> 重置 </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="pivotTableData"
      :stripe="true"
      :show-overflow-tooltip="true"
      border
    >
      <el-table-column
        label="部门名称"
        align="center"
        prop="deptName"
        fixed="left"
        min-width="120"
      />
      <el-table-column
        label="用户昵称"
        align="center"
        prop="nickname"
        fixed="left"
        min-width="100"
      />

      <el-table-column
        v-for="dict in showLeaveDicts"
        :key="dict.value"
        :label="dict.label"
        align="center"
        min-width="100"
      >
        <template #default="scope">
          <div
            v-if="scope.row['type_' + dict.value] > 0"
            class="cursor-pointer font-bold"
            style="color: var(--el-color-primary); text-decoration: underline"
            @click="openDetail(scope.row, dict.value)"
          >
            {{ scope.row['type_' + dict.value] }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>

      <el-table-column
        label="总计天数"
        align="center"
        fixed="right"
        min-width="100"
        prop="totalAll"
      >
        <template #default="scope">
          <el-tag type="danger" v-if="scope.row.totalAll > 0">
            {{ scope.row.totalAll }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <el-dialog
    v-model="detailVisible"
    :title="detailNickname ? `${detailNickname}的请假详情` : '请假详情记录'"
    width="1200px"
    append-to-body
  >
    <el-table v-loading="detailLoading" :data="pagedDetailList" border >
      <el-table-column label="申请人员" align="center" width="100">
        <template #default>
          {{ detailNickname }}
        </template>
      </el-table-column>

<!--      <el-table-column label="申请时间" align="center" prop="applyDate" width="160">-->
<!--        <template #default="scope">-->
<!--          {{ formatDate(scope.row.applyDate) }}-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="开始时间" align="center" prop="qxjStartDate" width="160">
        <template #default="scope">
          {{ formatDateWithAmPm(scope.row.qxjStartDate) }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="qxjEndDate" width="160">
        <template #default="scope">
          {{ formatDateWithAmPm(scope.row.qxjEndDate) }}
        </template>
      </el-table-column>
      <el-table-column label="天数" align="center" prop="totalTs" width="80" />
      <el-table-column label="请假原因" align="center" prop="sjReason" show-overflow-tooltip />
    </el-table>

    <template #footer>
      <div class="flex justify-end mt-10px">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="detailList.length"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { getSimpleDeptList } from '@/api/system/dept'
import * as LeaveApi from '@/api/bpm/leave'
import { defaultProps, handleTree } from '@/utils/tree'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'BpmLeaveSummary' })

// === 状态定义 ===
const loading = ref(true)
const rawList = ref<any[]>([])
const queryFormRef = ref()
const deptOptions = ref([])
const leaveDicts = getDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)

// 详情相关状态
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailList = ref([])
const detailNickname = ref('') // 【修改点 2】 存储当前详情对应的姓名

// 前端分页状态
const currentPage = ref(1)
const pageSize = ref(10)

const queryParams = reactive({
  year: new Date().getFullYear().toString(),
  month: undefined,
  deptId: undefined,
  qxjType: undefined,
  nickname: undefined
})

// === 计算属性 ===

const pagedDetailList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return detailList.value.slice(start, end)
})

const showLeaveDicts = computed(() => {
  if (queryParams.qxjType) {
    return leaveDicts.filter((d) => String(d.value) === String(queryParams.qxjType))
  }
  return leaveDicts
})

const pivotTableData = computed(() => {
  const userMap = new Map()
  rawList.value.forEach((item) => {
    if (queryParams.qxjType && String(item.qxjType) !== String(queryParams.qxjType)) return
    if (queryParams.nickname && item.nickname && !item.nickname.includes(queryParams.nickname))
      return

    const userId = item.userId
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId: userId,
        nickname: item.nickname,
        deptName: item.deptName,
        totalAll: 0
      })
    }
    const row = userMap.get(userId)
    const typeKey = `type_${item.qxjType}`
    row[typeKey] = item.totalDays
    row.totalAll += Number(item.totalDays)
  })
  return Array.from(userMap.values())
})

// === 方法 ===

const openDetail = async (row: any, typeValue: number) => {
  detailVisible.value = true
  detailLoading.value = true
  detailList.value = []
  currentPage.value = 1

  // 【修改点 3】 捕获当前行的人员姓名
  detailNickname.value = row.nickname

  try {
    const params = {
      year: queryParams.year ? parseInt(queryParams.year) : undefined,
      month: queryParams.month,
      userId: row.userId,
      qxjType: typeValue
    }
    const data = await LeaveApi.leaveApi.getLeaveDetailList(params)
    detailList.value = data
  } finally {
    detailLoading.value = false
  }
}

const formatDateWithAmPm = (dateStr: string | number | Date) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours()
  const period = hours < 12 ? '上午' : '下午'
  return `${year}-${month}-${day} ${period}`
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      year: queryParams.year ? parseInt(queryParams.year) : undefined,
      month: queryParams.month,
      deptId: queryParams.deptId
    }
    const data = await LeaveApi.leaveApi.getLeaveSummary(params)
    rawList.value = data
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  queryParams.year = new Date().getFullYear().toString()
  queryParams.qxjType = undefined
  queryParams.nickname = undefined
  handleQuery()
}

const getDeptOptions = async () => {
  const data = await getSimpleDeptList()
  deptOptions.value = handleTree(data)
}

onMounted(() => {
  getDeptOptions()
  getList()
})
</script>
