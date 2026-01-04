import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 行政诉讼拓展信息 */
export interface XzssKz {
          id: number; // 主键
          xmGuid?: string; // 备用主键
          cdpjRq: string | Dayjs; // 裁定判决日期
          jyhRq: string | Dayjs; // 建议函日期
          jyhNr: string; // 建议函内容
          zksRq: string | Dayjs; // 转业务科室日期
          pjJg: string; // 判决结果
          cdJg: string; // 裁定结果
          xzPc: number; // 行政赔偿（单位：元）
          zxQk: string; // 执行情况
          zdr: string; // 装订人
          zdRq: string | Dayjs; // 装订日期
          zdQk: string; // 装订情况
          yjr: string; // 移交人
          yjRq: string | Dayjs; // 移交日期
          yjQk: string; // 移交情况
          bz: string; // 备注
          ktRq: string | Dayjs; // 开庭日期
          processInstanceId: string; // 流程实例的编号
}

/** 行政诉讼信息 */
export interface Xzss {
          id: number; // 主键
          xmGuid?: string; // 备用主键
          swWh: string; // 来文号
          swJg: string; // 来文机关
          swRq: string | Dayjs; // 收文日期
          sqr: string; // 原告
          bsqr: string; // 被告
          dsr: string; // 第三人
          tdZl: string; // 土地坐落
          ssLx: number; // 诉讼类型：1一审，2二审，3再审，如果多次，继续记录
          fyGuid: string; // 复议项目主键
          fyAh: string; // 复议案号
          ssGuid: string; // 上一审项目主键
          ssAh: string; // 上一审案号
          lb1: string; // 类别一
          lb2: string; // 类别二
          lb3: string; // 类别三
          lb4: string; // 类别四
          lb5: string; // 类别五
          ssNr: string; // 复议请求
          cbr: string; // 承办人
          cbRq: string | Dayjs; // 承办日期
          sfyjgRq: string | Dayjs; // 送法院日期
          ssr: string; // 上诉人
          bssr: string; // 被上诉人
          zssqr: string; // 再审申请人
          zsbsqr: string; // 再审被申请人
          issupervise: number; // 监督监管
          zhubandate: string | Dayjs; // 办理时限
          ssnr: string; // 诉讼内容
          mailTip: number; // 是否已寄件提醒
          processInstanceId: string; // 流程实例的编号
            xzsskz?: XzssKz
}

// 行政诉讼 API
export const XzssApi = {
  // 查询行政诉讼分页
  getXzssPage: async (params: any) => {
    return await request.get({ url: `/bpm/xzss/page`, params })
  },

  // 查询行政诉讼详情
  getXzss: async (id: number) => {
    return await request.get({ url: `/bpm/xzss/get?id=` + id })
  },

  // 新增行政诉讼
  createXzss: async (data: Xzss) => {
    return await request.post({ url: `/bpm/xzss/create`, data })
  },

  // 修改行政诉讼
  updateXzss: async (data: Xzss) => {
    return await request.put({ url: `/bpm/xzss/update`, data })
  },

  // 删除行政诉讼
  deleteXzss: async (id: number) => {
    return await request.delete({ url: `/bpm/xzss/delete?id=` + id })
  },

  /** 批量删除行政诉讼 */
  deleteXzssList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/xzss/delete-list?ids=${ids.join(',')}` })
  },

  // 导出行政诉讼 Excel
  exportXzss: async (params) => {
    return await request.download({ url: `/bpm/xzss/export-excel`, params })
  },

// ==================== 子表（行政诉讼拓展） ====================

  // 获得行政诉讼拓展
  getXzssKzByXmGuid: async (xmGuid) => {
    return await request.get({ url: `/bpm/xzss/xzss-kz/get-by-xm-guid?xmGuid=` + xmGuid })
  }
}