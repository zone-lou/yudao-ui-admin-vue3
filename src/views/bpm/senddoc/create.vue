<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="发文申请信息">
        <template #header>
          <el-button
            v-if="!formData.processInstanceId"
            type="primary"
            @click="handleOpenDialog"
            :loading="formLoading"
          >
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
          <el-button
            v-if="!formData.processInstanceId"
            type="success"
            @click="handleSave"
            :loading="formLoading"
          >
            <Icon icon="ep:document-checked" class="mr-5px" /> 保存草稿
          </el-button>
          <el-button v-else type="primary" @click="handleSave" :loading="formLoading">
            <Icon icon="ep:document-checked" class="mr-5px" /> 保存修改
          </el-button>
        </template>

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
                <div style="display: flex; align-items: center; gap: 8px">
                  <el-form-item prop="sendDocNumber" style="margin-bottom: 0; width: 200px">
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
                  <span style="color: #666">〔</span>
                  <el-form-item prop="year" style="margin-bottom: 0; width: 120px">
                    <el-date-picker
                      v-model="formData.year"
                      type="year"
                      value-format="YYYY"
                      placeholder="年份"
                      style="width: 100%"
                      :clearable="false"
                    />
                  </el-form-item>
                  <span style="color: #666">〕</span>
                  <el-form-item prop="docSequence" style="margin-bottom: 0; width: 150px">
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
              <el-form-item
                label="不公开理由"
                prop="noreleasecause"
                v-if="formData.inforelease === '3'"
              >
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
        </el-form>
      </ContentWrap>
    </el-col>
  </el-row>

  <ProcessSendDialog
    ref="sendDialogRef"
    title="发送发文申请"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="startUserNodeId"
    @submit="submitProcess"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, unref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useMessage } from '@/hooks/web/useMessage'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import * as DefinitionApi from '@/api/bpm/definition'
import { SendDocApi } from '@/api/bpm/senddoc'

// 引入弹窗组件及常量
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'

defineOptions({ name: 'BpmSendDocCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()
const userStore = useUserStore()

// ===== 弹窗控制 =====
const sendDialogRef = ref()
const startUserNodeId = NodeId.START_USER_NODE_ID
const processDefinitionId = ref('')
const processDefineKey = 'send_doc' // 发文流程 Key

const formLoading = ref(false)
const formRef = ref()

// 表单数据
const formData = ref({
  id: undefined,
  processInstanceId: undefined, // 流程实例ID (如果存在则代表流程已发起)
  subject: undefined,
  sendDocNumber: undefined,
  year: new Date().getFullYear().toString(),
  docSequence: undefined,
  sendTime: undefined,
  urgencyDegree: undefined,
  secretDegree: undefined,
  draftPerson: undefined,
  draftDate: undefined,
  sendDept: undefined,
  primarySendDept: undefined,
  copySendDept: undefined,
  sendDocDraft: undefined,
  attachFilePath: undefined,
  isNormativeDocument: 2,
  inforelease: '1',
  noreleasecause: undefined,
  signPrintCount: undefined,
  typist: undefined,
  proofreader: undefined
})

const formRules = computed(() => ({
  subject: [{ required: true, message: '公文标题不能为空', trigger: 'blur' }],
  sendDocNumber: [{ required: true, message: '发文字号代字不能为空', trigger: 'change' }],
  year: [{ required: true, message: '年份不能为空', trigger: 'change' }],
  docSequence: [{ required: true, message: '序号不能为空', trigger: 'blur' }]
}))

/** 数据构建与格式化处理 */
const buildRequestData = () => {
  const data = { ...formData.value } as any

  // 格式化处理公开理由：如果非不公开，则清空不公开理由
  if (data.inforelease !== '3') {
    data.noreleasecause = undefined
  }

  // 对发送后端的富文本草稿进行 Base64 编码 (后端接收类型为 byte[])
  if (data.sendDocDraft) {
    data.sendDocDraft = window.btoa(unescape(encodeURIComponent(data.sendDocDraft)))
  }

  return data
}

/** 唤起发送弹窗 */
const handleOpenDialog = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 校验通过，唤起选人弹窗
  sendDialogRef.value.open({})
}

/** 弹窗确认发送流程 */
const submitProcess = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = buildRequestData()

    // 绑定流程变量及下一步处理人
    data.nextNodeAssignees = submitData.nextNodeAssignees
    if (submitData.variables && Object.keys(submitData.variables).length > 0) {
      data.processVariablesStr = JSON.stringify(submitData.variables)
    }

    if (!data.id) {
      await SendDocApi.createSendDoc(data)
      message.success('发文申请发起成功')
    } else {
      await SendDocApi.updateSendDoc(data)
      message.success('发文更新并发送成功')
    }

    if (sendDialogRef.value) {
      sendDialogRef.value.close()
    }

    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/unified')
    }, 200)
  } catch (error) {
    console.error(error)
    if (sendDialogRef.value) {
      sendDialogRef.value.submitLoading = false
    }
  } finally {
    formLoading.value = false
  }
}

/** 保存草稿或修改 (不启动流程) */
const handleSave = async () => {
  // 保存草稿时，可以根据业务需求选择只校验部分必填项，此处统一做完整校验
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  formLoading.value = true
  try {
    const data = buildRequestData()
    if (data.id) {
      await SendDocApi.updateSendDoc(data)
      message.success('保存修改成功')
    } else {
      await SendDocApi.createSendDoc(data)
      message.success('保存草稿成功')
    }

    // 返回到发文列表
    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/OAdoc/send-doc')
    }, 200)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  // 获取流程定义 ID (供弹窗组件使用)
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error(`发文流程(${processDefineKey})未配置，请检查！`)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id

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

  // 获取草稿或流转中数据回显
  const queryId = route.query.id
  if (queryId) {
    formLoading.value = true
    try {
      const detail = await SendDocApi.getSendDoc(Number(queryId))
      Object.assign(formData.value, detail)

      // 回显处理字典对应关系
      if (formData.value.sendDocNumber && /^\d+$/.test(String(formData.value.sendDocNumber))) {
        const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
        const dict = dicts.find((d) => String(d.value) === String(formData.value.sendDocNumber))
        if (dict) {
          formData.value.sendDocNumber = dict.label
        }
      }

      // Base64 解码，因为后端存储的是 byte[] 返回给前端是 Base64
      if (formData.value.sendDocDraft) {
        try {
          formData.value.sendDocDraft = decodeURIComponent(
            escape(window.atob(formData.value.sendDocDraft))
          )
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
