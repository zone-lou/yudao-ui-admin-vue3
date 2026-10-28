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

// 土地用途认定业务接口契约；后端业务接口接入后可进行保存、发送联调。
export const landApi = {
  get: (id: number) => request.get<LandRecord>({ url: '/bpm/land/get', params: { id } }),
  save: (data: LandRecord) => request.post<LandSaveResult>({ url: '/bpm/land/save', data }),
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
