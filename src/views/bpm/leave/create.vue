<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="请假申请信息">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="150px"
          v-loading="formLoading"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请人">
                <el-input v-model="nickname" placeholder="当前用户" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所在科室">
                <el-input v-model="deptName" placeholder="所在科室" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="请假类型" prop="qxjType">
                <el-select
                  v-model="formData.qxjType"
                  placeholder="请选择请假类型"
                  @change="calculateDuration"
                >
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请日期" prop="applyDate">
                <el-date-picker
                  v-model="formData.applyDate"
                  type="date"
                  value-format="x"
                  placeholder="请选择申请日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="开始时间" prop="qxjStartDate">
                <el-row style="width: 100%">
                  <el-col :span="16">
                    <el-date-picker
                      v-model="formData.qxjStartDate"
                      type="date"
                      value-format="x"
                      placeholder="选择开始时间"
                      @change="calculateDuration"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-select
                      v-model="formData.startPeriod"
                      placeholder="时段"
                      @change="calculateDuration"
                    >
                      <el-option label="上午" :value="1" />
                      <el-option label="下午" :value="2" />
                    </el-select>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="qxjEndDate">
                <el-row style="width: 100%">
                  <el-col :span="16">
                    <el-date-picker
                      v-model="formData.qxjEndDate"
                      type="date"
                      value-format="x"
                      placeholder="选择结束时间"
                      @change="calculateDuration"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-select
                      v-model="formData.endPeriod"
                      placeholder="时段"
                      @change="calculateDuration"
                    >
                      <el-option label="上午" :value="1" />
                      <el-option label="下午" :value="2" />
                    </el-select>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="请假天数" prop="totalTs">
                <el-input v-model="formData.totalTs" placeholder="自动计算" disabled>
                  <template #append>天</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="请假事由" prop="sjReason">
            <el-input
              v-model="formData.sjReason"
              placeholder="请输入请假事由"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
            />
          </el-form-item>

          <el-form-item label="附件材料" prop="filepath">
            <UploadFile v-model="formData.filepath" />
          </el-form-item>

          <el-form-item>
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
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView' // 关键引用
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { leaveApi, leave } from '@/api/bpm/leave' // 确保引用了请假API
import { HolidayApi } from '@/api/system/holiday' // 节假日API
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'

defineOptions({ name: 'BpmLeaveCreate' })

const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const message = useMessage()
const { delView } = useTagsViewStore() // 获取关闭视图方法
const { push, currentRoute } = useRouter() // 获取路由方法

const formLoading = ref(false)

// 表单数据
const formData = ref({
  id: undefined,
  applyDate: undefined,
  qxjType: undefined,
  qxjStartDate: undefined,
  qxjEndDate: undefined,
  sjReason: undefined,
  totalTs: 0,
  filepath: undefined,
  spzt: undefined, // 审批状态
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

// 流程配置
const processDefineKey = 'oa_leave' // 请假流程 Key (需确认)
const startUserSelectTasks = ref([])
const startUserSelectAssignees = ref({})
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const processDefinitionId = ref('')

const AM = 1
const PM = 2

// 节假日缓存
const holidayCache = ref<Record<string, { workDay: string; restDay: string }>>({})

// 获取节假日数据
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

// 核心计算逻辑
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

  // 1. 获取请假类型配置（是否包含节假日）
  const dictOptions = getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)
  const currentDict = dictOptions.find((i) => i.value === formData.value.qxjType)
  // 备注包含 "包含节假日" 则为日历日模式，否则为工作日模式
  // @ts-ignore
  const isCalendarDayMode = currentDict?.remark?.includes('包含节假日')

  // 2. 如果需要排除节假日，确保有节假日数据
  let holidayInfo: any = null
  if (!isCalendarDayMode) {
    const res = await getHolidayData(year)
    // 兼容 API 返回数组的情况
    if (Array.isArray(res) && res.length > 0) {
      holidayInfo = res[0]
    } else {
      holidayInfo = res
    }
    console.log('请假计算 - 年份:', year, '节假日数据(处理后):', holidayInfo)

    // 如果跨年... (省略逻辑，暂不改动)

    // 如果跨年，可能需要获取下一年的？这里暂只取开始时间的年份，通常请假不会跨太久，或者后端API支持。
    // 严谨做法：Check if end year != start year, fetch both.
    const endYear = end.format('YYYY')
    if (endYear !== year) {
      // 简单处理：合并数据或分别查询。为简单起见，如果年份不同，再查一次
      const endHolidayInfo = await getHolidayData(endYear)
      if (endHolidayInfo) {
        // 合并 workDay 和 restDay 字符串
        if (!holidayInfo) holidayInfo = endHolidayInfo
        else {
          holidayInfo = {
            workDay: holidayInfo.workDay + ',' + endHolidayInfo.workDay,
            restDay: holidayInfo.restDay + ',' + endHolidayInfo.restDay
          }
        }
      }
    }
  }

  // 判断某天是否为工作日
  const isWorkDay = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')

    // 模式1：日历日模式（包含节假日） -> 每一天都算工作日（即都要计入请假）
    if (isCalendarDayMode) {
      console.log(dateStr, '日历日模式-计入')
      return true
    }

    // 模式2：工作日模式（排除节假日）
    // 优先：API返回的精准设定
    const isForceWork = holidayInfo?.workDay?.includes && holidayInfo.workDay.includes(dateStr)
    const isForceRest = holidayInfo?.restDay?.includes && holidayInfo.restDay.includes(dateStr)

    if (isForceWork) {
      console.log(dateStr, '调休工作日-计入')
      return true
    }
    if (isForceRest) {
      console.log(dateStr, '法定节假日-排除')
      return false
    }

    // 兜底：周六周日为休息
    const day = date.day()
    if (day === 0 || day === 6) {
      console.log(dateStr, '周末-排除')
      return false
    }

    console.log(dateStr, '普通工作日-计入')
    return true
  }

  let totalDays = 0
  let currentDate = start.clone()

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    if (isWorkDay(currentDate)) {
      if (currentDate.isSame(start) && currentDate.isSame(end)) {
        // 同一天
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

  formData.value.totalTs = totalDays
}

const submitForm = async () => {
  if (!formRef) return
  await formRef.value.validate()
  calculateDuration()

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
    const data = { ...formData.value } as unknown as leave
    // 处理附件
    if (Array.isArray(data.filepath)) {
      data.filepath = data.filepath.join(',')
    }
    // 选人
    if (startUserSelectTasks.value?.length > 0) {
      // @ts-ignore
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    await leaveApi.createleave(data)
    message.success('请假申请发起成功')

    // 【关键修改】关闭当前 Tab 并跳转回“我的请求”列表
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
  formData.value.applyDate = Date.now()
  const res = await getUserProfile()
  if (res.dept) deptName.value = res.dept.name
  else if (res.users && res.users.dept) deptName.value = res.users.dept.name

  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('请假流程未配置，请检查 Key: ' + processDefineKey)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks
  await getApprovalDetail()
})
</script>
