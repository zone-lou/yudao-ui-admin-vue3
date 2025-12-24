<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="申请信息">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="150px"
          v-loading="formLoading"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请人" prop="applyDate">
                <el-input v-model="nickname" placeholder="请选择申请人" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所在科室" prop="applyDate">
                <el-input v-model="deptName" placeholder="请选择所在科室" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="开始时间" prop="qxjStartDate">
                <el-row>
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
                <el-row>
                  <el-col :span="16">
                    <el-date-picker
                      v-model="formData.qxjEndDate"
                      type="date"
                      value-format="x"
                      placeholder="选择结束时间"
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
              <el-form-item label="请（休）假种类" prop="qxjType">
                <el-select v-model="formData.qxjType" placeholder="请选择请（休）假种类">
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
              <el-form-item label="共计天数" prop="totalTs">
                <el-input v-model="formData.totalTs" placeholder="请输入共计天数" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="事假理由" prop="sjReason">
            <el-input
              v-model="formData.sjReason"
              placeholder="请输入事假理由"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
            />
          </el-form-item>

          <el-form-item label="文件地址" prop="filepath">
            <UploadFile v-model="formData.filepath" />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="submitForm">
              确 定
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { leave, leaveApi } from '@/api/bpm/leave'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'

defineOptions({ name: 'BpmLeaveCreate' })

const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由

const formLoading = ref(false)

const formData = ref({
  id: undefined,
  applyDate: undefined,
  qxjStartDate: undefined,
  qxjEndDate: undefined,
  qxjType: undefined,
  sjReason: undefined,
  totalTs: 0,
  filepath: undefined, // 现在可以是数组或字符串
  startPeriod: undefined,
  endPeriod: undefined
})

const formRules = reactive({
  qxjStartDate: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
  qxjEndDate: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }],
  qxjType: [{ required: true, message: '请（休）假种类不能为空', trigger: 'change' }],
  sjReason: [{ required: true, message: '事假理由不能为空', trigger: 'blur' }]
})
const formRef = ref()

// 新增：需要上传文件的假种类型（病假2、婚假3、哺乳假5、探亲假7、独生子女陪护假11）
const requiredFileTypes = [2, 3, 5, 7, 11]

// 新增：根据假种动态设置文件上传必填规则
watch(
  () => formData.value.qxjType,
  (newVal) => {
    if (requiredFileTypes.includes(newVal)) {
      formRules.filepath = [{ required: true, message: '请上传必要文件', trigger: 'change' }]
    } else {
      delete formRules.filepath
    }
  },
  { immediate: true }
)

const processDefineKey = 'oa_leave' // 流程定义 Key
const startUserSelectTasks = ref([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

const AM = 1
const PM = 2

const duration = ref(0)
const errorMsg = ref('')

const getRoleLevel = (roleStr: string): number => {
  if (roleStr.startsWith('grade_')) {
    const parts = roleStr.split('_')
    // 取下划线后的部分转为数字
    return parseInt(parts[1]) || 0
  }
  return 1 // 非 grade 角色默认等级为 0
}

const maxPermissionRole = computed(() => {
  // 1. 过滤出只包含 grade_ 的角色
  const gradeRoles = userStore.roles.filter((r) => r.startsWith('grade_'))

  if (gradeRoles.length === 0) return 'grade_3'

  // 2. 通过比较等级找到最大的那个
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

// 核心：计算时长逻辑（已修改节假日处理逻辑）
const calculateDuration = () => {
  duration.value = 0
  errorMsg.value = ''

  if (!formData.value.qxjStartDate || !formData.value.qxjEndDate) return

  const start = dayjs(formData.value.qxjStartDate).startOf('day')
  const end = dayjs(formData.value.qxjEndDate).startOf('day')

  // 1. 基础校验：结束日期必须 >= 开始日期
  if (end.isBefore(start)) {
    errorMsg.value = '结束日期不能早于开始日期'
    return
  }

  // 2. 同一天的情况校验
  if (end.isSame(start)) {
    if (formData.value.startPeriod === PM && formData.value.endPeriod === AM) {
      errorMsg.value = '同一天内，结束时段不能早于开始时段'
      return
    }
  }

  // 3. 计算有效工作日天数（排除周末）
  let totalDays = 0
  let currentDate = start.clone()
  const isHoliday = (date: dayjs.Dayjs) => date.day() === 0 || date.day() === 6 // 周日或周六

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    // 跳过周末
    if (!isHoliday(currentDate)) {
      // 开始日期的特殊处理
      if (currentDate.isSame(start)) {
        if (formData.value.startPeriod === PM) {
          totalDays += 0.5
        } else {
          totalDays += 1
        }
      }
      // 结束日期的特殊处理
      else if (currentDate.isSame(end)) {
        if (formData.value.endPeriod === AM) {
          totalDays += 0.5
        } else {
          totalDays += 1
        }
      }
      // 中间日期
      else {
        totalDays += 1
      }
    }
    currentDate = currentDate.add(1, 'day')
  }

  duration.value = totalDays
  formData.value.totalTs = totalDays
}

const submitForm = async () => {
  // 1.1 校验表单
  if (!formRef) return
  calculateDuration()
  if (errorMsg.value) return

  // 1.2 审批相关：校验指定审批人
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
  // 2. 提交请求
  formLoading.value = true
  try {
    // 创建数据副本
    const data = { ...formData.value } as unknown as leave

    // 新增：将文件路径数组转换为逗号分隔的字符串
    if (Array.isArray(data.filepath)) {
      data.filepath = data.filepath.join(',')
    }

    // 审批相关：设置指定审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }
    await leaveApi.createleave(data)
    message.success('发起成功')
    // 关闭当前 Tab
    delView(unref(currentRoute))
    await push({ name: 'BpmOALeave' })
  } finally {
    formLoading.value = false
  }
}

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      // TODO 小北：可以支持 processDefinitionKey 查询
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({
        role_condition: maxPermissionRole.value,
        days_condition4: days_condition4.value,
        days_condition3: days_condition3.value
      }) // 解决 GET 无法传递对象的问题，后端 String 再转 JSON
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    // 获取审批节点，显示 Timeline 的数据
    activityNodes.value = data.activityNodes

    // 获取发起人自选的任务
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
    // 恢复之前的选择审批人
    if (startUserSelectTasks.value?.length > 0) {
      for (const node of startUserSelectTasks.value) {
        if (
          tempStartUserSelectAssignees.value[node.id] &&
          tempStartUserSelectAssignees.value[node.id].length > 0
        ) {
          startUserSelectAssignees.value[node.id] = tempStartUserSelectAssignees.value[node.id]
        } else {
          startUserSelectAssignees.value[node.id] = []
        }
      }
    }
  } finally {
  }
}

/** 审批相关：选择发起人 */
const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

/** 初始化 */
onMounted(async () => {
  // TODO @小北：这里可以简化，统一通过 getApprovalDetail 处理么？
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error('OA 请假的流程模型未配置，请检查！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  // 审批相关：加载最新的审批详情，主要用于节点预测
  await getApprovalDetail()

  const res = await getUserProfile()
  if (res.dept) {
    deptName.value = res.dept.name
  } else if (res.users && res.users.dept) {
    deptName.value = res.users.dept.name
  }
})

/** 审批相关：预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次, formData.value可改成实际业务中的特定字段 */
watch(
  formData.value,
  (newValue, oldValue) => {
    if (!oldValue) {
      return
    }
    if (newValue && Object.keys(newValue).length > 0) {
      // 记录之前的节点审批人
      tempStartUserSelectAssignees.value = startUserSelectAssignees.value
      startUserSelectAssignees.value = {}
      // 加载最新的审批详情,主要用于节点预测
      getApprovalDetail()
    }
  },
  {
    immediate: true
  }
)
watch(
  () => [
    formData.value.qxjStartDate,
    formData.value.qxjEndDate,
    formData.value.startPeriod,
    formData.value.endPeriod
  ],
  () => {
    calculateDuration()
  }
)
</script>

<style scoped lang="scss"></style>
