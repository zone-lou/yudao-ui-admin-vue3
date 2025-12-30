import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 外出请假补假信息 */
export interface TimeExplain {
  id: number // 主键
  checkDate: string | Dayjs // 登记时间
  checkBegin: string | Dayjs // 开始时间
  checkEnd: string | Dayjs // 结束时间
  reason: string // 原因说明
  status: number // 审核状态（0审批中 1审核完毕 2删除）
  days: number // 请假天数
  filepath: string // 文件路径
}

// 外出请假补假 API
export const TimeExplainApi = {
  // 查询外出请假补假分页
  getTimeExplainPage: async (params: any) => {
    return await request.get({ url: `/bpm/time-explain/page`, params })
  },

  // 查询外出请假补假详情
  getTimeExplain: async (id: number) => {
    return await request.get({ url: `/bpm/time-explain/get?id=` + id })
  },

  // // 新增外出请假补假
  // createTimeExplain: async (data: TimeExplain) => {
  //   return await request.post({ url: `/bpm/time-explain/create`, data })
  // },
  //新增公出请假
  createTimeExplain: async (data: TimeExplain) => {
    return await request.post({ url: `/bpm/time-explain/createout`, data })
  },

  // 修改外出请假补假
  updateTimeExplain: async (data: TimeExplain) => {
    return await request.put({ url: `/bpm/time-explain/update`, data })
  },

  // 删除外出请假补假
  deleteTimeExplain: async (id: number) => {
    return await request.delete({ url: `/bpm/time-explain/delete?id=` + id })
  },

  /** 批量删除外出请假补假 */
  deleteTimeExplainList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/time-explain/delete-list?ids=${ids.join(',')}` })
  },

  // 导出外出请假补假 Excel
  exportTimeExplain: async (params) => {
    return await request.download({ url: `/bpm/time-explain/export-excel`, params })
  }
}
