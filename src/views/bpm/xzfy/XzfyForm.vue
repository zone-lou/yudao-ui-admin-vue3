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
      <el-form-item label="来文号" prop="swWh">
        <el-input v-model="formData.swWh" placeholder="请输入来文号" />
      </el-form-item>
      <el-form-item label="来文机关" prop="swJg">
        <el-input v-model="formData.swJg" placeholder="请输入来文机关" />
      </el-form-item>
      <el-form-item label="来文日期" prop="swRq">
        <el-date-picker
          v-model="formData.swRq"
          type="date"
          value-format="x"
          placeholder="选择来文日期"
        />
      </el-form-item>
      <el-form-item label="申请人" prop="sqr">
        <el-input v-model="formData.sqr" placeholder="请输入申请人" />
      </el-form-item>
      <el-form-item label="被申请人" prop="bsqr">
        <el-input v-model="formData.bsqr" placeholder="请输入被申请人" />
      </el-form-item>
      <el-form-item label="第三人" prop="dsr">
        <el-input v-model="formData.dsr" placeholder="请输入第三人" />
      </el-form-item>
      <el-form-item label="土地坐落" prop="tdZl">
        <el-input v-model="formData.tdZl" placeholder="请输入土地坐落" />
      </el-form-item>
      <el-form-item label="类别一" prop="lb1">
        <el-input v-model="formData.lb1" placeholder="请输入类别一" />
      </el-form-item>
      <el-form-item label="类别二" prop="lb2">
        <el-input v-model="formData.lb2" placeholder="请输入类别二" />
      </el-form-item>
      <el-form-item label="类别三" prop="lb3">
        <el-input v-model="formData.lb3" placeholder="请输入类别三" />
      </el-form-item>
      <el-form-item label="复议请求" prop="fyNr">
        <el-input v-model="formData.fyNr" placeholder="请输入复议请求" />
      </el-form-item>
      <el-form-item label="承办人" prop="cbr">
        <el-input v-model="formData.cbr" placeholder="请输入承办人" />
      </el-form-item>
      <el-form-item label="承办日期" prop="cbRq">
        <el-date-picker
          v-model="formData.cbRq"
          type="date"
          value-format="x"
          placeholder="选择承办日期"
        />
      </el-form-item>
      <el-form-item label="送复议机关日期" prop="sfyjgRq">
        <el-date-picker
          v-model="formData.sfyjgRq"
          type="date"
          value-format="x"
          placeholder="选择送复议机关日期"
        />
      </el-form-item>
      <el-form-item label="行政区（街道、村）" prop="xzq">
        <el-input v-model="formData.xzq" placeholder="请输入行政区（街道、村）" />
      </el-form-item>
      <el-form-item label="监督监管" prop="issupervise">
        <el-input v-model="formData.issupervise" placeholder="请输入监督监管" />
      </el-form-item>
      <el-form-item label="办理时限" prop="zhubandate">
        <el-date-picker
          v-model="formData.zhubandate"
          type="date"
          value-format="x"
          placeholder="选择办理时限"
        />
      </el-form-item>
      <el-form-item label="是否已寄件提醒" prop="mailTip">
        <el-input v-model="formData.mailTip" placeholder="请输入是否已寄件提醒" />
      </el-form-item>
      <el-form-item label="流程实例的编号" prop="processInstanceId">
        <el-input v-model="formData.processInstanceId" placeholder="请输入流程实例的编号" />
      </el-form-item>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="行政复议扩展" name="xzfyKz">
        <XzfyKzForm ref="xzfyKzFormRef" :xm-guid="formData.id" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { XzfyApi, Xzfy } from '@/api/bpm/xzfy'
import XzfyKzForm from './components/XzfyKzForm.vue'

/** 行政复议 表单 */
defineOptions({ name: 'XzfyForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  xmGuid: undefined,
  swWh: undefined,
  swJg: undefined,
  swRq: undefined,
  sqr: undefined,
  bsqr: undefined,
  dsr: undefined,
  tdZl: undefined,
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  fyNr: undefined,
  cbr: undefined,
  cbRq: undefined,
  sfyjgRq: undefined,
  xzq: undefined,
  issupervise: undefined,
  zhubandate: undefined,
  mailTip: undefined,
  processInstanceId: undefined
})
const formRules = reactive({
  xmGuid: [{ required: true, message: '备用主键不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('xzfyKz')
const xzfyKzFormRef = ref()

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
      formData.value = await XzfyApi.getXzfy(id)
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
  // 校验子表单
  try {
    await xzfyKzFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'xzfyKz'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Xzfy
    // 拼接子表的数据
    data.xzfyKz = xzfyKzFormRef.value.getData()
    if (formType.value === 'create') {
      await XzfyApi.createXzfy(data)
      message.success(t('common.createSuccess'))
    } else {
      await XzfyApi.updateXzfy(data)
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
    swWh: undefined,
    swJg: undefined,
    swRq: undefined,
    sqr: undefined,
    bsqr: undefined,
    dsr: undefined,
    tdZl: undefined,
    lb1: undefined,
    lb2: undefined,
    lb3: undefined,
    fyNr: undefined,
    cbr: undefined,
    cbRq: undefined,
    sfyjgRq: undefined,
    xzq: undefined,
    issupervise: undefined,
    zhubandate: undefined,
    mailTip: undefined,
    processInstanceId: undefined
  }
  formRef.value?.resetFields()
}
</script>