<template>
  <Dialog
    v-model="visible"
    :title="`${roleName} — 角色成员`"
    width="min(960px, calc(100vw - 32px))"
    class="role-member-dialog"
    :close-on-click-modal="!saving"
    :close-on-press-escape="!saving"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="role-member-content">
      <div class="role-member-toolbar">
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索姓名、账号或部门"
          class="role-member-search"
        />
        <el-select v-model="accountStatus" aria-label="账号状态" class="role-member-status">
          <el-option label="正常账号" :value="0" />
          <el-option label="已停用账号" :value="1" />
          <el-option label="全部账号" :value="-1" />
        </el-select>
        <el-button :disabled="saving" @click="loadMembers">刷新</el-button>
      </div>
      <div class="role-member-summary"
        >总成员 {{ members.length }} 人，其中正常 {{ activeCount }} 人，已停用
        {{ disabledCount }} 人</div
      >
      <div v-if="canManage" class="role-member-toolbar">
        <el-select
          v-model="selectedUserId"
          filterable
          clearable
          :disabled="saving || !ready || roleDisabled"
          placeholder="选择要添加的人员（可搜索）"
          class="role-member-picker"
        >
          <el-option
            v-for="user in candidates"
            :key="user.id"
            :value="user.id"
            :label="`${user.nickname} · ${user.deptName || '无部门'}（${user.id}）`"
          />
        </el-select>
        <el-button
          type="primary"
          :loading="saving"
          :disabled="!selectedUserId || !ready || roleDisabled"
          @click="addMember"
          >添加成员</el-button
        >
        <span v-if="roleDisabled" class="text-gray-500">角色已停用，可移除现有成员</span>
      </div>
      <div class="role-member-table">
        <el-table :data="pageMembers" height="100%" border empty-text="暂无符合条件的成员">
          <el-table-column prop="nickname" label="姓名" min-width="120" />
          <el-table-column prop="username" label="账号" min-width="140" />
          <el-table-column prop="deptName" label="部门" min-width="180" />
          <el-table-column label="账号状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 0 ? 'success' : 'info'" size="small">
                {{ row.status === 0 ? '正常' : row.status === 1 ? '已停用' : '未知' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="canManage" label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button type="danger" link :disabled="saving || !ready" @click="removeMember(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <template #footer>
      <div class="role-member-pagination">
        <span>筛选结果 {{ filteredMembers.length }} 人</span>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filteredMembers.length"
          :page-sizes="[10, 20, 50, 100]"
          :pager-count="5"
          background
          layout="sizes, prev, pager, next"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as PermissionApi from '@/api/system/permission'
import * as UserApi from '@/api/system/user'
import type { RoleVO } from '@/api/system/role'
import { checkPermi } from '@/utils/permission'

defineOptions({ name: 'RoleMemberForm' })
const message = useMessage()
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const handleClose = (done: () => void) => {
  if (!saving.value) done()
}
const ready = ref(false)
const roleId = ref(0)
const roleName = ref('')
const roleDisabled = ref(false)
const keyword = ref('')
const accountStatus = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selectedUserId = ref<number>()
const members = ref<PermissionApi.RoleMemberVO[]>([])
const users = ref<Array<{ id: number; nickname: string; deptName?: string; status: number }>>([])
const canManage = computed(() => checkPermi(['system:permission:assign-user-role']))
const candidates = computed(() => {
  const memberIds = new Set(members.value.map((member) => member.id))
  return users.value.filter((user) => user.status === 0 && !memberIds.has(user.id))
})
const activeCount = computed(() => members.value.filter((member) => member.status === 0).length)
const disabledCount = computed(() => members.value.filter((member) => member.status === 1).length)
const filteredMembers = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return members.value.filter(
    (member) =>
      (accountStatus.value === -1 || member.status === accountStatus.value) &&
      [member.nickname, member.username, member.deptName].some((text) =>
        text?.toLowerCase().includes(query)
      )
  )
})
const pageMembers = computed(() =>
  filteredMembers.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
)
watch([pageSize, keyword, accountStatus], () => {
  page.value = 1
})
let requestId = 0
const loadMembers = async () => {
  const currentRequest = ++requestId
  loading.value = true
  ready.value = false
  try {
    const [records, options] = await Promise.all([
      PermissionApi.getRoleMembers(roleId.value),
      canManage.value ? UserApi.getSimpleUserList() : Promise.resolve([])
    ])
    if (currentRequest !== requestId) return
    members.value = records
    users.value = options
    page.value = Math.min(
      page.value,
      Math.max(1, Math.ceil(filteredMembers.value.length / pageSize.value))
    )
    ready.value = true
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}
const open = async (role: RoleVO) => {
  roleId.value = role.id
  roleName.value = role.name
  roleDisabled.value = role.status !== 0
  members.value = []
  users.value = []
  keyword.value = ''
  accountStatus.value = 0
  selectedUserId.value = undefined
  page.value = 1
  visible.value = true
  await loadMembers()
}
const addMember = async () => {
  if (!selectedUserId.value || saving.value || !ready.value) return
  saving.value = true
  try {
    await PermissionApi.updateRoleMember(roleId.value, selectedUserId.value, true)
    selectedUserId.value = undefined
    message.success('成员已添加')
    await loadMembers()
  } finally {
    saving.value = false
  }
}
const removeMember = async (member: PermissionApi.RoleMemberVO) => {
  if (saving.value || !ready.value) return
  saving.value = true
  try {
    try {
      await message.confirm(
        `确认移除“${member.nickname}”的“${roleName.value}”角色？其他角色不受影响。`
      )
    } catch {
      return
    }
    await PermissionApi.updateRoleMember(roleId.value, member.id, false)
    message.success('成员已移除')
    await loadMembers()
  } finally {
    saving.value = false
  }
}
defineExpose({ open })
</script>

<style lang="scss">
.role-member-dialog {
  &.el-dialog {
    display: flex;
    flex-direction: column;
    height: min(720px, 90vh);
    margin: 5vh auto !important;
  }

  &.is-fullscreen {
    height: 100vh;
    margin: 0 !important;
  }

  .el-dialog__header,
  .el-dialog__footer {
    flex-shrink: 0;
  }

  .el-dialog__body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .role-member-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    gap: 12px;
  }

  .role-member-toolbar {
    display: flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    align-items: center;
    gap: 12px;
  }

  .role-member-search {
    width: min(280px, 100%);
  }
  .role-member-status {
    width: 150px;
  }
  .role-member-picker {
    width: min(420px, 100%);
  }

  .role-member-summary {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .role-member-table {
    flex: 1;
    min-height: 0;
  }

  .role-member-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    .el-pagination {
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }
  }
}
</style>
