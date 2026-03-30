<template>
  <div
    class="h-50px bottom-10 text-14px flex items-center color-#32373c dark:color-#fff font-bold btn-container"
  >
    <!-- 【保存草稿】按钮 -->
    <el-button
      v-if="runningTask && isHandleTaskStatus() && getBusinessFormReason"
      plain
      type="warning"
      class="mr-10px"
      @click="handleSaveDraft"
    >
      <Icon icon="ep:document-copy" />&nbsp; 保存草稿
    </el-button>

    <!-- 【发送/办结】按钮 -->
    <el-button
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.APPROVE)"
      plain
      type="success"
      @click="isOnlyEndNode ? handleDirectFinish() : openApproveDialog()"
    >
      <Icon icon="ep:select" />&nbsp;
      {{ getButtonDisplayName(OperationButtonType.APPROVE) }}
    </el-button>

    <!-- 【减签】按钮 -->
    <el-popover
      :visible="popOverVisible.deleteSign"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask?.children.length > 0"
    >
      <template #reference>
        <div @click="openPopover('deleteSign')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="ep:semi-select" />&nbsp; 减签
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="deleteSignFormRef"
          :model="deleteSignForm"
          :rules="deleteSignFormRule"
          label-width="100px"
        >
          <el-form-item label="减签人员" prop="deleteSignTaskId">
            <el-select v-model="deleteSignForm.deleteSignTaskId" clearable style="width: 100%">
              <el-option
                v-for="item in runningTask.children"
                :key="item.id"
                :label="getDeleteSignUserLabel(item)"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="办理意见" prop="reason">
            <el-input
              v-model="deleteSignForm.reason"
              clearable
              placeholder="请输入办理意见"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handlerDeleteSign()">
              减签
            </el-button>
            <el-button @click="closePopover('deleteSign', deleteSignFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>

    <!-- 【退回】按钮 -->
    <el-popover
      :visible="popOverVisible.return"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.RETURN)"
    >
      <template #reference>
        <div @click="openPopover('return')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="ep:back" />&nbsp;
          {{ getButtonDisplayName(OperationButtonType.RETURN) }}
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="returnFormRef"
          :model="returnForm"
          :rules="returnFormRule"
          label-width="100px"
        >
          <el-form-item label="退回节点" prop="targetTaskDefinitionKey">
            <el-select v-model="returnForm.targetTaskDefinitionKey" clearable style="width: 100%">
              <el-option
                v-for="item in returnList"
                :key="item.taskDefinitionKey"
                :label="item.name"
                :value="item.taskDefinitionKey"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="退回理由" prop="returnReason">
            <el-input
              v-model="returnForm.returnReason"
              clearable
              placeholder="请输入退回理由"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handleReturn()">
              {{ getButtonDisplayName(OperationButtonType.RETURN) }}
            </el-button>
            <el-button @click="closePopover('return', returnFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>

    <!--【取消】按钮 这个对应发起人的取消, 只有发起人可以取消 -->
    <el-popover
      :visible="popOverVisible.cancel"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="
        userId === processInstance?.startUser?.id && !isEndProcessStatus(processInstance?.status)
      "
    >
      <template #reference>
        <div @click="openPopover('cancel')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="fa:mail-reply" />&nbsp; 取消
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="cancelFormRef"
          :model="cancelForm"
          :rules="cancelFormRule"
          label-width="100px"
        >
          <el-form-item label="取消理由" prop="cancelReason">
            <span class="text-#878c93 text-12px">&nbsp; 取消后，该办理流程将自动结束</span>
            <el-input
              v-model="cancelForm.cancelReason"
              clearable
              placeholder="请输入取消理由"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handleCancel()">
              确认
            </el-button>
            <el-button @click="closePopover('cancel', cancelFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>
    <!-- 【再次提交】 按钮-->
    <div
      @click="handleReCreate()"
      class="hover-bg-gray-100 rounded-xl p-6px"
      v-if="
        userId === processInstance?.startUser?.id &&
        isEndProcessStatus(processInstance?.status) &&
        processDefinition?.formType === 10
      "
    >
      <Icon :size="14" icon="ep:refresh" />&nbsp; 再次提交
    </div>
  </div>

  <!-- 发送弹窗 -->
  <el-dialog
    v-model="approveDialogVisible"
    title="发送"
    width="1020px"
    append-to-body
    destroy-on-close
  >
    <el-form
      ref="approveFormRef"
      :model="approveReasonForm"
      :rules="approveReasonRule"
      label-width="90px"
    >
      <el-form-item prop="reason" label="办理意见" v-if="requireDialogReasonInput">
        <el-input
          v-model="approveReasonForm.reason"
          type="textarea"
          placeholder="请输入办理意见"
          :rows="3"
        />
      </el-form-item>

      <div class="mb-10px min-h-[450px]" v-loading="formLoading">
        <template v-if="approvalNodes.length > 0">
          <div class="flex flex-row w-full h-[450px]">
            <!-- 左侧：节点及人员选择 Tab 区 -->
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
                    <!-- 节点单个卡片 -->
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

            <!-- 右侧：全局共享的 “指派与发送人员” 统筹侧栏 -->
            <div
              class="w-[220px] ml-2 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <!-- 上半部分：已经收到文件的人员 -->
              <div
                class="flex-1 flex flex-col min-h-0 border-b border-gray-200 dark:border-gray-700"
                v-if="globalAssignedUsers.length > 0"
              >
                <div
                  class="px-2 py-1.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 flex-none bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                >
                  已经收到文件的人员 ({{ globalAssignedUsers.length }})
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-1.5">
                  <div
                    v-for="(user, index) in globalAssignedUsers"
                    :key="index"
                    class="mb-1 last:mb-0 bg-white dark:bg-gray-800 px-1.5 py-1 rounded border border-gray-100 dark:border-gray-700 shadow-sm"
                  >
                    <div
                      class="text-[14px] font-medium text-gray-800 dark:text-gray-300 truncate"
                      :title="user.nickname || user.name"
                    >
                      {{ user.nickname || user.name }}
                      <span class="text-[12px] text-blue-500 font-normal"
                        >({{ user.taskName }})</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- 下半部分：准备发送的人员 -->
              <div class="flex-1 flex flex-col min-h-0">
                <div
                  class="px-2 py-1.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 flex-none"
                  :class="
                    globalAssignedUsers.length === 0
                      ? 'bg-green-50 dark:bg-green-900/20 rounded-t-lg'
                      : 'bg-green-50 dark:bg-green-900/20'
                  "
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
        <div
          v-else-if="!formLoading"
          class="flex items-center justify-center h-[450px] text-gray-400"
        >
          暂无需要选择的办理节点
        </div>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="approveDialogVisible = false">取消</el-button>
      <el-button type="success" @click="handleApproveConfirm" :loading="formLoading"
        >确认</el-button
      >
    </template>
  </el-dialog>

  <!-- 签名弹窗 -->
  <SignDialog ref="signRef" @success="handleSignFinish" />
</template>
<script lang="ts" setup>
import { useUserStoreWithOut } from '@/store/modules/user'
import { setConfAndFields2 } from '@/utils/formCreate'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import * as TaskApi from '@/api/bpm/task'
import {
  OperationButtonType,
  OPERATION_BUTTON_NAME,
  NodeType
} from '@/components/SimpleProcessDesignerV2/src/consts'
import { BpmModelFormType, BpmProcessInstanceStatus } from '@/utils/constants'
import type { FormInstance, FormRules } from 'element-plus'
import SignDialog from './SignDialog.vue'

defineOptions({ name: 'ProcessInstanceBtnContainer' })

const router = useRouter() // 路由
const message = useMessage() // 消息弹窗

const userId = useUserStoreWithOut().getUser.id // 当前登录的编号
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const props = defineProps<{
  processInstance: any // 流程实例信息
  processDefinition: any // 流程定义信息
  userOptions: any[]
  normalForm: any // 流程表单 formCreate
  normalFormApi: any // 流程表单 formCreate Api
  writableFields: string[] // 流程表单可以编辑的字段
  currentNode: any
  nextNodes: any
  getBusinessFormReason?: () => Promise<string | undefined>
}>()

const formLoading = ref(false) // 表单加载中
const popOverVisible = ref({
  approve: false,
  reject: false,
  transfer: false,
  delegate: false,
  addSign: false,
  return: false,
  copy: false,
  cancel: false,
  deleteSign: false
}) // 气泡卡是否展示
const returnList = ref([] as any) // 退回节点
const runningTask = ref<any>() // 运行中的任务
const nodeTypeName = ref('办理') // 节点类型名称
const approveForm = ref<any>({}) // 审批通过时，额外的补充信息
const approveFormFApi = ref<any>({}) // approveForms 的 fAPi

const nextAssigneesTimelineRef = ref() // 下一个节点办理人时间线组件的引用
const reasonRequire = ref()
const requireDialogReasonInput = ref(false)
const approveFormRef = ref<FormInstance>()
const approveReasonForm = reactive({
  reason: '',
  signPicUrl: '',
  nextAssignees: {}
})
const approveReasonRule = computed(() => {
  return {
    reason: [{ required: true, message: nodeTypeName.value + '意见不能为空', trigger: 'blur' }],
    signPicUrl: [{ required: true, message: '签名不能为空', trigger: 'change' }],
    nextAssignees: [{ required: true, message: '办理人不能为空', trigger: 'blur' }]
  }
})

// 减签表单
const deleteSignFormRef = ref<FormInstance>()
const deleteSignForm = reactive({
  deleteSignTaskId: undefined,
  reason: ''
})
const deleteSignFormRule = reactive<FormRules<typeof deleteSignForm>>({
  deleteSignTaskId: [{ required: true, message: '减签人员不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '办理意见不能为空', trigger: 'blur' }]
})

// 退回表单
const returnFormRef = ref<FormInstance>()
const returnForm = reactive({
  targetTaskDefinitionKey: undefined,
  returnReason: ''
})
const returnFormRule = reactive<FormRules<typeof returnForm>>({
  targetTaskDefinitionKey: [{ required: true, message: '退回节点不能为空', trigger: 'change' }],
  returnReason: [{ required: true, message: '退回理由不能为空', trigger: 'blur' }]
})

// 取消表单
const cancelFormRef = ref<FormInstance>()
const cancelForm = reactive({
  cancelReason: ''
})
const cancelFormRule = reactive<FormRules<typeof cancelForm>>({
  cancelReason: [{ required: true, message: '取消理由不能为空', trigger: 'blur' }]
})

/** 监听 approveFormFApis，实现它对应的 form-create 初始化后，隐藏掉对应的表单提交按钮 */
watch(
  () => approveFormFApi.value,
  (val) => {
    val?.btn?.show(false)
    val?.resetBtn?.show(false)
  },
  {
    deep: true
  }
)

/** 弹出气泡卡 */
const openPopover = async (type: string) => {
  if (popOverVisible.value[type] === true) return
  // if (type === 'approve') {
  //   // 校验流程表单
  //   const valid = await validateNormalForm()
  //   if (!valid) {
  //     message.warning('表单校验不通过，请先完善表单!!')
  //     return
  //   }
  //   // initNextAssigneesFormField()  // 未定义函数，先注释或者删除
  //   // 获取意见
  //   if (props.getBusinessFormReason) {
  //     const opinion = await props.getBusinessFormReason()
  //     if (opinion) {
  //       approveReasonForm.reason = opinion
  //     }
  //   }
  // }
  if (type === 'return') {
    // 获取退回节点
    returnList.value = await TaskApi.getTaskListByReturn(runningTask.value.id)
    if (returnList.value.length === 0) {
      message.warning('当前没有可退回的节点')
      return
    }
  }
  Object.keys(popOverVisible.value).forEach((item) => {
    popOverVisible.value[item] = item === type
  })
  // await nextTick()
  // formRef.value.resetFields()
}

/** 关闭气泡卡 */
const closePopover = (type: string, formRef: FormInstance | undefined) => {
  if (formRef) {
    formRef.resetFields()
  }
  popOverVisible.value[type] = false
  // 清理 Timeline 组件中的自定义办理人数据
  if (nextAssigneesTimelineRef.value) {
    nextAssigneesTimelineRef.value.batchSetCustomApproveUsers({})
  }
}

// 新增 Dialog 可见性控制
const activeTab = ref('')
const approveDialogVisible = ref(false)
const approvalNodes = ref<any[]>([])

/** 判断是否只有结束节点 */
const isOnlyEndNode = computed(() => {
  if (props.nextNodes && props.nextNodes.length === 1) {
    const node = props.nextNodes[0] || {}
    const nameStr = (node.name || node.taskName || '').toLowerCase()
    return node.type === 1 || node.taskDefKey?.includes('EndEvent') || nameStr.includes('结束')
  }
  return false
})

/** 一键直接办结节点（跳过弹窗选择） */
const handleDirectFinish = async () => {
  // 1. 校验流程表单
  const valid = await validateNormalForm()
  if (!valid) {
    message.warning('表单校验不通过，请先完善表单!!')
    return
  }

  // 若开启了在线签名要求，为了复用原有交互，回退到打开详实发送弹窗由其管理（如确有此需求可在这里唤起签版）
  const defName = (props.processDefinition?.name || props.processInstance?.name || '').toLowerCase()
  const customPath = (props.processDefinition?.formCustomViewPath || '').toLowerCase()
  const isSpecialForm =
    defName.includes('请假') ||
    defName.includes('外出') ||
    defName.includes('公出') ||
    customPath.includes('leave') ||
    customPath.includes('timeexplain')

  if (runningTask.value?.signEnable && !approveReasonForm.signPicUrl && !isSpecialForm) {
    return openApproveDialog()
  }

  try {
    await message.confirm('是否确认提交？', '办理提示')
  } catch {
    return
  }

  // 2. 获取业务表单意见
  let reason = approveReasonForm.reason
  if (props.getBusinessFormReason) {
    const opinion = await props.getBusinessFormReason()
    if (opinion !== undefined) {
      if (!opinion || opinion.trim() === '') {
        message.warning('请先在表格内填写环节意见！')
        return
      }
      reason = opinion
    }
  }

  if (!reason || reason.trim() === '') {
    message.warning('请填写环节意见！')
    return
  }

  // 3. 构建请求级多表单变量
  let variables = getUpdatedProcessInstanceVariables()
  const formCreateApi = approveFormFApi.value
  if (Object.keys(formCreateApi)?.length > 0) {
    await formCreateApi.validate()
    // @ts-ignore
    variables = { ...variables, ...approveForm.value.value }
  }

  // 4. 发起直接办结请求
  const data = {
    id: runningTask.value.id,
    reason: reason,
    variables: variables,
    nextNodeAssignees: {} // 结束节点时无下一处理人
  } as any

  if (runningTask.value?.signEnable) {
    data.signPicUrl = approveReasonForm.signPicUrl
  }

  formLoading.value = true
  try {
    await TaskApi.approveTask(data)
    message.success('提交操作成功')
    approveDialogVisible.value = false
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 打开办理弹窗 */
const openApproveDialog = async () => {
  // 校验流程表单
  const valid = await validateNormalForm()
  if (!valid) {
    message.warning('表单校验不通过，请先完善表单!!')
    return
  }

  // 获取意见
  requireDialogReasonInput.value = !props.getBusinessFormReason
  if (props.getBusinessFormReason) {
    const opinion = await props.getBusinessFormReason()
    if (opinion !== undefined) {
      if (!opinion || opinion.trim() === '') {
        message.warning('请先在表格内填写环节意见！')
        return
      }
      approveReasonForm.reason = opinion // 自动填充
      requireDialogReasonInput.value = false

      // （已剥离特定的请假、公出、外出模块的直接放行代码，均一脉相承走下方 Dialog 加载可选节点）
    } else {
      approveReasonForm.reason = ''
      requireDialogReasonInput.value = true
    }
  }

  // 并行或提前加载节点，减少卡顿感，弹出动作剥离到外层优先
  approveDialogVisible.value = true
  // 使用 nextTick 让弹窗动画先行，不被卡死
  await nextTick()
  await loadApprovalNodes()
}

/** 加载可选节点数据 */
const loadApprovalNodes = async () => {
  formLoading.value = true
  try {
    const variables = getUpdatedProcessInstanceVariables()
    const data = await ProcessInstanceApi.getNextSelectNodes({
      processInstanceId: props.processInstance.id,
      taskId: runningTask.value.id,
      processVariablesStr: JSON.stringify(variables)
    })
    console.log('NextSelectNodes:', data)

    // 分类逻辑已在 categorizedNodes computed 属性中处理

    if (data && data.length > 0) {
      // 需求：主办科室节点置顶
      data.sort((a: any, b: any) => {
        const aName = a.taskName || a.name || ''
        const bName = b.taskName || b.name || ''
        if (aName.includes('主办') && !bName.includes('主办')) return -1
        if (!aName.includes('主办') && bName.includes('主办')) return 1
        return 0
      })
      for (const node of data) {
        // 专门修复：如果在流程最后一个节点（办结节点），由于模型定义或后端的兜底原因
        // 导致名字显示为“请销假”等非结案词汇，且它由于不需要人处理而没有配置任何选人规则，强制将其名称纠正为“办理完成”
        if (
          node.taskDefKey === 'end' ||
          node.taskDefKey?.toLowerCase().includes('endevent') ||
          (
            ['请销假', '请假', '公出', '外出', '公出申请', '外出申请', '因公外出'].includes(node.taskName) &&
            (!node.candidateUsers || node.candidateUsers.length === 0) &&
            (!node.extensionProperties || !node.extensionProperties.choose_rule)
          )
        ) {
          node.taskName = '办理完成'
          node.name = '办理完成'
        }

        // 需求：如果是内循环节点，过滤掉本人
        if (node.taskDefKey?.includes('_internal_loop') && node.candidateUsers) {
          node.candidateUsers = filterTreeMySelf(node.candidateUsers, userId)
        }
        node.checked = false
        node.selectedUsers = []

        // 如果没有预设候选人，尝试通过规则获取
        if (!node.candidateUsers || node.candidateUsers.length === 0) {
          if (node.extensionProperties && node.extensionProperties.choose_rule) {
            const users = await ProcessInstanceApi.getSelectUserOptions({
              chooseRule: node.extensionProperties.choose_rule,
              ruleValue: node.extensionProperties.rule_value
            })
            node.candidateUsers = buildDeptTree(users)
          }
        } else {
          // 如果已有候选人(可能是扁平结构也可能是树结构)
          // 根据数据示例， API 直接返回了树结构，但 children 里的用户只有 nickname 没有 name
          // 我们需要遍历树，把 nickname 赋值给 name
          const traverse = (nodes: any[]) => {
            nodes.forEach((n) => {
              if (!n.name && n.nickname) {
                n.name = n.nickname
              }
              if (n.children && n.children.length > 0) {
                traverse(n.children)
              }
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
    formLoading.value = false
  }
}

/** 计算属性：利用 flowName 将 approvalNodes 分组，并基于 flowSort 排序 */
const groupedApprovalNodes = computed(() => {
  const map: Record<string, { tabKey: string; tabLabel: string; sort: number; nodes: any[] }> = {}

  approvalNodes.value.forEach((node) => {
    // 找不到 flowName 时，回退保底使用 taskName 作为 Tab 标题
    const key = node.flowName || node.name || node.taskName || '无归类'
    if (!map[key]) {
      // 若没有提供 flowSort，默认给一个相对大的极大值以保证它排在后面
      const sortValue = node.flowSort != null ? Number(node.flowSort) : 9999
      map[key] = {
        tabKey: key, // 用 flowName 本身作为 el-tabs 的 name（只要唯一）
        tabLabel: key,
        sort: sortValue,
        nodes: []
      }
    } else {
      // 同组内以找到的含有非空 sort 的作为整个组的权威依据去更新
      if (node.flowSort != null && map[key].sort === 9999) {
        map[key].sort = Number(node.flowSort)
      }
    }
    map[key].nodes.push(node)
  })

  // 转成数组并依据 sort 排序，如果组间 sort 一致，再利用原来对"主办"关键字的前置要求补充兜底排序
  const groupArr = Object.values(map)
  groupArr.sort((a, b) => {
    if (a.sort !== b.sort) {
      return a.sort - b.sort
    }
    // 当排序号一样或者没传均等于 9999 时，兼顾保留“主办”在前面的原始业务逻辑
    if (a.tabLabel.includes('主办') && !b.tabLabel.includes('主办')) return -1
    if (!a.tabLabel.includes('主办') && b.tabLabel.includes('主办')) return 1
    return 0
  })

  return groupArr
})

/** 计算属性：全局提取所有节点下已经被勾选过分配的人员名单用于右侧栏汇总展示 */
const globalAssignedUsers = ref<any[]>([])

// 监听 approvalNodes 变化，被动提取汇总（为能进行双向绑定，改为 watch 响应式对象）
watch(
  () => approvalNodes.value,
  (nodes) => {
    // 只有在弹窗挂载或获取到节点时初始化。若已有记录，不再盲目清空以避免重绘导致复选框闪烁丢失勾选状态，
    // 这里采用重新构建赋值的方式。
    const users: any[] = []
    nodes.forEach((node) => {
      if (node.assignedUsers && node.assignedUsers.length > 0) {
        node.assignedUsers.forEach((user) => {
          users.push({
            id: user.id || Math.random(),
            name: user.name,
            nickname: user.nickname,
            deptName: user.deptName,
            taskName: node.taskName || node.name || '未知环节',
            taskDefKey: node.taskDefKey // 保留其归属的树图 key 以备联动
          })
        })
      }
    })
    globalAssignedUsers.value = users
  },
  { deep: true, immediate: true }
)

/** 计算属性：全局提取当前所有树结构中被勾选的人员信息（即本次准备发送的人员） */
const currentSelectedUsers = ref<any[]>([])

// 为了能够响应树内部深层的勾选变动，我们每次在 handleTreeCheck 等操作发生后手动重算该队列
const refreshCurrentSelectedUsers = () => {
  const users: any[] = []
  if (!approvalNodes.value || !userTreeRefs.value) return

  approvalNodes.value.forEach((node) => {
    // 必须当前大节点被勾选才算在此次发送队列中
    if (!node.checked) return
    const treeRef = userTreeRefs.value[node.taskDefKey]
    if (treeRef) {
      const checkedNodes = treeRef.getCheckedNodes(true, false) // leafOnly = true
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

// 监听外层大卡片的主选中状态（checkbox），一旦取消或者勾选整块区域，刷新右栏
watch(
  () => approvalNodes.value.map((n) => n.checked),
  () => {
    refreshCurrentSelectedUsers()
  },
  { deep: true }
)

/** 构建部门树 */
const buildDeptTree = (users: any[]) => {
  const deptMap = new Map()
  const result: any[] = []

  users.forEach((user) => {
    // 确保有 name 用于显示
    user.name = user.nickname || user.name

    // 如果没有部门信息，直接作为顶层用户节点（虽少见但防范）
    if (!user.deptId) {
      result.push(user)
      return
    }

    if (!deptMap.has(user.deptId)) {
      const deptNode = {
        id: `dept-${user.deptId}`, // 避免ID冲突
        name: user.deptName || '未知部门',
        children: [],
        isDept: true
      }
      deptMap.set(user.deptId, deptNode)
      result.push(deptNode)
    }
    // 添加用户到部门
    deptMap.get(user.deptId).children.push({
      ...user,
      name: user.nickname || user.name, // Ensure name is set for the child node
      id: user.id, // 用户ID
      isUser: true
    })
  })
  return result
}

/** 树节点选中回调 */
const handleTreeCheck = (node: any, data: any, checkedKeys: any[]) => {
  // 单选逻辑处理：如果 multiple_flag 为 0
  if (node.extensionProperties?.multiple_flag === '0') {
    const treeRef = userTreeRefs.value[node.taskDefKey]
    if (treeRef) {
      // 判断当前点击是选中还是取消选中
      if (checkedKeys.includes(data.id)) {
        // 如果点击的是部门（或者是带子节点的虚拟父级），在单选模式下不能直接全选子节点
        if (data.children && data.children.length > 0) {
          // 为了防止级联导致多人被勾，我们主动退化为：只勾选该部门下的第一个人员
          const firstUserId = data.children[0].id
          treeRef.setCheckedKeys([firstUserId])
        } else {
          // 如果点击的本来就是且只是具体人，则正常排他，强制只选中当前人
          treeRef.setCheckedKeys([data.id])
        }
        node.checked = true
      } else {
        // 如果是取消选中，则清空勾选
        treeRef.setCheckedKeys([])
        node.checked = false
      }
      // 更新右侧实时准备发送人员展示列
      nextTick(() => {
        refreshCurrentSelectedUsers()
      })
      return
    }
  }

  // 当选中任何人员时，自动勾选父级节点；如果一个人都没选中，则自动取消该节点勾选
  node.checked = checkedKeys.length > 0

  // 更新右侧实时准备发送人员展示列
  nextTick(() => {
    refreshCurrentSelectedUsers()
  })
}

/** 节点级别的全选/反选处理 */
const handleNodeCheckboxChange = (val: boolean | string | number, node: any) => {
  const treeRef = userTreeRefs.value[node.taskDefKey]
  if (!treeRef) return

  if (val) {
    // 全选：如果有多选限制（multiple_flag === '0'），则不应当随意全选，给出提示或选第一个
    if (node.extensionProperties?.multiple_flag === '0') {
      message.warning('该节点为单选，无法批量全选')
      setTimeout(() => {
        node.checked = false
      }, 0)
      return
    }
    // 获取所有叶子节点（即实际的人员）的 ID 进行全勾选
    const allLeafIds: any[] = []
    const traverse = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (!n.children || n.children.length === 0) {
          allLeafIds.push(n.id)
        } else {
          traverse(n.children)
        }
      })
    }
    traverse(node.candidateUsers || [])
    treeRef.setCheckedKeys(allLeafIds)
  } else {
    // 反选：清空树木里的勾选状态
    treeRef.setCheckedKeys([])
  }
}

/** 提交办理 */
const handleApproveConfirm = async () => {
  // 校验
  if (!approveFormRef.value) return
  const valid = await approveFormRef.value.validate()
  if (!valid) return

  // 防御：如果是来自内置审批栏，由于 el-form-item v-if 会导致其必填失效，故追加硬校验
  if (!approveReasonForm.reason || approveReasonForm.reason.trim() === '') {
    message.warning('办理意见不能为空')
    return
  }

  // 必须选中至少一个节点
  const selectedNodes = approvalNodes.value.filter((n) => n.checked)
  if (approvalNodes.value.length > 0 && selectedNodes.length === 0) {
    message.warning('请至少选择一个流程节点')
    return
  }

  // 校验节点下的人员
  // 遍历 selectedNodes
  const nextNodeAssignees: Record<string, number[]> = {}
  const debugAssigneeNames: Record<string, string[]> = {}
  const addSignUserIds: number[] = []
  const debugAddSignUserNames: string[] = []
  const variables: Record<string, any> = {}

  for (const node of selectedNodes) {
    // 提前设置跳转变量：如果这个节点有流转条件，必须塞给引擎，无论它是否需要人审批
    if (node.conditionExpression) {
      variables[node.conditionExpression.key] = node.conditionExpression.value
    }

    // 特例：如果是结束节点 ("end")，因为该节点天生不需要选人，直接跳过选人拦截检查并放行
    if (node.taskDefKey === 'end') {
      continue
    }

    // 获取该节点下选中的用户
    const treeRef = userTreeRefs.value[node.taskDefKey]
    if (!treeRef) continue

    const checkedNodes = treeRef.getCheckedNodes(true, false) // leafOnly = true
    // 过滤出用户
    const userIds = checkedNodes.filter((n: any) => n.id && n.nickname).map((n: any) => n.id)

    // 针对常规节点：发现没有勾选任何人，进行阻断
    if (userIds.length === 0) {
      // 容错补充：防止配置出错该节点天生没配置候选人树，如果是这种没树的节点，理论上可以放它走或者依据业务退回
      // 既然前面提示过“无需选择办理人(自动分配或无需办理)”，我们就放行它
      if (!node.candidateUsers || node.candidateUsers.length === 0) {
        continue
      }
      message.warning(`节点【${node.taskName}】请至少选择一名办理人`)
      return
    }

    // 需求：如果节点包含 _internal_loop，人员放入 addSignUserIds
    if (node.taskDefKey.includes('_internal_loop')) {
      addSignUserIds.push(...userIds)
      debugAddSignUserNames.push(
        ...checkedNodes.filter((n: any) => n.id && n.nickname).map((n: any) => n.nickname)
      )
      // 同步装填显示映射表，免得上方表格中该项显示出空数组 []
      debugAssigneeNames[node.taskDefKey] = checkedNodes
        .filter((n: any) => n.id && n.nickname)
        .map((n: any) => n.nickname)
    } else {
      nextNodeAssignees[node.taskDefKey] = userIds
      debugAssigneeNames[node.taskDefKey] = checkedNodes
        .filter((n: any) => n.id && n.nickname)
        .map((n: any) => n.nickname)
    }
  }

  // ============== 对外输出开发辅助日志 ==============
  const debugLogNodes = selectedNodes.map((n) => ({
    节点名称: n.taskName || n.name,
    分配人员名称: debugAssigneeNames[n.taskDefKey] || []
  }))
  console.log('【收文发送 - 节点及人员勾选日志】')
  console.table(debugLogNodes)
  if (addSignUserIds.length > 0) {
    console.log('【内循环加签人员】:', debugAddSignUserNames)
  }
  // ===============================================

  // 构造提交数据
  const data = {
    id: runningTask.value.id,
    reason: approveReasonForm.reason,
    variables: { ...getUpdatedProcessInstanceVariables(), ...variables }, // 合并变量
    nextNodeAssignees,
    addSignUserIds: addSignUserIds.length > 0 ? addSignUserIds : undefined
  } as any
  // 签名
  if (runningTask.value.signEnable) {
    data.signPicUrl = approveReasonForm.signPicUrl
  }

  // 多表单校验
  const formCreateApi = approveFormFApi.value
  if (Object.keys(formCreateApi)?.length > 0) {
    await formCreateApi.validate()
    // @ts-ignore
    data.variables = { ...data.variables, ...approveForm.value.value }
  }

  formLoading.value = true
  try {
    await TaskApi.approveTask(data)
    message.success('发送成功')
    approveDialogVisible.value = false
    reload()
  } finally {
    formLoading.value = false
  }
}

const userTreeRefs = ref<Record<string, any>>({})
const setTreeRef = (el: any, key: string) => {
  if (el) {
    userTreeRefs.value[key] = el
  }
}

/** 处理退回 */
const handleReturn = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!returnFormRef.value) return
    await returnFormRef.value.validate()
    // 1.2 提交退回
    const data = {
      id: runningTask.value.id,
      reason: returnForm.returnReason,
      targetTaskDefinitionKey: returnForm.targetTaskDefinitionKey
    }

    await TaskApi.returnTask(data)
    popOverVisible.value.return = false
    returnFormRef.value.resetFields()
    message.success('操作成功')
    // 2 重新加载数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理取消 */
const handleCancel = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!cancelFormRef.value) return
    await cancelFormRef.value.validate()
    // 1.2 提交取消
    await ProcessInstanceApi.cancelProcessInstanceByStartUser(
      props.processInstance.id,
      cancelForm.cancelReason
    )
    popOverVisible.value.return = false
    message.success('操作成功')
    cancelFormRef.value.resetFields()
    // 2 重新加载数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理再次提交 */
const handleReCreate = async () => {
  // 跳转发起流程界面
  await router.push({
    name: 'BpmProcessInstanceCreate',
    query: { processInstanceId: props.processInstance?.id }
  })
}

/** 处理保存草稿 */
const handleSaveDraft = async () => {
  if (props.getBusinessFormReason) {
    const opinion = await props.getBusinessFormReason()
    if (opinion !== undefined && opinion !== '') {
      await TaskApi.addComment({
        id: runningTask.value.id,
        reason: opinion
      })
      message.success('保存草稿成功')
    } else {
      message.warning('暂无内容或当前环节不支持草稿保存')
    }
  }
}

/** 获取减签人员标签 */
const getDeleteSignUserLabel = (task: any): string => {
  const deptName = task?.assigneeUser?.deptName || task?.ownerUser?.deptName
  const nickname = task?.assigneeUser?.nickname || task?.ownerUser?.nickname
  return `${nickname} ( 所属部门：${deptName} )`
}
/** 处理减签 */
const handlerDeleteSign = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!deleteSignFormRef.value) return
    await deleteSignFormRef.value.validate()
    // 1.2 提交减签
    const data = {
      id: deleteSignForm.deleteSignTaskId,
      reason: deleteSignForm.reason
    }
    await TaskApi.signDeleteTask(data)
    message.success('减签成功')
    deleteSignFormRef.value?.resetFields()
    popOverVisible.value.deleteSign = false
    // 2 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}
/** 重新加载数据 */
const reload = () => {
  emit('success')
}

/** 任务是否为处理中状态 */
const isHandleTaskStatus = () => {
  let canHandle = false
  if (TaskApi.TaskStatusEnum.RUNNING === runningTask.value?.status) {
    canHandle = true
  }
  return canHandle
}

/** 流程状态是否为结束状态 */
const isEndProcessStatus = (status: number) => {
  let isEndStatus = false
  if (
    BpmProcessInstanceStatus.APPROVE === status ||
    BpmProcessInstanceStatus.REJECT === status ||
    BpmProcessInstanceStatus.CANCEL === status
  ) {
    isEndStatus = true
  }
  return isEndStatus
}

/** 是否显示按钮 */
const isShowButton = (btnType: OperationButtonType): boolean => {
  let isShow = true
  if (runningTask.value?.buttonsSetting && runningTask.value?.buttonsSetting[btnType]) {
    isShow = runningTask.value.buttonsSetting[btnType].enable
  }
  return isShow
}

/** 获取按钮的显示名称 */
const getButtonDisplayName = (btnType: OperationButtonType) => {
  let displayName = OPERATION_BUTTON_NAME.get(btnType)
  if (runningTask.value?.buttonsSetting && runningTask.value?.buttonsSetting[btnType]) {
    displayName = runningTask.value.buttonsSetting[btnType].displayName
  }
  // 屏蔽流程实例旧配置中附带的“通过”字眼，强制转换
  if (displayName === '通过' || displayName === '审批通过') {
    return '发送'
  }
  return displayName
}

const loadTodoTask = (task: any) => {
  approveForm.value = {}
  runningTask.value = task
  approveFormFApi.value = {}
  reasonRequire.value = task?.reasonRequire ?? false
  nodeTypeName.value = task?.nodeType === NodeType.TRANSACTOR_NODE ? '办理' : '办理'
  // 处理 approve 表单.
  if (task && task.formId && task.formConf) {
    const tempApproveForm = {}
    setConfAndFields2(tempApproveForm, task.formConf, task.formFields, task.formVariables)
    approveForm.value = tempApproveForm
  } else {
    approveForm.value = {} // 占位，避免为空
  }
}

/** 校验流程表单 */
const validateNormalForm = async () => {
  if (props.processDefinition?.formType === BpmModelFormType.NORMAL) {
    let valid = true
    try {
      await props.normalFormApi?.validate()
    } catch {
      valid = false
    }
    return valid
  } else {
    return true
  }
}

/** 从可以编辑的流程表单字段，获取需要修改的流程实例的变量 */
const getUpdatedProcessInstanceVariables = () => {
  const variables = {}
  props.writableFields.forEach((field) => {
    variables[field] = props.normalFormApi.getValue(field)
  })
  return variables
}

/** 处理签名完成 */
const handleSignFinish = (url: string) => {
  approveReasonForm.signPicUrl = url
  approveFormRef.value?.validateField('signPicUrl')
}

defineExpose({ loadTodoTask })
/** 过滤掉树中的本人 */
const filterTreeMySelf = (treeData: any[], currentUserId: number) => {
  if (!treeData || treeData.length === 0) return []

  const result: any[] = []
  treeData.forEach((node) => {
    // 如果是用户节点（假设没有 children 字段且 ID 匹配，或者通过 nickname 判定）
    if (
      (!node.children || node.children.length === 0) &&
      node.id === currentUserId &&
      (node.nickname || node.name)
    ) {
      return
    }

    // 如果有子节点（部门），递归处理
    if (node.children && node.children.length > 0) {
      const filteredChildren = filterTreeMySelf(node.children, currentUserId)
      // 如果部门下还有人或子部门，保留该部门
      if (filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren
        })
      }
    } else {
      // 叶子节点且不匹配，保留
      result.push(node)
    }
  })
  return result
}
</script>

<style lang="scss" scoped>
:deep(.el-affix--fixed) {
  background-color: var(--el-bg-color);
}

.btn-container {
  > div {
    display: flex;
    margin: 0 8px;
    cursor: pointer;
    align-items: center;

    &:hover {
      color: #6db5ff;
    }
  }
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
