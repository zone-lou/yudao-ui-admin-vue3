import request from '@/config/axios'

export interface GroupMembership {
  id: number
  name: string
  manual: boolean
  roleIds: number[]
}

export interface UserMembership {
  userId: number
  roleCount: number
  groupCount: number
  roles: { id: number; name: string }[]
  groups: GroupMembership[]
}

export const getUserMembership = (userId: number): Promise<UserMembership> =>
  request.get({ url: '/bpm/user-group/membership/user', params: { userId } })

export const updateUserManualGroups = (userId: number, groupIds: number[]) =>
  request.put({ url: '/bpm/user-group/membership/user-manual-groups', data: { userId, groupIds } })

export const getRoleGroups = (roleId: number): Promise<number[]> =>
  request.get({ url: '/bpm/user-group/membership/role-groups', params: { roleId } })

export const updateRoleGroups = (roleId: number, groupIds: number[]) =>
  request.put({ url: '/bpm/user-group/membership/role-groups', data: { roleId, groupIds } })
