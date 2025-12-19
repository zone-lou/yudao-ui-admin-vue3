<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="单位类别" prop="docClass">
        <el-select v-model="formData.docClass" placeholder="请选择单位类别">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.RECEIVE_CLASS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来文单位" prop="sendDept">
        <el-select v-model="formData.sendDept" placeholder="请选择来文单位">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.AGENCY_NAME)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来文字号" prop="sendDocNumber">
        <el-input v-model="formData.sendDocNumber" placeholder="请输入来文字号" />
      </el-form-item>
      <el-form-item label="收文编号" prop="receiveDocNumber">
        <el-input v-model="formData.receiveDocNumber" placeholder="请输入收文编号" />
      </el-form-item>
      <el-form-item label="收文日期" prop="receiveTime">
        <el-date-picker
          v-model="formData.receiveTime"
          type="date"
          value-format="x"
          placeholder="选择收文日期"
        />
      </el-form-item>
      <el-form-item label="主题" prop="subject">
        <el-input v-model="formData.subject" placeholder="请输入主题" />
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgencyDegree">
        <el-select v-model="formData.urgencyDegree" placeholder="请选择紧急程度">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.EMERGENCY_DEGREE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="文件类别" prop="docSecondClass">
        <el-select v-model="formData.docSecondClass" placeholder="请选择文件类别">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.DOC_CLASS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="附件路径" prop="attachFilePath">
        <el-input v-model="formData.attachFilePath" placeholder="请输入附件路径" />
      </el-form-item>
      <el-form-item label="主办办结时间" prop="zhubandate">
        <el-date-picker
          v-model="formData.zhubandate"
          type="date"
          value-format="x"
          placeholder="选择主办办结时间"
        />
      </el-form-item>
      <el-form-item label="协办办结时间" prop="xiebandate">
        <el-date-picker
          v-model="formData.xiebandate"
          type="date"
          value-format="x"
          placeholder="选择协办办结时间"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { ReceiveDocApi, ReceiveDoc } from '@/api/bpm/receivedoc'

/** 收文 表单 */
defineOptions({ name: 'ReceiveDocForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  docClass: undefined,
  sendDept: undefined,
  sendDocNumber: undefined,
  receiveDocNumber: undefined,
  receiveTime: undefined,
  subject: undefined,
  urgencyDegree: undefined,
  remark: undefined,
  docSecondClass: undefined,
  attachFilePath: undefined,
  zhubandate: undefined,
  xiebandate: undefined
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
      formData.value = await ReceiveDocApi.getReceiveDoc(id)
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
    const data = formData.value as unknown as ReceiveDoc
    if (formType.value === 'create') {
      await ReceiveDocApi.createReceiveDoc(data)
      message.success(t('common.createSuccess'))
    } else {
      await ReceiveDocApi.updateReceiveDoc(data)
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
    docClass: undefined,
    sendDept: undefined,
    sendDocNumber: undefined,
    receiveDocNumber: undefined,
    receiveTime: undefined,
    subject: undefined,
    urgencyDegree: undefined,
    remark: undefined,
    docSecondClass: undefined,
    attachFilePath: undefined,
    zhubandate: undefined,
    xiebandate: undefined
  }
  formRef.value?.resetFields()
}
</script>