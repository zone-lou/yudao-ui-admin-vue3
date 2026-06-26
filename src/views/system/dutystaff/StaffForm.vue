<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="520">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="值班日期" prop="dutyDate">
        <el-date-picker
          v-model="formData.dutyDate"
          type="date"
          value-format="x"
          placeholder="选择值班日期"
          class="!w-full"
        />
      </el-form-item>
      <el-form-item label="人员类型" prop="staffType">
        <el-select v-model="formData.staffType" placeholder="请选择人员类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.DUTY_STAFF_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="人员" prop="userId">
        <el-select
          v-model="formData.userId"
          clearable
          filterable
          placeholder="请输入人员"
          @change="handleUserChange"
          class="!w-full"
        >
          <el-option-group
            v-for="group in groupedUserList"
            :key="group.deptName"
            :label="group.deptName"
          >
            <el-option
              v-for="item in group.users"
              :key="item.id"
              :label="formatUserLabel(item)"
              :value="item.id"
            />
          </el-option-group>
        </el-select>
      </el-form-item>
      <!--      <el-form-item label="人员姓名" prop="staffName">-->
      <!--        <el-input v-model="formData.staffName" placeholder="请输入人员姓名" />-->
      <!--      </el-form-item>-->
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { StaffApi, Staff } from '@/api/system/dutystaff'

import * as UserApi from '@/api/system/user'

type DutyUser = UserApi.UserVO & {
  deptName?: string
}

const userList = ref<DutyUser[]>([])

/** 值班 表单 */
defineOptions({ name: 'StaffForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  dutyDate: undefined,
  staffType: undefined,
  userId: undefined,
  staffName: undefined,
  smsCount: undefined
})
const formRules = reactive({})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await StaffApi.getStaff(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Staff
    if (formType.value === 'create') {
      await StaffApi.createStaff(data)
      message.success(t('common.createSuccess'))
    } else {
      await StaffApi.updateStaff(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleUserChange = (userId: number) => {
  // 如果清空了选择，也同步清空姓名
  if (!userId) {
    formData.value.staffName = undefined
    return
  }
  // 从 userList 中找到选中的用户，并将 nickname 赋值给 staffName
  const selectedUser = userList.value.find((item) => item.id === userId)
  if (selectedUser) {
    formData.value.staffName = selectedUser.nickname as any
  }
}

const formatUserLabel = (user: DutyUser) => {
  return user.deptName ? `${user.nickname}(${user.deptName})` : user.nickname
}

const groupedUserList = computed(() => {
  const deptMap = new Map<string, DutyUser[]>()
  userList.value.forEach((user) => {
    const deptName = user.deptName || '无部门'
    const users = deptMap.get(deptName) || []
    users.push(user)
    deptMap.set(deptName, users)
  })

  return Array.from(deptMap.entries())
    .sort(([deptNameA], [deptNameB]) => deptNameA.localeCompare(deptNameB, 'zh-CN'))
    .map(([deptName, users]) => ({
      deptName,
      users: users.sort((userA, userB) => userA.nickname.localeCompare(userB.nickname, 'zh-CN'))
    }))
})

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    dutyDate: undefined,
    staffType: undefined,
    userId: undefined,
    staffName: undefined,
    smsCount: undefined
  }
  formRef.value?.resetFields()
}

/** 初始化 **/
onMounted(async () => {
  // 加载用户列表
  const users = await UserApi.getSimpleUserList()
  userList.value = users.filter((user) => user.status === 0)
})
</script>
