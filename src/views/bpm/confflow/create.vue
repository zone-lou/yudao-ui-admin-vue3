<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="会议报告单申请信息">
        <template #header>
          <el-button @click="handleSaveDraft" :loading="formLoading">
            <Icon icon="ep:document-checked" class="mr-5px" /> 保存草稿
          </el-button>
          <el-button type="primary" @click="handleOpenDialog" :loading="formLoading">
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
        </template>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="0"
          v-loading="formLoading"
        >
          <div class="oa-container">
            <div class="doc-title">义乌市自然资源和规划局会议报告单</div>
            <table class="oa-table">
              <colgroup>
                <col style="width: 140px" />
                <col style="width: 35%" />
                <col style="width: 140px" />
                <col />
              </colgroup>
              <tbody>
                <tr class="h-row">
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>会议名称</td>
                  <td class="input-cell">
                    <el-form-item prop="title" class="mb-0">
                      <el-input v-model="formData.title" placeholder="请输入会议名称" />
                    </el-form-item>
                  </td>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>会议时间</td>
                  <td class="input-cell">
                    <el-form-item prop="startDate" class="mb-0">
                      <el-date-picker
                        v-model="formData.startDate"
                        type="datetime"
                        value-format="x"
                        format="YYYY-MM-DD HH:mm"
                        placeholder="选择会议时间"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr class="h-row">
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>会议地点</td>
                  <td class="input-cell">
                    <el-form-item prop="venue" class="mb-0">
                      <el-input v-model="formData.venue" placeholder="请输入会议地点" />
                    </el-form-item>
                  </td>
                  <td class="label-cell">召集单位<br />及召集人</td>
                  <td class="input-cell">
                    <el-form-item prop="joinUnit" class="mb-0">
                      <el-input v-model="formData.joinUnit" placeholder="请输入召集单位及召集人" />
                    </el-form-item>
                  </td>
                </tr>

                <tr class="h-row">
                  <td class="label-cell">我局参会科室</td>
                  <td class="input-cell">
                    <el-form-item prop="offerUnit" class="mb-0">
                      <el-input v-model="formData.offerUnit" placeholder="请输入我局参会科室" />
                    </el-form-item>
                  </td>
                  <td class="label-cell">我局参会人员</td>
                  <td class="input-cell">
                    <el-form-item prop="offerPerson" class="mb-0">
                      <el-input v-model="formData.offerPerson" placeholder="请输入我局参会人员" />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">会议主要内容<br />及我局承办事项</td>
                  <td colspan="3" class="input-cell h-large" style="padding: 10px">
                    <el-form-item prop="content" class="mb-0 h-full w-full">
                      <el-input
                        v-model="formData.content"
                        type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6 }"
                        placeholder="请输入主要内容及事项"
                        class="h-full w-full"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">参会人员<br />会议表态情况<br />及建议意见</td>
                  <td colspan="3" class="input-cell h-medium" style="padding: 10px">
                    <el-form-item prop="situation" class="mb-0 h-full w-full">
                      <el-input
                        v-model="formData.situation"
                        type="textarea"
                        :autosize="{ minRows: 5, maxRows: 6 }"
                        placeholder="请输入表态情况及意见"
                        class="h-full w-full"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 附件列表行 -->
                <tr class="print-hide-row">
                  <td class="label-cell">附件列表</td>
                  <td colspan="3" class="input-cell">
                    <el-form-item prop="attachFilePath" class="mb-0">
                      <UploadFile
                        ref="uploadFileRef"
                        v-model="formData.attachFilePath"
                        :upload-api="uploadReturnInfo"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 留空的签名区，保持样式一致 -->
                <tr>
                  <td class="label-cell" rowspan="2">科室负责人审核</td>
                  <td colspan="3" style="height: 50px; padding: 10px"></td>
                </tr>
                <tr>
                  <td colspan="3" class="footer-row">
                    <div
                      class="footer-content border-none"
                      style="
                        display: flex;
                        justify-content: flex-start;
                        padding-left: 20px;
                        gap: 20px;
                      "
                    >
                      <span>办理人员：<span class="sign-input"></span></span>
                      <span>办理日期：<span class="sign-input"></span></span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">分管领导阅签</td>
                  <td colspan="3" class="nested-table-container">
                    <table class="nested-table">
                      <tbody>
                        <tr>
                          <td class="sub-header" style="width: 60%">办理意见</td>
                          <td class="sub-header" style="width: 20%">办理人员</td>
                          <td class="sub-header" style="width: 20%">办理日期</td>
                        </tr>
                        <tr>
                          <td class="sub-content"></td>
                          <td class="sub-content" style="text-align: center"></td>
                          <td class="sub-content" style="text-align: center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell" rowspan="2">局长阅签</td>
                  <td colspan="3" style="height: 50px; padding: 10px"></td>
                </tr>
                <tr>
                  <td colspan="3" class="footer-row">
                    <div
                      class="footer-content"
                      style="display: flex; justify-content: center; gap: 50px"
                    >
                      <span>办理人员：<span class="sign-input"></span></span>
                      <span>日期：<span class="sign-input"></span></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
      </ContentWrap>
    </el-col>
  </el-row>

  <ProcessSendDialog
    ref="sendDialogRef"
    title="发送会议报告单"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="startUserNodeId"
    @submit="submitProcess"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useUserStore } from '@/store/modules/user'
import { useMessage } from '@/hooks/web/useMessage'
import * as DefinitionApi from '@/api/bpm/definition'
import { ConfflowApi } from '@/api/bpm/confflow'
import { dateUtil } from '@/utils/dateUtil'
import { uploadReturnInfo } from '@/api/infra/file'

import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'

defineOptions({ name: 'BpmConfflowCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const userStore = useUserStore()
const { push } = useRouter()
const route = useRoute()

// ===== 弹窗控制 =====
const sendDialogRef = ref()
const startUserNodeId = NodeId.START_USER_NODE_ID
const processDefinitionId = ref('')
const processDefineKey = 'conference_report'

const formLoading = ref(false)
const formRef = ref()
const uploadFileRef = ref()

// 表单数据初始化
const formData = ref<any>({
  id: undefined,
  title: undefined,
  applyDate: undefined,
  startDate: undefined,
  venue: undefined,
  joinUnit: undefined,
  offerUnit: undefined,
  offerPerson: undefined,
  situation: undefined,
  content: '',
  remark: undefined,
  attachFilePath: ''
})

// 表单校验规则
const formRules = reactive({
  title: [{ required: true, message: '会议名称不能为空', trigger: 'blur' }],
  startDate: [{ required: true, message: '会议时间不能为空', trigger: 'blur' }],
  venue: [{ required: true, message: '会议地点不能为空', trigger: 'blur' }]
})

/** 构建请求数据 */
const buildRequestData = () => {
  const data = { ...formData.value } as any

  const rawFileList = uploadFileRef.value?.fileList || []

  data.fileList = rawFileList
    .filter((item: any) => item.status === 'success' || item.id)
    .map((item: any) => {
      let fileName = item.name
      let filePath = ''
      let fileExtension = ''

      if (item.response?.data) {
        const fileResponse = item.response.data
        fileName =
          typeof fileResponse === 'object' && fileResponse !== null ? fileResponse.name : item.name
        filePath =
          typeof fileResponse === 'object' && fileResponse !== null
            ? fileResponse.path || fileResponse.url || ''
            : ''
        if (fileName && fileName.includes('.')) {
          fileExtension = fileName.split('.').pop() || ''
        }
      } else if (item.id) {
        fileName = item.name
        filePath = item.url || ''
        if (fileName && fileName.includes('.')) {
          fileExtension = fileName.split('.').pop() || ''
        }
      }

      return {
        confflowAttachId: item.confflowAttachId || item.id || undefined,
        commId: data.id,
        filePath: filePath,
        fileName: fileName,
        fileExtension: fileExtension
      }
    })
    .filter((item: any) => item.filePath || item.fileName || item.confflowAttachId)

  return data
}

/** 保存草稿 */
const handleSaveDraft = async () => {
  formLoading.value = true
  try {
    const data = buildRequestData()
    if (data.id) {
      await ConfflowApi.updateConfflow(data)
    } else {
      const id = await ConfflowApi.saveConfflow(data)
      formData.value.id = id
    }
    message.success('草稿保存成功')
  } catch (error) {
    console.error(error)
  } finally {
    formLoading.value = false
  }
}

/** 点击发送打开弹窗 */
const handleOpenDialog = async () => {
  try {
    if (!formRef.value) return
    const rawFileList = uploadFileRef.value?.fileList || []
    const isUploading = rawFileList.some(
      (file: any) => file.status === 'ready' || file.status === 'uploading'
    )
    if (isUploading) {
      message.warning('还有文件正在上传中，请稍后发送')
      return
    }
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    if (!processDefinitionId.value) {
      message.error('流程配置加载中，请稍后刷新重试')
      return
    }
    // 打开选人弹窗
    sendDialogRef.value.open({})
  } catch (error) {
    console.error('打开选人弹窗失败:', error)
  }
}

/** 接收弹窗返回的 assignees 和 variables 并正式提交业务表单 */
const submitProcess = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = buildRequestData()
    data.nextNodeAssignees = submitData.nextNodeAssignees
    if (submitData.variables && Object.keys(submitData.variables).length > 0) {
      data.processVariablesStr = JSON.stringify(submitData.variables)
    }

    if (data.id) {
      await ConfflowApi.createFlowConfflow(data)
    } else {
      await ConfflowApi.createConfflow(data)
    }
    message.success('会议报告单发起成功')

    if (sendDialogRef.value) {
      sendDialogRef.value.close()
    }

    setTimeout(() => {
      delView(route)
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

/** 初始化 */
onMounted(async () => {
  formLoading.value = true
  try {
    formData.value.applyDate = dateUtil().valueOf()
    const currentUser = userStore.user as any
    if (currentUser) {
      formData.value.offerPerson = currentUser.nickname || ''
      formData.value.offerUnit = currentUser.dept?.name || currentUser.deptName || ''
    }

    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
      undefined,
      processDefineKey
    )

    if (processDefinitionDetail) {
      processDefinitionId.value = processDefinitionDetail.id
    } else {
      message.error(`流程(${processDefineKey})未配置`)
    }

    // 编辑模式：加载已有数据和附件
    const queryId = route.query.id
    if (queryId) {
      const detail = await ConfflowApi.getConfflow(Number(queryId))
      if (detail) {
        Object.assign(formData.value, detail)

        const attachList = await ConfflowApi.getConfflowAttachList(Number(queryId))
        if (attachList && attachList.length > 0) {
          const files = attachList.map((item: any) => ({
            name: item.fileName,
            url: item.fileUrl,
            id: item.confflowAttachId,
            confflowAttachId: item.confflowAttachId,
            response: {
              data: {
                name: item.fileName,
                url: item.fileUrl,
                path: item.filePath
              }
            }
          }))
          nextTick(() => {
            if (uploadFileRef.value) {
              uploadFileRef.value.fileList = files
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    formLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
@media print {
  .print-hide-row {
    display: none !important;
  }
}

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

.oa-table {
  width: 100%;
  font-size: 15px !important;
  border: 1px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

.oa-table td {
  padding: 16px 12px !important;
  font-size: 15px !important;
  line-height: 1.5 !important;
  color: #000;
  word-wrap: break-word;
  vertical-align: middle;
  border: 1px solid #d71920;
}

.label-cell {
  width: 140px;
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

.input-cell {
  padding: 4px 8px !important;
  overflow: visible;
}

.h-row {
  height: 45px;
}

.h-large {
  height: 120px;
  text-align: left;
  vertical-align: top;
}

.h-medium {
  height: 80px;
  text-align: left;
  vertical-align: top;
}

.footer-row {
  height: 35px;
  vertical-align: middle;
}

.footer-content {
  color: #444;
}

.sign-input {
  display: inline-block;
  min-width: 80px;
  text-align: center;
}

.oa-table td.nested-table-container {
  height: 100%;
  padding: 0 !important;
}

.nested-table {
  width: 100%;
  height: 100%;
  margin: 0;
  border: none;
  border-collapse: collapse;
}

.nested-table td {
  padding: 5px !important;
  vertical-align: middle;
  border: none;
  border-right: 1px solid #d71920 !important;
  border-bottom: 1px solid #d71920 !important;
}

.nested-table tr:last-child td {
  border-bottom: none !important;
}

.nested-table tr td:last-child {
  border-right: none !important;
}

.sub-header {
  height: 30px;
  // font-weight: bold;
  color: #000;
  text-align: center;
  background-color: transparent;
}

.sub-content {
  height: 50px;
  vertical-align: top;
}

/* ================== Element Plus 覆写 ================== */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  font-family: inherit;
  font-size: 14px;
  color: #000;
  text-align: left;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: 14px;
  color: #000;
  resize: none;
}

:deep(.el-form-item) {
  margin-bottom: 0 !important;
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

:deep(.el-input.is-focus .el-input__wrapper),
:deep(.el-textarea__inner:focus) {
  outline: none;
  box-shadow: none !important;
}
</style>
