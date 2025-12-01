import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 假期申请审批信息 */
export interface Vacationrecord {
          applyDate: string | Dayjs; // 申请时间
          qxjStartDate: string | Dayjs; // 开始时间(请假时间段中最小的时间)
          qxjEndDate: string | Dayjs; // 结束时间(请假时间段中最大的时间)
          qxjType: number; // 请（休）假种类
          sjReason: string; // 事假理由
          totalTs: number; // 共计天数
          unitOpinion: string; // 所在单位（科室）意见
          unitOpinionShr: string; // 所在单位（科室）意见审核人
          unitOpinionDate: string | Dayjs; // 所在单位（科室）意见审核日期
          jbgsOpinion: string; // 局办公室意见
          jbgsOpinionShr: string; // 局办公室意见审核人
          jbgsOpinionDate: string | Dayjs; // 局办公室意见审核日期
          fjzOpinion: string; // 副局长意见
          fjzOpinionShr: string; // 副局长意见审核人
          fjzOpinionDate: string | Dayjs; // 副局长意见审核日期
          cwfjzOpinion: string; // 常务副局长意见
          cwfjzOpinionShr: string; // 常务副局长意见审核人
          cwfjzOpinionDate: string | Dayjs; // 常务副局长意见审核日期
          jzOpinion: string; // 局长意见
          jzOpinionShr: string; // 局长意见审核人
          jzOpinionDate: string | Dayjs; // 局长意见审核日期
          spzt: number; // 审批状态
          userid: number; // 申请用户
          xjDate: string | Dayjs; // 销假申请时间
          xjTs: number; // 销假总天数
          xjBz: string; // 销假备注
          xjSpzt: number; // 销假审批状态
          xjOption: string; // 销假审批意见
          xjOpinionShr: string; // 销假意见审核人
          dateDesc: string; // 请假时间描述（当请休假时间修改的时候进行更新）
  }

// 假期申请审批 API
export const VacationrecordApi = {
  // 查询假期申请审批分页
  getVacationrecordPage: async (params: any) => {
    return await request.get({ url: `/bpm/vacationrecord/page`, params })
  },

  // 查询假期申请审批详情
  getVacationrecord: async (id: number) => {
    return await request.get({ url: `/bpm/vacationrecord/get?id=` + id })
  },

  // 新增假期申请审批
  createVacationrecord: async (data: Vacationrecord) => {
    return await request.post({ url: `/bpm/vacationrecord/create`, data })
  },

  // 修改假期申请审批
  updateVacationrecord: async (data: Vacationrecord) => {
    return await request.put({ url: `/bpm/vacationrecord/update`, data })
  },

  // 删除假期申请审批
  deleteVacationrecord: async (id: number) => {
    return await request.delete({ url: `/bpm/vacationrecord/delete?id=` + id })
  },

  /** 批量删除假期申请审批 */
  deleteVacationrecordList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/vacationrecord/delete-list?ids=${ids.join(',')}` })
  },

  // 导出假期申请审批 Excel
  exportVacationrecord: async (params) => {
    return await request.download({ url: `/bpm/vacationrecord/export-excel`, params })
  }
}