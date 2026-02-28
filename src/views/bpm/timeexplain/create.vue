<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="公出申请信息">
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
              <el-form-item label="开始时间" prop="checkBegin">
                <el-row style="width: 100%">
                  <el-col :span="16">
                    <el-date-picker
                      v-model="formData.checkBegin"
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
              <el-form-item label="结束时间" prop="checkEnd">
                <el-row style="width: 100%">
                  <el-col :span="16">
                    <el-date-picker
                      v-model="formData.checkEnd"
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
              <el-form-item label="共计天数" prop="days">
                <el-input v-model="formData.days" placeholder="自动计算" disabled>
                  <template #append>天</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="登记日期" prop="checkDate">
                <el-date-picker
                  v-model="formData.checkDate"
                  type="date"
                  value-format="x"
                  placeholder="请选择登记日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="出发地" prop="startPlace">
                <el-input v-model="formData.startPlace" placeholder="请输入出发地" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="目的地" prop="endPlace">
                <el-input v-model="formData.endPlace" placeholder="请输入目的地" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="原因说明" prop="reason">
            <el-input
              v-model="formData.reason"
              placeholder="请输入公出/外出原因"
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
import { TimeExplain, TimeExplainApi } from '@/api/bpm/timeexplain'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'
import { useRoute } from 'vue-router'

defineOptions({ name: 'BpmTimeExplainCreate' })

const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const message = useMessage()
const { delView } = useTagsViewStore() // 获取关闭视图方法
const { push } = useRouter() // 获取路由方法
const route = useRoute()

const formLoading = ref(false)

// 表单数据
const formData = ref({
  id: undefined,
  checkDate: undefined,
  checkBegin: undefined,
  checkEnd: undefined,
  reason: undefined,
  days: 0,
  filepath: undefined,
  status: 0,
  startPeriod: 1,
  endPeriod: 2,
  startPlace: '义乌', // 默认义乌
  endPlace: undefined // 目的地
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

// 流程配置
const processDefineKey = 'oa_out'
const startUserSelectTasks = ref([])
const startUserSelectAssignees = ref({})
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const processDefinitionId = ref('')

const AM = 1
const PM = 2

// 时长计算逻辑
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
  const isHoliday = (date: dayjs.Dayjs) => date.day() === 0 || date.day() === 6

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    if (!isHoliday(currentDate)) {
      if (currentDate.isSame(start)) {
        totalDays += formData.value.startPeriod === PM ? 0.5 : 1
      } else if (currentDate.isSame(end)) {
        totalDays += formData.value.endPeriod === AM ? 0.5 : 1
      } else {
        totalDays += 1
      }
    }
    currentDate = currentDate.add(1, 'day')
  }

  // 修正同一天情况
  if (start.isSame(end) && !isHoliday(start)) {
    if (formData.value.startPeriod === AM && formData.value.endPeriod === AM) totalDays = 0.5
    else if (formData.value.startPeriod === PM && formData.value.endPeriod === PM) totalDays = 0.5
    else if (formData.value.startPeriod === AM && formData.value.endPeriod === PM) totalDays = 1
  }
  formData.value.days = totalDays
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
    const data = { ...formData.value } as unknown as TimeExplain
    if (Array.isArray(data.filepath)) {
      data.filepath = data.filepath.join(',')
    }
    if (startUserSelectTasks.value?.length > 0) {
      // @ts-ignore
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    await TimeExplainApi.createTimeExplain(data)
    message.success('公出申请发起成功')

    // 【关键修改】关闭当前 Tab 并跳转回“我的请求”列表
    const currentRouteObj = unref(route)
    await push({ path: '/bpm/unified' })
    delView(currentRouteObj)
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
  formData.value.checkDate = Date.now()
  const res = await getUserProfile()
  if (res.dept) deptName.value = res.dept.name
  else if (res.users && res.users.dept) deptName.value = res.users.dept.name

  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('公出流程未配置，请检查 Key: ' + processDefineKey)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks
  await getApprovalDetail()
})
</script>
