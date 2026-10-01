<template>
  <Dialog v-model="visible" :title="`${roleName}关联用户组`" width="560px">
    <el-form v-loading="loading" label-width="100px">
      <el-form-item label="用户组">
        <el-select v-model="groupIds" multiple filterable clearable class="w-full" placeholder="选择角色自动加入的用户组">
          <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="saving" :disabled="loading" @click="save">保存</el-button>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import * as UserGroupApi from '@/api/bpm/userGroup'
import * as MembershipApi from '@/api/bpm/userGroup/membership'
import type { RoleVO } from '@/api/system/role'

defineOptions({ name: 'RoleGroupMappingForm' })

const message = useMessage()
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const roleId = ref(0)
const roleName = ref('')
const groupIds = ref<number[]>([])
const groups = ref<{ id: number; name: string }[]>([])

const open = async (role: RoleVO) => {
  visible.value = true
  roleId.value = role.id
  roleName.value = role.name
  groupIds.value = []
  groups.value = []
  loading.value = true
  try {
    const [mapped, options] = await Promise.all([
      MembershipApi.getRoleGroups(role.id),
      UserGroupApi.getUserGroupSimpleList()
    ])
    groupIds.value = mapped
    groups.value = options.map((group) => ({ id: group.id, name: group.name }))
    const missingIds = mapped.filter((id) => !groups.value.some((group) => group.id === id))
    const missingGroups = await Promise.all(missingIds.map((id) => UserGroupApi.getUserGroup(id)))
    groups.value.push(...missingGroups.filter(Boolean).map((group) => ({ id: group.id, name: `${group.name}（已停用）` })))
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    await MembershipApi.updateRoleGroups(roleId.value, groupIds.value)
    message.success('角色与用户组映射已更新')
    visible.value = false
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>
