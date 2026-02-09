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

    <!-- 【通过】按钮 -->
    <el-button
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.APPROVE)"
      plain
      type="success"
      @click="openApproveDialog"
    >
      <Icon icon="ep:select" />&nbsp; {{ getButtonDisplayName(OperationButtonType.APPROVE) }}
    </el-button>

    <!-- 【拒绝】按钮 -->
    <!-- <el-popover
      :visible="popOverVisible.reject"
      placement="top-end"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.REJECT)"
    >
      <template #reference>
        <el-button class="mr-20px" plain type="danger" @click="openPopover('reject')">
          <Icon icon="ep:close" />&nbsp; {{ getButtonDisplayName(OperationButtonType.REJECT) }}
        </el-button>
      </template>
      //审批表单
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="rejectFormRef"
          :model="rejectReasonForm"
          :rules="rejectReasonRule"
          label-width="100px"
        >
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="rejectReasonForm.reason"
              placeholder="请输入审批意见"
              type="textarea"
              :rows="4"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :disabled="formLoading"
              type="danger"
              @click="handleAudit(false, rejectFormRef)"
            >
              {{ getButtonDisplayName(OperationButtonType.REJECT) }}
            </el-button>
            <el-button @click="closePopover('reject', rejectFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->

    <!-- 【抄送】按钮 -->
    <!-- <el-popover
      :visible="popOverVisible.copy"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.COPY)"
    >
      <template #reference>
        <div @click="openPopover('copy')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="svg-icon:send" />&nbsp;
          {{ getButtonDisplayName(OperationButtonType.COPY) }}
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="copyFormRef"
          :model="copyForm"
          :rules="copyFormRule"
          label-width="100px"
        >
          <el-form-item label="抄送人" prop="copyUserIds">
            <el-select
              v-model="copyForm.copyUserIds"
              clearable
              style="width: 100%"
              multiple
              placeholder="请选择抄送人"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="抄送意见" prop="copyReason">
            <el-input
              v-model="copyForm.copyReason"
              clearable
              placeholder="请输入抄送意见"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handleCopy">
              {{ getButtonDisplayName(OperationButtonType.COPY) }}
            </el-button>
            <el-button @click="closePopover('copy', copyFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->

    <!-- 【转办】按钮 -->
    <!-- <el-popover
      :visible="popOverVisible.transfer"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.TRANSFER)"
    >
      <template #reference>
        <div @click="openPopover('transfer')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="fa:share-square-o" />&nbsp;
          {{ getButtonDisplayName(OperationButtonType.TRANSFER) }}
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="transferFormRef"
          :model="transferForm"
          :rules="transferFormRule"
          label-width="100px"
        >
          <el-form-item label="新审批人" prop="assigneeUserId">
            <el-select v-model="transferForm.assigneeUserId" clearable style="width: 100%">
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="transferForm.reason"
              clearable
              placeholder="请输入审批意见"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handleTransfer()">
              {{ getButtonDisplayName(OperationButtonType.TRANSFER) }}
            </el-button>
            <el-button @click="closePopover('transfer', transferFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->

    <!-- 【委派】按钮 -->
    <!-- <el-popover
      :visible="popOverVisible.delegate"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.DELEGATE)"
    >
      <template #reference>
        <div @click="openPopover('delegate')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="ep:position" />&nbsp;
          {{ getButtonDisplayName(OperationButtonType.DELEGATE) }}
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="delegateFormRef"
          :model="delegateForm"
          :rules="delegateFormRule"
          label-width="100px"
        >
          <el-form-item label="接收人" prop="delegateUserId">
            <el-select v-model="delegateForm.delegateUserId" clearable style="width: 100%">
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="delegateForm.reason"
              clearable
              placeholder="请输入审批意见"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handleDelegate()">
              {{ getButtonDisplayName(OperationButtonType.DELEGATE) }}
            </el-button>
            <el-button @click="closePopover('delegate', delegateFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->

    <!-- 【加签】按钮 当前任务审批人为A，向前加签选了一个C，则需要C先审批，然后再是A审批，向后加签B，A审批完，需要B再审批完，才算完成这个任务节点 -->
    <el-popover
      :visible="popOverVisible.addSign"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.ADD_SIGN)"
    >
      <template #reference>
        <div @click="openPopover('addSign')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="ep:plus" />&nbsp;
          {{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="addSignFormRef"
          :model="addSignForm"
          :rules="addSignFormRule"
          label-width="100px"
        >
          <el-form-item label="加签处理人" prop="addSignUserIds">
            <el-select v-model="addSignForm.addSignUserIds" multiple clearable style="width: 100%">
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="addSignForm.reason"
              clearable
              placeholder="请输入审批意见"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handlerAddSign('before')">
              向前{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
            </el-button>
            <el-button :disabled="formLoading" type="primary" @click="handlerAddSign('after')">
              向后{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
            </el-button>
            <el-button @click="closePopover('addSign', addSignFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>

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
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="deleteSignForm.reason"
              clearable
              placeholder="请输入审批意见"
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
            <span class="text-#878c93 text-12px">&nbsp; 取消后，该审批流程将自动结束</span>
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

  <!-- 审批通过弹窗 -->
  <el-dialog
    v-model="approveDialogVisible"
    title="审批通过"
    width="900px"
    append-to-body
    destroy-on-close
  >
    <el-form
      ref="approveFormRef"
      :model="approveReasonForm"
      :rules="approveReasonRule"
      label-width="90px"
    >
      <el-form-item prop="reason" label="审批意见" v-if="!getBusinessFormReason">
        <el-input
          v-model="approveReasonForm.reason"
          type="textarea"
          placeholder="请输入审批意见"
          :rows="3"
        />
      </el-form-item>

      <div v-if="approvalNodes.length > 0" class="mb-10px">
        <div class="font-bold mb-5px">选择下一需处理节点及审批人</div>
        <div class="flex flex-row overflow-x-auto gap-4 pb-2 select-none">
          <div
            v-for="node in approvalNodes"
            :key="node.taskDefKey"
            class="border border-gray-200 rounded-lg p-3 bg-gray-50/50 dark:bg-gray-800/50 flex-none w-[280px] h-[500px] flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex-none"
            >
              <el-checkbox
                v-model="node.checked"
                :label="node.name || node.taskName"
                size="large"
                class="!font-bold !text-gray-800 dark:!text-gray-200"
              >
                {{ node.name || node.taskName }}
              </el-checkbox>
            </div>
            <div class="pl-2 flex-1 overflow-y-auto custom-scrollbar">
              <div
                v-if="!node.candidateUsers || node.candidateUsers.length === 0"
                class="text-gray-400 text-sm h-full flex items-center justify-center text-center px-4"
              >
                无需选择审批人<br />(自动分配或无需审批)
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
                @check="(_, { checkedKeys }) => handleTreeCheck(node, checkedKeys)"
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
import * as TaskApi from '@/api/bpm/task'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import * as UserApi from '@/api/system/user'
import {
  NodeType,
  OPERATION_BUTTON_NAME,
  OperationButtonType,
  CandidateStrategy
} from '@/components/SimpleProcessDesignerV2/src/consts'
import { BpmModelFormType, BpmProcessInstanceStatus } from '@/utils/constants'
import type { FormInstance, FormRules } from 'element-plus'
import SignDialog from './SignDialog.vue'
import ProcessInstanceTimeline from '../detail/ProcessInstanceTimeline.vue'
import { isEmpty } from '@/utils/is'

defineOptions({ name: 'ProcessInstanceBtnContainer' })

const router = useRouter() // 路由
const message = useMessage() // 消息弹窗

const userId = useUserStoreWithOut().getUser.id // 当前登录的编号
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const props = defineProps<{
  processInstance: any // 流程实例信息
  processDefinition: any // 流程定义信息
  userOptions: UserApi.UserVO[]
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

// ========== 审批信息 ==========
const runningTask = ref<any>() // 运行中的任务
const approveForm = ref<any>({}) // 审批通过时，额外的补充信息
const approveFormFApi = ref<any>({}) // approveForms 的 fAPi
const nodeTypeName = ref('审批') // 节点类型名称

// 审批通过意见表单
const reasonRequire = ref()
const approveFormRef = ref<FormInstance>()
const signRef = ref()
const approveSignFormRef = ref()
const selectNode = ref()
const tempNextUserSelectAssignees = ref()
const selectUserOptions = ref([])
const multipleFlag = ref(false)
const nextAssigneesActivityNode = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 下一个审批节点信息
const nextAssigneesTimelineRef = ref() // 下一个节点审批人时间线组件的引用
const approveReasonForm = reactive({
  reason: '',
  signPicUrl: '',
  nextAssignees: {}
})
const approveReasonRule = computed(() => {
  return {
    reason: [
      { required: reasonRequire.value, message: nodeTypeName + '意见不能为空', trigger: 'blur' }
    ],
    signPicUrl: [{ required: true, message: '签名不能为空', trigger: 'change' }],
    nextAssignees: [{ required: true, message: '审批人不能为空', trigger: 'blur' }]
  }
})
const nodeChange = async (val) => {
  if (val.taskDefKey !== 'end') {
    await getSelectUsers(val.extensionProperties)
  }
}

const getSelectUsers = async (item) => {
  const data = await ProcessInstanceApi.getSelectUserOptions({
    // TODO 小北：可以支持 processDefinitionKey 查询
    chooseRule: item.choose_rule,
    ruleValue: item.rule_value
  })
  multipleFlag.value = item.multiple_flag === '1'
  selectUserOptions.value = data
}
// 拒绝表单
const rejectFormRef = ref<FormInstance>()
const rejectReasonForm = reactive({
  reason: ''
})
const rejectReasonRule = computed(() => {
  return {
    reason: [{ required: reasonRequire.value, message: '审批意见不能为空', trigger: 'blur' }]
  }
})

// 抄送表单
const copyFormRef = ref<FormInstance>()
const copyForm = reactive({
  copyUserIds: [],
  copyReason: ''
})
const copyFormRule = reactive<FormRules<typeof copyForm>>({
  copyUserIds: [{ required: true, message: '抄送人不能为空', trigger: 'change' }]
})

// 转办表单
const transferFormRef = ref<FormInstance>()
const transferForm = reactive({
  assigneeUserId: undefined,
  reason: ''
})
const transferFormRule = reactive<FormRules<typeof transferForm>>({
  assigneeUserId: [{ required: true, message: '新审批人不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
})

// 委派表单
const delegateFormRef = ref<FormInstance>()
const delegateForm = reactive({
  delegateUserId: undefined,
  reason: ''
})
const delegateFormRule = reactive<FormRules<typeof delegateForm>>({
  delegateUserId: [{ required: true, message: '接收人不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
})

// 加签表单
const addSignFormRef = ref<FormInstance>()
const addSignForm = reactive({
  addSignUserIds: undefined,
  reason: ''
})
const addSignFormRule = reactive<FormRules<typeof addSignForm>>({
  addSignUserIds: [{ required: true, message: '加签处理人不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
})

// 减签表单
const deleteSignFormRef = ref<FormInstance>()
const deleteSignForm = reactive({
  deleteSignTaskId: undefined,
  reason: ''
})
const deleteSignFormRule = reactive<FormRules<typeof deleteSignForm>>({
  deleteSignTaskId: [{ required: true, message: '减签人员不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
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
  if (type === 'approve') {
    // 校验流程表单
    const valid = await validateNormalForm()
    if (!valid) {
      message.warning('表单校验不通过，请先完善表单!!')
      return
    }
    initNextAssigneesFormField()
    // 获取意见
    if (props.getBusinessFormReason) {
      const opinion = await props.getBusinessFormReason()
      if (opinion) {
        approveReasonForm.reason = opinion
      }
    }
  }
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
  nextAssigneesActivityNode.value = []
  // 清理 Timeline 组件中的自定义审批人数据
  if (nextAssigneesTimelineRef.value) {
    nextAssigneesTimelineRef.value.batchSetCustomApproveUsers({})
  }
}

// 新增 Dialog 可见性控制
const approveDialogVisible = ref(false)
const approvalNodes = ref<any[]>([])

/** 打开审批弹窗 */
const openApproveDialog = async () => {
  // 校验流程表单
  const valid = await validateNormalForm()
  if (!valid) {
    message.warning('表单校验不通过，请先完善表单!!')
    return
  }

  // 获取意见
  if (props.getBusinessFormReason) {
    const opinion = await props.getBusinessFormReason()
    if (opinion) {
      approveReasonForm.reason = opinion // 自动填充
    }
  }

  // 加载可选节点
  await loadApprovalNodes()
  approveDialogVisible.value = true
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

    if (data && data.length > 0) {
      for (const node of data) {
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
  } finally {
    formLoading.value = false
  }
}

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
const handleTreeCheck = (node: any, checkedKeys: any[]) => {
  // 如果选中了人，自动勾选节点
  if (checkedKeys.length > 0) {
    node.checked = true
  }
}

/** 提交审批 */
const handleApproveConfirm = async () => {
  // 校验
  // 必须选中至少一个节点
  const selectedNodes = approvalNodes.value.filter((n) => n.checked)
  if (approvalNodes.value.length > 0 && selectedNodes.length === 0) {
    message.warning('请至少选择一个流程节点')
    return
  }

  // 校验节点下的人员
  // 遍历 selectedNodes
  const nextNodeAssignees: Record<string, number[]> = {}
  const variables: Record<string, any> = {}

  for (const node of selectedNodes) {
    // 获取该节点下选中的用户
    // 我们需要 ref 引用
    const treeRef = userTreeRefs.value[node.taskDefKey]
    if (!treeRef) continue

    const checkedNodes = treeRef.getCheckedNodes(true, false) // leafOnly = true
    // 过滤出用户(假设有 nickname 字段的是用户)
    const userIds = checkedNodes.filter((n: any) => n.id && n.nickname).map((n: any) => n.id)

    if (userIds.length === 0) {
      message.warning(`节点【${node.taskName}】请至少选择一名审批人`)
      return
    }
    nextNodeAssignees[node.taskDefKey] = userIds

    // 设置变量
    if (node.conditionExpression) {
      variables[node.conditionExpression.key] = node.conditionExpression.value
    }
  }

  // 构造提交数据
  const data = {
    id: runningTask.value.id,
    reason: approveReasonForm.reason,
    variables: { ...getUpdatedProcessInstanceVariables(), ...variables }, // 合并变量
    nextNodeAssignees: nextNodeAssignees
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
    message.success('审批通过成功')
    approveDialogVisible.value = false
    reload()
  } finally {
    formLoading.value = false
  }
}

// 拒绝操作保持原有逻辑，或者直接复用 handleAudit (pass=false)
const handleReject = async (formRef: FormInstance | undefined) => {
  // ... 原有逻辑
  const data = {
    id: runningTask.value.id,
    reason: rejectReasonForm.reason
  }
  await TaskApi.rejectTask(data)
  popOverVisible.value.reject = false
  message.success('审批不通过成功')
  formRef?.resetFields()
  reload()
}

/** 处理审批通过和不通过的操作 */
// 保留此函数名以兼容模板调用 (Reject 还在用)
const handleAudit = async (pass: boolean, formRef: FormInstance | undefined) => {
  if (!pass) {
    await handleReject(formRef)
  } else {
    // 旧逻辑已废弃，直接报错或空处理
    console.error('Should not call handleAudit(true) anymore')
  }
}
const userTreeRefs = ref<Record<string, any>>({})
const setTreeRef = (el: any, key: string) => {
  if (el) {
    userTreeRefs.value[key] = el
  }
}

/** 处理抄送 */
const handleCopy = async () => {
  formLoading.value = true
  try {
    // 1. 校验表单
    if (!copyFormRef.value) return
    await copyFormRef.value.validate()
    // 2. 提交抄送
    const data = {
      id: runningTask.value.id,
      reason: copyForm.copyReason,
      copyUserIds: copyForm.copyUserIds
    }
    await TaskApi.copyTask(data)
    copyFormRef.value.resetFields()
    popOverVisible.value.copy = false
    message.success('操作成功')
  } finally {
    formLoading.value = false
  }
}

/** 处理转交 */
const handleTransfer = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!transferFormRef.value) return
    await transferFormRef.value.validate()
    // 1.2 提交转交
    const data = {
      id: runningTask.value.id,
      reason: transferForm.reason,
      assigneeUserId: transferForm.assigneeUserId
    }
    await TaskApi.transferTask(data)
    transferFormRef.value.resetFields()
    popOverVisible.value.transfer = false
    message.success('操作成功')
    // 2. 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理委派 */
const handleDelegate = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!delegateFormRef.value) return
    await delegateFormRef.value.validate()
    // 1.2 处理委派
    const data = {
      id: runningTask.value.id,
      reason: delegateForm.reason,
      delegateUserId: delegateForm.delegateUserId
    }

    await TaskApi.delegateTask(data)
    popOverVisible.value.delegate = false
    delegateFormRef.value.resetFields()
    message.success('操作成功')
    // 2. 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理加签 */
const handlerAddSign = async (type: string) => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!addSignFormRef.value) return
    await addSignFormRef.value.validate()
    // 1.2 提交加签
    const data = {
      id: runningTask.value.id,
      type,
      reason: addSignForm.reason,
      userIds: addSignForm.addSignUserIds
    }
    await TaskApi.signCreateTask(data)
    message.success('操作成功')
    addSignFormRef.value.resetFields()
    popOverVisible.value.addSign = false
    // 2 加载最新数据
    reload()
  } finally {
    formLoading.value = false
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
    if (opinion) {
      await TaskApi.addComment({
        id: runningTask.value.id,
        reason: opinion
      })
      message.success('保存草稿成功')
    } else {
      message.warning('意见不能为空')
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
    deleteSignFormRef.value.resetFields()
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
  return displayName
}

const loadTodoTask = (task: any) => {
  approveForm.value = {}
  runningTask.value = task
  approveFormFApi.value = {}
  reasonRequire.value = task?.reasonRequire ?? false
  nodeTypeName.value = task?.nodeType === NodeType.TRANSACTOR_NODE ? '办理' : '审批'
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
  approveSignFormRef.value.validate('change')
}

defineExpose({ loadTodoTask })
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
</style>
