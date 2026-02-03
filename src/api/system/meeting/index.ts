import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 会议记录信息 */
export interface Meeting {
  id: number // 主键
  meetingRoomId: number // 会议室主键
  recordTime: string | Dayjs // 记录时间
  startTime: string | Dayjs // 开始时间
  endTime: string | Dayjs // 结束时间
  userId: number // 预约人ID
  staffName: string // 预约人姓名
  department: string // 预约人部门
  telephone: string // 预约人电话
  attendNumber: number // 参会人数
  meetingAbstract: string // 会议摘要
}


// 会议记录 API
export const MeetingApi = {
  // 查询会议记录分页
  getMeetingPage: async (params: any) => {
    return await request.get({ url: `/system/meeting/page`, params })
  },

  // 查询会议记录详情
  getMeeting: async (id: number) => {
    return await request.get({ url: `/system/meeting/get?id=` + id })
  },

  // 新增会议记录
  createMeeting: async (data: Meeting) => {
    return await request.post({ url: `/system/meeting/create`, data })
  },

  // 修改会议记录
  updateMeeting: async (data: Meeting) => {
    return await request.put({ url: `/system/meeting/update`, data })
  },

  // 删除会议记录
  deleteMeeting: async (id: number) => {
    return await request.delete({ url: `/system/meeting/delete?id=` + id })
  },

  /** 批量删除会议记录 */
  deleteMeetingList: async (ids: number[]) => {
    return await request.delete({ url: `/system/meeting/delete-list?ids=${ids.join(',')}` })
  },

  // 导出会议记录 Excel
  exportMeeting: async (params) => {
    return await request.download({ url: `/system/meeting/export-excel`, params })
  },

  getBookingSchedule: async (params: any) => {
    return await request.get({ url: '/system/meeting/schedule', params })
  },

  bookMeeting: async (data: Meeting) => {
    return await request.post({ url: `/system/meeting/book`, data })
  },

  etMonthlySchedule: (params: any) => {
    return request.get({ url: '/system/meeting/monthly-schedule', params })
  },

  exportMeetingMonth: async(params: any) => {
    return await request.download({
      url: `/system/meeting/export-meeting`,
      params
    })
  }
}
