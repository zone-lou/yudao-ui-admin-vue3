import request from '@/config/axios'

export const LAND_PROCESS_KEY = 'lang_use'
export const LAND_REGISTER_NODE = 'Activity_1waprli'

export interface LandAttachment {
  id?: number
  attachFileId: number
  fileName: string
  filePath: string
  fileUrl?: string
  fileExtension?: string
}

export interface LandRecord {
  id?: number
  processInstanceId?: string
  taskId?: string
  projectName: string
  location: string
  deptOpinion: string
  applyDate: number | string
  startUserName?: string
  deptName?: string
  filepath: string
  fileList: LandAttachment[]
}

export interface LandSaveResult {
  id: number
  processInstanceId?: string
  taskId?: string
}

export interface LandSubmitData extends LandRecord {
  nextNodeAssignees?: Record<string, number[]>
  processVariablesStr?: string
  sendSms?: boolean
}

export interface LandPageParams extends PageParam {
  projectName?: string
  location?: string
  startUserName?: string
  status?: number
  applyDate?: string[]
}

export interface LandPageItem {
  id: number
  projectName: string
  location: string
  startUserName: string
  deptName: string
  applyDate: number | string
  status: number
  processInstanceId?: string
}
export const landApi = {
  getPage: (params: LandPageParams) =>
    request.get<PageResult<LandPageItem>>({ url: '/bpm/land/page', params }),
  get: (id: number) => request.get<LandRecord>({ url: '/bpm/land/get', params: { id } }),
  save: (data: LandRecord) => request.post<LandSaveResult>({ url: '/bpm/land/save', data }),
  managementUpdate: (data: LandRecord) => request.put({ url: '/bpm/land/management-update', data }),
  delete: (params: { id: number; reason: string }) =>
    request.delete({ url: '/bpm/land/delete', params }),
  update: (data: LandRecord) => request.put({ url: '/bpm/land/update', data }),
  submit: (data: LandSubmitData) => request.post({ url: '/bpm/land/create-flow', data })
}

export const emptyLandRecord = (): LandRecord => ({
  projectName: '',
  location: '',
  deptOpinion: '',
  applyDate: Date.now(),
  filepath: '',
  fileList: []
})
