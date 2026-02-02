<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="申请信息">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="150px"
          v-loading="formLoading"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="收文编号" prop="receiveDocNumber">
                <el-input
                  v-model="formData.receiveDocNumber"
                  placeholder="选择单位类别自动生成"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收文日期" prop="receiveTime">
                <el-date-picker
                  v-model="formData.receiveTime"
                  type="date"
                  value-format="x"
                  placeholder="请选择收文日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="来文字号" prop="sendDocNumber">
                <el-select v-model="formData.sendDocNumber" placeholder="请输入来文字号">
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)"
                    :key="dict.value"
                    :label="formatSendDocNumberLabel(dict.label)"
                    :value="formatSendDocNumberLabel(dict.label)"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位类别" prop="docClass">
                <el-select v-model="formData.docClass" placeholder="请选择单位类别">
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.BPM_RECEICE_CLASS)"
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
              <el-form-item label="文件类别" prop="docSecondClass">
                <el-select v-model="formData.docSecondClass" placeholder="请选择文件类别">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.BPM_DOC_CLASS)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急程度" prop="urgencyDegree">
                <el-select v-model="formData.urgencyDegree" placeholder="请选择紧急程度">
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
              <el-form-item label="来文单位" prop="sendDept">
                <el-select v-model="formData.sendDept" placeholder="请选择来文单位" multiple>
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.BPM_AGENCY_NAME)"
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
              <el-form-item label="主办单位办结时间" prop="zhubandate">
                <el-date-picker
                  v-model="formData.zhubandate"
                  type="date"
                  value-format="x"
                  placeholder="选择办结时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="协办单位办结时间" prop="xiebandate">
                <el-date-picker
                  v-model="formData.xiebandate"
                  type="date"
                  value-format="x"
                  placeholder="选择办结时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="文件标题" prop="subject">
            <el-input v-model="formData.subject" placeholder="请输入标题" />
          </el-form-item>

          <el-form-item label="收文文件" prop="attachFilePath">
            <UploadFile
              v-model="formData.attachFilePath"
              ref="uploadFileRef"
              :upload-api="uploadReturnInfo"
            />
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
            />
          </el-form-item>

          <el-form-item
            label="下一审批节点"
            prop="nextNode"
            required
            v-if="!formData.processInstanceId"
          >
            <el-select
              v-model="formData.nextNode"
              placeholder="请选择下一节点"
              @change="nodeChange"
              value-key="conditionExpression"
              :empty-values="[null, undefined]"
            >
              <el-option
                v-for="dict in nextNodeOptions"
                :key="dict.conditionExpression"
                :label="dict.taskName"
                :value="dict"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            label="审批人"
            prop="tempNextUserSelectAssignees"
            required
            v-if="!formData.processInstanceId"
          >
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

          <el-form-item>
            <el-button
              v-if="!formData.processInstanceId"
              :disabled="formLoading"
              type="primary"
              @click="handleSubmit"
            >
              发起流程
            </el-button>
            <el-button v-else :disabled="formLoading" type="primary" @click="handleSave">
              保存修改
            </el-button>
            <el-button
              v-if="!formData.processInstanceId"
              :disabled="formLoading"
              type="success"
              @click="handleSave"
            >
              保存草稿
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
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { ReceiveDocApi } from '@/api/bpm/receivedoc'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'
import { dateUtil } from '@/utils/dateUtil'
import { uploadReturnInfo } from '@/api/infra/file'

defineOptions({ name: 'BpmReceiveDocCreate' })

const userStore = useUserStore()
const deptName = ref('')
const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()

const formLoading = ref(false)
const multipleFlag = ref(false)

const formData = ref({
  id: undefined,
  processInstanceId: undefined,
  docClass: undefined,
  sendDept: [],
  sendDocNumber: undefined,
  receiveDocNumber: undefined,
  receiveTime: undefined,
  subject: undefined,
  urgencyDegree: undefined,
  remark: undefined,
  docSecondClass: undefined,
  attachFilePath: '',
  zhubandate: undefined,
  xiebandate: undefined,
  nextNode: '',
  nextUserSelectAssignees: {},
  tempNextUserSelectAssignees: undefined,
  fileList: []
})

const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const nextNodeSelectAssignees = ref({})
const uploadFileRef = ref()
const formRef = ref()

const formRules = reactive({
  subject: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  receiveDocNumber: [{ required: true, message: '收文编号不能为空', trigger: 'blur' }],
  nextNode: [{ required: true, message: '下一审批节点不能为空', trigger: 'change' }],
  tempNextUserSelectAssignees: [{ required: true, message: '审批人不能为空', trigger: 'blur' }]
})

const processDefineKey = 'receice_doc_v2_copy'
const startUserSelectTasks = ref([])
const startUserSelectAssignees = ref({})
const tempStartUserSelectAssignees = ref({})
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const processDefinitionId = ref('')

const nodeChange = async (val) => {
  await getSelectUsers(val.extensionProperties)
}

const getSelectUsers = async (item) => {
  const data = await ProcessInstanceApi.getSelectUserOptions({
    chooseRule: item.choose_rule,
    ruleValue: item.rule_value
  })
  multipleFlag.value = item.multiple_flag === '1'
  selectUserOptions.value = data
}

/** 构建请求数据 */
const buildRequestData = () => {
  const data = { ...formData.value } as any
  if (Array.isArray(data.sendDept)) {
    data.sendDept = data.sendDept.join(',')
  }
  const rawFileList = uploadFileRef.value?.fileList || []
  data.fileList = rawFileList
    .map((item: any, index: number) => {
      let fileId = undefined
      let fileName = item.name
      if (item.response?.data) {
        const fileResponse = item.response.data
        fileId =
          typeof fileResponse === 'object' && fileResponse !== null ? fileResponse.id : fileResponse
        fileName =
          typeof fileResponse === 'object' && fileResponse !== null ? fileResponse.name : item.name
      } else if (item.id) {
        fileId = item.id
        fileName = item.name
      } else {
        console.warn('文件ID解析失败:', item.name)
      }
      return {
        receiveDocId: data.id,
        attachFileId: fileId,
        attachFileName: fileName,
        attachOrder: index,
        showType: 0
      }
    })
    .filter((item) => item.attachFileId)
  return data
}

/** 保存操作 */
const handleSave = async () => {
  try {
    await formRef.value.validateField(['subject', 'receiveDocNumber'])
  } catch (e) {
    return
  }
  formLoading.value = true
  try {
    const data = buildRequestData()
    if (data.id) {
      await ReceiveDocApi.updateReceiveDoc(data)
    } else {
      await ReceiveDocApi.saveReceiveDoc(data)
    }
    message.success('保存成功')
    delView(unref(currentRoute))
    await push('/bpm/OAdoc/receive-doc')
  } finally {
    formLoading.value = false
  }
}

/** 提交操作 */
const handleSubmit = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 修改点：仅在未启动流程时，校验审批人
  if (!formData.value.processInstanceId && startUserSelectTasks.value?.length > 0) {
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
    const data = buildRequestData()

    // 修改点：仅在未启动流程时，构建流程相关参数
    if (!formData.value.processInstanceId) {
      data.nextNodeAssignees = {}
      if (startUserSelectTasks.value?.length > 0) {
        data.startUserSelectAssignees = startUserSelectAssignees.value
      }
      if (formData.value.tempNextUserSelectAssignees?.length > 0) {
        data.nextNodeAssignees[formData.value.nextNode.taskDefKey] =
          formData.value.tempNextUserSelectAssignees
      } else if (formData.value.tempNextUserSelectAssignees) {
        data.nextNodeAssignees[formData.value.nextNode.taskDefKey] = [
          formData.value.tempNextUserSelectAssignees
        ]
      }
      data.processVariablesStr = JSON.stringify({
        [formData.value.nextNode.conditionExpression.key]:
          formData.value.nextNode.conditionExpression.value
      })
    }

    console.log(data, '提交请求数据')

    if (!data.id) {
      // 1. 纯新增提交
      await ReceiveDocApi.createReceiveDoc(data)
    } else {
      if (data.processInstanceId) {
        // 2. 有流程实例ID -> 流程已启动 -> 走 update 接口
        await ReceiveDocApi.updateReceiveDoc(data)
      } else {
        // 3. 无流程实例ID -> 草稿提交 -> 走 submit 接口
        await ReceiveDocApi.submitReceiveDoc(data)
      }
    }

    message.success('提交成功')
    delView(unref(currentRoute))
    await push({ name: 'BpmProcessInstanceMy' })
  } finally {
    formLoading.value = false
  }
}

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
  if (!processDefinitionId.value) return
  // 如果是修改流程中表单，不需要重新计算下一节点
  if (formData.value.processInstanceId) return

  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({
        [formData.value.nextNode.conditionExpression.key]:
          formData.value.nextNode.conditionExpression.value
      })
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    activityNodes.value = data.activityNodes

    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
    if (startUserSelectTasks.value?.length > 0) {
      for (const node of startUserSelectTasks.value) {
        if (
          tempStartUserSelectAssignees.value[node.id] &&
          tempStartUserSelectAssignees.value[node.id].length > 0
        ) {
          startUserSelectAssignees.value[node.id] = tempStartUserSelectAssignees.value[node.id]
        } else {
          startUserSelectAssignees.value[node.id] = []
        }
      }
    }
  } finally {
  }
}

const getNextApprovalNodes = async () => {
  const data = await ProcessInstanceApi.getNextSelectNode({
    processDefinitionId: processDefinitionId.value,
    activityId: NodeId.START_USER_NODE_ID
  })
  nextNodeOptions.value = data
  formData.value.nextNode = data[0]
  await getSelectUsers(data[0].extensionProperties)
}

const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

/** 初始化 */
onMounted(async () => {
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('OA 收文的流程模型未配置，请检查！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks
  await getNextApprovalNodes()

  const res = await getUserProfile()
  if (res.dept) {
    deptName.value = res.dept.name
  } else if (res.users && res.users.dept) {
    deptName.value = res.users.dept.name
  }

  const queryId = route.query.id
  if (queryId) {
    formLoading.value = true
    try {
      const detail = await ReceiveDocApi.getReceiveDoc(queryId)
      Object.assign(formData.value, detail)

      // 修复：如果 sendDocNumber 是数字（历史旧数据或之前的错误），自动转换为格式化字符串
      if (formData.value.sendDocNumber && /^\d+$/.test(formData.value.sendDocNumber)) {
        const dicts = getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)
        const dict = dicts.find((d) => d.value === formData.value.sendDocNumber)
        if (dict) {
          formData.value.sendDocNumber = formatSendDocNumberLabel(dict.label)
        }
      }

      if (typeof formData.value.sendDept === 'string' && formData.value.sendDept) {
        formData.value.sendDept = formData.value.sendDept.split(',')
      } else if (!formData.value.sendDept) {
        formData.value.sendDept = []
      }

      const attachList = await ReceiveDocApi.getReceiveDocXmGuid(queryId)
      if (attachList && attachList.length > 0) {
        const files = attachList.map((item) => ({
          name: item.attachFileName,
          url: item.fileUrl,
          id: item.attachFileId,
          response: { data: { id: item.attachFileId, name: item.attachFileName } }
        }))
        nextTick(() => {
          if (uploadFileRef.value) {
            uploadFileRef.value.fileList = files
          }
        })
      }
    } finally {
      formLoading.value = false
    }
  } else {
    formData.value.receiveTime = Date.now()
  }
})

const formatSendDocNumberLabel = (label: string) => {
  const year = new Date().getFullYear()
  return `${label}[${year}]号`
}

watch(
  formData.value,
  (newValue, oldValue) => {
    if (!oldValue) return
    if (newValue && Object.keys(newValue).length > 0) {
      tempStartUserSelectAssignees.value = startUserSelectAssignees.value
      startUserSelectAssignees.value = {}
      getApprovalDetail()
    }
  },
  { deep: true }
)

const generateReceiveDocNumber = async () => {
  if (!formData.value.docClass || !formData.value.receiveTime) {
    return
  }
  const year = dateUtil(formData.value.receiveTime).format('YYYY')
  try {
    const res = await ReceiveDocApi.getReceiveDocSign({
      docClass: formData.value.docClass.toString(),
      year: year
    })
    if (res) {
      formData.value.receiveDocNumber = res
    }
  } catch (error) {
    console.error('生成收文编号失败:', error)
  }
}

watch(
  () => formData.value.docClass,
  (newVal) => {
    if (newVal) {
      generateReceiveDocNumber()
    }
  }
)

watch(
  () => formData.value.receiveTime,
  (newVal, oldVal) => {
    if (!newVal) return
    const newYear = dateUtil(newVal).format('YYYY')
    const oldYear = oldVal ? dateUtil(oldVal).format('YYYY') : ''
    if (newYear !== oldYear) {
      generateReceiveDocNumber()
    }
  }
)
</script>

<style scoped lang="scss"></style>
