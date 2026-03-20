<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="行政复议申请信息" v-loading="formLoading">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="表单信息" name="form">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
              <h3 class="section-title">基本信息</h3>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="来文号" prop="swWh">
                    <el-input v-model="formData.swWh" placeholder="请输入来文号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
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
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="申请人" prop="sqr">
                    <el-input v-model="formData.sqr" placeholder="请输入申请人" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
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
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="第三人" prop="dsr">
                    <el-input v-model="formData.dsr" placeholder="请输入第三人" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="土地坐落" prop="tdZl">
                    <el-input v-model="formData.tdZl" placeholder="请输入土地坐落" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="来文日期" prop="swRq">
                    <el-date-picker
                      v-model="formData.swRq"
                      type="date"
                      value-format="x"
                      placeholder="选择来文日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="12">
              <el-form-item label="办理时限" prop="zhubandate">
                <el-date-picker
                  v-model="formData.zhubandate"
                  type="date"
                  value-format="x"
                  placeholder="选择办理时限"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col> -->
              </el-row>

              <el-form-item label="案件分类" prop="lb1">
                <el-radio-group v-model="formData.lb1">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZFY_CLASS1)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="涉及事项" prop="lb2">
                <el-radio-group v-model="formData.lb2">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZFY_CLASS2)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="案件类型" prop="lb3">
                <el-radio-group v-model="formData.lb3">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZFY_CLASS3)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="复议请求" prop="fyNr">
                <el-input
                  v-model="formData.fyNr"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入复议请求内容"
                />
              </el-form-item>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="承办人" prop="cbr">
                    <el-input v-model="formData.cbr" placeholder="请输入承办人" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="承办日期" prop="cbRq">
                    <el-date-picker
                      v-model="formData.cbRq"
                      type="date"
                      value-format="x"
                      placeholder="选择承办日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="行政区" prop="xzq">
                    <el-input v-model="formData.xzq" placeholder="街道/村" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="监督监管" prop="issupervise">
                    <el-radio-group v-model="formData.issupervise">
                      <el-radio :label="1">是</el-radio>
                      <el-radio :label="0">否</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <h3 class="section-title" style="margin-top: 20px">其他相关信息</h3>

              <el-row>
                <el-col :span="12">
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
                <el-col :span="12">
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
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="转业务科室日期" prop="xzfyKz.zksRq">
                    <el-date-picker
                      v-model="formData.xzfyKz.zksRq"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
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

              <el-row>
                <el-col :span="12">
                  <el-form-item label="意见书文号" prop="xzfyKz.yjsWh">
                    <el-input v-model="formData.xzfyKz.yjsWh" placeholder="请输入意见书文号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="意见书日期" prop="xzfyKz.yjsRq">
                    <el-date-picker
                      v-model="formData.xzfyKz.yjsRq"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="意见书内容" prop="xzfyKz.yjsNr">
                <el-input
                  v-model="formData.xzfyKz.yjsNr"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入内容"
                />
              </el-form-item>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="行政赔偿(元)" prop="xzfyKz.xzPc">
                    <el-input v-model="formData.xzfyKz.xzPc" placeholder="请输入金额" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="执行情况" prop="xzfyKz.zxQk">
                    <el-input v-model="formData.xzfyKz.zxQk" placeholder="请输入执行情况" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="是否移交" prop="xzfyKz.sfYj">
                    <el-radio-group v-model="formData.xzfyKz.sfYj">
                      <el-radio :label="1">是</el-radio>
                      <el-radio :label="0">否</el-radio>
                    </el-radio-group>
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

              <el-row>
                <el-col :span="8">
                  <el-form-item label="是否装订" prop="xzfyKz.sfZd">
                    <el-radio-group v-model="formData.xzfyKz.sfZd">
                      <el-radio :label="1">是</el-radio>
                      <el-radio :label="0">否</el-radio>
                    </el-radio-group>
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

              <el-form-item label="备注" prop="xzfyKz.bz">
                <el-input v-model="formData.xzfyKz.bz" type="textarea" placeholder="请输入备注" />
              </el-form-item>

              <h3 class="section-title">相关文书列表</h3>

              <div style="margin-bottom: 10px; text-align: right">
                <el-button type="primary" plain size="small" @click="addDocRow">
                  <Icon icon="ep:plus" class="mr-5px" /> 添加行
                </el-button>
              </div>

              <el-table :data="docList" border style="width: 100%">
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
                <el-table-column label="操作" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button link type="danger" @click="deleteDocRow($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <h3 class="section-title" style="margin-top: 20px">流程处理</h3>

              <el-form-item label="下一审批节点" prop="nextNode" required>
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

              <el-form-item style="margin-top: 30px">
                <el-button :disabled="formLoading" type="primary" @click="submitForm">
                  提交申请
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 审批表专属扩展页 -->
          <el-tab-pane label="审批表" name="oaForm">
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
                          <span style="width: 40%">审批人：<span class="sign-input"></span></span>
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
                          <span style="width: 40%">审批人：<span class="sign-input"></span></span>
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

    <el-col :span="8">
      <ContentWrap title="审批流程预览" :bodyStyle="{ padding: '0 20px 0' }">
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
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { XzfyApi, Xzfy } from '@/api/bpm/xzfy'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import { dateUtil } from '@/utils/dateUtil'

defineOptions({ name: 'BpmXzfyCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const userStore = useUserStore()

const activeTab = ref('form')
const formLoading = ref(false)
const formRef = ref()

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

// 流程相关
const processDefineKey = 'oa_review'
const startUserSelectTasks = ref([])
const startUserSelectAssignees = ref({})
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const processDefinitionId = ref('')

const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const multipleFlag = ref(false)

// 表单数据
const formData = ref({
  id: undefined,
  sqr: undefined,
  bsqr: '1',
  dsr: undefined,
  tdZl: undefined,
  swWh: undefined,
  swJg: '1',
  swRq: undefined,
  // zhubandate: undefined,
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  fyNr: undefined,
  cbr: undefined,
  cbRq: undefined,
  xzq: undefined,
  issupervise: 1, // 默认打勾监督监管
  zhubandate: undefined,

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
  tempNextUserSelectAssignees: undefined
})

const docList = ref([{ docName: '', docDate: '', docContent: '' }])

const formRules = reactive({
  sqr: [{ required: true, message: '申请人不能为空', trigger: 'blur' }],
  bsqr: [{ required: true, message: '被申请人不能为空', trigger: 'change' }],
  tdZl: [{ required: true, message: '土地坐落不能为空', trigger: 'blur' }],
  swWh: [{ required: true, message: '来文号不能为空', trigger: 'blur' }],
  swJg: [{ required: true, message: '来文机关不能为空', trigger: 'change' }],
  swRq: [{ required: true, message: '来文日期不能为空', trigger: 'change' }],
  lb1: [{ required: true, message: '案件分类不能为空', trigger: 'change' }],
  lb2: [{ required: true, message: '涉及事项不能为空', trigger: 'change' }],
  lb3: [{ required: true, message: '案件类型不能为空', trigger: 'change' }],
  nextNode: [{ required: true, message: '下一审批节点不能为空', trigger: 'change' }],
  tempNextUserSelectAssignees: [{ required: true, message: '审批人不能为空', trigger: 'change' }]
})

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

const submitForm = async () => {
  if (!formRef) return
  await formRef.value.validate()

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
    const data = { ...formData.value } as any

    data.otherRelatedInfo = JSON.stringify(docList.value)

    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    data.nextNodeAssignees = {}

    const assignees = formData.value.tempNextUserSelectAssignees
    if (assignees) {
      const taskKey = formData.value.nextNode.taskDefKey
      data.nextNodeAssignees[taskKey] = Array.isArray(assignees) ? assignees : [assignees]
    }

    await XzfyApi.createXzfy(data)
    message.success('行政复议申请发起成功')

    delView(unref(currentRoute))
    await push({ name: 'BpmProcessInstanceMy' })
  } finally {
    formLoading.value = false
  }
}

const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({})
    })
    if (!data) return
    activityNodes.value = data.activityNodes
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
  } catch (e) {
    console.error(e)
  }
}

const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
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
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  await getNextApprovalNodes()
  await getApprovalDetail()
})

watch(
  () => formData.value.nextNode,
  () => {
    getApprovalDetail()
  }
)
</script>

<style scoped>
/* stylelint-disable selector-id-pattern */

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

/* ================= 导入红头审批表专用样式 ================= */
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
