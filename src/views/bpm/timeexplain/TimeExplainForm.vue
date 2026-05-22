<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="登记时间" prop="checkDate">
        <el-date-picker
          v-model="formData.checkDate"
          type="date"
          value-format="x"
          placeholder="选择登记时间"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="checkBegin">
        <el-date-picker
          v-model="formData.checkBegin"
          type="date"
          value-format="x"
          placeholder="选择开始时间"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="checkEnd">
        <el-date-picker
          v-model="formData.checkEnd"
          type="date"
          value-format="x"
          placeholder="选择结束时间"
        />
      </el-form-item>
      <el-form-item label="原因说明" prop="reason">
        <el-input v-model="formData.reason" placeholder="请输入原因说明" />
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择审核状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_TASK_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="请假天数" prop="days">
        <el-input v-model="formData.days" placeholder="请输入请假天数" />
      </el-form-item>
      <el-form-item label="文件路径" prop="filepath">
        <el-input v-model="formData.filepath" placeholder="请输入文件路径" />
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
import { TimeExplainApi, TimeExplain } from '@/api/bpm/timeexplain'

/** 外出请假补假 表单 */
defineOptions({ name: 'TimeExplainForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  checkDate: undefined,
  checkBegin: undefined,
  checkEnd: undefined,
  reason: undefined,
  status: undefined,
  days: undefined,
  filepath: undefined
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
      formData.value = await TimeExplainApi.getTimeExplain(id)
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
    const data = formData.value as unknown as TimeExplain
    if (formType.value === 'create') {
      await TimeExplainApi.createTimeExplain(data)
      message.success(t('common.createSuccess'))
    } else {
      await TimeExplainApi.updateTimeExplain(data)
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
    checkDate: undefined,
    checkBegin: undefined,
    checkEnd: undefined,
    reason: undefined,
    status: undefined,
    days: undefined,
    filepath: undefined
  }
  formRef.value?.resetFields()
}
</script>
