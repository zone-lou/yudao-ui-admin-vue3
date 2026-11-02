<template>
    <section class="applicant-history">
      <el-form :inline="true" :model="filters" :disabled="!defaultsReady" class="history-filters" @submit.prevent="handleQuery">
        <el-form-item label="请假类型">
          <el-select v-model="filters.qxjType" clearable placeholder="全部类型" class="!w-180px">
            <el-option v-for="item in getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)"
              :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假时间">
          <el-date-picker v-model="filters.leaveTime" type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始日期" end-placeholder="结束日期"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            class="!w-280px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit"><Icon icon="ep:search" class="mr-5px" />查询</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        </el-form-item>
      </el-form>
      <el-alert v-if="historyError" type="error" :closable="false" title="请假记录加载失败">
        <el-button link type="primary" @click="retryLoad">重新加载</el-button>
      </el-alert>
      <el-table v-else v-loading="historyLoading" :data="historyList" border empty-text="暂无请假记录">
        <el-table-column width="36" align="center" class-name="record-marker-column">
          <template #default="{ row }">
            <el-tooltip v-if="String(row.id) === String(leaveId)" content="本次申请" placement="top">
              <span class="record-marker" tabindex="0" aria-label="本次申请">
                <el-badge is-dot type="danger" />
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
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
const getPeriod = (value: any) => new Date(value).getHours() < 12 ? '上午' : '下午'
const defaultsReady = ref(false)
const defaultLeaveType = ref<number>()
const historyLoading = ref(false)
const historyError = ref(false)
const historyList = ref<LeaveApi.leave[]>([])
const historyTotal = ref(0)
const historyPage = reactive({ pageNo: 1, pageSize: 10 })
const filters = reactive<{ qxjType?: number; leaveTime: string[] | null }>({
  qxjType: undefined, leaveTime: null
})
const appliedFilters = ref<{ qxjType?: number; leaveTime?: string[] }>({})
const handleQuery = () => {
  if (!defaultsReady.value) return
  historyPage.pageNo = 1
  appliedFilters.value = {
    qxjType: filters.qxjType,
    leaveTime: filters.leaveTime?.length === 2 ? [...filters.leaveTime] : undefined
  }
  void getApplicantHistory()
}
const resetQuery = () => {
  const today = dayjs()
  filters.qxjType = defaultLeaveType.value
  filters.leaveTime = [
    today.subtract(1, 'year').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    today.endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ]
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

let defaultsRequestId = 0
const initializeFilters = async () => {
  const requestId = ++defaultsRequestId
  ++historyRequestId
  defaultsReady.value = false
  historyLoading.value = true
  historyError.value = false
  historyList.value = []
  historyTotal.value = 0
  historyPage.pageNo = 1
  try {
    const detail = await LeaveApi.leaveApi.getleave(Number(props.leaveId))
    if (requestId !== defaultsRequestId) return
    if (detail?.qxjType == null || !Number.isFinite(Number(detail.qxjType))) {
      throw new Error('未获取到本次申请的请假类型')
    }
    defaultLeaveType.value = Number(detail.qxjType)
    defaultsReady.value = true
    resetQuery()
  } catch {
    if (requestId === defaultsRequestId) {
      historyError.value = true
      historyLoading.value = false
    }
  }
}
const retryLoad = () => defaultsReady.value ? getApplicantHistory() : initializeFilters()
watch(() => props.leaveId, initializeFilters, { immediate: true })
</script>
<style scoped>
.applicant-history { padding: 16px; display: flow-root; }
.history-filters :deep(.el-form-item) { margin-bottom: 16px; }
.record-marker { display: inline-flex; align-items: center; justify-content: center; cursor: help; }
:deep(.record-marker-column .cell) { padding: 0; }
</style>
