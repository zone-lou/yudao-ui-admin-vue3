import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 行政复议扩展信息 */
export interface XzfyKz {
          id: number; // 主键
          xmGuid: string; // 备用主键
          fyjdRq: string | Dayjs; // 复议决定日期
          fyJg: number; // 复议结果：0撤销，1维持
          zksRq: string | Dayjs; // 转业务科室日期
          yjsWh: string; // 意见书文号
          yjsRq: string | Dayjs; // 意见书日期
          xzPc: number; // 行政赔偿，单位：元
          zxQk: string; // 执行情况
          sfZd: number; // 是否装订：0否，1是
          zdr: string; // 装订人
          zdRq: string | Dayjs; // 装订日期
          sfYj: number; // 是否移交：0否，1是
          yjr: string; // 移交人
          yjRq: string | Dayjs; // 移交日期
          bz: string; // 备注
          yjsNr: string; // 意见书内容
          tzRq: string | Dayjs; // 听证日期
          processInstanceId: string; // 流程实例的编号
  }

// 行政复议扩展 API
export const XzfyKzApi = {
  // 查询行政复议扩展分页
  getXzfyKzPage: async (params: any) => {
    return await request.get({ url: `/bpm/xzfy-kz/page`, params })
  },

  // 查询行政复议扩展详情
  getXzfyKz: async (id: number) => {
    return await request.get({ url: `/bpm/xzfy-kz/get?id=` + id })
  },

  // 新增行政复议扩展
  createXzfyKz: async (data: XzfyKz) => {
    return await request.post({ url: `/bpm/xzfy-kz/create`, data })
  },

  // 修改行政复议扩展
  updateXzfyKz: async (data: XzfyKz) => {
    return await request.put({ url: `/bpm/xzfy-kz/update`, data })
  },

  // 删除行政复议扩展
  deleteXzfyKz: async (id: number) => {
    return await request.delete({ url: `/bpm/xzfy-kz/delete?id=` + id })
  },

  /** 批量删除行政复议扩展 */
  deleteXzfyKzList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/xzfy-kz/delete-list?ids=${ids.join(',')}` })
  },

  // 导出行政复议扩展 Excel
  exportXzfyKz: async (params) => {
    return await request.download({ url: `/bpm/xzfy-kz/export-excel`, params })
  }
}