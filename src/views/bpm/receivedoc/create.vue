<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="申请信息">
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
          <el-row>
            <el-col :span="12">
              <el-form-item label="收文编号" prop="receiveDocNumber">
                <el-input
                  v-model="formData.receiveDocNumber"
                  placeholder="请输入收文编号，或选择单位类别自动生成"
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
                <el-autocomplete
                  v-model="formData.sendDocNumber"
                  :fetch-suggestions="queryDocNumberSuggestions"
                  placeholder="请输入或选择来文字号"
                  clearable
                  style="width: 100%"
                />
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
                <el-autocomplete
                  v-model="formData.docSecondClass"
                  :fetch-suggestions="queryDocSecondClassSuggestions"
                  placeholder="请输入或选择文件类别"
                  clearable
                  style="width: 100%"
                />
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
                <el-autocomplete
                  v-model="formData.sendDept"
                  :fetch-suggestions="querySendDeptSuggestions"
                  placeholder="请输入或选择来文单位"
                  clearable
                  style="width: 100%"
                />
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
              @update:first-file-name="handleFirstFileNameUpdate"
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
        </el-form>
      </ContentWrap>
    </el-col>
  </el-row>

  <ProcessSendDialog
    ref="sendDialogRef"
    title="发送收文记录"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="startUserNodeId"
    @submit="submitProcess"
  />
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, unref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useMessage } from '@/hooks/web/useMessage'
import * as DefinitionApi from '@/api/bpm/definition'
import { ReceiveDocApi } from '@/api/bpm/receivedoc'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'
import { dateUtil } from '@/utils/dateUtil'
import { uploadReturnInfo } from '@/api/infra/file'

// 引入弹窗组件及常量
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'

defineOptions({ name: 'BpmReceiveDocCreate' })

const userStore = useUserStore()
const deptName = ref('')
const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()

// ===== 弹窗控制 =====
const sendDialogRef = ref()
const startUserNodeId = NodeId.START_USER_NODE_ID
const processDefinitionId = ref('')
const processDefineKey = 'receice_doc_v2_copy_copy' // 流程 Key

const formLoading = ref(false)
const uploadFileRef = ref()
const formRef = ref()

// 去除了写死的节点变量
const formData = ref({
  id: undefined,
  processInstanceId: undefined,
  docClass: undefined,
  sendDept: undefined,
  sendDocNumber: undefined,
  receiveDocNumber: undefined,
  receiveTime: undefined as number | undefined,
  subject: undefined,
  urgencyDegree: undefined,
  remark: undefined,
  docSecondClass: undefined,
  attachFilePath: '',
  zhubandate: undefined,
  xiebandate: undefined,
  fileList: []
})

// 去除了办理人的必填校验
const formRules = reactive({
  subject: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  receiveDocNumber: [{ required: true, message: '收文编号不能为空', trigger: 'blur' }]
})

// 监听并接收首位有效文件名称回填
const handleFirstFileNameUpdate = (fileName: string, forceUpdate: boolean = false) => {
  const data = formData.value as any
  if (fileName && (forceUpdate || !data.subject || data.subject.toString().trim() === '')) {
    data.subject = fileName
  }
}

/** 构建请求数据 */
const buildRequestData = () => {
  const data = { ...formData.value } as any
  if (Array.isArray(data.sendDept)) {
    data.sendDept = data.sendDept.join(',')
  }

  const rawFileList = uploadFileRef.value?.fileList || []

  data.fileList = rawFileList
    .filter((item: any) => item.status === 'success' || item.id)
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
      }

      return {
        receiveDocId: data.id,
        attachFileId: fileId,
        attachFileName: fileName,
        attachOrder: index,
        showType: 0
      }
    })
    .filter((item: any) => item.attachFileId)

  return data
}

/** 点击发送，校验表单后唤起弹窗 */
const handleOpenDialog = async () => {
  const rawFileList = uploadFileRef.value?.fileList || []
  const isUploading = rawFileList.some(
    (file: any) => file.status === 'ready' || file.status === 'uploading'
  )
  if (isUploading) {
    message.warning('还有文件正在上传中，请稍后发送')
    return
  }

  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 打开选人弹窗
  sendDialogRef.value.open({})
}

/** 接收弹窗返回的下一步办理人和变量，并提交流程 */
const submitProcess = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = buildRequestData()

    // 绑定下一节点办理人和变量参数
    data.nextNodeAssignees = submitData.nextNodeAssignees
    if (submitData.variables && Object.keys(submitData.variables).length > 0) {
      data.processVariablesStr = JSON.stringify(submitData.variables)
    }

    if (!data.id) {
      // 纯新增发起
      await ReceiveDocApi.createReceiveDoc(data)
    } else {
      // 已有草稿发起
      await ReceiveDocApi.submitReceiveDoc(data)
    }

    message.success('发送成功')

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

/** 保存草稿/修改操作 (不启动流程) */
const handleSave = async () => {
  const rawFileList = uploadFileRef.value?.fileList || []
  const isUploading = rawFileList.some(
    (file: any) => file.status === 'ready' || file.status === 'uploading'
  )
  if (isUploading) {
    message.warning('还有文件正在上传中，请稍后保存')
    return
  }
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
    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/OAdoc/receive-doc')
    }, 200)
  } finally {
    formLoading.value = false
  }
}

const querySendDeptSuggestions = (queryString: string, cb: any) => {
  const dictOptions = getStrDictOptions(DICT_TYPE.BPM_AGENCY_NAME) || []
  const suggestions = dictOptions.map((dict) => ({ value: dict.label }))
  const results = queryString
    ? suggestions.filter((item) => item.value.includes(queryString))
    : suggestions
  cb(results)
}

const queryDocSecondClassSuggestions = (queryString: string, cb: any) => {
  const dictOptions = getIntDictOptions(DICT_TYPE.BPM_DOC_CLASS) || []
  const suggestions = dictOptions.map((dict) => ({ value: dict.label }))
  const results = queryString
    ? suggestions.filter((item) => item.value.includes(queryString))
    : suggestions
  cb(results)
}

const queryDocNumberSuggestions = (queryString: string, cb: any) => {
  const dictOptions = getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE) || []
  const suggestions = dictOptions.map((dict) => ({
    value: formatSendDocNumberLabel(dict.label)
  }))
  const results = queryString
    ? suggestions.filter((item) => item.value.includes(queryString))
    : suggestions
  cb(results)
}

const formatSendDocNumberLabel = (label: string) => {
  const year = new Date().getFullYear()
  return `${label}[${year}]号`
}

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

/** 初始化 */
onMounted(async () => {
  // 获取流程定义 ID (供弹窗组件使用)
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('OA 收文的流程模型未配置，请检查！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id

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

      if (formData.value.sendDocNumber && /^\d+$/.test(String(formData.value.sendDocNumber))) {
        const dicts = getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)
        const dict = dicts.find((d) => String(d.value) === String(formData.value.sendDocNumber))
        if (dict) {
          formData.value.sendDocNumber = formatSendDocNumberLabel(dict.label)
        }
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

watch(
  () => formData.value.attachFilePath,
  (newVal) => {
    if (newVal && !formData.value.subject && uploadFileRef.value?.fileList?.length > 0) {
      const firstFileName = uploadFileRef.value.fileList[0].name
      if (firstFileName) {
        const lastDotIndex = firstFileName.lastIndexOf('.')
        const title = lastDotIndex > -1 ? firstFileName.substring(0, lastDotIndex) : firstFileName
        formData.value.subject = title
      }
    }
  }
)
</script>

<style scoped lang="scss"></style>
