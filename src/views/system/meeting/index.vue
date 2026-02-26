<template>
  <ContentWrap>
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <el-button-group>
          <el-button icon="ArrowLeft" @click="changeWeek(-1)">上一周</el-button>
          <el-button @click="resetToToday">本周</el-button>
          <el-button icon="ArrowRight" @click="changeWeek(1)">下一周</el-button>
        </el-button-group>

        <div class="flex flex-col ml-2">
          <span class="text-lg font-bold text-gray-700">{{ currentYear }}年</span>
          <span class="text-sm text-gray-500">{{ currentDateRangeStr }}</span>
        </div>
      </div>

      <div class="flex gap-2">
        <div class="flex items-center text-xs text-gray-400 mr-4">
          <span class="inline-block w-3 h-3 bg-green-100 border-l-2 border-green-500 mr-1"></span>
          我的预约
          <span
            class="inline-block w-3 h-3 bg-blue-100 border-l-2 border-blue-500 ml-3 mr-1"
          ></span>
          他人预约
        </div>
        <el-button
          type="success"
          plain
          :loading="exportLoading"
          @click="goToExportPage"
        >
          <Icon icon="ep:download" />导出
        </el-button>
      </div>
    </div>

    <div class="booking-table-wrapper" v-loading="loading">
      <table class="custom-table">
        <thead>
          <tr>
            <th style="width: 250px; background-color: #f8f9fa">会议室 / 日期</th>
            <th v-for="(day, index) in weekDays" :key="index" :class="{ 'is-today': day.isToday }">
              <div class="font-bold">{{ day.weekName }}</div>
              <div class="text-xs mt-1" :class="day.isToday ? 'text-blue-600' : 'text-gray-500'">
                {{ day.dateStr }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in scheduleData" :key="room.roomId">
            <td class="room-cell">
              <div class="font-bold text-gray-800 text-sm">{{ room.room.roomName }}</div>
            </td>
            <td v-for="(day, dIndex) in weekDays" :key="dIndex" class="day-cell">
              <div class="cell-container" @click="handleCellClick(room, day)">
                <div
                  v-for="booking in getDayBookings(room.bookingList, day.fullDate).slice(0, 2)"
                  :key="booking.id"
                  class="booking-item"
                  :class="booking.isMyBooking ? 'my-booking' : 'other-booking'"
                  @click.stop="handleBookingClick(booking, room)"
                >
                  <div class="flex items-center justify-between">
                    <span class="time-range"
                      >{{ formatTime(booking.startTime) }}~{{ formatTime(booking.endTime) }}</span
                    >
                    <span class="user-name truncate ml-1">{{ booking.nickName }}</span>
                  </div>
                </div>

                <el-popover
                  v-if="getDayBookings(room.bookingList, day.fullDate).length > 2"
                  placement="top"
                  :width="200"
                  trigger="hover"
                >
                  <template #reference>
                    <div class="more-tag" @click.stop>
                      + {{ getDayBookings(room.bookingList, day.fullDate).length - 2 }} 更多...
                    </div>
                  </template>

                  <div class="popover-list max-h-60 overflow-y-auto">
                    <div
                      v-for="booking in getDayBookings(room.bookingList, day.fullDate)"
                      :key="booking.id"
                      class="booking-item mb-1"
                      :class="booking.isMyBooking ? 'my-booking' : 'other-booking'"
                      @click="handleBookingClick(booking, room)"
                    >
                      <div class="time-range">
                        {{ formatTime(booking.startTime) }}~{{ formatTime(booking.endTime) }}
                      </div>
                      <div class="user-name">{{ booking.nickName }}</div>
                    </div>
                  </div>
                </el-popover>

                <div class="ghost-add-item">
                  <el-icon><Plus /></el-icon>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="scheduleData.length === 0">
            <td colspan="8" class="text-center py-10 text-gray-400"> 暂无会议室数据 </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BookingForm ref="formRef" @success="loadData" />
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import { Plus } from '@element-plus/icons-vue' // 【新增】 记得引入图标

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const router = useRouter()

import * as BookingApi from '@/api/system/meeting'
import BookingForm from './MeetingForm.vue'
import download from '@/utils/download' //

const loading = ref(false)
const exportLoading = ref(false)
const currentDate = ref(dayjs())
const scheduleData = ref<any[]>([])
const formRef = ref()

// --- 日期计算逻辑 ---
const weekDays = computed(() => {
  const start = currentDate.value.startOf('isoWeek')
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = start.add(i, 'day')
    days.push({
      dateStr: d.format('MM-DD'),
      fullDate: d.format('YYYY-MM-DD'),
      weekName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      isToday: d.isSame(dayjs(), 'day'),
      isPast: d.isBefore(dayjs(), 'day')
    })
  }
  return days
})

const currentYear = computed(() => currentDate.value.year())
const currentDateRangeStr = computed(() => {
  const start = weekDays.value[0].dateStr
  const end = weekDays.value[6].dateStr
  return `${start} ~ ${end}`
})

// --- API 操作 ---
const loadData = async () => {
  loading.value = true
  try {
    const start = weekDays.value[0].fullDate + ' 00:00:00'
    const end = weekDays.value[6].fullDate + ' 23:59:59'
    const res = await BookingApi.MeetingApi.getBookingSchedule({ beginTime: start, endTime: end })
    scheduleData.value = res
  } finally {
    loading.value = false
  }
}

/** 导出操作 */
const handleExport = async () => {
  try {
    exportLoading.value = true
    const data = await BookingApi.MeetingApi.exportMeetingMonth({
      // 传递当前视图的年份和月份
      year: currentDate.value.year(),
      month: currentDate.value.month() + 1 // dayjs 的 month 是 0-11，需要 +1
    })
    download.excel(data, `会议预约${currentDate.value.format('YYYY-MM')}.xlsx`)
    ElMessage.success('导出成功')
  } catch (err) {
    console.error(err)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

const goToExportPage = () => {
  // 跳转到月度查询页面
  // 注意：你需要确保在【菜单管理】中配置了这个路由，或者直接用 path
  router.push({ path: '/system/MonthlySheet' })
}

const getDayBookings = (list: any[], dateStr: string) => {
  if (!list) return []
  return list.filter((b) => dayjs(b.startTime).format('YYYY-MM-DD') === dateStr)
}

const formatTime = (time: number) => {
  if (!time) return ''
  return dayjs(time).format('HH:mm')
}

// 交互
const changeWeek = (offset: number) => {
  currentDate.value = currentDate.value.add(offset, 'week')
  loadData()
}
const resetToToday = () => {
  currentDate.value = dayjs()
  loadData()
}

/** 点击空白格子或加号 -> 新增 */
const handleCellClick = (room: any, day: any) => {
  if (day.isPast && !day.isToday) {
    ElMessage.warning('不能预约过去的日期')
    return
  }

  formRef.value.open({
    roomId: room.room.id,
    roomName: room.room.roomName,
    date: day.fullDate
  })
}

/** 点击已有预约 -> 查看详情 */
const handleBookingClick = (booking: any, room: any) => {
  formRef.value.open({
    ...booking,
    roomName: room.room.roomName, // 修正：这里根据你的数据结构可能需要确认是 room.roomName 还是 room.room.roomName
    startTime: dayjs(booking.startTime).format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs(booking.endTime).format('YYYY-MM-DD HH:mm:ss')
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.custom-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border: 1px solid #e5e7eb;

  th,
  td {
    border: 1px solid #e5e7eb;
    vertical-align: top;
  }

  th {
    padding: 8px 0;
    text-align: center;
    background-color: #f9fafb;
    color: #374151;

    &.is-today {
      background-color: #eff6ff;
      color: #2563eb;
    }
  }

  .room-cell {
    padding: 8px;
    background-color: #fff;
    text-align: center;
    vertical-align: middle;
  }

  .day-cell {
    padding: 2px;
    background-color: #fff;

    .cell-container {
      width: 100%;
      height: 100%;
      min-height: 60px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 2px;
      /* 确保内容不会撑破格子 */
      box-sizing: border-box;

      &:hover {
        background-color: #fbfcff;

        /* 悬浮整个格子时，加号变色，增强交互感 */
        .ghost-add-item {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }
}

.more-tag {
  font-size: 12px;
  color: #6b7280;
  background-color: #f3f4f6;
  text-align: center;
  padding: 2px 0;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 2px;

  &:hover {
    background-color: #e5e7eb;
    color: #374151;
  }
}

/* 【新增】常驻添加按钮样式 */
.ghost-add-item {
  height: 20px; /* 高度与预约条目保持一致，视觉更整齐 */
  margin-top: 2px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc; /* 默认颜色浅一点，不抢眼 */
  font-size: 12px;
  opacity: 0; /* 默认完全透明（看不见，但占位置，防止抖动） */
  transform: translateY(5px); /* 稍微向下偏移一点，制造浮现动画效果 */
  transition: all 0.2s ease; /* 添加平滑过渡动画 */

  /* 自身悬浮样式 */
  &:hover {
    background-color: #ecf5ff;
    border-color: #409eff;
    color: #409eff;
    cursor: pointer;
  }
}

/* 预约条目样式 */
.booking-item {
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.3;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .time-range {
    font-weight: 700;
    font-family: monospace;
    font-size: 11px;
    flex-shrink: 0; /* 防止时间被压缩 */
  }

  .user-name {
    margin-top: 0;
  }

  &.my-booking {
    background-color: #dcfce7;
    color: #166534;
    border-left: 2px solid #22c55e;

    &:hover {
      background-color: #bbf7d0;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &.other-booking {
    background-color: #e0f2fe;
    color: #075985;
    border-left: 2px solid #0ea5e9;
    opacity: 0.9;

    &:hover {
      background-color: #bae6fd;
      transform: translateY(-1px);
    }
  }
}
</style>
