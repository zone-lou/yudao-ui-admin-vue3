import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 假期申请审批信息 */
export interface leave {
  id: number // 假期申请审批内码
  applyDate: string | Dayjs // 申请时间
  qxjStartDate: string | Dayjs // 开始时间(请假时间段中最小的时间)
  qxjEndDate: string | Dayjs // 结束时间(请假时间段中最大的时间)
  qxjType: number // 请（休）假种类
  sjReason: string // 事假理由
  totalTs: number // 共计天数
  spzt: number // 审批状态
  userid: number // 申请用户
  filepath: string // 文件地址
  processInstanceId: string // 流程实例的编号
}
export interface LeaveSummaryVO {
  year?: number
  month?: number
  deptId?: number
  userId?: number
  qxjType?: number
}

// 假期申请审批 API
export const leaveApi = {
  // 查询假期申请审批分页
  getleavePage: async (params: any) => {
    return await request.get({ url: `/bpm/leave/page`, params })
  },

  // 查询假期申请审批详情
  getleave: async (id: number) => {
    return await request.get({ url: `/bpm/leave/get?id=` + id })
  },

  // 新增假期申请审批
  createleave: async (data: leave) => {
    return await request.post({ url: `/bpm/leave/create`, data })
  },

  // 修改假期申请审批
  updateleave: async (data: leave) => {
    return await request.put({ url: `/bpm/leave/update`, data })
  },

  // 删除假期申请审批
  deleteleave: async (id: number) => {
    return await request.delete({ url: `/bpm/leave/delete?id=` + id })
  },

  /** 批量删除假期申请审批 */
  deleteleaveList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/leave/delete-list?ids=${ids.join(',')}` })
  },

  // 导出假期申请审批 Excel
  exportleave: async (params) => {
    return await request.download({ url: `/bpm/leave/export-excel`, params })
  },

  getLeaveSummary: async (params: LeaveSummaryVO) => {
    return await request.get({ url: '/bpm/leave/summary', params })
  },

  getLeaveDetailList: async (params: LeaveSummaryVO) => {
    return await request.get({ url: '/bpm/leave/detail-list', params })
  }
}
