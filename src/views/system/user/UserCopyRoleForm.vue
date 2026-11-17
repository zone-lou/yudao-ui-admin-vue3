<template>
  <Dialog
    v-model="visible"
    title="复制角色与用户组"
    width="min(760px, calc(100vw - 32px))"
    :before-close="handleClose"
  >
    <div v-loading="loading">
      <el-form label-width="100px" class="copy-membership-form">
        <el-form-item label="来源人员">
          <span>{{ sourceName }}（{{ sourceUsername }}）</span>
        </el-form-item>
        <el-form-item label="目标人员">
          <el-select
            v-model="targetUserIds"
            multiple
            filterable
            :reserve-keyword="false"
            clearable
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="4"
            :multiple-limit="50"
            :disabled="saving || !ready"
            placeholder="搜索姓名或部门，可选择多名人员"
            class="w-full"
          >
            <el-option
              v-for="user in targetOptions"
              :key="user.id"
              :value="user.id"
              :label="`${user.nickname} · ${user.deptName || '无部门'}（${user.id}）`"
            />
          </el-select>
          <span class="text-gray-500">已选 {{ targetUserIds.length }} 人，每次最多 50 人</span>
        </el-form-item>
        <div class="copy-membership-options">
          <el-form-item v-if="canCopyRoles" label="复制角色">
            <div class="w-full">
              <div v-if="roles.length" class="mb-2">
                <el-checkbox
                  :model-value="selectedRoleIds.length === roles.length"
                  :indeterminate="
                    selectedRoleIds.length > 0 && selectedRoleIds.length < roles.length
                  "
                  :disabled="saving"
                  @change="toggleAll"
                  >全选</el-checkbox
                >
                <span class="ml-3 text-gray-500">已选 {{ selectedRoleIds.length }} 个角色</span>
              </div>
              <el-checkbox-group v-model="selectedRoleIds" :disabled="saving">
                <el-checkbox v-for="role in roles" :key="role.id" :label="role.id">
                  {{ role.name }}
                </el-checkbox>
              </el-checkbox-group>
              <el-empty
                v-if="ready && !roles.length"
                description="该人员没有可复制的启用角色"
                :image-size="60"
              />
              <div v-if="skippedCount" class="text-gray-500">
                {{ skippedCount }} 个已停用或不可用角色不参与复制。
              </div>
            </div>
          </el-form-item>
          <el-form-item v-if="canCopyGroups" label="复制用户组">
            <div class="w-full">
              <div v-if="groups.length" class="mb-2">
                <el-checkbox
                  :model-value="selectedGroupIds.length === groups.length"
                  :indeterminate="
                    selectedGroupIds.length > 0 && selectedGroupIds.length < groups.length
                  "
                  :disabled="saving"
                  @change="toggleAllGroups"
                  >全选</el-checkbox
                >
                <span class="ml-3 text-gray-500">已选 {{ selectedGroupIds.length }} 个用户组</span>
              </div>
              <el-checkbox-group v-model="selectedGroupIds" :disabled="saving">
                <el-checkbox v-for="group in groups" :key="group.id" :label="group.id">
                  {{ group.name }}
                </el-checkbox>
              </el-checkbox-group>
              <el-empty
                v-if="ready && !groups.length"
                description="该人员没有可复制的启用用户组"
                :image-size="60"
              />
              <div v-if="skippedGroupCount" class="text-gray-500">
                {{ skippedGroupCount }} 个已停用或不可用用户组不参与复制。
              </div>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <template #footer>
      <el-button :disabled="saving" @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="saving"
        :disabled="
          !ready || (!selectedRoleIds.length && !selectedGroupIds.length) || !targetUserIds.length
        "
        @click="submit"
        >确认复制</el-button
      >
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as MembershipApi from '@/api/bpm/userGroup/membership'
import * as UserGroupApi from '@/api/bpm/userGroup'
import { checkPermi } from '@/utils/permission'
import * as UserApi from '@/api/system/user'
import * as RoleApi from '@/api/system/role'

defineOptions({ name: 'SystemUserCopyRoleForm' })
const emit = defineEmits(['success'])
const message = useMessage()
const canCopyRoles = checkPermi(['system:permission:assign-user-role'])
const canCopyGroups = checkPermi(['bpm:user-group:update'])
const visible = ref(false)
const loading = ref(false)
const ready = ref(false)
const saving = ref(false)
const sourceId = ref(0)
const sourceName = ref('')
const sourceUsername = ref('')
const roles = ref<RoleApi.RoleVO[]>([])
const selectedRoleIds = ref<number[]>([])
const groups = ref<{ id: number; name: string }[]>([])
const selectedGroupIds = ref<number[]>([])
const skippedGroupCount = ref(0)
const targetUserIds = ref<number[]>([])
const targetOptions = ref<Array<{ id: number; nickname: string; deptName?: string }>>([])
const skippedCount = ref(0)
let requestId = 0
const handleClose = (done: () => void) => {
  if (!saving.value) done()
}
const toggleAll = (checked: boolean | string | number) => {
  selectedRoleIds.value = checked ? roles.value.map((role) => role.id) : []
}
const toggleAllGroups = (checked: boolean | string | number) => {
  selectedGroupIds.value = checked ? groups.value.map((group) => group.id) : []
}
const open = async (user: UserApi.UserVO) => {
  const currentRequest = ++requestId
  sourceId.value = user.id
  sourceName.value = user.nickname
  sourceUsername.value = user.username
  roles.value = []
  selectedRoleIds.value = []
  groups.value = []
  selectedGroupIds.value = []
  skippedGroupCount.value = 0
  targetUserIds.value = []
  targetOptions.value = []
  skippedCount.value = 0
  ready.value = false
  visible.value = true
  loading.value = true
  try {
    const [membership, enabledRoles, enabledGroups, users] = await Promise.all([
      MembershipApi.getUserMembership(user.id),
      canCopyRoles ? RoleApi.getSimpleRoleList() : Promise.resolve([]),
      canCopyGroups ? UserGroupApi.getUserGroupSimpleList() : Promise.resolve([]),
      UserApi.getSimpleUserList()
    ])
    if (currentRequest !== requestId) return
    const assigned = new Set(membership.roles.map((role) => role.id))
    const joined = new Set(membership.groups.map((group) => group.id))
    roles.value = enabledRoles.filter((role) => assigned.has(role.id))
    selectedRoleIds.value = roles.value.map((role) => role.id)
    groups.value = enabledGroups.filter((group) => joined.has(group.id))
    selectedGroupIds.value = groups.value.map((group) => group.id)
    skippedCount.value = canCopyRoles ? assigned.size - roles.value.length : 0
    skippedGroupCount.value = canCopyGroups ? joined.size - groups.value.length : 0
    targetOptions.value = users.filter((target) => target.id !== user.id && target.status === 0)
    ready.value = true
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}
const submit = async () => {
  if (
    !ready.value ||
    saving.value ||
    (!selectedRoleIds.value.length && !selectedGroupIds.value.length) ||
    !targetUserIds.value.length
  )
    return
  saving.value = true
  try {
    try {
      await message.confirm(
        `确认将“${sourceName.value}”的 ${selectedRoleIds.value.length} 个角色、${selectedGroupIds.value.length} 个用户组复制给所选 ${targetUserIds.value.length} 人？`
      )
    } catch {
      return
    }
    await MembershipApi.copyUserMembership({
      sourceUserId: sourceId.value,
      targetUserIds: targetUserIds.value,
      roleIds: selectedRoleIds.value,
      groupIds: selectedGroupIds.value
    })
    message.success('复制成功')
    visible.value = false
    emit('success')
  } finally {
    saving.value = false
  }
}
defineExpose({ open })
</script>

<style scoped lang="scss">
.copy-membership-form {
  display: flex;
  flex-direction: column;
  height: min(520px, 55vh);

  > :deep(.el-form-item) {
    flex-shrink: 0;
  }
}

.copy-membership-options {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
