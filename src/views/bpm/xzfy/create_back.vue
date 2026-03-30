<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="创建行政复议">
        <template #header>
          <el-button type="primary" @click="handleSendClick" :loading="formLoading">
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
        </template>

        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="基础信息" name="basic">
            <el-form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              label-width="140px"
              v-loading="formLoading"
            >
              <h3 class="section-title">基本信息</h3>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="来文号" prop="swWh">
                    <el-input v-model="formData.swWh" placeholder="请输入来文号" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="来文机关" prop="swJg">
                    <el-select
                      v-model="formData.swJg"
                      placeholder="请输入或选择来文机关"
                      filterable
                      allow-create
                      default-first-option
                      style="width: 100%"
                    >
                      <el-option
                        v-for="dict in getDictOptions(DICT_TYPE.BPM_INCOMING_AUTHORITY)"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="收文日期" prop="swRq">
                    <el-date-picker
                      v-model="formData.swRq"
                      type="date"
                      value-format="x"
                      placeholder="选择收文日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="申请人" prop="sqr">
                    <el-input v-model="formData.sqr" placeholder="请输入申请人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="被申请人" prop="bsqr">
                    <el-select
                      v-model="formData.bsqr"
                      placeholder="请输入或选择被申请人"
                      filterable
                      allow-create
                      default-first-option
                      style="width: 100%"
                    >
                      <el-option
                        v-for="dict in getDictOptions(DICT_TYPE.BPM_APPLIED_RESPONDENT)"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="第三人" prop="dsr">
                    <el-input v-model="formData.dsr" placeholder="请输入第三人" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="16">
                  <el-form-item label="土地坐落" prop="tdZl">
                    <div style="display: flex; gap: 10px; width: 100%">
                      <el-input v-model="tdZlPart1" @input="handleTdZlChange" />
                      <el-input v-model="tdZlPart2" @input="handleTdZlChange" />
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="诉讼案号" prop="ssah">
                    <el-input v-model="formData.ssah" placeholder="自动读取诉讼案号" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="案件分类" prop="lb1">
                    <el-select
                      v-model="formData.lb1"
                      placeholder="请选择案件分类"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="dict in getDictOptions(DICT_TYPE.BPM_XZFY_CLASS1)"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="涉及事项" prop="lb2">
                    <el-select
                      v-model="formData.lb2"
                      placeholder="请选择涉及事项"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="dict in getDictOptions(DICT_TYPE.BPM_XZFY_CLASS2)"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="案件类型" prop="lb3">
                    <el-select
                      v-model="formData.lb3"
                      placeholder="请选择案件类型"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="dict in getDictOptions(DICT_TYPE.BPM_XZFY_CLASS3)"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="复议请求" prop="fyNr">
                <el-input
                  v-model="formData.fyNr"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入复议请求内容"
                />
              </el-form-item>

              <el-form-item label="复议附件" prop="attachFilePath">
                <UploadFile
                  v-model="formData.attachFilePath"
                  ref="uploadFileRef"
                  :upload-api="uploadReturnInfo"
                />
              </el-form-item>

              <h3 class="section-title" style="margin-top: 20px">其他相关信息</h3>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="复议决定日期" prop="xzfyKz.fyjdRq">
                    <el-date-picker
                      v-model="formData.xzfyKz.fyjdRq"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="复议结果" prop="xzfyKz.fyJg">
                    <el-select
                      v-model="formData.xzfyKz.fyJg"
                      placeholder="请选择复议结果"
                      style="width: 100%"
                    >
                      <el-option label="撤销" :value="0" />
                      <el-option label="维持" :value="1" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="听证日期" prop="xzfyKz.tzRq">
                    <el-date-picker
                      v-model="formData.xzfyKz.tzRq"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-table :data="docList" border style="width: 100%; margin-bottom: 18px">
                <el-table-column label="序号" type="index" width="60" align="center" />
                <el-table-column label="文书名称" align="center">
                  <template #default="{ row }">
                    <el-input v-model="row.docName" placeholder="请输入文书名称" />
                  </template>
                </el-table-column>
                <el-table-column label="收文日期" align="center">
                  <template #default="{ row }">
                    <el-date-picker
                      v-model="row.docDate"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="主要内容" align="center">
                  <template #default="{ row }">
                    <el-input v-model="row.docContent" placeholder="请输入主要内容" />
                  </template>
                </el-table-column>

                <el-table-column width="100" align="center">
                  <template #header>
                    <el-button link type="primary" @click="addDocRow">
                      <Icon icon="ep:plus" class="mr-5px" />添加
                    </el-button>
                  </template>

                  <template #default="{ $index }">
                    <el-button link type="danger" @click="deleteDocRow($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="是否装订" prop="xzfyKz.sfZd">
                    <el-select
                      v-model="formData.xzfyKz.sfZd"
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option label="是" :value="1" />
                      <el-option label="否" :value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="装订人" prop="xzfyKz.zdr">
                    <el-input v-model="formData.xzfyKz.zdr" placeholder="请输入装订人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="装订日期" prop="xzfyKz.zdRq">
                    <el-date-picker
                      v-model="formData.xzfyKz.zdRq"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="是否移交" prop="xzfyKz.sfYj">
                    <el-select
                      v-model="formData.xzfyKz.sfYj"
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option label="是" :value="1" />
                      <el-option label="否" :value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="移交人" prop="xzfyKz.yjr">
                    <el-input v-model="formData.xzfyKz.yjr" placeholder="请输入移交人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="移交日期" prop="xzfyKz.yjRq">
                    <el-date-picker
                      v-model="formData.xzfyKz.yjRq"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="复议结果执行情况" prop="xzfyKz.zxQk">
                <el-input
                  v-model="formData.xzfyKz.zxQk"
                  type="textarea"
                  placeholder="请输入执行情况"
                />
              </el-form-item>
              <el-form-item label="备注" prop="xzfyKz.bz">
                <el-input v-model="formData.xzfyKz.bz" type="textarea" placeholder="请输入备注" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="办理单" name="oaForm">
            <div id="printDivTag" class="form-scroll-area">
              <div class="oa-container">
                <div class="doc-title">义乌市自然资源和规划局行政复议审批表</div>

                <div class="meta-info">
                  <div class="meta-left">
                    <span
                      >收文日期：<span class="meta-input">{{
                        formatDate(formData.swRq)
                      }}</span></span
                    >
                  </div>
                  <div class="meta-right">
                    <span
                      >来文号：<span class="meta-input">{{ formData.swWh }}</span></span
                    >
                  </div>
                </div>

                <table class="oa-table">
                  <colgroup>
                    <col style="width: 120px" />
                    <col style="width: auto" />
                    <col style="width: 140px" />
                    <col style="width: 150px" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td class="label-cell">监督监管</td>
                      <td class="data-text">
                        <div
                          class="check-item w-full h-full cursor-pointer select-none"
                          @click="formData.issupervise = formData.issupervise === 1 ? 0 : 1"
                        >
                          <span class="checkbox-mock">
                            <span v-if="formData.issupervise === 1">✔</span>
                          </span>
                          进行监督监管
                        </div>
                      </td>
                      <td class="label-cell">科室办理办结日期</td>
                      <td class="data-text center-text" style="padding: 0">
                        <el-date-picker
                          v-model="formData.zhubandate"
                          type="date"
                          value-format="x"
                          placeholder="选择日期"
                          style="width: 100%; border: none"
                        />
                      </td>
                    </tr>

                    <!-- 拟办意见 -->
                    <tr>
                      <td class="label-cell" rowspan="2">拟办意见</td>
                      <td colspan="3" class="h-80 data-text text-left"> </td>
                    </tr>
                    <tr>
                      <td colspan="3" class="signature-row">
                        <div class="sig-container">
                          <span style="width: 40%">办理人：<span class="sign-input"></span></span>
                          <span style="width: 40%">日期：<span class="sign-input"></span></span>
                        </div>
                      </td>
                    </tr>

                    <!-- 局长意见 -->
                    <tr>
                      <td class="label-cell" rowspan="2">局长意见</td>
                      <td colspan="3" class="h-80 data-text text-left"> </td>
                    </tr>
                    <tr>
                      <td colspan="3" class="signature-row">
                        <div class="sig-container">
                          <span style="width: 40%">办理人：<span class="sign-input"></span></span>
                          <span style="width: 40%">日期：<span class="sign-input"></span></span>
                        </div>
                      </td>
                    </tr>

                    <!-- 局领导意见 (多人列表) -->
                    <tr>
                      <td class="label-cell" rowspan="2">局领导<br />意见</td>
                      <td class="sub-header">办理意见</td>
                      <td class="sub-header">办理人员</td>
                      <td class="sub-header">办理日期</td>
                    </tr>
                    <tr>
                      <td class="h-35 data-text"></td>
                      <td class="h-35 data-text center-text"></td>
                      <td class="h-35 data-text center-text"></td>
                    </tr>

                    <!-- 科室单位办理意见 (多人列表) -->
                    <tr>
                      <td class="label-cell" rowspan="2">科室单位<br />办理意见</td>
                      <td class="sub-header">办理意见</td>
                      <td class="sub-header">办理人员</td>
                      <td class="sub-header">办理日期</td>
                    </tr>
                    <tr>
                      <td class="h-35 data-text"></td>
                      <td class="h-35 data-text center-text"></td>
                      <td class="h-35 data-text center-text"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </ContentWrap>
    </el-col>
  </el-row>

  <el-dialog v-model="dialogVisible" title="流程处理" width="500px" append-to-body>
    <el-form
      ref="dialogFormRef"
      :model="formData"
      :rules="dialogRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="下一环节" prop="nextNode">
        <el-select
          v-model="formData.nextNode"
          placeholder="请选择下一环节"
          @change="nodeChange"
          value-key="taskDefKey"
          :empty-values="[null, undefined]"
          style="width: 100%"
        >
          <el-option
            v-for="dict in nextNodeOptions"
            :key="dict.taskDefKey"
            :label="dict.taskName"
            :value="dict"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="办理人" prop="tempNextUserSelectAssignees">
        <el-select
          v-model="formData.tempNextUserSelectAssignees"
          placeholder="请选择办理人"
          :multiple="multipleFlag"
          style="width: 100%"
        >
          <el-option
            v-for="dict in selectUserOptions"
            :key="dict.id"
            :label="dict.nickname"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { XzfyApi } from '@/api/bpm/xzfy'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import { dateUtil } from '@/utils/dateUtil'
import { uploadReturnInfo } from '@/api/infra/file'

defineOptions({ name: 'BpmXzfyCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const userStore = useUserStore()

const activeTab = ref('basic')
const formLoading = ref(false)
const formRef = ref()

const uploadFileRef = ref()

// 弹窗相关
const dialogVisible = ref(false)
const dialogFormRef = ref()

// 流程相关
const processDefineKey = 'oa_review'
const processDefinitionId = ref('')
const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const multipleFlag = ref(false)

const tdZlPart1 = ref('')
const tdZlPart2 = ref('')

// 表单数据
const formData = ref({
  id: undefined,
  sqr: '',
  bsqr: '义乌市国土资规局',
  dsr: undefined,
  tdZl: undefined,
  swWh: undefined,
  swJg: '国务院',
  swRq: undefined,
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  fyNr: undefined,
  cbr: undefined,
  cbRq: undefined,
  xzq: undefined,
  issupervise: 1,
  ssah: undefined,

  xzfyKz: {
    fyjdRq: undefined,
    fyJg: undefined,
    zksRq: undefined,
    yjsWh: undefined,
    yjsRq: undefined,
    yjsNr: undefined,
    xzPc: undefined,
    zxQk: undefined,
    sfZd: 0,
    zdr: undefined,
    zdRq: undefined,
    sfYj: 0,
    yjr: undefined,
    yjRq: undefined,
    bz: undefined,
    tzRq: undefined
  },

  nextNode: undefined,
  tempNextUserSelectAssignees: undefined,

  attachFilePath: '',
  fileList: []
})

const handleTdZlChange = () => {
  const part1 = tdZlPart1.value || ''
  const part2 = tdZlPart2.value || ''

  // 拼合结果给到表单实际提交的字段
  formData.value.tdZl = part1 + part2

  // 如果两个框都清空了，把 tdZl 置为 undefined，以便触发空值校验标红
  if (!part1 && !part2) {
    formData.value.tdZl = undefined
  }
}

const docList = ref([{ docName: '', docDate: '', docContent: '' }])

// 基础表单校验规则
const formRules = reactive({
  sqr: [{ required: true, message: '申请人不能为空', trigger: 'blur' }],
  bsqr: [{ required: true, message: '被申请人不能为空', trigger: 'change' }],
  tdZl: [{ required: true, message: '土地坐落不能为空', trigger: 'blur' }],
  swWh: [{ required: true, message: '来文号不能为空', trigger: 'blur' }],
  swJg: [{ required: true, message: '来文机关不能为空', trigger: 'change' }],
  swRq: [{ required: true, message: '收文日期不能为空', trigger: 'change' }],
  lb1: [{ required: true, message: '案件分类不能为空', trigger: 'change' }],
  lb2: [{ required: true, message: '涉及事项不能为空', trigger: 'change' }],
  lb3: [{ required: true, message: '案件类型不能为空', trigger: 'change' }]
})

// 弹窗流程处理校验规则
const dialogRules = reactive({
  nextNode: [{ required: true, message: '下一环节不能为空', trigger: 'change' }],
  tempNextUserSelectAssignees: [{ required: true, message: '办理人不能为空', trigger: 'change' }]
})

const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

const addDocRow = () => {
  docList.value.push({ docName: '', docDate: '', docContent: '' })
}

const deleteDocRow = (index: number) => {
  docList.value.splice(index, 1)
}

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

// 顶部发送按钮点击处理
const handleSendClick = async () => {
  // 1. 校验文件上传状态
  const rawFileList = uploadFileRef.value?.fileList || []
  const isUploading = rawFileList.some(
    (file: any) => file.status === 'ready' || file.status === 'uploading'
  )
  if (isUploading) {
    message.warning('还有文件正在上传中，请稍后提交')
    return
  }

  // 2. 校验主表单必填项
  if (!formRef.value) return
  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) {
    message.warning('请检查并完善基础信息必填项')
    return
  }

  // 3. 校验通过，打开弹窗
  dialogVisible.value = true
}

// 弹窗确认提交
const submitForm = async () => {
  // 校验弹窗表单
  if (!dialogFormRef.value) return
  const isValid = await dialogFormRef.value.validate().catch(() => false)
  if (!isValid) return

  formLoading.value = true
  try {
    const data = { ...formData.value } as any

    data.otherRelatedInfo = JSON.stringify(docList.value)
    data.nextNodeAssignees = {}

    const assignees = formData.value.tempNextUserSelectAssignees
    if (assignees) {
      const taskKey = formData.value.nextNode.taskDefKey
      data.nextNodeAssignees[taskKey] = Array.isArray(assignees) ? assignees : [assignees]
    }

    // 附件处理逻辑
    const rawFileList = uploadFileRef.value?.fileList || []
    data.fileList = rawFileList
      .filter((item: any) => item.status === 'success' || item.id)
      .map((item: any) => {
        let fileId = undefined
        let fileName = item.name
        let fileUrl = item.url

        if (item.response?.data) {
          const fileResponse = item.response.data
          fileId =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.id
              : fileResponse
          fileName =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.name || item.name
              : item.name
          fileUrl =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.url || item.url
              : item.url
        } else if (item.id) {
          fileId = item.id
          fileName = item.name
        }

        let extension = ''
        if (fileName && fileName.lastIndexOf('.') > -1) {
          extension = fileName.substring(fileName.lastIndexOf('.') + 1)
        }

        return {
          id: fileId,
          filename: fileName,
          filepath: fileUrl,
          fileextension: extension
        }
      })
      .filter((item: any) => item.filepath)

    await XzfyApi.createXzfy(data)
    message.success('行政复议申请发起成功')

    dialogVisible.value = false

    delView(unref(currentRoute))
    await push({ name: 'BpmProcessInstanceMy' })
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('流程未配置，请检查 Key: ' + processDefineKey)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id

  await getNextApprovalNodes()
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
.custom-tabs {
  margin-top: -10px;
}

#printDivTag {
  padding: 20px;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

#printDivTag .oa-container {
  width: 100%;
  padding: 40px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 0 10px rgb(0 0 0 / 10%);
}

#printDivTag .doc-title {
  margin-bottom: 25px;
  font-size: 30px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

#printDivTag .meta-info {
  display: flex;
  padding: 0 5px;
  margin-bottom: 5px;
  font-size: 15px;
  color: #333;
}

#printDivTag .meta-left {
  width: 50%;
}

#printDivTag .meta-right {
  width: 50%;
  text-align: right;
}

#printDivTag .meta-input {
  display: inline-block;
  min-width: 120px;
  text-align: center;
}

#printDivTag .oa-table {
  width: 100%;
  border: 2px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

#printDivTag .oa-table td {
  padding: 6px 8px;
  font-size: 15px;
  line-height: 1.5;
  color: #000;
  word-wrap: break-word;
  vertical-align: middle;
  border: 1px solid #d71920;
}

#printDivTag .label-cell {
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

#printDivTag .h-80 {
  height: 80px;
  vertical-align: top;
}

#printDivTag .h-large {
  height: 120px;
  vertical-align: top;
}

#printDivTag .h-35 {
  height: 35px;
}

#printDivTag .signature-row {
  height: 30px;
  padding: 0 !important;
}

#printDivTag .sig-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  color: #444;
}

#printDivTag .sign-input {
  display: inline-block;
  min-width: 100px;
}

#printDivTag .sub-header {
  height: 30px;
  font-weight: normal;
  text-align: center;
}

#printDivTag .text-left {
  text-align: left !important;
}

#printDivTag .check-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

#printDivTag .checkbox-mock {
  position: relative;
  display: inline-flex;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
  background-color: transparent !important;
  border: 1px solid #000;
  align-items: center;
  justify-content: center;
}
</style>
