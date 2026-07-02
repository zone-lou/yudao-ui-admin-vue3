import request from '@/config/axios'

export type HistoryWorkflowAttachment = {
  id?: number | string
  filename?: string
  fileName?: string
  filepath?: string
  filePath?: string
  fileextension?: string
  fileExtension?: string
}

export type HistoryWorkflowComment = {
  id?: number | string
  userName?: string
  commentDetail?: string
  commentDate?: string
  nodeName?: string
  attachments?: HistoryWorkflowAttachment[]
}

export type HistoryWorkflowRecord = {
  id?: number | string
  actinstId?: number | string
  routeinstId?: number | string
  name?: string
  actinstName?: string
  fromActinstName?: string
  toActinstName?: string
  transactor?: string
  userName?: string
  startTime?: string
  startDate?: string
  endTime?: string
  endDate?: string
  passTime?: string
  status?: number | string
  comment?: string
  actinstComment?: string
  passComment?: string
}

export type HistoryWorkflowField = {
  label: string
  value?: any
}

export type HistoryWorkflowDetail = {
  processInstance?: {
    id?: string
    proinstId?: number | string
    projectId?: string
    name?: string
    proinstName?: string
    startUserName?: string
    startTime?: string
    startDate?: string
    endTime?: string
    endDate?: string
    status?: number | string
    proinstStatus?: number | string
    responsibleDept?: string
    deadline?: string
    emergency?: number | string
  }
  business?: {
    id?: number | string
    type?: string
    businessType?: string
    title?: string
    viewPath?: string
    fields?: HistoryWorkflowField[]
    data?: Record<string, any>
    attachments?: HistoryWorkflowAttachment[]
    comments?: HistoryWorkflowComment[]
  }
  activityNodes?: any[]
  records?: HistoryWorkflowRecord[]
  routeRecords?: HistoryWorkflowRecord[]
  comments?: HistoryWorkflowComment[]
  attachments?: HistoryWorkflowAttachment[]
}

export const HistoryWorkflowApi = {
  getDetail: async (params: { processInstanceId?: string; projectId?: string }) => {
    return await request.get<HistoryWorkflowDetail>({
      url: '/bpm/history-workflow/detail',
      params
    })
  }
}
