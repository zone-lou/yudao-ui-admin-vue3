<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="申请人ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入申请人ID" />
      </el-form-item>
      <el-form-item label="申请人" prop="userName">
        <el-input v-model="formData.userName" placeholder="请输入申请人" />
      </el-form-item>
      <el-form-item label="申请人部门ID" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入申请人部门ID" />
      </el-form-item>
      <el-form-item label="申请人部门" prop="deptName">
        <el-input v-model="formData.deptName" placeholder="请输入申请人部门" />
      </el-form-item>
      <el-form-item label="申请日期" prop="applyDate">
        <el-date-picker
          v-model="formData.applyDate"
          type="date"
          value-format="x"
          placeholder="选择申请日期"
        />
      </el-form-item>
      <el-form-item label="会议时间" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          value-format="x"
          placeholder="选择会议时间"
        />
      </el-form-item>
      <el-form-item label="会议名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入会议名称" />
      </el-form-item>
      <el-form-item label="提议内容" prop="content">
        <Editor v-model="formData.content" height="150px" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="会议地点" prop="venue">
        <el-input v-model="formData.venue" placeholder="请输入会议地点" />
      </el-form-item>
      <el-form-item label="召集单位及召集人" prop="joinUnit">
        <el-input v-model="formData.joinUnit" placeholder="请输入召集单位及召集人" />
      </el-form-item>
      <el-form-item label="我局参会科室" prop="offerUnit">
        <el-input v-model="formData.offerUnit" placeholder="请输入我局参会科室" />
      </el-form-item>
      <el-form-item label="我局参会人员" prop="offerPerson">
        <el-input v-model="formData.offerPerson" placeholder="请输入我局参会人员" />
      </el-form-item>
      <el-form-item label="参会人员会议情况及建议" prop="situation">
        <el-input v-model="formData.situation" placeholder="请输入参会人员会议情况及建议" />
      </el-form-item>
      <el-form-item label="附件路径" prop="attachFilePath">
        <el-input v-model="formData.attachFilePath" placeholder="请输入附件路径" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ConfflowApi, Confflow } from '@/api/bpm/confflow'

/** 会议报告单 表单 */
defineOptions({ name: 'ConfflowForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  userName: undefined,
  deptId: undefined,
  deptName: undefined,
  applyDate: undefined,
  startDate: undefined,
  title: undefined,
  content: undefined,
  remark: undefined,
  venue: undefined,
  joinUnit: undefined,
  offerUnit: undefined,
  offerPerson: undefined,
  situation: undefined,
  attachFilePath: undefined
})
const formRules = reactive({
  startDate: [{ required: true, message: '会议时间不能为空', trigger: 'blur' }],
  title: [{ required: true, message: '会议名称不能为空', trigger: 'blur' }],
  venue: [{ required: true, message: '会议地点不能为空', trigger: 'blur' }]
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
      formData.value = await ConfflowApi.getConfflow(id)
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
    const data = formData.value as unknown as Confflow
    if (formType.value === 'create') {
      await ConfflowApi.createConfflow(data)
      message.success(t('common.createSuccess'))
    } else {
      await ConfflowApi.updateConfflow(data)
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
    userId: undefined,
    userName: undefined,
    deptId: undefined,
    deptName: undefined,
    applyDate: undefined,
    startDate: undefined,
    title: undefined,
    content: undefined,
    remark: undefined,
    venue: undefined,
    joinUnit: undefined,
    offerUnit: undefined,
    offerPerson: undefined,
    situation: undefined,
    attachFilePath: undefined
  }
  formRef.value?.resetFields()
}
</script>