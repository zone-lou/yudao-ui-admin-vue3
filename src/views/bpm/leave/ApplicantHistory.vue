<template>
    <section class="applicant-history">
      <el-form :inline="true" :model="filters" class="history-filters" @submit.prevent="handleQuery">
        <el-form-item label="请假类型">
          <el-select v-model="filters.qxjType" clearable placeholder="全部类型" class="!w-180px">
            <el-option v-for="item in getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)"
              :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假时间">
          <el-date-picker v-model="filters.leaveTimeStart" type="date" clearable
            value-format="YYYY-MM-DD" placeholder="开始日期" class="!w-160px" />
          <span class="mx-8px">至</span>
          <el-date-picker v-model="filters.leaveTimeEnd" type="date" clearable
            value-format="YYYY-MM-DD" placeholder="不限结束日期" class="!w-160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit"><Icon icon="ep:search" class="mr-5px" />查询</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        </el-form-item>
      </el-form>
      <el-alert v-if="historyError" type="error" :closable="false" title="请假记录加载失败">
        <el-button link type="primary" @click="getApplicantHistory">重新加载</el-button>
      </el-alert>
      <el-table v-else v-loading="historyLoading" :data="historyList" :row-class-name="getRowClassName"
        @cell-mouse-enter="handleCellMouseEnter" border empty-text="暂无请假记录">
        <el-table-column label="请假类型" min-width="130" align="center">
          <template #default="{ row }">
            <dict-tag :type="DICT_TYPE.BPM_LEAVE_TYPE" :value="row.qxjType" />
          </template>
        </el-table-column>
        <el-table-column label="开始时间" min-width="170" align="center">
          <template #default="{ row }">{{ formatHistoryTime(row.qxjStartDate) }}</template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="170" align="center">
          <template #default="{ row }">{{ formatHistoryTime(row.qxjEndDate) }}</template>
        </el-table-column>
        <el-table-column label="请假天数" prop="totalTs" width="100" align="center" />
        <el-table-column label="审批状态" min-width="110" align="center">
          <template #default="{ row }">
            <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="row.spzt" />
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-if="!historyError"
        v-model:page="historyPage.pageNo"
        v-model:limit="historyPage.pageSize"
        :total="historyTotal"
        @pagination="getApplicantHistory"
      />
    </section>
</template>
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import * as LeaveApi from '@/api/bpm/leave'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
const props = defineProps<{ leaveId: string | number }>()
const isCurrentApplication = (row: LeaveApi.leave) => String(row.id) === String(props.leaveId)
const getRowClassName = ({ row }: { row: LeaveApi.leave }) =>
  isCurrentApplication(row) ? 'current-application-row' : ''
const handleCellMouseEnter = (row: LeaveApi.leave, _column: unknown, cell: HTMLTableCellElement) => {
  cell.title = isCurrentApplication(row) ? '本次申请' : ''
}
const getPeriod = (value: any) => new Date(value).getHours() < 12 ? '上午' : '下午'
const historyLoading = ref(false)
const historyError = ref(false)
const historyList = ref<LeaveApi.leave[]>([])
const historyTotal = ref(0)
const historyPage = reactive({ pageNo: 1, pageSize: 10 })
const filters = reactive<{ qxjType?: number; leaveTimeStart: string | null; leaveTimeEnd: string | null }>({
  qxjType: undefined, leaveTimeStart: null, leaveTimeEnd: null
})
const appliedFilters = ref<{ qxjType?: number; leaveTimeStart?: string; leaveTimeEnd?: string }>({})
const handleQuery = () => {
  historyPage.pageNo = 1
  appliedFilters.value = {
    qxjType: filters.qxjType,
    leaveTimeStart: filters.leaveTimeStart ? `${filters.leaveTimeStart} 00:00:00` : undefined,
    leaveTimeEnd: filters.leaveTimeEnd ? `${filters.leaveTimeEnd} 23:59:59` : undefined
  }
  void getApplicantHistory()
}
const resetQuery = () => {
  const today = dayjs()
  filters.qxjType = undefined
  filters.leaveTimeStart = today.subtract(1, 'year').format('YYYY-MM-DD')
  filters.leaveTimeEnd = null
  handleQuery()
}
let historyRequestId = 0

const formatHistoryTime = (value: any) =>
  value ? `${formatDate(value, 'YYYY-MM-DD')} ${getPeriod(value)}` : ''

const getApplicantHistory = async () => {
  const requestId = ++historyRequestId
  historyList.value = []
  historyError.value = false
  if (!props.leaveId) {
    historyLoading.value = false
    return
  }
  historyLoading.value = true
  try {
    const data = await LeaveApi.leaveApi.getApplicantHistoryPage({
      leaveId: Number(props.leaveId),
      ...historyPage,
      ...appliedFilters.value
    })
    if (requestId !== historyRequestId) return
    historyList.value = data.list
    historyTotal.value = data.total
  } catch {
    if (requestId === historyRequestId) historyError.value = true
  } finally {
    if (requestId === historyRequestId) historyLoading.value = false
  }
}

watch(() => props.leaveId, () => {
  historyTotal.value = 0
  resetQuery()
}, { immediate: true })
</script>
<style scoped>
.applicant-history { padding: 16px; display: flow-root; }
.history-filters :deep(.el-form-item) { margin-bottom: 16px; }
:deep(.current-application-row) {
  --el-table-tr-bg-color: var(--el-color-primary-light-9);
}
:deep(.current-application-row > td.el-table__cell:first-child) {
  box-shadow: inset 3px 0 0 var(--el-color-primary);
}
:deep(.el-table--enable-row-hover .current-application-row:hover > td.el-table__cell) {
  background-color: var(--el-color-primary-light-8);
}
</style>
