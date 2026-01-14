import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 节假日信息 */
export interface Holiday {
          id: number; // 节假日内码
          settingDate: string | Dayjs; // 设置日期
          isworkday: number; // 是否是工作日
          holiDesc: string; // 假日描述
  }

// 节假日 API
export const HolidayApi = {
  // 查询节假日分页
  getHolidayPage: async (params: any) => {
    return await request.get({ url: `/system/holiday/page`, params })
  },

  // 查询节假日详情
  getHoliday: async (id: number) => {
    return await request.get({ url: `/system/holiday/get?id=` + id })
  },

  // 新增节假日
  createHoliday: async (data: Holiday) => {
    return await request.post({ url: `/system/holiday/create`, data })
  },

  // 修改节假日
  updateHoliday: async (data: Holiday) => {
    return await request.put({ url: `/system/holiday/update`, data })
  },

  // 删除节假日
  deleteHoliday: async (id: number) => {
    return await request.delete({ url: `/system/holiday/delete?id=` + id })
  },

  /** 批量删除节假日 */
  deleteHolidayList: async (ids: number[]) => {
    return await request.delete({ url: `/system/holiday/delete-list?ids=${ids.join(',')}` })
  },

  // 导出节假日 Excel
  exportHoliday: async (params) => {
    return await request.download({ url: `/system/holiday/export-excel`, params })
  },

  // 节假日导入模板
  importHolidayTemplate:()=>{
    return request.download({ url: '/system/holiday/get-import-template' })
  }
}
