<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="申请信息">
        <template #header>
          <el-button
            v-if="!formData.processInstanceId && !formData.projectId"
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
            <Icon icon="ep:document-checked" class="mr-5px" /> 保存
          </el-button>
          <el-button v-else type="primary" @click="handleSave" :loading="formLoading">
            <Icon icon="ep:document-checked" class="mr-5px" /> 保存修改
          </el-button>
        </template>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="0"
          v-loading="formLoading"
        >
          <div id="printDivTag">
            <div class="oa-container">
              <div class="doc-title">义乌市自然资源和规划局收文阅办单</div>

              <div
                class="meta-info"
                style="
                  display: flex;
                  height: 35px;
                  margin-bottom: 12px;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <div style="display: flex; align-items: center; height: 100%">
                  <div style="display: flex; align-items: center; margin-right: 4px">
                    <span style="margin-right: 2px; color: #f56c6c">*</span>
                    <span
                      style="
                        font-family: SimHei, sans-serif;
                        font-size: 14px;
                        color: #333;
                        white-space: nowrap;
                      "
                      >收文号：</span
                    >
                  </div>
                  <div style="display: flex; width: 160px; align-items: center">
                    <el-form-item prop="receiveDocNumber" style="width: 100%; margin-bottom: 0">
                      <el-input
                        v-model="formData.receiveDocNumber"
                        placeholder="根据单位类别生成"
                        :disabled="isUpdateMode"
                      />
                    </el-form-item>
                  </div>
                </div>

                <div style="display: flex; align-items: center; height: 100%">
                  <div style="display: flex; align-items: center; margin-right: 4px">
                    <span style="margin-right: 2px; color: #f56c6c">*</span>
                    <span
                      style="
                        font-family: SimHei, sans-serif;
                        font-size: 14px;
                        color: #333;
                        white-space: nowrap;
                      "
                      >收文日期：</span
                    >
                  </div>
                  <div style="display: flex; width: 185px; align-items: center">
                    <el-form-item prop="receiveTime" style="width: 100%; margin-bottom: 0">
                      <el-date-picker
                        v-model="formData.receiveTime"
                        type="datetime"
                        value-format="x"
                        format="YYYY-MM-DD HH:mm"
                        placeholder="选择日期时间"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </div>
                </div>

                <div style="display: flex; align-items: center; height: 100%">
                  <div style="display: flex; align-items: center; margin-right: 4px">
                    <span style="margin-right: 2px; color: #f56c6c">*</span>
                    <span
                      style="
                        font-family: SimHei, sans-serif;
                        font-size: 14px;
                        color: #333;
                        white-space: nowrap;
                      "
                      >紧急程度：</span
                    >
                  </div>
                  <div style="display: flex; width: 120px; align-items: center">
                    <el-form-item prop="urgencyDegree" style="width: 100%; margin-bottom: 0">
                      <el-select
                        v-model="formData.urgencyDegree"
                        placeholder="紧急程度"
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
                  </div>
                </div>
              </div>

              <table class="oa-table">
                <colgroup>
                  <col style="width: 110px" />
                  <col style="width: 35%" />
                  <col style="width: 110px" />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <td class="label-cell">来文机关</td>
                    <td class="data-text input-cell">
                      <el-form-item prop="sendDept" class="mb-0 w-full h-full">
                        <el-autocomplete
                          v-model="formData.sendDept"
                          :fetch-suggestions="querySendDeptSuggestions"
                          placeholder="请输入或选择来文单位"
                          clearable
                          style="width: 100%"
                        />
                      </el-form-item>
                    </td>
                    <td class="label-cell">来文号</td>
                    <td class="data-text input-cell">
                      <el-form-item prop="sendDocNumber" class="mb-0 w-full h-full">
                        <el-autocomplete
                          v-model="formData.sendDocNumber"
                          :fetch-suggestions="queryDocNumberSuggestions"
                          placeholder="请输入或选择来文字号"
                          clearable
                          style="width: 100%"
                        />
                      </el-form-item>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell">单位类别</td>
                    <td class="data-text input-cell">
                      <el-form-item prop="docClass" class="mb-0 w-full h-full">
                        <el-select
                          v-model="formData.docClass"
                          placeholder="请选择单位类别"
                          style="width: 100%"
                        >
                          <el-option
                            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_RECEICE_CLASS)"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                          />
                        </el-select>
                      </el-form-item>
                    </td>
                    <td class="label-cell">文件类别</td>
                    <td class="data-text input-cell">
                      <el-form-item prop="docSecondClass" class="mb-0 w-full h-full">
                        <el-autocomplete
                          v-model="formData.docSecondClass"
                          :fetch-suggestions="queryDocSecondClassSuggestions"
                          placeholder="请输入或选择文件类别"
                          clearable
                          style="width: 100%"
                        />
                      </el-form-item>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell"><span class="text-red-500 mr-5px">*</span>标 题</td>
                    <td colspan="3" class="data-text input-cell">
                      <el-form-item prop="subject" class="mb-0 w-full h-full">
                        <el-input v-model="formData.subject" placeholder="请输入标题" />
                      </el-form-item>
                    </td>
                  </tr>

                  <tr class="print-hide-row">
                    <td class="label-cell">收文文件</td>
                    <td colspan="3" class="data-text input-cell" style="padding: 10px !important">
                      <el-form-item prop="attachFilePath" class="mb-0">
                        <UploadFile
                          v-model="formData.attachFilePath"
                          ref="uploadFileRef"
                          :upload-api="uploadReturnInfo"
                          @update:first-file-name="handleFirstFileNameUpdate"
                        />
                      </el-form-item>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell" rowspan="2">拟办意见</td>
                    <td colspan="3" class="h-80 data-text"></td>
                  </tr>
                  <tr>
                    <td colspan="3" class="signature-row">
                      <span style="margin-right: 5px">办理人：</span>
                      <span class="data-text" style="display: inline-block; min-width: 60px"></span>
                      <span style="margin-left: 15px">办理日期：</span>
                      <span class="data-text" style="display: inline-block; min-width: 80px"></span>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell" rowspan="2">局长批示</td>
                    <td colspan="3" class="h-80"></td>
                  </tr>
                  <tr>
                    <td colspan="3" class="signature-row">
                      <span style="margin-right: 5px">办理人：</span>
                      <span style="display: inline-block; min-width: 60px"></span>
                      <span style="margin-left: 15px">办理日期：</span>
                      <span style="display: inline-block; min-width: 80px"></span>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell">监督监管</td>
                    <td colspan="3" class="input-cell" style="padding: 10px">
                      <div class="compact-row">
                        <div
                          class="check-item mr-10px cursor-pointer select-none"
                          @click="formData.issupervise = !formData.issupervise"
                        >
                          <span class="checkbox-mock">
                            <span v-if="formData.issupervise">✔</span>
                          </span>
                          <span>进行监督监管</span>
                        </div>

                        <div class="check-item mr-10px flex items-center">
                          <span class="mr-2 mb-0">主办科室办结日期：</span>
                          <el-form-item prop="zhubandate" class="mb-0 w-130px inline-form-item">
                            <el-date-picker
                              v-model="formData.zhubandate"
                              type="date"
                              size="small"
                              value-format="x"
                              placeholder="选择日期"
                              style="width: 100%"
                            />
                          </el-form-item>
                        </div>

                        <div class="check-item flex items-center">
                          <span class="mr-2 mb-0">协办科室办结日期：</span>
                          <el-form-item prop="xiebandate" class="mb-0 w-130px inline-form-item">
                            <el-date-picker
                              v-model="formData.xiebandate"
                              type="date"
                              size="small"
                              value-format="x"
                              placeholder="选择日期"
                              style="width: 100%"
                            />
                          </el-form-item>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell">办件办理情况</td>
                    <td colspan="3" class="h-40"></td>
                  </tr>

                  <!-- 领导意见 -->
                  <tr>
                    <td class="label-cell">领导意见</td>
                    <td colspan="2" class="center-text label-cell" style="background: none"
                      >意 见</td
                    >
                    <td class="center-text label-cell" style="width: 140px; background: none"
                      >日 期</td
                    >
                  </tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>

                  <!-- 分管领导批示 -->
                  <tr>
                    <td class="label-cell">分管领导批示</td>
                    <td colspan="2" class="center-text label-cell" style="background: none"
                      >意 见</td
                    >
                    <td class="center-text label-cell" style="background: none">日 期</td>
                  </tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>

                  <!-- 阅办者 -->
                  <tr>
                    <td class="label-cell">阅办者</td>
                    <td colspan="2" class="center-text label-cell" style="background: none"
                      >意 见</td
                    >
                    <td class="center-text label-cell" style="background: none">日 期</td>
                  </tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>
                  <tr
                    ><td class="center-text data-text" style="height: 50px"></td
                    ><td colspan="2"></td><td></td
                  ></tr>
                </tbody>
              </table>
            </div>
          </div>
        </el-form>
      </ContentWrap>
    </el-col>
  </el-row>

  <ProcessSendDialog
    ref="sendDialogRef"
    title="发送收文记录"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="receiveRegisterTaskId"
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
import { ReceiveDocApi, type ReceiveDocSaveResult } from '@/api/bpm/receivedoc'
import { getUserProfile } from '@/api/system/user/profile'
import { dateUtil } from '@/utils/dateUtil'
import { uploadReturnInfo } from '@/api/infra/file'

// 引入弹窗组件及常量
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'

defineOptions({ name: 'BpmReceiveDocCreate' })

const deptName = ref('')
const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()

// ===== 弹窗控制 =====
const sendDialogRef = ref()
const receiveRegisterTaskId = 'Activity_04ykbd0'
const processDefinitionId = ref('')
const processDefineKey = 'receice_doc_v2_copy_copy' // 流程 Key

const formLoading = ref(false)
const uploadFileRef = ref()
const formRef = ref()
const initializingExistingRecord = ref(false)
let receiveDocNumberRequestId = 0

// 去除了写死的节点变量
const formData = ref<Record<string, any>>({
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
  issupervise: true,
  fileList: []
})

const isUpdateMode = computed(() => !!formData.value.id || !!formData.value.processInstanceId)

// 去除了办理人的必填校验
const formRules = reactive({
  subject: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  receiveDocNumber: [{ required: true, message: '选择单位类别后自动生成', trigger: 'blur' }]
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

const getReturnProcessInstanceRoute = () => {
  const processInstanceId = route.query.returnProcessInstanceId
  if (!processInstanceId) return undefined
  const query: Record<string, any> = { id: String(processInstanceId) }
  if (route.query.returnTaskId) {
    query.taskId = String(route.query.returnTaskId)
  }
  return {
    name: 'BpmProcessInstanceDetail',
    query
  }
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
  const valid = await formRef.value.validate().catch(() => false)
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
      const saveResult = await ReceiveDocApi.saveReceiveDoc(data)
      data.id = saveResult.id
      formData.value.id = data.id
    }
    await ReceiveDocApi.submitReceiveDoc(data)

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

/** 保存/修改操作 */
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
    const isNewDraft = !data.id
    let saveResult: ReceiveDocSaveResult | undefined
    if (data.id) {
      await ReceiveDocApi.updateReceiveDoc(data)
    } else {
      saveResult = await ReceiveDocApi.saveReceiveDoc(data)
      data.id = saveResult.id
      formData.value.id = data.id
    }

    if (isNewDraft) {
      if (saveResult?.processInstanceId) {
        formData.value.processInstanceId = saveResult.processInstanceId
      }
      message.success('保存成功，已生成来文登记待办')
      if (saveResult?.processInstanceId) {
        setTimeout(() => {
          delView(unref(currentRoute))
          const query: Record<string, any> = { id: saveResult.processInstanceId }
          if (saveResult.taskId) {
            query.taskId = saveResult.taskId
          }
          push({
            name: 'BpmProcessInstanceDetail',
            query
          })
        }, 200)
      }
      return
    }

    message.success('保存修改成功')
    const returnRoute = getReturnProcessInstanceRoute()
    if (!returnRoute) {
      return
    }
    setTimeout(() => {
      delView(unref(currentRoute))
      push(returnRoute)
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
  if (initializingExistingRecord.value || !formData.value.docClass || !formData.value.receiveTime) {
    return
  }
  const requestId = ++receiveDocNumberRequestId
  const year = dateUtil(formData.value.receiveTime).format('YYYY')
  try {
    const res = await ReceiveDocApi.getReceiveDocSign({
      docClass: formData.value.docClass.toString(),
      year: year
    })
    if (res && requestId === receiveDocNumberRequestId) {
      formData.value.receiveDocNumber = res
    }
  } catch (error) {
    console.error('生成收文编号失败:', error)
  }
}

/** 初始化 */
onMounted(async () => {
  try {
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
      initializingExistingRecord.value = true
      const detail = await ReceiveDocApi.getReceiveDoc(Number(queryId))
      if (detail) {
        Object.assign(formData.value, detail)

        if (formData.value.sendDocNumber && /^\d+$/.test(String(formData.value.sendDocNumber))) {
          const dicts = getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)
          const dict = dicts?.find((d) => String(d.value) === String(formData.value.sendDocNumber))
          if (dict) {
            formData.value.sendDocNumber = formatSendDocNumberLabel(dict.label)
          }
        }

        const attachList = await ReceiveDocApi.getReceiveDocXmGuid(Number(queryId))
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
      }
    } else {
      formData.value.receiveTime = Date.now()
    }
  } catch (error) {
    console.error('收文发起页初始化失败:', error)
    // message.error('页面数据加载失败')
  } finally {
    initializingExistingRecord.value = false
    formLoading.value = false
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

<style lang="scss" scoped>
@media print {
  .print-hide-row {
    display: none !important;
  }
}

#printDivTag {
  .oa-container {
    width: 994px !important;
    max-width: 100% !important;
    min-height: 1123px !important;
    padding: 40px 50px !important;
    margin: 20px auto !important;
    font-family: SimSun, 'Songti SC', STSong, serif;
    background-color: #fff;
    box-shadow: 0 4px 16px rgb(0 0 0 / 15%) !important;
    box-sizing: border-box !important;
  }

  .doc-title {
    margin-bottom: 20px;
    font-size: 26px;
    font-weight: bold;
    letter-spacing: 2px;
    color: #d71920;
    text-align: center;
  }

  .meta-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    font-size: 14px;
    color: #333;
  }

  .meta-input {
    display: inline-block;
    min-width: 80px;
    padding: 0 5px;
    font-family: SimHei, sans-serif;
    font-size: 14px !important;
    color: #000;
    text-align: left;
    text-decoration: none !important;
    border-bottom: none !important;
  }

  .data-text {
    font-family: SimSun, 'Songti SC', STSong, serif;
    font-size: 15px !important;
    color: #000;
    word-break: break-all;
    border-bottom: none !important;
  }

  .oa-table {
    width: 100%;
    border: 2px solid #d71920;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .oa-table td {
    padding: 16px 12px !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    color: #000;
    vertical-align: middle;
    border: 1px solid #d71920;
  }

  .label-cell {
    width: 140px !important;
    font-weight: bold;
    color: #d71920;
    text-align: center;
    white-space: nowrap;
    background-color: #fffbfc;
  }

  .compact-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 15px;
    align-items: center;
    justify-content: flex-start;
  }

  .check-item {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .checkbox-mock {
    position: relative;
    top: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin-right: 4px;
    font-size: 12px;
    font-weight: bold;
    line-height: 1;
    vertical-align: middle;
    border: 1px solid #000;
  }

  .date-text {
    display: inline-block;
    min-width: 60px;
    padding: 0 2px;
    text-align: center;
    text-decoration: none !important;
    border-bottom: none !important;
  }

  .h-80 {
    height: 100px;
    vertical-align: top;
  }

  .h-40 {
    height: 50px;
  }

  .h-35 {
    height: 45px;
  }

  .center-text {
    text-align: center;
  }

  .signature-row {
    padding-top: 2px;
    font-size: 13px;
    color: #333;
  }

  .input-cell {
    padding: 4px 8px !important;
    overflow: visible; /* 防止 el-form-item__error 被截断 */
  }
}

/* ================== Element Plus 覆写 ================== */
:deep(.inline-form-item) {
  display: flex;
  align-items: center;

  .el-form-item__content {
    line-height: normal !important;
  }

  .el-input__wrapper {
    height: 28px;
    padding: 0 8px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  }
}

:deep(.oa-table) {
  .el-input__wrapper,
  .el-textarea__inner {
    padding: 0;
    background-color: transparent;
    border-radius: 0;
    box-shadow: none !important;
  }

  .el-input__inner {
    font-family: inherit;
    font-size: 14px;
    color: #000;
    text-align: left;
  }

  .el-textarea__inner {
    font-family: inherit;
    font-size: 14px;
    color: #000;
    resize: none;
  }

  .el-form-item {
    margin-bottom: 0 !important;
  }
}

/* 浮动气泡样式的必填报错提醒 */
:deep(.el-form-item__error) {
  position: absolute !important;
  top: -20px !important;
  left: 0 !important;
  z-index: 1000 !important;
  padding: 2px 8px !important;
  font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
  font-size: 11px !important;
  font-weight: normal !important;
  line-height: 1.2 !important;
  color: #fff !important;
  white-space: nowrap !important;
  pointer-events: none;
  background: #f56c6c !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 10px rgb(0 0 0 / 20%);
}

:deep(.el-form-item__error::after) {
  position: absolute;
  top: 100%;
  left: 10px;
  display: block;
  border-color: #f56c6c transparent transparent;
  border-style: solid;
  border-width: 4px 4px 0;
  content: '';
}

/* 隐藏输入框获取焦点时的边框 */
:deep(.oa-table) {
  .el-input.is-focus .el-input__wrapper,
  .el-textarea__inner:focus {
    outline: none;
    box-shadow: none !important;
  }
}
</style>
