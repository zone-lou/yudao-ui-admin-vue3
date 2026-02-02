<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="发文申请信息">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="150px"
          v-loading="formLoading"
        >
          <h3 class="section-title">基础信息</h3>

          <el-row>
            <el-col :span="24">
              <el-form-item label="公文标题" prop="subject">
                <el-input v-model="formData.subject" placeholder="请输入公文标题/主题" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="发文字号" prop="sendDocNumber">
                <el-select
                  v-model="formData.sendDocNumber"
                  placeholder="请选择发文字号"
                  style="width: 100%"
                >
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.label"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发文日期" prop="sendTime">
                <el-date-picker
                  v-model="formData.sendTime"
                  type="date"
                  value-format="x"
                  placeholder="选择发文日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="文件类型" prop="docType">
                <el-select
                  v-model="formData.docType"
                  placeholder="请选择文件类型"
                  style="width: 100%"
                >
                  <el-option label="党务" :value="1" />
                  <el-option label="政务" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急程度" prop="urgencyDegree">
                <el-select
                  v-model="formData.urgencyDegree"
                  placeholder="请选择紧急程度"
                  style="width: 100%"
                >
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.BPM_EMERGENCY_DEGREE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="机密程度" prop="secretDegree">
                <el-select
                  v-model="formData.secretDegree"
                  placeholder="请选择机密程度"
                  style="width: 100%"
                >
                  <el-option label="无" value="" />
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.BPM_DEGREE_OF_SECRECY)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公文性质" prop="docProperty">
                <el-input v-model="formData.docProperty" placeholder="请输入公文性质" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="拟稿人" prop="draftPerson">
                <el-input v-model="formData.draftPerson" placeholder="请输入拟稿人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="拟稿时间" prop="draftDate">
                <el-date-picker
                  v-model="formData.draftDate"
                  type="date"
                  value-format="x"
                  placeholder="选择拟稿时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="formData.contactPhone" placeholder="请输入拟稿人联系电话" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发文单位" prop="sendDept">
                <el-input v-model="formData.sendDept" placeholder="请输入发文单位" />
              </el-form-item>
            </el-col>
          </el-row>

          <h3 class="section-title" style="margin-top: 20px">机关单位</h3>

          <el-form-item label="主送机关" prop="primarySendDept">
            <el-input
              v-model="formData.primarySendDept"
              type="textarea"
              :rows="2"
              placeholder="请输入主送机关"
            />
          </el-form-item>

          <el-form-item label="抄送机关" prop="copySendDept">
            <el-input
              v-model="formData.copySendDept"
              type="textarea"
              :rows="2"
              placeholder="请输入抄送机关"
            />
          </el-form-item>

          <el-row>
            <el-col :span="12">
              <el-form-item label="抄报机关" prop="reportSendDept">
                <el-input v-model="formData.reportSendDept" placeholder="请输入抄报机关" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联合发文单位" prop="uniondepts">
                <el-input v-model="formData.uniondepts" placeholder="请输入联合发文单位" />
              </el-form-item>
            </el-col>
          </el-row>

          <h3 class="section-title" style="margin-top: 20px">内容与附件</h3>

          <el-form-item label="发文草稿内容" prop="sendDocDraft">
            <el-input
              v-model="formData.sendDocDraft"
              type="textarea"
              :rows="3"
              placeholder="请输入发文草稿内容"
            />
          </el-form-item>

          <el-form-item label="附件" prop="attachFilePath">
            <UploadFile v-model="formData.attachFilePath" />
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
          </el-form-item>

          <h3 class="section-title" style="margin-top: 20px">审批与办理</h3>

          <el-row>
            <el-col :span="12">
              <el-form-item label="签发人" prop="issuedName">
                <el-input v-model="formData.issuedName" placeholder="请输入签发人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="校对人" prop="proofreader">
                <el-input v-model="formData.proofreader" placeholder="请输入校对人" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="签印份数" prop="signPrintCount">
                <el-input v-model="formData.signPrintCount" placeholder="请输入签印份数" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保管期限" prop="keepTerm">
                <el-input v-model="formData.keepTerm" placeholder="请输入保管期限" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="是否规范性文件" prop="isNormativeDocument">
                <el-radio-group v-model="formData.isNormativeDocument">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="2">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否重要" prop="ifimportant">
                <el-radio-group v-model="formData.ifimportant">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="发送状态" prop="sendStatus">
            <el-radio-group v-model="formData.sendStatus">
              <el-radio :label="0">拟发</el-radio>
              <el-radio :label="1">已发</el-radio>
              <el-radio :label="2">退回</el-radio>
            </el-radio-group>
          </el-form-item>

          <template v-if="!formData.processInstanceId">
            <h3 class="section-title" style="margin-top: 20px">流程处理</h3>

            <el-form-item label="下一审批节点" prop="nextNode" required>
              <el-select
                v-model="formData.nextNode"
                placeholder="请选择下一节点"
                @change="nodeChange"
                value-key="taskDefKey"
                :empty-values="[null, undefined]"
              >
                <el-option
                  v-for="dict in nextNodeOptions"
                  :key="dict.taskDefKey"
                  :label="dict.taskName"
                  :value="dict"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="审批人" prop="tempNextUserSelectAssignees" required>
              <el-select
                v-model="formData.tempNextUserSelectAssignees"
                placeholder="请选择审批人"
                :multiple="multipleFlag"
              >
                <el-option
                  v-for="dict in selectUserOptions"
                  :key="dict.id"
                  :label="dict.nickname"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </template>

          <el-form-item style="margin-top: 30px">
            <el-button
              v-if="!formData.processInstanceId"
              :disabled="formLoading"
              type="primary"
              @click="submitForm"
            >
              提交申请
            </el-button>
            <el-button v-else :disabled="formLoading" type="primary" @click="submitForm">
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
    </el-col>

    <el-col :span="8">
      <ContentWrap title="审批流程" :bodyStyle="{ padding: '0 20px 0' }">
        <ProcessInstanceTimeline
          ref="timelineRef"
          :activity-nodes="activityNodes"
          :show-status-icon="false"
          @select-user-confirm="selectUserConfirm"
        />
      </ContentWrap>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { SendDocApi, SendDoc } from '@/api/bpm/senddoc'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import { useRoute } from 'vue-router'

defineOptions({ name: 'BpmSendDocCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formLoading = ref(false)
const formRef = ref()

// 流程相关
const processDefineKey = 'send_doc' // 发文流程 Key
const startUserSelectTasks = ref([])
const startUserSelectAssignees = ref({})
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const processDefinitionId = ref('')

const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const multipleFlag = ref(false)

// 表单数据
const formData = ref({
  id: undefined,
  subject: undefined, // 主题/标题
  sendDocNumber: undefined, // 发文字号
  sendTime: undefined, // 发文日期
  docType: undefined, // 文件类型
  urgencyDegree: undefined, // 紧急程度
  secretDegree: undefined, // 机密程度
  docProperty: undefined, // 公文性质
  draftPerson: undefined, // 拟稿人
  draftDate: undefined, // 拟稿时间
  contactPhone: undefined, // 联系电话
  sendDept: undefined, // 发文单位
  primarySendDept: undefined, // 主送
  copySendDept: undefined, // 抄送
  reportSendDept: undefined, // 抄报
  uniondepts: undefined, // 联合发文单位
  sendDocDraft: undefined, // 草稿内容
  attachFilePath: undefined, // 附件
  remark: undefined, // 备注
  issuedName: undefined, // 签发人
  proofreader: undefined, // 校对人
  signPrintCount: undefined, // 签印份数
  keepTerm: undefined, // 保管期限
  isNormativeDocument: 2, // 默认否
  ifimportant: 0, // 默认否
  sendStatus: 0, // 默认拟发

  // 其他字段保持 undefined，提交时会包含
  docClass: undefined,
  docSecondClass: undefined,

  // 流程流转字段
  nextNode: undefined,
  tempNextUserSelectAssignees: undefined
})

const formRules = computed(() => ({
  subject: [{ required: true, message: '公文标题不能为空', trigger: 'blur' }],
  docType: [{ required: true, message: '文件类型不能为空', trigger: 'change' }],
  sendDocNumber: [{ required: true, message: '发文字号不能为空', trigger: 'change' }],
  nextNode: [
    {
      required: !formData.value.processInstanceId,
      message: '下一审批节点不能为空',
      trigger: 'change'
    }
  ],
  tempNextUserSelectAssignees: [
    { required: !formData.value.processInstanceId, message: '审批人不能为空', trigger: 'change' }
  ]
}))

// === 下一步节点与选人逻辑 ===
const nodeChange = async (val: any) => {
  await getSelectUsers(val.extensionProperties)
}

const getSelectUsers = async (item: any) => {
  const data = await ProcessInstanceApi.getSelectUserOptions({
    chooseRule: item.choose_rule,
    ruleValue: item.rule_value
  })
  multipleFlag.value = item.multiple_flag === '1'
  selectUserOptions.value = data
}

const getNextApprovalNodes = async () => {
  if (!processDefinitionId.value) return

  const data = await ProcessInstanceApi.getNextSelectNode({
    processDefinitionId: processDefinitionId.value,
    activityId: NodeId.START_USER_NODE_ID
  })

  nextNodeOptions.value = data
  if (data.length > 0) {
    formData.value.nextNode = data[0]
    await getSelectUsers(data[0].extensionProperties)
  }
}

// === 提交逻辑 ===
const submitForm = async () => {
  if (!formRef) return
  await formRef.value.validate()

  if (startUserSelectTasks.value?.length > 0) {
    for (const userTask of startUserSelectTasks.value) {
      if (
        Array.isArray(startUserSelectAssignees.value[userTask.id]) &&
        startUserSelectAssignees.value[userTask.id].length === 0
      ) {
        return message.warning(`请选择${userTask.name}的审批人`)
      }
    }
  }

  formLoading.value = true
  try {
    const data = { ...formData.value } as any

    // 处理发起人自选审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    // 处理下一步流程选择
    data.nextNodeAssignees = {}
    const assignees = formData.value.tempNextUserSelectAssignees
    if (assignees) {
      const taskKey = formData.value.nextNode.taskDefKey
      data.nextNodeAssignees[taskKey] = Array.isArray(assignees) ? assignees : [assignees]
    }

    if (!data.id) {
      await SendDocApi.createSendDoc(data)
      message.success('发文申请发起成功')
    } else {
      await SendDocApi.updateSendDoc(data)
      message.success('发文更新成功')
    }

    delView(unref(currentRoute))
    await push({ name: 'BpmProcessInstanceMy' })
  } finally {
    formLoading.value = false
  }
}

// === 初始化 ===
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({})
    })
    if (!data) return
    activityNodes.value = data.activityNodes
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
  } catch (e) {
    console.error(e)
  }
}

const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

onMounted(async () => {
  // 预填当前用户为拟稿人
  if (userStore.user.nickname) {
    formData.value.draftPerson = userStore.user.nickname
  }
  formData.value.draftDate = Date.now() // 默认当前时间

  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('流程未配置，请检查 Key: ' + processDefineKey)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  await getNextApprovalNodes()
  await getApprovalDetail()

  const queryId = route.query.id
  if (queryId) {
    formLoading.value = true
    try {
      const detail = await SendDocApi.getSendDoc(Number(queryId))
      Object.assign(formData.value, detail)

      // 修复：如果 sendDocNumber 是数字（历史旧数据），自动转换为字典标签
      if (formData.value.sendDocNumber && /^\d+$/.test(String(formData.value.sendDocNumber))) {
        const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
        const dict = dicts.find((d) => String(d.value) === String(formData.value.sendDocNumber))
        if (dict) {
          formData.value.sendDocNumber = dict.label
        }
      }
    } finally {
      formLoading.value = false
    }
  }
})

watch(
  () => formData.value.nextNode,
  () => {
    getApprovalDetail()
  }
)
</script>

<style scoped>
.section-title {
  padding-left: 10px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  border-left: 4px solid #409eff;
}
</style>
