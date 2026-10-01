import request from '@/config/axios'

export const getRoleProcessViewKeys = (roleId: number): Promise<string[]> =>
  request.get({ url: '/bpm/process-view-scope/role-keys', params: { roleId } })

export const setRoleProcessViewKeys = (roleId: number, processDefinitionKeys: string[]) =>
  request.put({
    url: '/bpm/process-view-scope/role-keys',
    data: { roleId, processDefinitionKeys }
  })
