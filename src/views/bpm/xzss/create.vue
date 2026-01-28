<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="行政诉讼申请信息">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="140px"
          v-loading="formLoading"
        >
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
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_INCOMING_AUTHORITY_XZSS)"
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
              <el-form-item label="原告" prop="sqr">
                <el-input v-model="formData.sqr" placeholder="请输入原告" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="被告" prop="bsqr">
                <el-input v-model="formData.bsqr" placeholder="请输入被告" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="第三人" prop="dsr">
                <el-input v-model="formData.dsr" placeholder="请输入第三人" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="上诉人" prop="ssr">
                <el-input v-model="formData.ssr" placeholder="请输入上诉人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="被上诉人" prop="bssr">
                <el-input v-model="formData.bssr" placeholder="请输入被上诉人" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="再审申请人" prop="zssqr">
                <el-input v-model="formData.zssqr" placeholder="请输入再审申请人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="再审被申请人" prop="zsbsqr">
                <el-input v-model="formData.zsbsqr" placeholder="请输入再审被申请人" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
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
            <el-col :span="12">
              <el-form-item label="土地坐落" prop="tdZl">
                <el-input v-model="formData.tdZl" placeholder="请输入土地坐落" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="复议案号" prop="fyAh">
                <el-input v-model="formData.fyAh" placeholder="请输入复议案号">
                  <template #append>
                    <el-button @click="openFySelect">选择</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上一审案号" prop="ssAh">
                <el-input v-model="formData.ssAh" placeholder="请输入上一审案号">
                  <template #append>
                    <el-button @click="openSsSelect">选择</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="办理时限" prop="zhubandate">
                <el-date-picker
                  v-model="formData.zhubandate"
                  type="date"
                  value-format="x"
                  placeholder="选择办理时限"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="送法院日期" prop="sfyjgRq">
                <el-date-picker
                  v-model="formData.sfyjgRq"
                  type="date"
                  value-format="x"
                  placeholder="选择送法院日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="诉讼阶段" prop="ssLx">
            <el-radio-group v-model="formData.ssLx">
              <el-radio
                v-for="dict in getDictOptions(DICT_TYPE.BPM_ADMINISTRATIVE_LITIGATION_STAGE)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="案件类别" prop="lb1">
            <el-radio-group v-model="formData.lb1">
              <el-radio
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS1)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="案件分类" prop="lb2">
            <el-radio-group v-model="formData.lb2">
              <el-radio
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS2)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="涉及事项" prop="lb3">
            <el-radio-group v-model="formData.lb3">
              <el-radio
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS3)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="案件类型" prop="lb4">
            <el-radio-group v-model="formData.lb4">
              <el-radio
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS4)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="诉讼类别" prop="lb5">
            <el-radio-group v-model="formData.lb5">
              <el-radio
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS5)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="诉讼请求" prop="ssNr">
            <el-input
              v-model="formData.ssNr"
              type="textarea"
              :rows="2"
              placeholder="请输入诉讼请求"
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
              <el-form-item label="监督监管" prop="issupervise">
                <el-radio-group v-model="formData.issupervise">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="寄件提醒" prop="mailTip">
                <el-radio-group v-model="formData.mailTip">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <h3 class="section-title" style="margin-top: 20px">行政诉讼相关信息</h3>

          <el-row>
            <el-col :span="12">
              <el-form-item label="裁定判决日期" prop="xzssKz.cdpjRq">
                <el-date-picker
                  v-model="formData.xzssKz.cdpjRq"
                  type="date"
                  value-format="x"
                  placeholder="选择裁定判决日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="建议函日期" prop="xzssKz.jyhRq">
                <el-date-picker
                  v-model="formData.xzssKz.jyhRq"
                  type="date"
                  value-format="x"
                  placeholder="选择建议函日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="建议函内容" prop="xzssKz.jyhNr">
            <el-input v-model="formData.xzssKz.jyhNr" placeholder="请输入建议函内容" />
          </el-form-item>

          <el-row>
            <el-col :span="12">
              <el-form-item label="转业务科室" prop="xzssKz.zksRq">
                <el-date-picker
                  v-model="formData.xzssKz.zksRq"
                  type="date"
                  value-format="x"
                  placeholder="选择转业务科室日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开庭日期" prop="xzssKz.ktRq">
                <el-date-picker
                  v-model="formData.xzssKz.ktRq"
                  type="date"
                  value-format="x"
                  placeholder="选择开庭日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="判决结果" prop="xzssKz.pjJg">
                <el-input v-model="formData.xzssKz.pjJg" placeholder="请输入判决结果" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="裁定结果" prop="xzssKz.cdJg">
                <el-input v-model="formData.xzssKz.cdJg" placeholder="请输入裁定结果" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="行政赔偿(元)" prop="xzssKz.xzPc">
                <el-input v-model="formData.xzssKz.xzPc" placeholder="请输入行政赔偿金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执行情况" prop="xzssKz.zxQk">
                <el-input v-model="formData.xzssKz.zxQk" placeholder="请输入执行情况" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item label="装订人" prop="xzssKz.zdr">
                <el-input v-model="formData.xzssKz.zdr" placeholder="请输入装订人" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="装订日期" prop="xzssKz.zdRq">
                <el-date-picker
                  v-model="formData.xzssKz.zdRq"
                  type="date"
                  value-format="x"
                  placeholder="选择装订日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="装订情况" prop="xzssKz.zdQk">
                <el-input v-model="formData.xzssKz.zdQk" placeholder="请输入装订情况" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item label="移交人" prop="xzssKz.yjr">
                <el-input v-model="formData.xzssKz.yjr" placeholder="请输入移交人" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="移交日期" prop="xzssKz.yjRq">
                <el-date-picker
                  v-model="formData.xzssKz.yjRq"
                  type="date"
                  value-format="x"
                  placeholder="选择移交日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="移交情况" prop="xzssKz.yjQk">
                <el-input v-model="formData.xzssKz.yjQk" placeholder="请输入移交情况" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="执行情况" prop="xzssKz.bz">
            <el-input v-model="formData.xzssKz.bz" type="textarea" placeholder="请输入备注" />
          </el-form-item>
          <el-form-item label="备注" prop="xzssKz.bz">
            <el-input v-model="formData.xzssKz.bz" type="textarea" placeholder="请输入备注" />
          </el-form-item>

          <h3 class="section-title" style="margin-top: 20px">相关文书列表</h3>

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

  <!-- 复议案件选择弹窗 -->
  <el-dialog v-model="fySelectVisible" title="选择复议案件" width="70%" append-to-body>
    <el-table v-loading="listLoading" :data="xzfyList" border>
      <el-table-column label="诉讼文号" prop="swWh" />
      <el-table-column label="来文机关" prop="swJg" />
      <el-table-column label="收文日期" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.swRq) }}
        </template>
      </el-table-column>
      <el-table-column label="原告" prop="sqr" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button type="primary" link @click="selectFy(scope.row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <!-- 上一审案件选择弹窗 -->
  <el-dialog v-model="ssSelectVisible" title="选择上一审案件" width="70%" append-to-body>
    <el-table v-loading="listLoading" :data="historyXzssList" border>
      <el-table-column label="诉讼文号" prop="swWh" />
      <el-table-column label="来文机关" prop="swJg" />
      <el-table-column label="收文日期" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.swRq) }}
        </template>
      </el-table-column>
      <el-table-column label="原告" prop="sqr" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button type="primary" link @click="selectSs(scope.row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { XzssApi, Xzss } from '@/api/bpm/xzss'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'

import { XzfyApi } from '@/api/bpm/xzfy'
import { dateUtil } from '@/utils/dateUtil'

defineOptions({ name: 'BpmXzssCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const userStore = useUserStore()

const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

const formLoading = ref(false)
const formRef = ref()

// 流程相关
const processDefineKey = 'oa_lawsuit' // 流程 Key
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
  // 主表字段
  sqr: undefined,
  bsqr: undefined,
  dsr: undefined,
  tdZl: undefined,
  swWh: undefined,
  swJg: '1',
  swRq: undefined,
  zhubandate: undefined,
  ssLx: undefined, // 诉讼类型(其实是诉讼阶段)
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  lb4: undefined,
  lb5: undefined,
  ssNr: undefined, // 复议请求
  ssnr: undefined, // 诉讼内容
  cbr: undefined,
  cbRq: undefined,
  sfyjgRq: undefined,
  ssr: undefined,
  bssr: undefined,
  zssqr: undefined,
  zsbsqr: undefined,
  fyAh: undefined,
  fyGuid: undefined, // 复议关联ID
  ssAh: undefined,
  ssGuid: undefined, // 上一审关联ID
  issupervise: 0,
  mailTip: 0,

  // 子表字段
  xzssKz: {
    cdpjRq: undefined,
    jyhRq: undefined,
    jyhNr: undefined,
    zksRq: undefined,
    pjJg: undefined,
    cdJg: undefined,
    xzPc: undefined,
    zxQk: undefined,
    zdr: undefined,
    zdRq: undefined,
    zdQk: undefined,
    yjr: undefined,
    yjRq: undefined,
    yjQk: undefined,
    bz: undefined,
    ktRq: undefined
  },

  // 流程字段
  nextNode: undefined,
  tempNextUserSelectAssignees: undefined
})

const docList = ref([{ docName: '', docDate: '', docContent: '' }])

const formRules = reactive({
  swWh: [{ required: true, message: '来文号不能为空', trigger: 'blur' }],
  swJg: [{ required: true, message: '来文机关不能为空', trigger: 'change' }],
  sqr: [{ required: true, message: '原告不能为空', trigger: 'blur' }],
  bsqr: [{ required: true, message: '被告不能为空', trigger: 'blur' }],
  swRq: [{ required: true, message: '收文日期不能为空', trigger: 'change' }],
  tdZl: [{ required: true, message: '土地坐落不能为空', trigger: 'blur' }],
  fyAh: [{ required: true, message: '复议案号不能为空', trigger: 'blur' }],
  lb1: [{ required: true, message: '案件类别不能为空', trigger: 'change' }],
  lb2: [{ required: true, message: '案件分类不能为空', trigger: 'change' }],
  lb3: [{ required: true, message: '涉及事项不能为空', trigger: 'change' }],
  lb4: [{ required: true, message: '案件类型不能为空', trigger: 'change' }],
  lb5: [{ required: true, message: '诉讼类别不能为空', trigger: 'change' }],
  nextNode: [{ required: true, message: '下一审批节点不能为空', trigger: 'change' }],
  tempNextUserSelectAssignees: [{ required: true, message: '审批人不能为空', trigger: 'change' }]
})

// === 动态表格操作 ===
const addDocRow = () => {
  docList.value.push({ docName: '', docDate: '', docContent: '' })
}

const deleteDocRow = (index: number) => {
  docList.value.splice(index, 1)
}

// === 复议案号、上一审案号 选择逻辑 ===
const fySelectVisible = ref(false)
const ssSelectVisible = ref(false)
const xzfyList = ref<any[]>([])
const historyXzssList = ref<any[]>([])
const listLoading = ref(false)

const openFySelect = async () => {
  fySelectVisible.value = true
  listLoading.value = true
  try {
    // 调用 getXzfyPageUnlinked 获取未关联行政诉讼的行政复议
    // @ts-ignore
    const res = await XzfyApi.getXzfyPageUnlinked({ pageNo: 1, pageSize: 10 })
    if (res && res.list) {
      xzfyList.value = res.list
    }
  } catch (e) {
    console.error(e)
  } finally {
    listLoading.value = false
  }
}

const openSsSelect = async () => {
  ssSelectVisible.value = true
  listLoading.value = true
  try {
    // 调用 getXzssPage 获取行政诉讼列表
    // @ts-ignore
    const res = await XzssApi.getXzssPage({ pageNo: 1, pageSize: 10 })
    if (res && res.list) {
      historyXzssList.value = res.list
    }
  } catch (e) {
    console.error(e)
  } finally {
    listLoading.value = false
  }
}

const selectFy = (row: any) => {
  formData.value.fyAh = row.swWh // 备注：复议列表的 swWh 对应 复议案号
  formData.value.fyGuid = row.xmGuid // 关联ID
  fySelectVisible.value = false
}

const selectSs = (row: any) => {
  formData.value.ssAh = row.swWh // 备注：上一审列表的 swWh 对应 案号
  formData.value.ssGuid = row.xmGuid // 关联ID
  ssSelectVisible.value = false
}

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
        return message.warning(`请选择${userTask.name}的审批人`)
      }
    }
  }

  formLoading.value = true
  try {
    const data = { ...formData.value } as any

    // 1. 处理动态表格数据 (复用 otherRelatedInfo 字段逻辑)
    data.otherRelatedInfo = JSON.stringify(docList.value)

    // 2. 处理发起人自选审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    // 3. 处理下一步流程选择
    data.nextNodeAssignees = {}

    const assignees = formData.value.tempNextUserSelectAssignees
    if (assignees) {
      const taskKey = formData.value.nextNode.taskDefKey
      data.nextNodeAssignees[taskKey] = Array.isArray(assignees) ? assignees : [assignees]
    }

    await XzssApi.createXzss(data)
    message.success('行政诉讼申请发起成功')

    delView(unref(currentRoute))
    await push({ name: 'BpmProcessInstanceMy' })
  } finally {
    formLoading.value = false
  }
}

// === 初始化 ===
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
.section-title {
  padding-left: 10px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  border-left: 4px solid #409eff;
}
</style>
