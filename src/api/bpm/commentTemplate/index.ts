import request from '@/config/axios'

export interface PersonalTemplate {
  oaIdeaId?: number
  ideaMessage: string
  ideaType?: string
  ideaOrder: number
}
export interface BusinessTemplate {
  commentGuid?: string
  bizdefGuid: string
  commentName: string
  commentCode: string
  commentContent: string
  commentAct?: string
  meetFunction?: string
  seqOrder: number
}
export interface TemplateBinding {
  processDefinitionKey: string
  bizdefGuid: string
  ideaType: string
  sourceType: string
  nodeMapping: string
  fieldMapping: string
}
export interface TemplateOptions {
  ideaType: string
  personal: PersonalTemplate[]
  business: BusinessTemplate[]
}
const url = '/bpm/comment-template'
export const CommentTemplateApi = {
  options: (taskId: string, code = 'Default'): Promise<TemplateOptions> =>
    request.get({ url: `${url}/options`, params: { taskId, code } }),
  render: (taskId: string, id: string, code = 'Default'): Promise<string> =>
    request.get({ url: `${url}/render`, params: { taskId, id, code } }),
  savePersonal: (data: PersonalTemplate): Promise<number> =>
    request.post({ url: `${url}/personal/save`, data }),
  deletePersonal: (id: number) => request.delete({ url: `${url}/personal/delete`, params: { id } }),
  orderPersonal: (data: number[]) => request.put({ url: `${url}/personal/order`, data }),
  business: (bizdefGuid: string): Promise<BusinessTemplate[]> =>
    request.get({ url: `${url}/business/list`, params: { bizdefGuid } }),
  saveBusiness: (data: BusinessTemplate) => request.post({ url: `${url}/business/save`, data }),
  deleteBusiness: (id: string) => request.delete({ url: `${url}/business/delete`, params: { id } }),
  bindings: (): Promise<TemplateBinding[]> => request.get({ url: `${url}/binding/list` }),
  saveBinding: (
    data: Omit<TemplateBinding, 'nodeMapping' | 'fieldMapping'> & {
      nodeMapping: Record<string, string>
      fieldMapping: Record<string, string>
    }
  ) => request.post({ url: `${url}/binding/save`, data }),
  deleteBinding: (processDefinitionKey: string) =>
    request.delete({ url: `${url}/binding/delete`, params: { processDefinitionKey } }),
  fields: (sourceType: string): Promise<string[]> =>
    request.get({ url: `${url}/fields`, params: { sourceType } })
}
