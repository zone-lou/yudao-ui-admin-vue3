<template>
  <el-dialog v-model="dialogVisible" :title="title" width="1020px" append-to-body destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <div class="mb-10px min-h-[450px]" v-loading="loading">
        <template v-if="approvalNodes.length > 0">
          <div class="flex flex-row w-full h-[450px]">
            <div
              class="flex-1 flex flex-col min-w-0 pr-3 border-r border-gray-200 dark:border-gray-700"
            >
              <el-tabs v-model="activeTab" class="w-full flex-1 flex flex-col">
                <el-tab-pane
                  v-for="group in groupedApprovalNodes"
                  :key="group.tabKey"
                  :label="group.tabLabel"
                  :name="group.tabKey"
                  class="flex-1"
                >
                  <div
                    class="h-[390px] flex flex-row gap-3 overflow-x-auto overflow-y-hidden pb-1 custom-scrollbar"
                  >
                    <div
                      v-for="node in group.nodes"
                      :key="node.taskDefKey"
                      class="border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex flex-col shadow-sm transition-shadow h-full min-w-[280px] max-w-[400px] flex-shrink-0"
                    >
                      <div
                        class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-none p-2 pb-1"
                      >
                        <el-checkbox
                          v-model="node.checked"
                          :label="node.name || node.taskName"
                          size="large"
                          class="!font-bold !text-gray-800 dark:!text-gray-200"
                          @change="(val) => handleNodeCheckboxChange(val, node)"
                        >
                          {{ node.name || node.taskName }}
                        </el-checkbox>
                      </div>
                      <div class="pl-2 py-1 flex-1 overflow-y-auto custom-scrollbar">
                        <div
                          v-if="!node.candidateUsers || node.candidateUsers.length === 0"
                          class="text-gray-400 text-sm h-full flex items-center justify-center text-center px-4 min-h-[60px]"
                        >
                          无需选择办理人<br />(自动分配或无需办理)
                        </div>
                        <el-tree
                          class="!bg-transparent"
                          v-else
                          :ref="(el) => setTreeRef(el, node.taskDefKey)"
                          :data="node.candidateUsers"
                          :props="{ label: 'name', children: 'children' }"
                          show-checkbox
                          node-key="id"
                          default-expand-all
                          :check-strictly="false"
                          @check="
                            (data, { checkedKeys }) => handleTreeCheck(node, data, checkedKeys)
                          "
                        >
                          <template #default="{ data }">
                            <span
                              :class="{
                                'font-bold text-gray-700 dark:text-gray-200':
                                  data.children && data.children.length > 0,
                                'text-blue-600 dark:text-blue-400':
                                  !data.children || data.children.length === 0
                              }"
                            >
                              {{ data.name }}
                            </span>
                          </template>
                        </el-tree>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>

            <div
              class="w-[220px] ml-2 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex-1 flex flex-col min-h-0">
                <div
                  class="px-2 py-1.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 flex-none bg-green-50 dark:bg-green-900/20 rounded-t-lg"
                >
                  准备发送的人员 ({{ currentSelectedUsers.length }})
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-1.5">
                  <div
                    v-if="currentSelectedUsers.length === 0"
                    class="text-xs text-center text-gray-400 mt-2"
                    >暂未勾选</div
                  >
                  <div
                    v-for="(user, index) in currentSelectedUsers"
                    :key="'send_' + index"
                    class="mb-1 last:mb-0 bg-white dark:bg-gray-800 px-1.5 py-1 rounded border border-green-100 dark:border-gray-700 shadow-sm flex items-center gap-1"
                  >
                    <div
                      class="text-[14px] font-medium text-gray-800 dark:text-gray-300 flex-1 truncate"
                      :title="user.nickname || user.name"
                    >
                      {{ user.nickname || user.name }}
                      <span class="text-[12px] text-green-600 font-normal"
                        >({{ user.taskName }})</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="!loading" class="flex items-center justify-center h-[450px] text-gray-400">
          暂无需要选择的办理节点
        </div>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="submitLoading">确认</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useMessage } from '@/hooks/web/useMessage'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { useUserStoreWithOut } from '@/store/modules/user'

defineOptions({ name: 'ProcessSendDialog' })

const message = useMessage()
const userId = useUserStoreWithOut().getUser.id

const props = defineProps({
  title: { type: String, default: '发送' },
  showReason: { type: Boolean, default: false }, // 创建流程通常不需要填意见，审批时需要
  processDefinitionId: { type: String, default: '' },
  processInstanceId: { type: String, default: undefined },
  taskId: { type: String, default: undefined },
  activityId: { type: String, default: undefined } // 对于发起节点，通常传入 StartEvent 的 ID
})

const emit = defineEmits(['submit'])

const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)

const formRef = ref()
const formData = reactive({ reason: '' })
const formRules = computed(() => {
  return props.showReason
    ? { reason: [{ required: true, message: '办理意见不能为空', trigger: 'blur' }] }
    : {}
})

const approvalNodes = ref<any[]>([])
const activeTab = ref('')
const userTreeRefs = ref<Record<string, any>>({})

// 暴露给父组件的方法
const open = async (variables: Record<string, any> = {}) => {
  dialogVisible.value = true
  formData.reason = ''
  await nextTick()
  await loadApprovalNodes(variables)
}

const close = () => {
  dialogVisible.value = false
  submitLoading.value = false
}

defineExpose({ open, close, submitLoading })

const setTreeRef = (el: any, key: string) => {
  if (el) userTreeRefs.value[key] = el
}

/** 加载可选节点数据 */
const loadApprovalNodes = async (variables: Record<string, any>) => {
  loading.value = true
  try {
    const data = await ProcessInstanceApi.getNextSelectNodes({
      processDefinitionId: props.processDefinitionId,
      processInstanceId: props.processInstanceId,
      taskId: props.taskId,
      activityId: props.activityId,
      processVariablesStr: JSON.stringify(variables)
    })

    if (data && data.length > 0) {
      data.sort((a: any, b: any) => {
        const aName = a.taskName || a.name || ''
        const bName = b.taskName || b.name || ''
        if (aName.includes('主办') && !bName.includes('主办')) return -1
        if (!aName.includes('主办') && bName.includes('主办')) return 1
        return 0
      })

      for (const node of data) {
        if (node.taskDefKey?.includes('_internal_loop') && node.candidateUsers) {
          node.candidateUsers = filterTreeMySelf(node.candidateUsers, userId)
        }
        node.checked = false

        if (!node.candidateUsers || node.candidateUsers.length === 0) {
          if (node.extensionProperties && node.extensionProperties.choose_rule) {
            const users = await ProcessInstanceApi.getSelectUserOptions({
              chooseRule: node.extensionProperties.choose_rule,
              ruleValue: node.extensionProperties.rule_value
            })
            node.candidateUsers = buildDeptTree(users)
          }
        } else {
          const traverse = (nodes: any[]) => {
            nodes.forEach((n) => {
              if (!n.name && n.nickname) n.name = n.nickname
              if (n.children && n.children.length > 0) traverse(n.children)
            })
          }
          traverse(node.candidateUsers)
        }
      }
    }
    approvalNodes.value = data || []
    if (groupedApprovalNodes.value.length > 0) {
      activeTab.value = groupedApprovalNodes.value[0].tabKey
    }
  } finally {
    loading.value = false
  }
}

/** 构建部门树 */
const buildDeptTree = (users: any[]) => {
  const deptMap = new Map()
  const result: any[] = []
  users.forEach((user) => {
    user.name = user.nickname || user.name
    if (!user.deptId) {
      result.push(user)
      return
    }
    if (!deptMap.has(user.deptId)) {
      const deptNode = {
        id: `dept-${user.deptId}`,
        name: user.deptName || '未知部门',
        children: [],
        isDept: true
      }
      deptMap.set(user.deptId, deptNode)
      result.push(deptNode)
    }
    deptMap
      .get(user.deptId)
      .children.push({ ...user, name: user.nickname || user.name, id: user.id, isUser: true })
  })
  return result
}

const filterTreeMySelf = (treeData: any[], currentUserId: number) => {
  if (!treeData || treeData.length === 0) return []
  const result: any[] = []
  treeData.forEach((node) => {
    if (
      (!node.children || node.children.length === 0) &&
      node.id === currentUserId &&
      (node.nickname || node.name)
    )
      return
    if (node.children && node.children.length > 0) {
      const filteredChildren = filterTreeMySelf(node.children, currentUserId)
      if (filteredChildren.length > 0) result.push({ ...node, children: filteredChildren })
    } else {
      result.push(node)
    }
  })
  return result
}

const groupedApprovalNodes = computed(() => {
  const map: Record<string, any> = {}
  approvalNodes.value.forEach((node) => {
    const key = node.flowName || node.name || node.taskName || '无归类'
    if (!map[key]) {
      map[key] = {
        tabKey: key,
        tabLabel: key,
        sort: node.flowSort != null ? Number(node.flowSort) : 9999,
        nodes: []
      }
    } else {
      if (node.flowSort != null && map[key].sort === 9999) map[key].sort = Number(node.flowSort)
    }
    map[key].nodes.push(node)
  })
  const groupArr = Object.values(map)
  groupArr.sort((a, b) => {
    if (a.sort !== b.sort) return a.sort - b.sort
    if (a.tabLabel.includes('主办') && !b.tabLabel.includes('主办')) return -1
    if (!a.tabLabel.includes('主办') && b.tabLabel.includes('主办')) return 1
    return 0
  })
  return groupArr
})

const currentSelectedUsers = ref<any[]>([])

const refreshCurrentSelectedUsers = () => {
  const users: any[] = []
  if (!approvalNodes.value || !userTreeRefs.value) return
  approvalNodes.value.forEach((node) => {
    if (!node.checked) return
    const treeRef = userTreeRefs.value[node.taskDefKey]
    if (treeRef) {
      const checkedNodes = treeRef.getCheckedNodes(true, false)
      checkedNodes.forEach((n: any) => {
        if (n.id && (n.nickname || n.name)) {
          users.push({
            id: n.id,
            nickname: n.nickname || n.name,
            deptName: n.deptName,
            taskName: node.taskName || node.name || '未知环节'
          })
        }
      })
    }
  })
  currentSelectedUsers.value = users
}

watch(
  () => approvalNodes.value.map((n) => n.checked),
  () => refreshCurrentSelectedUsers(),
  { deep: true }
)

const handleTreeCheck = (node: any, data: any, checkedKeys: any[]) => {
  if (node.extensionProperties?.multiple_flag === '0') {
    const treeRef = userTreeRefs.value[node.taskDefKey]
    if (treeRef) {
      if (checkedKeys.includes(data.id)) {
        if (data.children && data.children.length > 0) {
          treeRef.setCheckedKeys([data.children[0].id])
        } else {
          treeRef.setCheckedKeys([data.id])
        }
        node.checked = true
      } else {
        treeRef.setCheckedKeys([])
        node.checked = false
      }
      nextTick(() => refreshCurrentSelectedUsers())
      return
    }
  }
  node.checked = checkedKeys.length > 0
  nextTick(() => refreshCurrentSelectedUsers())
}

const handleNodeCheckboxChange = (val: boolean | string | number, node: any) => {
  const treeRef = userTreeRefs.value[node.taskDefKey]
  if (!treeRef) return
  if (val) {
    if (node.extensionProperties?.multiple_flag === '0') {
      message.warning('该节点为单选，无法批量全选')
      setTimeout(() => {
        node.checked = false
      }, 0)
      return
    }
    const allLeafIds: any[] = []
    const traverse = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (!n.children || n.children.length === 0) allLeafIds.push(n.id)
        else traverse(n.children)
      })
    }
    traverse(node.candidateUsers || [])
    treeRef.setCheckedKeys(allLeafIds)
  } else {
    treeRef.setCheckedKeys([])
  }
}

/** 点击确认，将数据抛出给父组件处理业务 */
const handleConfirm = async () => {
  if (formRef.value) {
    const valid = await formRef.value.validate()
    if (!valid) return
  }

  const selectedNodes = approvalNodes.value.filter((n) => n.checked)
  if (approvalNodes.value.length > 0 && selectedNodes.length === 0) {
    message.warning('请至少选择一个流程节点')
    return
  }

  const nextNodeAssignees: Record<string, number[]> = {}
  const variables: Record<string, any> = {}

  for (const node of selectedNodes) {
    if (node.conditionExpression) {
      variables[node.conditionExpression.key] = node.conditionExpression.value
    }
    if (node.taskDefKey === 'end') continue

    const treeRef = userTreeRefs.value[node.taskDefKey]
    if (!treeRef) continue
    const checkedNodes = treeRef.getCheckedNodes(true, false)
    const userIds = checkedNodes.filter((n: any) => n.id && n.nickname).map((n: any) => n.id)

    if (userIds.length === 0 && node.candidateUsers && node.candidateUsers.length > 0) {
      message.warning(`节点【${node.taskName}】请至少选择一名办理人`)
      return
    }

    nextNodeAssignees[node.taskDefKey] = userIds
  }

  submitLoading.value = true

  // 触发自定义事件，把组装好的指派人员数据传给父组件
  emit('submit', {
    nextNodeAssignees,
    reason: formData.reason,
    variables
  })
}
</script>

<style scoped>
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
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(144 147 153 / 60%);
}
</style>
