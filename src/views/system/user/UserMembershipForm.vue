<template>
  <Dialog v-model="visible" :title="`${userName} · 角色与用户组`" width="640px">
    <div v-loading="loading" class="membership">
      <section class="membership-section" aria-labelledby="membership-roles-title">
        <div class="section-heading">
          <h3 id="membership-roles-title">当前角色</h3>
          <span class="section-count">{{ detail?.roleCount ?? 0 }}</span>
        </div>
        <div class="role-list">
          <el-tag v-for="role in detail?.roles || []" :key="role.id" type="info" effect="plain">
            {{ role.name }}
          </el-tag>
          <span v-if="!detail?.roles?.length" class="empty-text">暂无角色</span>
        </div>
      </section>

      <section class="membership-section" aria-labelledby="membership-groups-title">
        <div class="section-heading">
          <h3 id="membership-groups-title">已加入的用户组</h3>
          <span class="section-count">{{ detail?.groupCount ?? 0 }}</span>
        </div>
        <div class="group-list">
          <div class="group-list-header" aria-hidden="true">
            <span>用户组名称</span>
            <span>成员来源</span>
          </div>
          <ul v-if="detail?.groups?.length" class="group-rows">
            <li v-for="group in detail.groups" :key="group.id" class="group-row">
              <span class="group-name">{{ group.name }}</span>
              <div class="group-sources">
                <span v-if="group.manual" class="source-badge source-badge--manual">手动加入</span>
                <span v-for="roleId in group.roleIds" :key="roleId" class="source-badge">
                  <Icon icon="ep:connection" :size="13" />
                  角色 · {{ roleNames.get(roleId) || `角色 ${roleId}` }}
                </span>
              </div>
            </li>
          </ul>
          <div v-else class="group-empty">暂未加入任何用户组</div>
        </div>
      </section>

      <section v-if="canEdit" class="manual-editor" aria-labelledby="membership-manual-title">
        <div class="section-heading">
          <h3 id="membership-manual-title">额外加入用户组</h3>
          <span class="optional-label">按需添加</span>
        </div>
        <p id="membership-manual-hint" class="section-description">
          角色关联的用户组会自动加入，无需重复添加。
        </p>
        <el-select
          v-model="manualGroupIds"
          multiple
          filterable
          clearable
          class="manual-select"
          placeholder="搜索并选择用户组"
          aria-labelledby="membership-manual-title"
          aria-describedby="membership-manual-hint"
        >
          <el-option
            v-for="group in groupOptions"
            :key="group.id"
            :value="group.id"
            :label="group.name"
          />
        </el-select>
      </section>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button v-if="canEdit" type="primary" :loading="saving" :disabled="loading" @click="save">
        保存更改
      </el-button>
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

<style scoped lang="scss">
.membership {
  max-height: 65vh;
  padding: 6px 10px 10px;
  overflow-y: auto;
  color: var(--el-text-color-primary);
}

.membership-section + .membership-section {
  margin-top: 24px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
  }
}

.section-count {
  min-width: 22px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
  color: var(--el-text-color-secondary);
  text-align: center;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.role-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.el-tag) {
    height: 28px;
    padding: 0 10px;
    color: var(--el-text-color-regular);
    border-color: var(--el-border-color-light);
  }
}

.empty-text,
.group-empty {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.group-list {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.group-list-header,
.group-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
}

.group-list-header {
  padding-top: 9px;
  padding-bottom: 9px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
}

.group-rows {
  padding: 0;
  margin: 0;
  list-style: none;
}

.group-row + .group-row {
  border-top: 1px solid var(--el-border-color-lighter);
}

.group-name {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.group-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  font-size: 12px;
  line-height: 20px;
  color: var(--el-color-primary);
  overflow-wrap: anywhere;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
}

.source-badge--manual {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

.group-empty {
  padding: 24px 16px;
  text-align: center;
}

.manual-editor {
  padding: 16px;
  margin-top: 24px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;

  .section-heading {
    margin-bottom: 4px;
  }
}

.optional-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.section-description {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 20px;
  color: var(--el-text-color-regular);
}

.manual-select {
  width: 100%;
}

@media (width <= 600px) {
  .membership {
    padding-right: 0;
    padding-left: 0;
  }

  .group-list-header,
  .group-row {
    gap: 10px;
    padding-right: 12px;
    padding-left: 12px;
  }
}
</style>
