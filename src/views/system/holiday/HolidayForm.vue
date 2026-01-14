<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" :width="400">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="设置日期" prop="settingDate">
        <el-date-picker
          v-model="formData.settingDate"
          type="date"
          value-format="x"
          placeholder="选择设置日期"
        />
      </el-form-item>
      <el-form-item label="是否是工作日" prop="isworkday">
        <el-select v-model="formData.isworkday" placeholder="请选择是否是工作日">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.INFRA_BOOLEAN_INT)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="假日描述" prop="holiDesc">
        <el-input v-model="formData.holiDesc" placeholder="请输入假日描述" />
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
import { HolidayApi, Holiday } from '@/api/system/holiday'

/** 节假日 表单 */
defineOptions({ name: 'HolidayForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  settingDate: undefined,
  isworkday: undefined,
  holiDesc: undefined
})
const formRules = reactive({
  settingDate: [{ required: true, message: '设置日期不能为空', trigger: 'blur' }],
  isworkday: [{ required: true, message: '是否是工作日不能为空', trigger: 'change' }]
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
      formData.value = await HolidayApi.getHoliday(id)
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
    const data = formData.value as unknown as Holiday
    if (formType.value === 'create') {
      await HolidayApi.createHoliday(data)
      message.success(t('common.createSuccess'))
    } else {
      await HolidayApi.updateHoliday(data)
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
    settingDate: undefined,
    isworkday: undefined,
    holiDesc: undefined
  }
  formRef.value?.resetFields()
}
</script>
