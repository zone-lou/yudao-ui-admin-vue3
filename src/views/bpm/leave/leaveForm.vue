<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="申请时间" prop="applyDate">
        <el-date-picker
          v-model="formData.applyDate"
          type="date"
          value-format="x"
          placeholder="选择申请时间"
        />
      </el-form-item>
      <el-form-item label="开始时间(请假时间段中最小的时间)" prop="qxjStartDate">
        <el-date-picker
          v-model="formData.qxjStartDate"
          type="date"
          value-format="x"
          placeholder="选择开始时间(请假时间段中最小的时间)"
        />
      </el-form-item>
      <el-form-item label="结束时间(请假时间段中最大的时间)" prop="qxjEndDate">
        <el-date-picker
          v-model="formData.qxjEndDate"
          type="date"
          value-format="x"
          placeholder="选择结束时间(请假时间段中最大的时间)"
        />
      </el-form-item>
      <el-form-item label="请（休）假种类" prop="qxjType">
        <el-select v-model="formData.qxjType" placeholder="请选择请（休）假种类">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEAVE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事假理由" prop="sjReason">
        <el-input v-model="formData.sjReason" placeholder="请输入事假理由" />
      </el-form-item>
      <el-form-item label="共计天数" prop="totalTs">
        <el-input v-model="formData.totalTs" placeholder="请输入共计天数" />
      </el-form-item>
      <el-form-item label="审批状态" prop="spzt">
        <el-input v-model="formData.spzt" placeholder="请输入审批状态" />
      </el-form-item>
      <el-form-item label="申请用户" prop="userid">
        <el-input v-model="formData.userid" placeholder="请输入申请用户" />
      </el-form-item>
      <el-form-item label="文件地址" prop="filepath">
        <UploadFile v-model="formData.filepath" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { leaveApi, leave } from '@/api/bpm/leave'

/** 假期申请审批 表单 */
defineOptions({ name: 'LeaveForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  applyDate: undefined,
  qxjStartDate: undefined,
  qxjEndDate: undefined,
  qxjType: undefined,
  sjReason: undefined,
  totalTs: undefined,
  spzt: undefined,
  userid: undefined,
  filepath: undefined
})
const formRules = reactive({
})
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
      formData.value = await leaveApi.getleave(id)
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
    const data = formData.value as unknown as leave
    if (formType.value === 'create') {
      await leaveApi.createleave(data)
      message.success(t('common.createSuccess'))
    } else {
      await leaveApi.updateleave(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    applyDate: undefined,
    qxjStartDate: undefined,
    qxjEndDate: undefined,
    qxjType: undefined,
    sjReason: undefined,
    totalTs: undefined,
    spzt: undefined,
    userid: undefined,
    filepath: undefined
  }
  formRef.value?.resetFields()
}
</script>