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
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { leaveApi, leave } from '@/api/bpm/leave'
import { HolidayApi } from '@/api/system/holiday'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'

defineOptions({ name: 'BpmLeaveCreate' })

const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const message = useMessage()
const { delView } = useTagsViewStore()
const { push } = useRouter()
const route = useRoute()

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

// 流程配置
const processDefineKey = 'oa_leave'
const startUserSelectTasks = ref([])
const startUserSelectAssignees = ref({})
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const processDefinitionId = ref('')

const AM = 1
const PM = 2

const duration = ref(0)

// ---------------- 权限与条件计算 ----------------
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
  console.log(duration.value, '当前计算时长(用于条件判断)')
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

// ---------------- 节假日与时长计算 ----------------
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
    const endYear = end.format('YYYY')
    if (endYear !== year) {
      const endHolidayInfo = await getHolidayData(endYear)
      if (endHolidayInfo) {
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
  console.log(totalDays, 'dasfdds')
  duration.value = totalDays
  formData.value.totalTs = totalDays
}

// ---------------- 审批流核心逻辑 ----------------
const getApprovalDetail = async () => {
  // 如果没有流程ID，无法获取详情
  if (!processDefinitionId.value) return

  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({
        role_condition: maxPermissionRole.value,
        days_condition4: days_condition4.value, // 使用计算属性
        days_condition3: days_condition3.value // 使用计算属性
      })
    })
    if (!data) return
    activityNodes.value = data.activityNodes
    // 更新需要发起人自选的节点
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

const submitForm = async () => {
  if (!formRef) return
  await formRef.value.validate()
  await calculateDuration() // 提交前再次确认时长

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
    if (Array.isArray(data.filepath)) {
      data.filepath = data.filepath.join(',')
    }
    if (startUserSelectTasks.value?.length > 0) {
      // @ts-ignore
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    await leaveApi.createleave(data)
    message.success('请假申请发起成功')
    const currentRouteObj = unref(route)
    await push({ path: '/bpm/unified' })
    delView(currentRouteObj)
  } finally {
    formLoading.value = false
  }
}

// ---------------- 监听器 (核心修改点) ----------------

// 1. 精准监听条件变化，触发审批流预览更新
// 替代了原来的 watch(formData, ...)
watch(
  () => [days_condition3.value, days_condition4.value],
  async ([new3, new4], [old3, old4]) => {
    // 只有当流程定义已经加载完成，才去获取详情
    if (processDefinitionId.value) {
      console.log('条件变化，刷新审批预览', { new3, new4 })
      // 条件改变，重置选人状态，因为节点可能变了
      startUserSelectAssignees.value = {}
      await getApprovalDetail()
    }
  }
)

// 2. 监听日期和时段变化，计算时长 (时长变化会自动更新 days_condition, 进而触发上面的 watch)
watch(
  () => [
    formData.value.qxjStartDate,
    formData.value.qxjEndDate,
    formData.value.startPeriod,
    formData.value.endPeriod,
    formData.value.qxjType // 类型变化也会影响时长计算（是否包含节假日）
  ],
  () => {
    calculateDuration()
  }
)

// ---------------- 生命周期 (核心修改点) ----------------
onMounted(async () => {
  // 1. 初始化页面数据
  formData.value.applyDate = Date.now()
  const userRes = await getUserProfile()
  if (userRes.dept) deptName.value = userRes.dept.name
  else if (userRes.users && userRes.users.dept) deptName.value = userRes.users.dept.name

  // 2. 【关键】优先获取流程定义，拿到 processDefinitionId
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error('请假流程未配置，请检查 Key: ' + processDefineKey)
    return
  }

  // 3. 赋值流程ID
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  // 4. 【关键】流程ID就绪后，再请求审批节点详情
  await getApprovalDetail()
})
</script>
