import { ref } from 'vue'
import { HolidayApi } from '@/api/system/holiday'
import type { OutingCalendar } from './time'

/** 复用系统节假日配置；加载失败时抛出错误，不能按普通周一到周五继续提交。 */
export const useOutingCalendar = () => {
  const calendar = ref<OutingCalendar | null>(null)
  let pending: Promise<OutingCalendar> | undefined
  const ensureCalendar = async (): Promise<OutingCalendar> => {
    if (calendar.value) return calendar.value
    if (!pending) {
      pending = HolidayApi.getHolidaySummary(String(new Date().getFullYear())).then((rows) => {
        if (!Array.isArray(rows)) throw new Error('节假日配置格式错误')
        const result: OutingCalendar = {}
        // 当前接口返回全部年份，跨年公出也使用对应年份的配置。
        for (const row of rows) {
          for (const date of (row.restDay || '').split(',')) {
            if (date.trim()) result[date.trim()] = false
          }
        }
        for (const row of rows) {
          for (const date of (row.workDay || '').split(',')) {
            if (date.trim()) result[date.trim()] = true
          }
        }
        calendar.value = result
        return result
      }).finally(() => { pending = undefined })
    }
    return pending
  }
  return { calendar, ensureCalendar }
}
