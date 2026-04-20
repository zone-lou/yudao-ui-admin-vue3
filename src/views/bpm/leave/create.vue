<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap
        title="创建请假申请"
        :bodyStyle="{ background: '#ffffff', minHeight: 'calc(100vh - 120px)' }"
      >
        <template #header>
          <el-button type="primary" @click="handleSendClick" :loading="formLoading">
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
        </template>

        <el-tabs v-model="activeTab" class="custom-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="请假申请" name="apply">
            <div class="oa-container">
              <div class="doc-title">义乌市自然资源和规划局请假审批单</div>
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
                      <td class="label-cell"><span class="text-red-500 mr-5px">*</span>请假类型</td>
                      <td class="input-cell">
                        <el-form-item prop="qxjType" class="mb-0">
                          <el-select
                            v-model="formData.qxjType"
                            placeholder="请选择"
                            @change="calculateDuration"
                            style="width: 100%"
                          >
                            <el-option
                              v-for="dict in getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)"
                              :key="dict.value"
                              :label="dict.label"
                              :value="dict.value"
                            />
                          </el-select>
                        </el-form-item>
                      </td>
                      <td class="label-cell"><span class="text-red-500 mr-5px">*</span>申请日期</td>
                      <td class="input-cell">
                        <el-form-item prop="applyDate" class="mb-0">
                          <el-date-picker
                            v-model="formData.applyDate"
                            type="date"
                            value-format="x"
                            placeholder="选择日期"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </td>
                    </tr>

                    <tr>
                      <td class="label-cell"
                        ><span class="text-red-500 mr-5px">*</span>请假开始 从</td
                      >
                      <td class="input-cell">
                        <el-form-item prop="qxjStartDate" class="mb-0">
                          <el-date-picker
                            v-model="formData.qxjStartDate"
                            type="date"
                            value-format="x"
                            placeholder="选择日期"
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
                      <td class="label-cell"
                        ><span class="text-red-500 mr-5px">*</span>请假结束 至</td
                      >
                      <td class="input-cell">
                        <el-form-item prop="qxjEndDate" class="mb-0">
                          <el-date-picker
                            v-model="formData.qxjEndDate"
                            type="date"
                            value-format="x"
                            placeholder="选择日期"
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
                      <td class="label-cell">请假天数</td>
                      <td class="input-cell" colspan="3">{{ formData.totalTs }} 天</td>
                    </tr>

                    <tr class="print-hide-row">
                      <td class="label-cell">附件列表</td>
                      <td class="input-cell" colspan="3">
                        <el-form-item prop="filepath" class="mb-0">
                          <UploadFile v-model="formData.filepath" />
                        </el-form-item>
                      </td>
                    </tr>

                    <tr>
                      <td class="label-cell"><span class="text-red-500 mr-5px">*</span>请假事由</td>
                      <td colspan="3" class="input-cell h-reason">
                        <el-form-item prop="sjReason" class="mb-0">
                          <el-input
                            v-model="formData.sjReason"
                            placeholder="请输入请假事由"
                            :autosize="{ minRows: 4, maxRows: 8 }"
                            type="textarea"
                          />
                        </el-form-item>
                      </td>
                    </tr>

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
          </el-tab-pane>

          <el-tab-pane label="请假记录" name="history">
            <el-table v-loading="historyLoading" :data="historyList" border style="width: 100%">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="请假类型" align="center" prop="qxjType" width="120">
                <template #default="scope">
                  <dict-tag :type="DICT_TYPE.BPM_LEAVE_TYPE" :value="scope.row.qxjType" />
                </template>
              </el-table-column>
              <el-table-column label="申请日期" align="center" prop="applyDate" width="150">
                <template #default="scope">
                  <span>{{ formatDate(scope.row.applyDate) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="开始时间" align="center" prop="qxjStartDate" width="150">
                <template #default="scope">
                  <span>{{ formatDate(scope.row.qxjStartDate) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结束时间" align="center" prop="qxjEndDate" width="150">
                <template #default="scope">
                  <span>{{ formatDate(scope.row.qxjEndDate) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="请假天数" align="center" prop="totalTs" width="100" />
              <el-table-column
                label="当前环节"
                align="center"
                prop="currentNodeName"
                min-width="120"
              />
              <el-table-column
                label="当前办理人"
                align="center"
                prop="currentAssigneeNames"
                min-width="150"
              />
            </el-table>

            <Pagination
              :total="total"
              v-model:page="queryParams.pageNo"
              v-model:limit="queryParams.pageSize"
              @pagination="getHistoryList"
            />
          </el-tab-pane>
        </el-tabs>
      </ContentWrap>
    </el-col>
  </el-row>

  <ProcessSendDialog
    ref="sendDialogRef"
    title="发送请假申请"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="startUserNodeId"
    @submit="submitForm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, unref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import { leaveApi } from '@/api/bpm/leave'
import { HolidayApi } from '@/api/system/holiday'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'
import { useMessage } from '@/hooks/web/useMessage'
// 新增引入弹窗组件及节点常量
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'

defineOptions({ name: 'BpmLeaveCreate' })

const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()

// ===== 弹窗控制 =====
const sendDialogRef = ref()
const startUserNodeId = NodeId.START_USER_NODE_ID

// ===== 标签页控制 =====
const activeTab = ref('apply')

// ===== 表单数据与状态 =====
const formLoading = ref(false)

const formData = ref<any>({
  id: undefined,
  processInstanceId: undefined,
  applyDate: undefined,
  qxjType: undefined,
  qxjStartDate: undefined,
  qxjEndDate: undefined,
  sjReason: undefined,
  totalTs: 0,
  filepath: undefined,
  spzt: undefined,
  userid: undefined,
  startPeriod: 1,
  endPeriod: 2
})

const formRules = reactive({
  qxjType: [{ required: true, message: '请假类型不能为空', trigger: 'change' }],
  qxjStartDate: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
  qxjEndDate: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }],
  sjReason: [{ required: true, message: '请假事由不能为空', trigger: 'blur' }],
  applyDate: [{ required: true, message: '申请日期不能为空', trigger: 'blur' }]
})
const formRef = ref()

const processDefineKey = 'oa_leave'
const processDefinitionId = ref('')

const AM = 1
const PM = 2
const duration = ref(0)

// ===== 请假记录列表相关 =====
const historyLoading = ref(false)
const historyList = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

const isHistoryFetched = ref(false)

const formatDate = (val: any) => {
  if (!val) return ''
  return dayjs(val).format('YYYY-MM-DD')
}

const getHistoryList = async () => {
  historyLoading.value = true
  try {
    const data = await leaveApi.getLeaveHistoryPage(queryParams)
    historyList.value = data.list
    total.value = data.total
    isHistoryFetched.value = true
  } finally {
    historyLoading.value = false
  }
}

const handleTabChange = (tab: string | number) => {
  if (tab === 'history' && !isHistoryFetched.value) {
    getHistoryList()
  }
}

// ===== 权限与计算逻辑 =====
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

const days_condition4 = computed(() => {
  if (maxPermissionRole.value === 'grade_3' && duration.value <= 1) {
    return '4_6'
  } else {
    return '4_3'
  }
})

const days_condition3 = computed(() => {
  if (
    (maxPermissionRole.value === 'grade_3' && duration.value > 1 && duration.value < 30) ||
    (maxPermissionRole.value === 'grade_7' && duration.value <= 7)
  ) {
    return '3_6'
  }
  if (
    maxPermissionRole.value === 'grade_11' ||
    (maxPermissionRole.value === 'grade_7' && duration.value > 7) ||
    (maxPermissionRole.value === 'grade_3' && duration.value > 30)
  ) {
    return '3_5'
  } else return ''
})

const holidayCache = ref<Record<string, { workDay: string; restDay: string }>>({})

const getHolidayData = async (year: string) => {
  if (holidayCache.value[year]) return holidayCache.value[year]
  try {
    const res = await HolidayApi.getHolidaySummary(year)
    if (res) {
      holidayCache.value[year] = res
      return res
    }
  } catch (e) {
    console.error('获取节假日失败', e)
  }
  return null
}

const calculateDuration = async () => {
  formData.value.totalTs = 0
  if (!formData.value.qxjStartDate || !formData.value.qxjEndDate || !formData.value.qxjType) return

  const start = dayjs(formData.value.qxjStartDate).startOf('day')
  const end = dayjs(formData.value.qxjEndDate).startOf('day')
  const year = start.format('YYYY')

  if (end.isBefore(start)) {
    message.error('结束日期不能早于开始日期')
    return
  }
  if (end.isSame(start) && formData.value.startPeriod === PM && formData.value.endPeriod === AM) {
    message.error('结束时段不能早于开始时段')
    return
  }

  const dictOptions = getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)
  const currentDict = dictOptions.find((i) => i.value === formData.value.qxjType)
  // @ts-ignore
  const isCalendarDayMode = currentDict?.remark?.includes('包含节假日')

  let holidayInfo: any = null
  if (!isCalendarDayMode) {
    const res = await getHolidayData(year)
    if (Array.isArray(res) && res.length > 0) {
      holidayInfo = res[0]
    } else {
      holidayInfo = res
    }
  }

  const isWorkDay = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    if (isCalendarDayMode) return true
    const isForceWork = holidayInfo?.workDay?.includes && holidayInfo.workDay.includes(dateStr)
    const isForceRest = holidayInfo?.restDay?.includes && holidayInfo.restDay.includes(dateStr)
    if (isForceWork) return true
    if (isForceRest) return false
    const day = date.day()
    if (day === 0 || day === 6) return false
    return true
  }

  let totalDays = 0
  let currentDate = start.clone()
  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    if (isWorkDay(currentDate)) {
      if (currentDate.isSame(start) && currentDate.isSame(end)) {
        if (formData.value.startPeriod === AM && formData.value.endPeriod === AM) totalDays += 0.5
        else if (formData.value.startPeriod === PM && formData.value.endPeriod === PM)
          totalDays += 0.5
        else totalDays += 1
      } else if (currentDate.isSame(start)) {
        totalDays += formData.value.startPeriod === PM ? 0.5 : 1
      } else if (currentDate.isSame(end)) {
        totalDays += formData.value.endPeriod === AM ? 0.5 : 1
      } else {
        totalDays += 1
      }
    }
    currentDate = currentDate.add(1, 'day')
  }
  duration.value = totalDays
  formData.value.totalTs = totalDays
}

const handleSendClick = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) return
  await calculateDuration()

  // 组装流程变量，唤起发送弹窗
  const variables = {
    role_condition: maxPermissionRole.value,
    days_condition4: days_condition4.value,
    days_condition3: days_condition3.value
  }
  sendDialogRef.value.open(variables)
}

// 接收弹窗返回的 assignees 和 variables
const submitForm = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = { ...formData.value } as any
    if (Array.isArray(data.filepath)) {
      data.filepath = data.filepath.join(',')
    }

    // 携带流程变量
    data.processVariablesStr = JSON.stringify({
      role_condition: maxPermissionRole.value,
      days_condition4: days_condition4.value,
      days_condition3: days_condition3.value,
      ...(submitData.variables || {})
    })

    // 携带下一步办理人
    data.nextNodeAssignees = submitData.nextNodeAssignees

    await leaveApi.createleave(data)
    message.success('请假申请发起成功')

    if (sendDialogRef.value) {
      sendDialogRef.value.close()
    }

    isHistoryFetched.value = false

    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/unified')
    }, 200)
  } catch (error) {
    console.error(error)
    // 异常时关闭弹窗内的 loading 状态
    if (sendDialogRef.value) {
      sendDialogRef.value.submitLoading = false
    }
  } finally {
    formLoading.value = false
  }
}

watch(
  () => [
    formData.value.qxjStartDate,
    formData.value.qxjEndDate,
    formData.value.startPeriod,
    formData.value.endPeriod,
    formData.value.qxjType
  ],
  () => {
    calculateDuration()
  }
)

onMounted(async () => {
  formData.value.applyDate = Date.now()
  const userRes = await getUserProfile()
  if (userRes.dept) deptName.value = userRes.dept.name
  else if (userRes.users && userRes.users.dept) deptName.value = userRes.users.dept.name

  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (processDefinitionDetail) {
    processDefinitionId.value = processDefinitionDetail.id
  } else {
    message.error('流程未配置，请检查 Key: ' + processDefineKey)
  }
})
</script>

<style scoped lang="scss">
.custom-tabs {
  margin-top: -10px;
}

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
  width: 100%;
  padding: 10px 20px;
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', serif;
  background-color: #fff;
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
  font-size: 14px;
  border: 1px solid #8cb4e0;
  border-collapse: collapse;
  table-layout: fixed;
}

.oa-table td {
  padding: 6px 10px;
  line-height: 1.4;
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
