import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 会议室信息 */
export interface MeetingRoom {
          id: number; // 主键
          roomName: string; // 会议室名称
          roomArea: number; // 会议室面积
          seats: number; // 会议室座位数
          remark: string; // 备注
          sequence: number; // 排序
  }

// 会议室 API
export const MeetingRoomApi = {
  // 查询会议室分页
  getMeetingRoomPage: async (params: any) => {
    return await request.get({ url: `/system/meeting-room/page`, params })
  },

  // 查询会议室详情
  getMeetingRoom: async (id: number) => {
    return await request.get({ url: `/system/meeting-room/get?id=` + id })
  },

  // 新增会议室
  createMeetingRoom: async (data: MeetingRoom) => {
    return await request.post({ url: `/system/meeting-room/create`, data })
  },

  // 修改会议室
  updateMeetingRoom: async (data: MeetingRoom) => {
    return await request.put({ url: `/system/meeting-room/update`, data })
  },

  // 删除会议室
  deleteMeetingRoom: async (id: number) => {
    return await request.delete({ url: `/system/meeting-room/delete?id=` + id })
  },

  /** 批量删除会议室 */
  deleteMeetingRoomList: async (ids: number[]) => {
    return await request.delete({ url: `/system/meeting-room/delete-list?ids=${ids.join(',')}` })
  },

  // 导出会议室 Excel
  exportMeetingRoom: async (params) => {
    return await request.download({ url: `/system/meeting-room/export-excel`, params })
  }
}