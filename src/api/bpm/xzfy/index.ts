import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 行政复议扩展信息 */
export interface XzfyKz {
  id: number // 主键
  xmGuid: string // 备用主键
  fyjdRq: string | Dayjs // 复议决定日期
  fyJg: number // 复议结果：0撤销，1维持
  zksRq: string | Dayjs // 转业务科室日期
  yjsWh: string // 意见书文号
  yjsRq: string | Dayjs // 意见书日期
  xzPc: number // 行政赔偿，单位：元
  zxQk: string // 执行情况
  sfZd: number // 是否装订：0否，1是
  zdr: string // 装订人
  zdRq: string | Dayjs // 装订日期
  sfYj: number // 是否移交：0否，1是
  yjr: string // 移交人
  yjRq: string | Dayjs // 移交日期
  bz: string // 备注
  yjsNr: string // 意见书内容
  tzRq: string | Dayjs // 听证日期
  processInstanceId: string // 流程实例的编号
}

/** 行政复议信息 */
export interface Xzfy {
  id: number // 主键
  xmGuid: string // 备用主键
  swWh: string // 来文号
  swJg: string // 来文机关
  swRq: string | Dayjs // 来文日期
  sqr: string // 申请人
  bsqr: string // 被申请人
  dsr: string // 第三人
  tdZl: string // 土地坐落
  lb1: string // 类别一
  lb2: string // 类别二
  lb3: string // 类别三
  fyNr: string // 复议请求
  cbr: string // 承办人
  cbRq: string | Dayjs // 承办日期
  sfyjgRq: string | Dayjs // 送复议机关日期
  xzq: string // 行政区（街道、村）
  issupervise: number // 监督监管
  zhubandate: string | Dayjs // 办理时限
  mailTip: number // 是否已寄件提醒
  processInstanceId: string // 流程实例的编号
  xzfykz?: XzfyKz
}

// 行政复议 API
export const XzfyApi = {
  // 查询行政复议分页
  getXzfyPage: async (params: any) => {
    return await request.get({ url: `/bpm/xzfy/page`, params })
  },

  // 查询未关联行政诉讼的行政复议分页
  getXzfyPageUnlinked: async (params: any) => {
    return await request.get({ url: `/bpm/xzfy/page-unlinked`, params })
  },

  // 查询行政复议详情
  getXzfy: async (id: number) => {
    return await request.get({ url: `/bpm/xzfy/get?id=` + id })
  },

  // 新增行政复议
  createXzfy: async (data: Xzfy) => {
    return await request.post({ url: `/bpm/xzfy/create`, data })
  },

  // 修改行政复议
  updateXzfy: async (data: Xzfy) => {
    return await request.put({ url: `/bpm/xzfy/update`, data })
  },

  // 删除行政复议
  deleteXzfy: async (id: number) => {
    return await request.delete({ url: `/bpm/xzfy/delete?id=` + id })
  },

  /** 批量删除行政复议 */
  deleteXzfyList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/xzfy/delete-list?ids=${ids.join(',')}` })
  },

  // 导出行政复议 Excel
  exportXzfy: async (params) => {
    return await request.download({ url: `/bpm/xzfy/export-excel`, params })
  },

  // ==================== 子表（行政复议扩展） ====================

  // 获得行政复议扩展
  getXzfyKzByXmGuid: async (xmGuid) => {
    return await request.get({ url: `/bpm/xzfy/xzfy-kz/get-by-xm-guid?xmGuid=` + xmGuid })
  }
}
