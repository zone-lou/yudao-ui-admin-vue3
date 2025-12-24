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
                <el-input v-model="formData.receiveDocNumber" placeholder="请输入收文编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收文日期" prop="receiveTime">
                <el-input v-model="formData.receiveTime" placeholder="请选择收文日期" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="来文字号" prop="sendDocNumber">
                <el-select v-model="formData.sendDocNumber" placeholder="请输入来文字号">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)"
                    :key="dict.value"
                    :label="formatSendDocNumberLabel(dict.label)"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位类别" prop="docSecondClass">
                <el-select v-model="formData.docSecondClass" placeholder="请选择单位类别">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.BPM_RECEICE_CLASS)"
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
              <el-form-item label="文件类别" prop="docClass">
                <el-select v-model="formData.docClass" placeholder="请选择文件类别">
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
                    v-for="dict in getIntDictOptions(DICT_TYPE.BPM_EMERGENCY_DEGREE)"
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
                    v-for="dict in getIntDictOptions(DICT_TYPE.BPM_RECEICE_DOC_UNIT)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!--            <el-col :span="12">-->
            <!--              <el-form-item label="监督监管">-->
            <!--                <el-row>-->
            <!--                  <el-col :span="12">-->
            <!--                    <el-form-item label="主办单位办结时间" prop="zhubandate">-->
            <!--                      <el-date-picker-->
            <!--                        v-model="formData.zhubandate"-->
            <!--                        type="date"-->
            <!--                        value-format="x"-->
            <!--                        placeholder="选择办结时间"-->
            <!--                        style="width: 100%"-->
            <!--                      />-->
            <!--                    </el-form-item>-->
            <!--                  </el-col>-->
            <!--                  <el-col :span="12">-->
            <!--                    <el-form-item label="协办单位办结时间" prop="xiebandate">-->
            <!--                      <el-date-picker-->
            <!--                        v-model="formData.xiebandate"-->
            <!--                        type="date"-->
            <!--                        value-format="x"-->
            <!--                        placeholder="选择办结时间"-->
            <!--                        style="width: 100%"-->
            <!--                      />-->
            <!--                    </el-form-item>-->
            <!--                  </el-col>-->
            <!--                </el-row>-->
            <!--              </el-form-item>-->
            <!--            </el-col>-->
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
          <el-form-item label="收文文件" prop="filepath">
            <UploadFile v-model="formData.attachFilePath" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
            />
          </el-form-item>
          <el-form-item label="下一审批节点" prop="nextNode" required>
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
          <el-form-item label="审批人" prop="remark" required>
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
            <el-button :disabled="formLoading" type="primary" @click="submitForm">
              确 定
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import {
  ApprovalNodeInfo,
  getNextSelectNode,
  getSelectUserOptions
} from '@/api/bpm/processInstance'
import { ReceiveDoc, ReceiveDocApi } from '@/api/bpm/receivedoc'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'
import { dateUtil } from '@/utils/dateUtil'
defineOptions({ name: 'BpmReceiveDocCreate' })

const userStore = useUserStore()
const deptName = ref('')

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由

const formLoading = ref(false)
const multipleFlag = ref(false)

const formData = ref({
  id: undefined,
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
  tempNextUserSelectAssignees: undefined
})

const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const nextNodeSelectAssignees = ref({})

const formRules = reactive({
  subject: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  receiveDocNumber: [{ required: true, message: '收文编号不能为空', trigger: 'blur' }],
  nextNode: [{ required: true, message: '下一审批节点不能为空', trigger: 'change' }],
  tempNextUserSelectAssignees: [{ required: true, message: '审批人不能为空', trigger: 'change' }]
})
const formRef = ref()

const processDefineKey = 'receice_doc_v2' // 流程定义 Key
const startUserSelectTasks = ref([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

const nodeChange = async (val) => {
  await getSelectUsers(val.extensionProperties)
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

const submitForm = async () => {
  // 1.1 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 1.2 审批相关：校验指定审批人
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
  // 2. 提交请求
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as ReceiveDoc
    // 将来文单位数组转换为逗号分隔的字符串
    if (Array.isArray(data.sendDept)) {
      data.sendDept = data.sendDept.join(',')
    }
    data.nextNodeAssignees = {}
    // 审批相关：设置指定审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }
    // 有长度说明是多选
    if (formData.value.tempNextUserSelectAssignees?.length > 0) {
      data.nextNodeAssignees[formData.value.nextNode.taskDefKey] =
        formData.value.tempNextUserSelectAssignees
    } else if (formData.value.tempNextUserSelectAssignees) {
      data.nextNodeAssignees[formData.value.nextNode.taskDefKey] = [
        formData.value.tempNextUserSelectAssignees
      ]
    }
    data.selectNode = formData.value.nextNode.conditionExpression

    console.log(data, '请求数据')
    await ReceiveDocApi.createReceiveDoc(data)
    message.success('发起成功')
    // 关闭当前 Tab
    delView(unref(currentRoute))
    await push({ name: 'BpmProcessInstanceMy' })
  } finally {
    formLoading.value = false
  }
}

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
  if (!processDefinitionId.value) return
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      // TODO 小北：可以支持 processDefinitionKey 查询
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({
        PROCESS_NEXT_NODE: formData.value.nextNode.conditionExpression
      }) // 解决 GET 无法传递对象的问题，后端 String 再转 JSON
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    // 获取审批节点，显示 Timeline 的数据
    activityNodes.value = data.activityNodes

    // 获取发起人自选的任务
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
    // 恢复之前的选择审批人
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
    // TODO 小北：可以支持 processDefinitionKey 查询
    activityId: NodeId.START_USER_NODE_ID // 解决 GET 无法传递对象的问题，后端 String 再转 JSON
  })
  nextNodeOptions.value = data
  formData.value.nextNode = data[0]
  await getSelectUsers(data[0].extensionProperties)
}

/** 审批相关：选择发起人 */
const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

/** 初始化 */
onMounted(async () => {
  formData.value.receiveTime = dateUtil().format('YYYY-MM-DD')
  // TODO @小北：这里可以简化，统一通过 getApprovalDetail 处理么？
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

  // 审批相关：加载最新的审批详情，主要用于节点预测
  // await getApprovalDetail()
  await getNextApprovalNodes()

  // await getNextApprovalNodes()

  const res = await getUserProfile()
  if (res.dept) {
    deptName.value = res.dept.name
  } else if (res.users && res.users.dept) {
    deptName.value = res.users.dept.name
  }
})

/**
 * 格式化来文字号显示文本
 * 显示格式为: 标签[当前年份]号
 */
const formatSendDocNumberLabel = (label: string) => {
  const year = new Date().getFullYear()
  return `${label}[${year}]号`
}

/** 审批相关：预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次, formData.value可改成实际业务中的特定字段 */
watch(
  formData.value,
  (newValue, oldValue) => {
    if (!oldValue) {
      return
    }
    if (newValue && Object.keys(newValue).length > 0) {
      // 记录之前的节点审批人
      tempStartUserSelectAssignees.value = startUserSelectAssignees.value
      startUserSelectAssignees.value = {}
      // 加载最新的审批详情,主要用于节点预测
      getApprovalDetail()
    }
  },
  {
    immediate: true
  }
)

/**
 * 自动生成收文编号
 * 编号格式: 当前年份-文件类别选项键值-随机四位数
 */
const generateReceiveDocNumber = () => {
  const year = new Date().getFullYear()
  // 如果没有选择单位类别，则使用默认值
  const category =
    formData.value.docSecondClass !== undefined
      ? formData.value.docSecondClass.toString()
      : 'DEFAULT'
  // 生成4位随机数
  const randomNumber = Math.floor(1000 + Math.random() * 9000)
  formData.value.receiveDocNumber = `${year}-${category}-${randomNumber}`
}

// 监听单位类别(docSecondClass)变化，自动更新收文编号
watch(
  () => formData.value.docSecondClass,
  (newVal) => {
    // 当单位类别发生变化时，自动生成新的收文编号
    generateReceiveDocNumber()
  }
)
</script>

<style scoped lang="scss"></style>
