<template>
  <ContentWrap>
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <span class="text-gray-700 font-bold">月度查询：</span>

        <el-date-picker
          v-model="queryDate"
          type="month"
          placeholder="选择月份"
          :clearable="false"
          style="width: 180px"
          @change="handleQuery"
        />

        <el-button type="primary" icon="Search" @click="handleQuery" :loading="loading">
          查询
        </el-button>
      </div>

      <el-button
        type="success"
        plain
        icon="Download"
        @click="handleExport"
        :loading="exportLoading"
      >
        导出 Excel
      </el-button>
    </div>

    <div class="monthly-table-wrapper" v-loading="loading">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        height="600"
        :header-cell-style="{ background: '#f8f9fa', color: '#606266', textAlign: 'center' }"
      >
        <el-table-column label="会议室" fixed width="180" align="center">
          <template #default="{ row }">
            <div class="font-bold">{{ row.room.roomName }}</div>
            <!--            <div class="text-xs text-gray-400">{{ roomInfo(row) }}</div>-->
          </template>
        </el-table-column>

        <el-table-column
          v-for="day in daysInMonth"
          :key="day.dateStr"
          :label="day.label"
          width="160"
          align="center"
        >
          <template #header>
            <div>{{ day.label }}</div>
            <div
              class="text-xs font-normal"
              :class="day.isWeekend ? 'text-red-400' : 'text-gray-400'"
            >
              {{ day.weekName }}
            </div>
          </template>

          <template #default="{ row }">
            <div class="cell-content">
              <div
                v-for="booking in getDayBookings(row.bookingList, day.fullDate)"
                :key="booking.id"
                class="booking-item"
              >
                <div class="text-xs font-bold text-blue-600">
                  {{ formatTime(booking.startTime) }}-{{ formatTime(booking.endTime) }}
                </div>
                <div class="text-xs text-gray-600 truncate" :title="booking.userName">
                  {{ booking.userName }}
                </div>
                <div class="text-xs text-gray-400 scale-90 truncate">
                  {{ booking.deptName }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import * as BookingApi from '@/api/system/meeting' // 确保路径正确
import download from '@/utils/download' // 引入下载工具
import { ElMessage } from 'element-plus'

const loading = ref(false)
const exportLoading = ref(false)
const queryDate = ref(new Date()) // 默认当前月
const tableData = ref([])

// --- 计算当月天数逻辑 ---
const daysInMonth = computed(() => {
  const target = dayjs(queryDate.value)
  const daysInMonth = target.daysInMonth()
  const arr = []

  for (let i = 1; i <= daysInMonth; i++) {
    const d = target.date(i)
    const isWeekend = d.day() === 0 || d.day() === 6
    arr.push({
      label: `${i}日`,
      fullDate: d.format('YYYY-MM-DD'),
      weekName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.day()],
      isWeekend
    })
  }
  return arr
})

// --- API 方法 ---

const handleQuery = async () => {
  if (!queryDate.value) return

  loading.value = true
  try {
    const d = dayjs(queryDate.value)
    // 注意：这里调用的是【月度排班数据 JSON】接口
    const res = await BookingApi.MeetingApi.etMonthlySchedule({
      year: d.year(),
      month: d.month() + 1
    })
    tableData.value = res
    console.log(tableData, 'dshflahds')
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  if (!queryDate.value) return

  exportLoading.value = true
  try {
    const d = dayjs(queryDate.value)
    // 这里调用的是之前写的【导出 Excel】接口
    const data = await BookingApi.MeetingApi.exportMeetingMonth({
      year: d.year(),
      month: d.month() + 1
    })
    download.excel(data, `会议室预约月报_${d.format('YYYY-MM')}.xlsx`)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// --- 辅助方法 ---
const roomInfo = (row: any) => {
  // 处理 VO 结构差异，如果有 room 对象则取 room，否则直接取属性
  const r = row.room || row
  return `席位:${r.seats || 0} | 面积:${r.roomArea || 0}`
}

const getDayBookings = (list: any[], dateStr: string) => {
  if (!list) return []
  return list.filter((b) => dayjs(b.startTime).format('YYYY-MM-DD') === dateStr)
}

const formatTime = (time: number) => {
  if (!time) return ''
  return dayjs(time).format('HH:mm')
}

// 初始化
onMounted(() => {
  handleQuery()
})
</script>

<style scoped lang="scss">
.monthly-table-wrapper {
  margin-top: 10px;
  background: #fff;
}

.cell-content {
  min-height: 40px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.booking-item {
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  padding: 4px;
  text-align: left;

  &:hover {
    background-color: #c6e2ff;
  }
}
</style>
