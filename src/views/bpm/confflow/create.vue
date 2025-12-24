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
            <el-col :span="24">
              <el-form-item label="会议名称" prop="title">
                <el-input v-model="formData.title" placeholder="请输入会议名称" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="申请日期" prop="applyDate">
                <el-date-picker
                  v-model="formData.applyDate"
                  type="date"
                  value-format="x"
                  placeholder="选择申请日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="会议时间" prop="startDate">
                <el-date-picker
                  v-model="formData.startDate"
                  type="date"
                  value-format="x"
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="会议地点" prop="venue">
                <el-input v-model="formData.venue" placeholder="请输入会议地点" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="召集单位及召集人" prop="joinUnit">
                <el-input v-model="formData.joinUnit" placeholder="请输入召集单位及召集人" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="我局参会科室" prop="offerUnit">
                <el-input v-model="formData.offerUnit" placeholder="请输入我局参会科室" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="我局参会人员" prop="offerPerson">
                <el-input v-model="formData.offerPerson" placeholder="请输入我局参会人员" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="参会人员会议情况及建议" prop="situation">
            <el-input
              v-model="formData.situation"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入参会人员会议情况及建议"
            />
          </el-form-item>

          <el-form-item label="提议内容" prop="content">
            <Editor v-model="formData.content" height="150px" />
          </el-form-item>

          <el-form-item label="附件" prop="attachFilePath">
            <UploadFile v-model="formData.attachFilePath" />
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
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

          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="submitForm">
              提 交
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
import { ApprovalNodeInfo, getSelectUserOptions } from '@/api/bpm/processInstance'
import { Confflow, ConfflowApi } from '@/api/bpm/confflow' // 引入会议报告单API
import { useUserStore } from '@/store/modules/user'
import { dateUtil } from '@/utils/dateUtil'

defineOptions({ name: 'BpmConfflowCreate' })

const userStore = useUserStore()
const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由

const formLoading = ref(false)
const multipleFlag = ref(false)

// 表单数据初始化
const formData = ref({
  id: undefined,
  // 业务字段
  title: undefined,
  applyDate: undefined,
  startDate: undefined,
  venue: undefined,
  joinUnit: undefined,
  offerUnit: undefined,
  offerPerson: undefined,
  situation: undefined,
  content: '', // 富文本默认为空字符串
  remark: undefined,
  attachFilePath: '',
  // 流程字段
  nextNode: '',
  nextUserSelectAssignees: {},
  tempNextUserSelectAssignees: undefined
})

const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const nextNodeSelectAssignees = ref({})

// 表单校验规则
const formRules = reactive({
  title: [{ required: true, message: '会议名称不能为空', trigger: 'blur' }],
  startDate: [{ required: true, message: '会议时间不能为空', trigger: 'blur' }],
  venue: [{ required: true, message: '会议地点不能为空', trigger: 'blur' }],
  nextNode: [{ required: true, message: '下一审批节点不能为空', trigger: 'change' }],
  tempNextUserSelectAssignees: [{ required: true, message: '审批人不能为空', trigger: 'change' }]
})
const formRef = ref()

// 流程定义 Key
const processDefineKey = 'conference_report'
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

/** 提交表单 */
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 校验指定审批人
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
    const data = { ...formData.value } as unknown as Confflow

    // BPM 参数组装
    data.nextNodeAssignees = {}
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    // 处理下一节点审批人
    if (formData.value.tempNextUserSelectAssignees?.length > 0) {
      data.nextNodeAssignees[formData.value.nextNode.taskDefKey] =
        formData.value.tempNextUserSelectAssignees
    } else if (formData.value.tempNextUserSelectAssignees) {
      data.nextNodeAssignees[formData.value.nextNode.taskDefKey] = [
        formData.value.tempNextUserSelectAssignees
      ]
    }
    data.selectNode = formData.value.nextNode.conditionExpression

    // 调用新增接口
    await ConfflowApi.createConfflow(data)
    message.success('发起成功')

    // 关闭当前 Tab 并跳转
    delView(unref(currentRoute))
    await push({ name: 'BpmProcessInstanceMy' }) // 假设跳转到“我的流程”
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
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({
        PROCESS_NEXT_NODE: formData.value.nextNode.conditionExpression
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

    // 恢复历史选择
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
  if (data.length > 0) {
    formData.value.nextNode = data[0]
    await getSelectUsers(data[0].extensionProperties)
  }
}

const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

/** 初始化 */
onMounted(async () => {
  // 默认日期填充
  formData.value.applyDate = dateUtil().valueOf() // 时间戳
  // 也可以给 startDate 设置默认值，视需求而定

  // 获取流程定义
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error(`会议报告单流程(${processDefineKey})未配置，请检查！`)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  await getNextApprovalNodes()
})

// 监听表单变化重新预测节点（如果流程中有根据表单字段判断走向的网关）
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
  { immediate: true }
)
</script>

<style scoped lang="scss"></style>
