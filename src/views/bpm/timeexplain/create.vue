<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap
        title="创建公出申请"
        :bodyStyle="{ background: '#ffffff', minHeight: 'calc(100vh - 120px)' }"
      >
        <template #header>
          <el-button type="primary" @click="handleSendClick" :loading="formLoading">
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
        </template>

        <div class="oa-container">
          <div class="doc-title">义乌市自然资源和规划局因公外出审批单</div>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="0px"
            v-loading="formLoading"
            class="oa-form"
          >
            <table class="oa-table">
              <colgroup>
                <col width="140px" />
                <col width="35%" />
                <col width="130px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td class="label-cell">申请人</td>
                  <td class="input-cell text-center">{{ nickname }}</td>
                  <td class="label-cell">所在科室</td>
                  <td class="input-cell text-center">{{ deptName }}</td>
                </tr>

                <tr>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>登记日期</td>
                  <td class="input-cell" colspan="3">
                    <el-form-item prop="checkDate" class="mb-0">
                      <el-date-picker
                        v-model="formData.checkDate"
                        type="date"
                        value-format="x"
                        placeholder="请选择登记日期"
                        style="width: 250px"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>公出开始 从</td>
                  <td class="input-cell">
                    <el-form-item prop="checkBegin" class="mb-0">
                      <el-date-picker
                        v-model="formData.checkBegin"
                        type="date"
                        value-format="x"
                        placeholder="选择开始时间"
                        @change="calculateDuration"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </td>
                  <td class="label-cell">时段</td>
                  <td class="input-cell">
                    <el-form-item prop="startPeriod" class="mb-0">
                      <el-select
                        v-model="formData.startPeriod"
                        placeholder="时段"
                        @change="calculateDuration"
                        style="width: 100%"
                      >
                        <el-option label="上午" :value="1" />
                        <el-option label="下午" :value="2" />
                      </el-select>
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>公出结束 至</td>
                  <td class="input-cell">
                    <el-form-item prop="checkEnd" class="mb-0">
                      <el-date-picker
                        v-model="formData.checkEnd"
                        type="date"
                        value-format="x"
                        placeholder="选择结束时间"
                        @change="calculateDuration"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </td>
                  <td class="label-cell">时段</td>
                  <td class="input-cell">
                    <el-form-item prop="endPeriod" class="mb-0">
                      <el-select
                        v-model="formData.endPeriod"
                        placeholder="时段"
                        @change="calculateDuration"
                        style="width: 100%"
                      >
                        <el-option label="上午" :value="1" />
                        <el-option label="下午" :value="2" />
                      </el-select>
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>出发地</td>
                  <td class="input-cell">
                    <el-form-item prop="startPlace" class="mb-0">
                      <el-input v-model="formData.startPlace" placeholder="请输入出发地" />
                    </el-form-item>
                  </td>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>目的地</td>
                  <td class="input-cell">
                    <el-form-item prop="endPlace" class="mb-0">
                      <el-input v-model="formData.endPlace" placeholder="请输入目的地" />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">外出天数</td>
                  <td class="input-cell" colspan="3">{{ formData.days }} 天</td>
                </tr>

                <tr class="print-hide-row">
                  <td class="label-cell">附件列表</td>
                  <td class="input-cell" colspan="3">
                    <el-form-item prop="filepath" class="mb-0">
                      <UploadFile
                        ref="uploadFileRef"
                        v-model="formData.filepath"
                        :upload-api="uploadReturnInfo"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>外出事由</td>
                  <td colspan="3" class="input-cell h-reason">
                    <el-form-item prop="reason" class="mb-0">
                      <el-input
                        v-model="formData.reason"
                        placeholder="请输入公出/外出原因"
                        :autosize="{ minRows: 4, maxRows: 8 }"
                        type="textarea"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 审批意见占位行 -->
                <tr>
                  <td class="label-cell" rowspan="2">科室(单位)负责人意见</td>
                  <td colspan="3" class="input-cell h-large"> </td>
                </tr>
                <tr>
                  <td colspan="3" class="signature-row">
                    <span class="sig-item">办理人：<span class="sig-line"></span></span>
                    <span class="sig-item">日期：<span class="sig-line"></span></span>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell" rowspan="2">办公室意见</td>
                  <td colspan="3" class="input-cell h-large"> </td>
                </tr>
                <tr>
                  <td colspan="3" class="signature-row">
                    <span class="sig-item">办理人：<span class="sig-line"></span></span>
                    <span class="sig-item">日期：<span class="sig-line"></span></span>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell" rowspan="2">局分管领导意见</td>
                  <td colspan="3" class="input-cell h-large"> </td>
                </tr>
                <tr>
                  <td colspan="3" class="signature-row">
                    <span class="sig-item">办理人：<span class="sig-line"></span></span>
                    <span class="sig-item">日期：<span class="sig-line"></span></span>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell" rowspan="2">局主要领导意见</td>
                  <td colspan="3" class="input-cell h-large"> </td>
                </tr>
                <tr>
                  <td colspan="3" class="signature-row">
                    <span class="sig-item">办理人：<span class="sig-line"></span></span>
                    <span class="sig-item">日期：<span class="sig-line"></span></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </el-form>
        </div>
      </ContentWrap>
    </el-col>
  </el-row>

  <!-- 发送弹窗 -->
  <ProcessSendDialog
    ref="processSendDialogRef"
    :process-definition-id="processDefinitionId"
    title="发送"
    @submit="submitForm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import { TimeExplainApi } from '@/api/bpm/timeexplain'
import { uploadReturnInfo } from '@/api/infra/file'
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'
import { useMessage } from '@/hooks/web/useMessage'

defineOptions({ name: 'BpmTimeExplainCreate' })

const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()

const formLoading = ref(false)

const formData = ref<any>({
  id: undefined,
  checkDate: undefined,
  checkBegin: undefined,
  checkEnd: undefined,
  reason: undefined,
  days: 0,
  filepath: '',
  status: 0,
  startPeriod: 1,
  endPeriod: 2,
  startPlace: '义乌',
  endPlace: undefined,
  processInstanceId: undefined
})

const formRules = reactive({
  checkBegin: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
  checkEnd: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }],
  reason: [{ required: true, message: '原因说明不能为空', trigger: 'blur' }],
  checkDate: [{ required: true, message: '登记时间不能为空', trigger: 'blur' }],
  startPlace: [{ required: true, message: '出发地不能为空', trigger: 'blur' }],
  endPlace: [{ required: true, message: '目的地不能为空', trigger: 'blur' }]
})
const formRef = ref()
const uploadFileRef = ref()
const processSendDialogRef = ref()

const processDefineKey = 'oa_out'
const processDefinitionId = ref('')

const AM = 1
const PM = 2

const calculateDuration = () => {
  formData.value.days = 0
  if (!formData.value.checkBegin || !formData.value.checkEnd) return

  const start = dayjs(formData.value.checkBegin).startOf('day')
  const end = dayjs(formData.value.checkEnd).startOf('day')

  if (end.isBefore(start)) {
    message.error('结束日期不能早于开始日期')
    return
  }
  if (end.isSame(start) && formData.value.startPeriod === PM && formData.value.endPeriod === AM) {
    message.error('结束时段不能早于开始时段')
    return
  }

  let totalDays = 0
  let currentDate = start.clone()

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    if (currentDate.isSame(start) && currentDate.isSame(end)) {
      if (formData.value.startPeriod === AM && formData.value.endPeriod === AM) totalDays = 0.5
      else if (formData.value.startPeriod === PM && formData.value.endPeriod === PM) totalDays = 0.5
      else totalDays = 1
    } else if (currentDate.isSame(start)) {
      totalDays += formData.value.startPeriod === PM ? 0.5 : 1
    } else if (currentDate.isSame(end)) {
      totalDays += formData.value.endPeriod === AM ? 0.5 : 1
    } else {
      totalDays += 1
    }
    currentDate = currentDate.add(1, 'day')
  }
  formData.value.days = totalDays
}

const getRoleLevel = (roleStr: string): number => {
  if (roleStr.startsWith('grade_')) {
    const parts = roleStr.split('_')
    return parseInt(parts[1]) || 0
  }
  return 1
}

const maxPermissionRole = computed(() => {
  const gradeRoles = userStore.roles.filter((r) => r.startsWith('grade_'))
  if (gradeRoles.length === 0) return 'grade_3'
  return gradeRoles.reduce((prev, curr) => {
    return getRoleLevel(curr) > getRoleLevel(prev) ? curr : prev
  })
})

/** 构建请求数据 */
const buildRequestData = () => {
  const data = { ...formData.value } as any

  const rawFileList = uploadFileRef.value?.fileList || []

  data.fileList = rawFileList
    .filter((item: any) => item.status === 'success' || item.id)
    .map((item: any, index: number) => {
      let fileId = undefined
      let fileName = item.name
      let filePath = ''
      let fileExtension = ''

      if (item.response?.data) {
        const fileResponse = item.response.data
        fileId =
          typeof fileResponse === 'object' && fileResponse !== null ? fileResponse.id : fileResponse
        fileName =
          typeof fileResponse === 'object' && fileResponse !== null ? fileResponse.name : item.name
        filePath =
          typeof fileResponse === 'object' && fileResponse !== null
            ? (fileResponse.path || fileResponse.url || '')
            : ''
        if (fileName && fileName.includes('.')) {
          fileExtension = fileName.split('.').pop() || ''
        }
      } else if (item.id) {
        fileId = item.attachFileId || item.response?.data?.id
        fileName = item.name
        filePath = item.url || ''
        if (fileName && fileName.includes('.')) {
          fileExtension = fileName.split('.').pop() || ''
        }
      }

      return {
        id: item.id || undefined,
        timeExplainId: data.id,
        attachFileId: fileId,
        filePath: filePath,
        fileName: fileName,
        fileExtension: fileExtension
      }
    })
    .filter((item: any) => item.attachFileId || item.id)

  return data
}

const handleSendClick = async () => {
  if (!formRef.value) return
  const rawFileList = uploadFileRef.value?.fileList || []
  const isUploading = rawFileList.some(
    (file: any) => file.status === 'ready' || file.status === 'uploading'
  )
  if (isUploading) {
    message.warning('还有文件正在上传中，请稍后发送')
    return
  }
  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) return
  calculateDuration()
  const variables = { role_condition: maxPermissionRole.value }
  processSendDialogRef.value.open(variables)
}

const submitForm = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = buildRequestData()
    data.processVariablesStr = JSON.stringify({
      role_condition: maxPermissionRole.value,
      ...(submitData.variables || {})
    })

    // 将发送弹窗选择的下一节点审批人信息注入到表单数据中
    data.nextNodeAssignees = submitData.nextNodeAssignees

    if (data.id) {
      await TimeExplainApi.updateTimeExplain(data)
    } else {
      await TimeExplainApi.createTimeExplain(data)
    }
    message.success('公出申请发起成功')
    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/unified')
    }, 200)
  } catch (error) {
    console.error(error)
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  formData.value.checkDate = Date.now()
  const res = await getUserProfile()
  if (res.dept) deptName.value = res.dept.name
  else if (res.users && res.users.dept) deptName.value = res.users.dept.name
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (processDefinitionDetail) processDefinitionId.value = processDefinitionDetail.id

  // 编辑模式：加载已有数据和附件
  const queryId = route.query.id
  if (queryId) {
    formLoading.value = true
    try {
      const detail = await TimeExplainApi.getTimeExplain(Number(queryId))
      if (detail) {
        Object.assign(formData.value, detail)

        const attachList = await TimeExplainApi.getTimeExplainAttachList(Number(queryId))
        if (attachList && attachList.length > 0) {
          const files = attachList.map((item: any) => ({
            name: item.fileName,
            url: item.fileUrl,
            id: item.id,
            attachFileId: item.attachFileId,
            response: { data: { id: item.attachFileId, name: item.fileName, url: item.fileUrl, path: item.filePath } }
          }))
          nextTick(() => {
            if (uploadFileRef.value) {
              uploadFileRef.value.fileList = files
            }
          })
        }
      }
    } finally {
      formLoading.value = false
    }
  }
})
</script>

<style scoped lang="scss">
:deep(.el-form-item) {
  margin-bottom: 0 !important;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  padding: 0 !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  padding: 0 !important;
}

:deep(.el-input-group__append) {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.el-form-item.is-error .el-input__wrapper),
:deep(.el-form-item.is-error .el-textarea__inner),
:deep(.el-form-item.is-error .el-select__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
}

.oa-container {
  box-sizing: border-box !important;
  width: 994px !important;
  max-width: 100% !important;
  min-height: 1123px !important;
  padding: 40px 50px !important;
  margin: 20px auto !important;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
  box-shadow: 0 4px 16px rgb(0 0 0 / 15%) !important;
}

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

:deep(.el-form-item__error)::after {
  position: absolute;
  top: 100%;
  left: 10px;
  display: block;
  border-color: #f56c6c transparent transparent;
  border-style: solid;
  border-width: 4px 4px 0;
  content: '';
}

.doc-title {
  margin-bottom: 20px;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #b1351e;
  text-align: center;
}

.oa-table {
  width: 100%;
  font-size: 15px !important;
  border: 1px solid #8cb4e0;
  border-collapse: collapse;
  table-layout: fixed;
}

.oa-table td {
  padding: 16px 12px !important;
  font-size: 15px !important;
  line-height: 1.5 !important;
  color: #333;
  vertical-align: middle;
  border: 1px solid #8cb4e0;
}

.label-cell {
  font-weight: bold;
  color: #333;
  text-align: center;
  background-color: #dbe9f8;
}

.input-cell {
  position: relative;
  min-height: 24px;
  overflow: visible !important;
  background-color: #fff;
}

.h-large {
  height: 100px;
  padding: 10px;
  text-align: left;
  vertical-align: top;
}

.h-reason {
  height: 120px;
  padding: 10px;
  text-align: left;
  vertical-align: top;
}

.signature-row {
  padding: 5px 20px;
  color: #555;
  text-align: right;
  background-color: #fff;
}

.sig-item {
  display: inline-block;
  margin-left: 30px;
}

.sig-line {
  display: inline-block;
  min-width: 80px;
  padding-left: 5px;
  text-align: left;
  border-bottom: none;
}

@media print {
  .print-hide-row {
    display: none !important;
  }
}
</style>
