<template>
  <el-dialog
    v-model="visible"
    title="追加"
    :width="collapsed ? '360px' : 'min(1020px, calc(100vw - 32px))'"
    class="approve-send-dialog"
    :show-close="false"
    :class="{ 'approve-send-dialog--collapsed': collapsed }"
    draggable
    :close-on-click-modal="false"
    append-to-body
    :close-on-press-escape="!submitting"
    :before-close="beforeClose"
    destroy-on-close
    @closed="collapsed = false"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="approve-send-dialog__header">
        <span :id="titleId" :class="titleClass">追加</span>
        <div class="approve-send-dialog__actions" @mousedown.stop>
          <el-checkbox v-model="sendSms" :disabled="submitting" @change="savePreference">发送短信</el-checkbox>
          <button
            type="button"
            class="approve-send-dialog__action"
            :title="collapsed ? '展开' : '收起'"
            :aria-label="collapsed ? '展开' : '收起'"
            @click.stop="collapsed = !collapsed"
          >
            <Icon
              :icon="collapsed ? 'radix-icons:enter-full-screen' : 'radix-icons:exit-full-screen'"
            />
          </button>
          <button
            type="button"
            class="approve-send-dialog__action"
            :disabled="submitting"
            title="关闭"
            aria-label="关闭"
            @click.stop="close"
          >
            <Icon icon="ep:close" />
          </button>
        </div>
      </div>
    </template>
    <el-form
      v-show="!collapsed"
      label-width="90px"
    >
      <el-form-item label="追加原因">
        <el-input
          v-model="reason"
          :disabled="submitting"
          :maxlength="1000"
          type="textarea"
          placeholder="请输入追加原因（选填）"
          :rows="3"
        />
      </el-form-item>

      <div class="mb-10px min-h-[450px]" v-loading="loading">
        <template v-if="targets.length > 0">
          <div class="flex flex-row w-full h-[450px]" :class="{ 'pointer-events-none': submitting }">
            <!-- 左侧：节点及人员选择 Tab 区 -->
            <div
              class="flex-1 flex flex-col min-w-0 pr-3 border-r border-gray-200 dark:border-gray-700"
            >
              <el-tabs v-model="activeTab" class="w-full flex-1 flex flex-col">
                <el-tab-pane
                  v-for="group in groups"
                  :key="group.tabKey"
                  :name="group.tabKey"
                  class="flex-1"
                >
                  <template #label>
                    <span>{{ group.tabLabel }}</span>
                  </template>
                  <div
                    class="h-[390px] flex flex-row gap-3 overflow-x-auto overflow-y-hidden pb-1 custom-scrollbar"
                  >
                    <!-- 节点单个卡片 -->
                    <div
                      v-for="node in group.nodes"
                      :key="node.executionId"
                      class="border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex flex-col shadow-sm transition-shadow h-full min-w-[280px] max-w-[400px] flex-shrink-0"
                    >
                      <div
                        class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-none p-2 pb-1"
                      >
                        <el-checkbox
                          :model-value="Boolean(selections[node.executionId]?.length)"
                          :disabled="submitting || !node.candidates.some(user => !user.disabled)"
                          size="large"
                          class="!font-bold !text-gray-800 dark:!text-gray-200"
                          @change="(val) => selectAll(node, Boolean(val))"
                        >
                          <span class="inline-flex items-center">
                            <span>{{ node.nodeName }}</span>
                          </span>
                        </el-checkbox>
                      </div>
                      <div class="pl-2 py-1 flex-1 overflow-y-auto custom-scrollbar">
                        <div
                          v-if="!trees[node.executionId] || trees[node.executionId].length === 0"
                          class="text-gray-400 text-sm h-full flex items-center justify-center text-center px-4 min-h-[60px]"
                        >
                          暂无可追加的候选人员
                        </div>
                        <el-tree
                          class="!bg-transparent"
                          v-else
                          :ref="(el) => setTreeRef(el, node.executionId)"
                          :data="trees[node.executionId]"
                          :props="{ label: 'name', children: 'children', disabled: 'disabled' }"
                          show-checkbox
                          node-key="key"
                          :default-checked-keys="checkedKeys(node.executionId)"
                          default-expand-all
                          :check-strictly="false"
                          @check="
                            (_data, { checkedNodes }) => checkUsers(node, checkedNodes)
                          "
                        >
                          <template #default="{ data }">
                            <span
                              :class="{
                                'font-bold text-gray-700 dark:text-gray-200':
                                  data.children && data.children.length > 0,
                                'text-blue-600 dark:text-blue-400':
                                  (!data.children || data.children.length === 0) && !data.disabled,
                                'text-gray-400': data.disabled
                              }"
                            >
                              {{ data.name }}{{ data.userId && data.disabled ? '（已派发）' : '' }}
                            </span>
                          </template>
                        </el-tree>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>

            <!-- 右侧：全局共享的 “指派与发送人员” 统筹侧栏 -->
            <div
              class="w-[220px] ml-2 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <!-- 上半部分：已派发或占用人员 -->
              <div
                class="flex-1 flex flex-col min-h-0 border-b border-gray-200 dark:border-gray-700"
                v-if="assignedUsers.length > 0"
              >
                <div
                  class="px-2 py-1.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 flex-none bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                >
                  已派发或占用人员 ({{ assignedUsers.length }})
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-1.5">
                  <div
                    v-for="(user, index) in assignedUsers"
                    :key="index"
                    class="mb-1 last:mb-0 bg-white dark:bg-gray-800 px-1.5 py-1 rounded border border-gray-100 dark:border-gray-700 shadow-sm"
                  >
                    <div
                      class="text-[14px] font-medium text-gray-800 dark:text-gray-300 truncate"
                      :title="user.nickname"
                    >
                      {{ user.nickname }}
                      <span class="text-[12px] text-blue-500 font-normal"
                        >({{ user.nodeName }})</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- 下半部分：准备追加的人员 -->
              <div class="flex-1 flex flex-col min-h-0">
                <div
                  class="px-2 py-1.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 flex-none"
                  :class="
                    assignedUsers.length === 0
                      ? 'bg-green-50 dark:bg-green-900/20 rounded-t-lg'
                      : 'bg-green-50 dark:bg-green-900/20'
                  "
                >
                  准备追加的人员 ({{ selectedUsers.length }})
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-1.5">
                  <div
                    v-if="selectedUsers.length === 0"
                    class="text-xs text-center text-gray-400 mt-2"
                    >暂未勾选</div
                  >
                  <div
                    v-for="(user, index) in selectedUsers"
                    :key="'send_' + index"
                    class="mb-1 last:mb-0 bg-white dark:bg-gray-800 px-1.5 py-1 rounded border border-green-100 dark:border-gray-700 shadow-sm flex items-center gap-1"
                  >
                    <div
                      class="text-[14px] font-medium text-gray-800 dark:text-gray-300 flex-1 truncate"
                      :title="user.nickname"
                    >
                      {{ user.nickname }}
                      <span class="text-[12px] text-green-600 font-normal"
                        >({{ user.nodeName }})</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div
          v-else-if="!loading && !loadError"
          class="flex items-center justify-center h-[450px] text-gray-400"
        >
          暂无可追加的办理节点
        </div>
        <div v-if="loadError" class="flex items-center justify-center h-[450px] text-gray-400">
          加载失败，请重试。<el-button link type="primary" @click="loadTargets">重新加载</el-button>
        </div>
      </div>
    </el-form>
    <template #footer v-if="!collapsed">
      <el-button :disabled="submitting" @click="visible = false">取消</el-button>
      <el-button type="success" @click="submit" :loading="submitting" :disabled="loading || loadError || !selectedTargets.length"
        >确认追加</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import * as TaskApi from '@/api/bpm/task'
import { getTenantId } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { ElTree } from 'element-plus'

type Target = TaskApi.AppendTarget
type TreeNode = { key: string; name: string; userId?: number; disabled?: boolean; disabledReason?: string; children?: TreeNode[] }
const emit = defineEmits(['success'])
const message = useMessage()
const userStore = useUserStore()
const visible = ref(false)
const collapsed = ref(false)
const loading = ref(false)
const loadError = ref(false)
const submitting = ref(false)
const sourceTaskId = ref('')
const targets = ref<Target[]>([])
const selections = ref<Record<string, number[]>>({})
const activeTab = ref('')
const reason = ref('')
const sendSms = ref(true)
const treeRefs = new Map<string, InstanceType<typeof ElTree>>()
let requestVersion = 0
const selectedTargets = computed(() => targets.value
  .map(target => ({ targetExecutionId: target.executionId, userIds: selections.value[target.executionId] || [] }))
  .filter(target => target.userIds.length > 0))
const allUsers = computed(() => targets.value.flatMap(target => target.candidates.map(user => ({
  ...user, executionId: target.executionId, nodeName: target.nodeName, key: `${target.executionId}:${user.id}`
}))))
const assignedUsers = computed(() => allUsers.value.filter(user => user.disabled))
const selectedUsers = computed(() => allUsers.value.filter(user => !user.disabled && selections.value[user.executionId]?.includes(user.id)))
const trees = computed(() => Object.fromEntries(targets.value.map(target => {
  const departments = new Map<number, TreeNode>()
  const result: TreeNode[] = []
  for (const user of target.candidates) {
    const member = { key: `user:${user.id}`, name: user.nickname, userId: user.id, disabled: user.disabled, disabledReason: user.disabledReason }
    // 与发送一致：缺少部门的人员直接展示，不制造虚拟部门。
    if (!user.deptId) {
      result.push(member)
      continue
    }
    if (!departments.has(user.deptId)) {
      const department = { key: `dept:${user.deptId}`, name: user.deptName || '未知部门', children: [] as TreeNode[] }
      departments.set(user.deptId, department)
      result.push(department)
    }
    departments.get(user.deptId)!.children!.push(member)
  }
  departments.forEach(department => { department.disabled = department.children!.every(user => user.disabled) })
  return [target.executionId, result]
})))
const groups = computed(() => {
  const grouped = new Map<string, { tabKey: string; tabLabel: string; sort: number; nodes: Target[] }>()
  for (const target of targets.value) {
    const key = target.flowName || target.nodeName || '无归类'
    if (!grouped.has(key)) {
      grouped.set(key, { tabKey: key, tabLabel: key, sort: target.flowSort != null ? Number(target.flowSort) : 9999, nodes: [] })
    } else if (target.flowSort != null && grouped.get(key)!.sort === 9999) {
      grouped.get(key)!.sort = Number(target.flowSort)
    }
    grouped.get(key)!.nodes.push(target)
  }
  return [...grouped.values()].sort((a, b) => {
    if (a.sort !== b.sort) return a.sort - b.sort
    if (a.tabLabel.includes('主办') && !b.tabLabel.includes('主办')) return -1
    if (!a.tabLabel.includes('主办') && b.tabLabel.includes('主办')) return 1
    return 0
  })
})
const checkedKeys = (id: string) => (selections.value[id] || []).map(userId => `user:${userId}`)
const setTreeRef = (tree: unknown, id: string) => {
  if (tree) {
    treeRefs.set(id, tree as InstanceType<typeof ElTree>)
  } else treeRefs.delete(id)
}
const selectAll = (target: Target, checked: boolean) => {
  selections.value[target.executionId] = checked ? target.candidates.filter(user => !user.disabled).map(user => user.id) : []
  treeRefs.get(target.executionId)?.setCheckedKeys(checkedKeys(target.executionId))
}
const checkUsers = (target: Target, nodes: TreeNode[]) => {
  const allowed = new Set(target.candidates.filter(user => !user.disabled).map(user => user.id))
  selections.value[target.executionId] = nodes.filter(node => node.userId != null && allowed.has(node.userId)).map(node => node.userId!)
}
const preferenceKey = () => `bpm:send-sms:${getTenantId() || 'default'}:${userStore.getUser.id}`
const savePreference = () => {
  try { localStorage.setItem(preferenceKey(), String(sendSms.value)) } catch { /* 本次选择仍生效 */ }
}
const beforeClose = (done: () => void) => { if (!submitting.value) done() }
watch(visible, value => { if (!value) { requestVersion++; treeRefs.clear() } })
const loadTargets = async () => {
  const version = ++requestVersion
  loading.value = true
  loadError.value = false
  try {
    const result = await TaskApi.getAppendTargets(sourceTaskId.value)
    if (version !== requestVersion) return
    // 与发送弹窗一致：分组前主办节点置顶，避免追加后运行实例返回顺序改变卡片顺序。
    targets.value = [...result].sort((a, b) => {
      const aPrimary = (a.nodeName || '').includes('主办')
      const bPrimary = (b.nodeName || '').includes('主办')
      return Number(bPrimary) - Number(aPrimary)
    })
    selections.value = Object.fromEntries(result.map(target => [target.executionId, []]))
    activeTab.value = groups.value[0]?.tabKey || ''
  } catch {
    if (version === requestVersion) loadError.value = true
  } finally { if (version === requestVersion) loading.value = false }
}
const open = async (taskId: string) => {
  if (submitting.value) return
  sourceTaskId.value = taskId
  targets.value = []
  selections.value = {}
  treeRefs.clear()
  reason.value = ''
  activeTab.value = ''
  collapsed.value = false
  try { sendSms.value = localStorage.getItem(preferenceKey()) !== 'false' } catch { sendSms.value = true }
  visible.value = true
  await loadTargets()
}
const submit = async () => {
  if (submitting.value || loading.value || loadError.value || !selectedTargets.value.length) return
  submitting.value = true
  try {
    await TaskApi.appendTask({ sourceTaskId: sourceTaskId.value, targets: selectedTargets.value, reason: reason.value, sendSms: sendSms.value })
    message.success('追加成功')
    visible.value = false
    emit('success')
  } finally { submitting.value = false }
}
defineExpose({ open })
</script>

<style lang="scss" scoped>
.approve-send-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.approve-send-dialog__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.approve-send-dialog__actions :deep(.el-checkbox) {
  height: 24px;
  margin-right: 0;
}

.approve-send-dialog__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--el-color-info);
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}

.approve-send-dialog--collapsed :deep(.el-dialog__body) {
  display: none;
}

/* 优化横向排列时产生的多重滚动条视觉干扰 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(144 147 153 / 30%);
  border-radius: 4px;
  transition: background-color 0.3s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(144 147 153 / 60%);
}
</style>
