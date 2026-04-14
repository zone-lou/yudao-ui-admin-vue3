<template>
  <el-row :gutter="20">
    <el-col :span="24">
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
            <el-col :span="24">
              <el-form-item label="发文字号" required>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <el-form-item prop="sendDocNumber" style="margin-bottom: 0; width: 200px;">
                    <el-select
                      v-model="formData.sendDocNumber"
                      placeholder="代字"
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
                  <span style="color: #666;">〔</span>
                  <el-form-item prop="year" style="margin-bottom: 0; width: 120px;">
                    <el-date-picker
                      v-model="formData.year"
                      type="year"
                      value-format="YYYY"
                      placeholder="年份"
                      style="width: 100%"
                      :clearable="false"
                    />
                  </el-form-item>
                  <span style="color: #666;">〕</span>
                  <el-form-item prop="docSequence" style="margin-bottom: 0; width: 150px;">
                    <el-input v-model="formData.docSequence" placeholder="序号">
                      <template #append>号</template>
                    </el-input>
                  </el-form-item>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
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
          </el-row>

          <el-row>
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
            <el-col :span="12">
              <el-form-item label="拟稿人" prop="draftPerson">
                <el-input v-model="formData.draftPerson" placeholder="请输入拟稿人" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
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
            <el-col :span="12">
              <el-form-item label="发文单位 / 部门" prop="sendDept">
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

          <h3 class="section-title" style="margin-top: 20px">内容与附件</h3>

          <el-form-item label="发文草稿内容" prop="sendDocDraft">
            <el-input
              v-model="formData.sendDocDraft"
              type="textarea"
              :rows="3"
              placeholder="请输入发文草稿内容标题或简述"
            />
          </el-form-item>

          <el-form-item label="附件" prop="attachFilePath">
            <UploadFile v-model="formData.attachFilePath" />
          </el-form-item>

          <h3 class="section-title" style="margin-top: 20px">属性设置</h3>

          <el-row>
            <el-col :span="12">
              <el-form-item label="公开方式" prop="inforelease">
                <el-radio-group v-model="formData.inforelease">
                  <el-radio label="1">主动公开</el-radio>
                  <el-radio label="2">依申请公开</el-radio>
                  <el-radio label="3">不公开</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="不公开理由" prop="noreleasecause" v-if="formData.inforelease === '3'">
                <el-input v-model="formData.noreleasecause" placeholder="请输入不公开理由" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="是否属于规范性文件" prop="isNormativeDocument">
                <el-radio-group v-model="formData.isNormativeDocument">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="2">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>


          <template v-if="!formData.processInstanceId">
            <h3 class="section-title" style="margin-top: 20px">流程处理</h3>

            <el-form-item label="下一办理节点" prop="nextNode" required>
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

            <el-form-item label="办理人" prop="tempNextUserSelectAssignees" required>
              <el-select
                v-model="formData.tempNextUserSelectAssignees"
                placeholder="请选择办理人"
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
  </el-row>
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { SendDocApi } from '@/api/bpm/senddoc'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
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
const processDefinitionId = ref('')

const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const multipleFlag = ref(false)

// 表单数据 (基于严格对接后端表及详情页字段清理)
const formData = ref({
  id: undefined,
  subject: undefined, // 主题/标题
  sendDocNumber: undefined, // 发文字号
  year: new Date().getFullYear().toString(), // 默认当前年份
  docSequence: undefined, // 序号
  sendTime: undefined, // 发文日期
  urgencyDegree: undefined, // 紧急程度
  secretDegree: undefined, // 机密程度
  draftPerson: undefined, // 拟稿人
  draftDate: undefined, // 拟稿时间
  sendDept: undefined, // 发文单位
  primarySendDept: undefined, // 主送
  copySendDept: undefined, // 抄送
  sendDocDraft: undefined, // 发文草稿内容
  attachFilePath: undefined, // 附件
  isNormativeDocument: 2, // 是否属于规范性文件 (1是 2否)
  inforelease: '1', // 公开方式
  noreleasecause: undefined, // 不公开理由
  signPrintCount: undefined, // 签印份数
  typist: undefined, // 打字员
  proofreader: undefined, // 校对人

  // 流程流转字段
  nextNode: undefined,
  tempNextUserSelectAssignees: undefined
})

const formRules = computed(() => ({
  subject: [{ required: true, message: '公文标题不能为空', trigger: 'blur' }],
  sendDocNumber: [{ required: true, message: '发文字号代字不能为空', trigger: 'change' }],
  year: [{ required: true, message: '年份不能为空', trigger: 'change' }],
  docSequence: [{ required: true, message: '序号不能为空', trigger: 'blur' }],
  nextNode: [
    {
      required: !formData.value.processInstanceId,
      message: '下一办理节点不能为空',
      trigger: 'change'
    }
  ],
  tempNextUserSelectAssignees: [
    { required: !formData.value.processInstanceId, message: '办理人不能为空', trigger: 'change' }
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

  const data = await ProcessInstanceApi.getNextSelectNodes({
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
        return message.warning(`请选择${userTask.name}的办理人`)
      }
    }
  }

  formLoading.value = true
  try {
    const data = { ...formData.value } as any

    // 格式化处理公开理由：如果非不公开，则清空不公开理由
    if (data.inforelease !== '3') {
      data.noreleasecause = undefined
    }
    
    // 对发送后端的富文本草稿进行 Base64 编码，因为后端接收类型为 byte[]
    if (data.sendDocDraft) {
      data.sendDocDraft = window.btoa(unescape(encodeURIComponent(data.sendDocDraft)))
    }

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

    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/unified')
    }, 200)
  } finally {
    formLoading.value = false
  }
}

// === 初始化 ===

onMounted(async () => {
  // 预填当前用户为拟稿人
  if (userStore.user.nickname) {
    formData.value.draftPerson = userStore.user.nickname
  }
  const anyUser = userStore.user as any
  if (anyUser.dept?.name) {
    formData.value.sendDept = anyUser.dept.name
  } else if (anyUser.deptName) {
    formData.value.sendDept = anyUser.deptName
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

  const queryId = route.query.id
  if (queryId) {
    formLoading.value = true
    try {
      const detail = await SendDocApi.getSendDoc(Number(queryId))
      Object.assign(formData.value, detail)

      if (formData.value.sendDocNumber && /^\d+$/.test(String(formData.value.sendDocNumber))) {
        const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
        const dict = dicts.find((d) => String(d.value) === String(formData.value.sendDocNumber))
        if (dict) {
          formData.value.sendDocNumber = dict.label
        }
      }
      
      // 进行 Base64 解码，因为后端存储的是 byte[] 返回给前端是 Base64
      if (formData.value.sendDocDraft) {
        try {
          formData.value.sendDocDraft = decodeURIComponent(escape(window.atob(formData.value.sendDocDraft)))
        } catch (e) {}
      }
    } finally {
      formLoading.value = false
    }
  }
})

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
