<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="备用主键" prop="xmGuid">
        <el-input v-model="formData.xmGuid" placeholder="请输入备用主键" />
      </el-form-item>
      <el-form-item label="复议决定日期" prop="fyjdRq">
        <el-date-picker
          v-model="formData.fyjdRq"
          type="date"
          value-format="x"
          placeholder="选择复议决定日期"
        />
      </el-form-item>
      <el-form-item label="复议结果：0撤销，1维持" prop="fyJg">
        <el-input v-model="formData.fyJg" placeholder="请输入复议结果：0撤销，1维持" />
      </el-form-item>
      <el-form-item label="转业务科室日期" prop="zksRq">
        <el-date-picker
          v-model="formData.zksRq"
          type="date"
          value-format="x"
          placeholder="选择转业务科室日期"
        />
      </el-form-item>
      <el-form-item label="意见书文号" prop="yjsWh">
        <el-input v-model="formData.yjsWh" placeholder="请输入意见书文号" />
      </el-form-item>
      <el-form-item label="意见书日期" prop="yjsRq">
        <el-date-picker
          v-model="formData.yjsRq"
          type="date"
          value-format="x"
          placeholder="选择意见书日期"
        />
      </el-form-item>
      <el-form-item label="行政赔偿，单位：元" prop="xzPc">
        <el-input v-model="formData.xzPc" placeholder="请输入行政赔偿，单位：元" />
      </el-form-item>
      <el-form-item label="执行情况" prop="zxQk">
        <el-input v-model="formData.zxQk" placeholder="请输入执行情况" />
      </el-form-item>
      <el-form-item label="是否装订：0否，1是" prop="sfZd">
        <el-input v-model="formData.sfZd" placeholder="请输入是否装订：0否，1是" />
      </el-form-item>
      <el-form-item label="装订人" prop="zdr">
        <el-input v-model="formData.zdr" placeholder="请输入装订人" />
      </el-form-item>
      <el-form-item label="装订日期" prop="zdRq">
        <el-date-picker
          v-model="formData.zdRq"
          type="date"
          value-format="x"
          placeholder="选择装订日期"
        />
      </el-form-item>
      <el-form-item label="是否移交：0否，1是" prop="sfYj">
        <el-input v-model="formData.sfYj" placeholder="请输入是否移交：0否，1是" />
      </el-form-item>
      <el-form-item label="移交人" prop="yjr">
        <el-input v-model="formData.yjr" placeholder="请输入移交人" />
      </el-form-item>
      <el-form-item label="移交日期" prop="yjRq">
        <el-date-picker
          v-model="formData.yjRq"
          type="date"
          value-format="x"
          placeholder="选择移交日期"
        />
      </el-form-item>
      <el-form-item label="备注" prop="bz">
        <el-input v-model="formData.bz" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="意见书内容" prop="yjsNr">
        <el-input v-model="formData.yjsNr" placeholder="请输入意见书内容" />
      </el-form-item>
      <el-form-item label="听证日期" prop="tzRq">
        <el-date-picker
          v-model="formData.tzRq"
          type="date"
          value-format="x"
          placeholder="选择听证日期"
        />
      </el-form-item>
      <el-form-item label="流程实例的编号" prop="processInstanceId">
        <el-input v-model="formData.processInstanceId" placeholder="请输入流程实例的编号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { XzfyKzApi, XzfyKz } from '@/api/bpm/xzfykz'

/** 行政复议扩展 表单 */
defineOptions({ name: 'XzfyKzForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  xmGuid: undefined,
  fyjdRq: undefined,
  fyJg: undefined,
  zksRq: undefined,
  yjsWh: undefined,
  yjsRq: undefined,
  xzPc: undefined,
  zxQk: undefined,
  sfZd: undefined,
  zdr: undefined,
  zdRq: undefined,
  sfYj: undefined,
  yjr: undefined,
  yjRq: undefined,
  bz: undefined,
  yjsNr: undefined,
  tzRq: undefined,
  processInstanceId: undefined
})
const formRules = reactive({
  xmGuid: [{ required: true, message: '备用主键不能为空', trigger: 'blur' }]
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
      formData.value = await XzfyKzApi.getXzfyKz(id)
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
    const data = formData.value as unknown as XzfyKz
    if (formType.value === 'create') {
      await XzfyKzApi.createXzfyKz(data)
      message.success(t('common.createSuccess'))
    } else {
      await XzfyKzApi.updateXzfyKz(data)
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
    xmGuid: undefined,
    fyjdRq: undefined,
    fyJg: undefined,
    zksRq: undefined,
    yjsWh: undefined,
    yjsRq: undefined,
    xzPc: undefined,
    zxQk: undefined,
    sfZd: undefined,
    zdr: undefined,
    zdRq: undefined,
    sfYj: undefined,
    yjr: undefined,
    yjRq: undefined,
    bz: undefined,
    yjsNr: undefined,
    tzRq: undefined,
    processInstanceId: undefined
  }
  formRef.value?.resetFields()
}
</script>