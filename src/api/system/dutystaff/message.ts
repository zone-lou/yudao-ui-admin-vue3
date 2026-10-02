import request from '@/config/axios'

export interface DutyTemplateVO {
  code: string
  configured: boolean
  name?: string
  channelCode?: string
  content?: string
  status?: number
}

export interface DutyParamVO {
  id: number
  label: string
  value: string
}

export const getDutyTemplates = (): Promise<DutyTemplateVO[]> => {
  return request.get({ url: '/system/duty/message/templates' })
}

export const updateDutyTemplateContent = (code: string, content: string) => {
  return request.put({ url: '/system/duty/message/template-content', data: { code, content } })
}

export const getDutyParams = (): Promise<DutyParamVO[]> => {
  return request.get({ url: '/system/duty/message/params' })
}

export const createDutyParam = (label: string, value: string) => {
  return request.post({ url: '/system/duty/message/param', data: { label, value } })
}

export const updateDutyParamValue = (id: number, value: string) => {
  return request.put({ url: '/system/duty/message/param-value', data: { id, value } })
}
