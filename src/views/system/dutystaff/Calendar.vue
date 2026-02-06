<template>
  <ContentWrap>
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold text-lg">值班日历</span>
          <div>
            <span
              v-for="dict in getDictOptions(DICT_TYPE.DUTY_STAFF_TYPE)"
              :key="dict.value + ''"
              class="mr-2"
            >
              <el-tag :type="dict.colorType" effect="plain">
                {{ dict.label }}
              </el-tag>
            </span>
          </div>
        </div>
      </template>

      <el-calendar v-model="currentDate" v-loading="loading">
        <template #date-cell="{ data }">
          <div class="calendar-cell" :class="{ 'is-today': data.isSelected }">
            <div class="date-num">
              {{ data.day.split('-').slice(2).join('') }}
            </div>

            <div class="duty-list scrollbar-custom">
              <div v-for="item in getDutyByDate(data.day)" :key="item.id" class="duty-item">
                <el-popover placement="top" trigger="hover" :width="200">
                  <template #default>
                    <div class="text-sm">
                      <p><strong>部门：</strong>{{ item.deptName || '暂无' }}</p>
                      <p><strong>提醒次数：</strong>{{ item.smsCount }}次</p>
                      <p
                        ><strong>类型：</strong>
                        <DictTag :type="DICT_TYPE.DUTY_STAFF_TYPE" :value="item.staffType" />
                      </p>
                    </div>
                  </template>
                  <template #reference>
                    <el-tag
                      size="small"
                      :type="getStaffTagType(item.staffType)"
                      class="w-full mb-1 truncate cursor-pointer"
                    >
                      {{ item.staffName }}{{ item.deptName ? `(${item.deptName})` : '' }}
                    </el-tag>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import * as DutyApi from '@/api/system/dutystaff'

// 1. 状态定义
const loading = ref(false)
const currentDate = ref(new Date())
const dutyList = ref<DutyApi.DutyStaffRespVO[]>([])

// 2. 获取数据方法
const fetchData = async (date: Date) => {
  loading.value = true
  try {
    // 获取当前日历视图的范围
    // 为了保险起见，获取上个月25号到下下个月5号的数据，覆盖日历的首尾空白格
    const currentMonth = dayjs(date)
    const startTime = currentMonth.subtract(1, 'month').date(25).format('YYYY-MM-DD 00:00:00')
    const endTime = currentMonth.add(2, 'month').date(5).format('YYYY-MM-DD 23:59:59')

    const data = await DutyApi.StaffApi.getDutyStaffList({ startTime, endTime })
    console.log(data)
    dutyList.value = data
  } finally {
    loading.value = false
  }
}

// 3. 核心工具：根据日期筛选数据
const getDutyByDate = (dayStr: string) => {
  // dayStr 是 Element Plus 传回来的 'YYYY-MM-DD'
  return dutyList.value.filter((item) => {
    if (!item.dutyDate) return false
    // 后端返回的时间通常是 ISO 字符串或时间戳，需要格式化比对
    return dayjs(item.dutyDate).format('YYYY-MM-DD') === dayStr
  })
}

// 4. 辅助样式工具：根据字典值返回 Tag 颜色
// 注意：如果你已经在字典管理里配置了 CSS Class，可以直接用 DictTag，这里是为了演示如何手动控制
const getStaffTagType = (value: string) => {
  // 获取字典数组
  const dicts = getDictOptions(DICT_TYPE.DUTY_STAFF_TYPE)
  // 查找匹配项 (用 == 兼容字符串 '1' 和数字 1)
  const dict = dicts.find((d: any) => d.value == value)
  // 返回 colorType，如果没配颜色则默认 primary
  return dict && dict.colorType ? dict.colorType : 'primary'
}

// 5. 监听日期变化（切换月份时自动刷新数据）
watch(
  () => currentDate.value,
  (newDate) => {
    fetchData(newDate)
  },
  { immediate: true } // 初始化时立即执行
)
</script>

<style scoped lang="scss">
/* Element Plus 日历样式深度覆盖 */
:deep(.el-calendar-table .el-calendar-day) {
  height: 120px; /* 固定高度 */
  padding: 5px;
  overflow: hidden; /* 防止撑开，内部滚动 */
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.date-num {
  font-weight: bold;
  margin-bottom: 4px;
  color: #606266;
}

.duty-list {
  flex: 1;
  overflow-y: auto; /* 超出高度显示滚动条 */
}

/* 隐藏滚动条但保留功能（Webkit浏览器） */
.scrollbar-custom::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}
</style>
