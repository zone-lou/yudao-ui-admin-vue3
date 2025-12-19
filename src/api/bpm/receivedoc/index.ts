import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 收文信息 */
export interface ReceiveDoc {
  id: number
  docClass: string // 单位类别
  sendDept: string // 来文单位
  sendDocNumber: string // 来文字号
  receiveDocNumber: string // 收文编号
  receiveTime: string | Dayjs // 收文日期
  subject: string // 主题
  urgencyDegree: string // 紧急程度
  remark: string // 备注
  docSecondClass: number // 文件类别
  attachFilePath: string // 附件路径
  zhubandate: string | Dayjs // 主办办结时间
  xiebandate: string | Dayjs // 协办办结时间
}

// 收文 API
export const ReceiveDocApi = {
  // 查询收文分页
  getReceiveDocPage: async (params: any) => {
    return await request.get({ url: `/bpm/receive-doc/page`, params })
  },

  // 查询收文详情
  getReceiveDoc: async (id: number) => {
    return await request.get({ url: `/bpm/receive-doc/get?id=` + id })
  },

  // 新增收文
  createReceiveDoc: async (data: ReceiveDoc) => {
    return await request.post({ url: `/bpm/receive-doc/create`, data })
  },

  // 修改收文
  updateReceiveDoc: async (data: ReceiveDoc) => {
    return await request.put({ url: `/bpm/receive-doc/update`, data })
  },

  // 删除收文
  deleteReceiveDoc: async (id: number) => {
    return await request.delete({ url: `/bpm/receive-doc/delete?id=` + id })
  },

  /** 批量删除收文 */
  deleteReceiveDocList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/receive-doc/delete-list?ids=${ids.join(',')}` })
  },

  // 导出收文 Excel
  exportReceiveDoc: async (params) => {
    return await request.download({ url: `/bpm/receive-doc/export-excel`, params })
  }
}
