<template>
  <Dialog v-model="visible" :title="`${userName}的角色与用户组`" width="720px">
    <div v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="角色数量">{{ detail?.roleCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="用户组数量">{{ detail?.groupCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="角色" :span="2">
          <el-space wrap>
            <el-tag v-for="role in detail?.roles || []" :key="role.id">{{ role.name }}</el-tag>
            <span v-if="!detail?.roles?.length">暂无角色</span>
          </el-space>
        </el-descriptions-item>
      </el-descriptions>

      <el-table :data="detail?.groups || []" class="mt-16px" max-height="320">
        <el-table-column label="用户组" prop="name" min-width="150" />
        <el-table-column label="加入方式" min-width="240">
          <template #default="{ row }">
            <el-tag v-if="row.manual" class="mr-8px">手动加入</el-tag>
            <el-tag v-for="roleId in row.roleIds" :key="roleId" type="success" class="mr-8px">
              {{ roleNames.get(roleId) || `角色 ${roleId}` }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-form v-if="canEdit" label-width="100px" class="mt-20px">
        <el-form-item label="手动用户组">
          <el-select v-model="manualGroupIds" multiple filterable clearable class="w-full" placeholder="选择用户组">
            <el-option v-for="group in groupOptions" :key="group.id" :value="group.id" :label="group.name" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button v-if="canEdit" type="primary" :loading="saving" :disabled="loading" @click="save">保存手动用户组</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { checkPermi } from '@/utils/permission'
import * as UserGroupApi from '@/api/bpm/userGroup'
import * as MembershipApi from '@/api/bpm/userGroup/membership'
import type { UserVO } from '@/api/system/user'

defineOptions({ name: 'UserMembershipForm' })

const message = useMessage()
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const canEdit = checkPermi(['bpm:user-group:update'])
const userId = ref(0)
const userName = ref('')
const detail = ref<MembershipApi.UserMembership>()
const manualGroupIds = ref<number[]>([])
const groupOptions = ref<{ id: number; name: string }[]>([])
const roleNames = computed(() => new Map((detail.value?.roles || []).map((role): [number, string] => [role.id, role.name])))

const open = async (user: UserVO) => {
  visible.value = true
  userId.value = user.id
  userName.value = user.nickname || user.username
  detail.value = undefined
  manualGroupIds.value = []
  await load()
}

const load = async () => {
  loading.value = true
  try {
    const [membership, groups] = await Promise.all([
      MembershipApi.getUserMembership(userId.value),
      canEdit ? UserGroupApi.getUserGroupSimpleList() : Promise.resolve([])
    ])
    detail.value = membership
    groupOptions.value = groups.map((group) => ({ id: group.id, name: group.name }))
    for (const group of membership.groups.filter((item) => item.manual)) {
      if (!groupOptions.value.some((item) => item.id === group.id)) {
        groupOptions.value.push({ id: group.id, name: `${group.name}（已停用）` })
      }
    }
    manualGroupIds.value = membership.groups.filter((group) => group.manual).map((group) => group.id)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    await MembershipApi.updateUserManualGroups(userId.value, manualGroupIds.value)
    message.success('手动用户组已更新')
    await load()
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>
