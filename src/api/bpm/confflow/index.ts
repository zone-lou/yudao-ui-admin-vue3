import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 会议报告单信息 */
export interface Confflow {
          id: number; // 主键
          docGuid?: string; // 办件GUID
          docType?: string; // 办件类型
          userId: number; // 申请人ID
          userName: string; // 申请人
          deptId: number; // 申请人部门ID
          deptName: string; // 申请人部门
          applyDate: string | Dayjs; // 申请日期
          startDate?: string | Dayjs; // 会议时间
          title?: string; // 会议名称
          content: string; // 提议内容
          remark: string; // 备注
          venue?: string; // 会议地点
          joinUnit: string; // 召集单位及召集人
          offerUnit: string; // 我局参会科室
          offerPerson: string; // 我局参会人员
          situation: string; // 参会人员会议情况及建议
          attachFilePath: string; // 附件路径
          processInstanceId?: string; // 流程实例编号
          status?: number; // 审批状态
          nextNodeAssignees?: any; // 下一节点审批人
          startUserSelectAssignees?: any; // 发起人自选审批人
          processVariablesStr?: string; // 流程变量
  }

export interface ConfflowSaveResult {
  id: number
  processInstanceId?: string
  taskId?: string
}

// 会议报告单 API
export const ConfflowApi = {
  // 查询会议报告单分页
  getConfflowPage: async (params: any) => {
    return await request.get({ url: `/bpm/confflow/page`, params })
  },

  // 查询会议报告单详情
  getConfflow: async (id: number) => {
    return await request.get({ url: `/bpm/confflow/get?id=` + id })
  },

  // 新增会议报告单
  createConfflow: async (data: Confflow) => {
    return await request.post({ url: `/bpm/confflow/create`, data })
  },

  // 保存会议报告单草稿
  saveConfflow: async (data: Confflow) => {
    return await request.post<ConfflowSaveResult>({ url: `/bpm/confflow/save`, data })
  },

  // 草稿发起会议报告单流程
  createFlowConfflow: async (data: Confflow) => {
    return await request.post({ url: `/bpm/confflow/create-flow`, data })
  },

  // 修改会议报告单
  updateConfflow: async (data: Confflow) => {
    return await request.put({ url: `/bpm/confflow/update`, data })
  },

  // 删除会议报告单
  deleteConfflow: async (data: { id: number; reason: string }) => {
    return await request.delete({ url: `/bpm/confflow/delete`, params: data })
  },

  /** 批量删除会议报告单 */
  deleteConfflowList: async (data: { ids: number[]; reason: string }) => {
    return await request.delete({ url: `/bpm/confflow/delete-list`, params: data })
  },

  // 导出会议报告单 Excel
  exportConfflow: async (params) => {
    return await request.download({ url: `/bpm/confflow/export-excel`, params })
  },

  // 获取会议报告单附件列表
  getConfflowAttachList: async (confflowId: number) => {
    return await request.get({
      url: `/bpm/confflow/confflow-attach/list-by-comm-id?commId=` + confflowId
    })
  }
}
