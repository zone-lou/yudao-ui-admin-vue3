import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 值班信息 */
export interface Staff {
          id: number; // 主键
          dutyDate: string | Dayjs; // 值班日期
          staffType: string; // 人员类型
          userId: number; // 人员ID
          staffName: string; // 人员姓名
          smsCount: number; // 提醒次数
  }
export interface DutyStaffRespVO {
  id: number
  dutyDate: string
  staffType: string
  userId: number
  staffName: string
  smsCount: number
  deptName: string
}


// 值班 API
export const StaffApi = {
  // 查询值班分页
  getStaffPage: async (params: any) => {
    return await request.get({ url: `/system/duty/staff/page`, params })
  },

  // 查询值班详情
  getStaff: async (id: number) => {
    return await request.get({ url: `/system/duty/staff/get?id=` + id })
  },

  // 新增值班
  createStaff: async (data: Staff) => {
    return await request.post({ url: `/system/duty/staff/create`, data })
  },

  // 修改值班
  updateStaff: async (data: Staff) => {
    return await request.put({ url: `/system/duty/staff/update`, data })
  },

  // 删除值班
  deleteStaff: async (id: number) => {
    return await request.delete({ url: `/system/duty/staff/delete?id=` + id })
  },

  /** 批量删除值班 */
  deleteStaffList: async (ids: number[]) => {
    return await request.delete({ url: `/system/duty/staff/delete-list?ids=${ids.join(',')}` })
  },

  // 导出值班 Excel
  exportStaff: async (params) => {
    return await request.download({ url: `/system/duty/staff/export-excel`, params })
  },

  // 下载值班导入模板
  importDutyTemplate:()=>{
    return request.download({ url: '/system/duty/staff/get-import-template' })
  },

  getDutyStaffList: async (params: any)=>{
    return await request.get({ url: `/system/duty/staff/list`, params })
  }

}
