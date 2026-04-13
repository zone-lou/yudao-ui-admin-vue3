<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="创建公出申请">
        <template #header>
          <el-button type="primary" @click="handleSendClick" :loading="formLoading">
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
        </template>

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
        </el-form>
      </ContentWrap>
    </el-col>
  </el-row>

  <ProcessSendDialog
    ref="sendDialogRef"
    title="发送公出申请"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="startUserNodeId"
    @submit="submitForm"
  />
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { TimeExplainApi } from '@/api/bpm/timeexplain'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'
import { useRoute, useRouter } from 'vue-router'
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'

defineOptions({ name: 'BpmTimeExplainCreate' })

const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()

const formLoading = ref(false)
const sendDialogRef = ref()
const startUserNodeId = NodeId.START_USER_NODE_ID

// 表单数据
const formData = ref<any>({
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

// 流程配置
const processDefineKey = 'oa_out'
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

  if (start.isSame(end) && !isHoliday(start)) {
    if (formData.value.startPeriod === AM && formData.value.endPeriod === AM) totalDays = 0.5
    else if (formData.value.startPeriod === PM && formData.value.endPeriod === PM) totalDays = 0.5
    else if (formData.value.startPeriod === AM && formData.value.endPeriod === PM) totalDays = 1
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

// 顶部发送按钮点击处理
const handleSendClick = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) return

  calculateDuration()

  // 流程变量参数
  const variables = {
    role_condition: maxPermissionRole.value
  }
  sendDialogRef.value.open(variables)
}

// 弹窗确认提交
const submitForm = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = { ...formData.value } as any
    if (Array.isArray(data.filepath)) {
      data.filepath = data.filepath.join(',')
    }

    // 流程流转参数对接
    if (!formData.value.processInstanceId) {
      data.nextNodeAssignees = submitData.nextNodeAssignees
      data.processVariablesStr = JSON.stringify({
        role_condition: maxPermissionRole.value,
        ...(submitData.variables || {})
      })
    }

    await TimeExplainApi.createTimeExplain(data)
    message.success('公出申请发起成功')
    sendDialogRef.value.close()

    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/unified')
    }, 200)
  } catch (error) {
    if (sendDialogRef.value) {
      sendDialogRef.value.submitLoading = false
    }
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
  if (!processDefinitionDetail) {
    message.error('公出流程未配置，请检查 Key: ' + processDefineKey)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
})
</script>
