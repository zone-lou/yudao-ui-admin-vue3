<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="150px"
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
      <el-form-item label="开始时间" prop="qxjStartDate">
        <el-date-picker
          v-model="formData.qxjStartDate"
          type="date"
          value-format="x"
          placeholder="选择开始时间"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="qxjEndDate">
        <el-date-picker
          v-model="formData.qxjEndDate"
          type="date"
          value-format="x"
          placeholder="选择结束时间"
        />
      </el-form-item>
      <el-form-item label="请假种类" prop="qxjType">
        <el-select v-model="formData.qxjType" placeholder="请选择请假种类">
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
      <el-form-item label="所在单位（科室）意见" prop="unitOpinion">
        <el-input v-model="formData.unitOpinion" placeholder="请输入所在单位（科室）意见" />
      </el-form-item>
      <el-form-item label="所在单位（科室）意见审核人" prop="unitOpinionShr">
        <el-input v-model="formData.unitOpinionShr" placeholder="请输入所在单位（科室）意见审核人" />
      </el-form-item>
      <el-form-item label="所在单位（科室）意见审核日期" prop="unitOpinionDate">
        <el-date-picker
          v-model="formData.unitOpinionDate"
          type="date"
          value-format="x"
          placeholder="选择所在单位（科室）意见审核日期"
        />
      </el-form-item>
      <el-form-item label="局办公室意见" prop="jbgsOpinion">
        <el-input v-model="formData.jbgsOpinion" placeholder="请输入局办公室意见" />
      </el-form-item>
      <el-form-item label="局办公室意见审核人" prop="jbgsOpinionShr">
        <el-input v-model="formData.jbgsOpinionShr" placeholder="请输入局办公室意见审核人" />
      </el-form-item>
      <el-form-item label="局办公室意见审核日期" prop="jbgsOpinionDate">
        <el-date-picker
          v-model="formData.jbgsOpinionDate"
          type="date"
          value-format="x"
          placeholder="选择局办公室意见审核日期"
        />
      </el-form-item>
      <el-form-item label="副局长意见" prop="fjzOpinion">
        <el-input v-model="formData.fjzOpinion" placeholder="请输入副局长意见" />
      </el-form-item>
      <el-form-item label="副局长意见审核人" prop="fjzOpinionShr">
        <el-input v-model="formData.fjzOpinionShr" placeholder="请输入副局长意见审核人" />
      </el-form-item>
      <el-form-item label="副局长意见审核日期" prop="fjzOpinionDate">
        <el-date-picker
          v-model="formData.fjzOpinionDate"
          type="date"
          value-format="x"
          placeholder="选择副局长意见审核日期"
        />
      </el-form-item>
      <el-form-item label="常务副局长意见" prop="cwfjzOpinion">
        <el-input v-model="formData.cwfjzOpinion" placeholder="请输入常务副局长意见" />
      </el-form-item>
      <el-form-item label="常务副局长意见审核人" prop="cwfjzOpinionShr">
        <el-input v-model="formData.cwfjzOpinionShr" placeholder="请输入常务副局长意见审核人" />
      </el-form-item>
      <el-form-item label="常务副局长意见审核日期" prop="cwfjzOpinionDate">
        <el-date-picker
          v-model="formData.cwfjzOpinionDate"
          type="date"
          value-format="x"
          placeholder="选择常务副局长意见审核日期"
        />
      </el-form-item>
      <el-form-item label="局长意见" prop="jzOpinion">
        <el-input v-model="formData.jzOpinion" placeholder="请输入局长意见" />
      </el-form-item>
      <el-form-item label="局长意见审核人" prop="jzOpinionShr">
        <el-input v-model="formData.jzOpinionShr" placeholder="请输入局长意见审核人" />
      </el-form-item>
      <el-form-item label="局长意见审核日期" prop="jzOpinionDate">
        <el-date-picker
          v-model="formData.jzOpinionDate"
          type="date"
          value-format="x"
          placeholder="选择局长意见审核日期"
        />
      </el-form-item>
      <el-form-item label="审批状态" prop="spzt">
        <el-input v-model="formData.spzt" placeholder="请输入审批状态" />
      </el-form-item>
      <el-form-item label="申请用户" prop="userid">
        <el-input v-model="formData.userid" placeholder="请输入申请用户" />
      </el-form-item>
      <el-form-item label="销假申请时间" prop="xjDate">
        <el-date-picker
          v-model="formData.xjDate"
          type="date"
          value-format="x"
          placeholder="选择销假申请时间"
        />
      </el-form-item>
      <el-form-item label="销假总天数" prop="xjTs">
        <el-input v-model="formData.xjTs" placeholder="请输入销假总天数" />
      </el-form-item>
      <el-form-item label="销假备注" prop="xjBz">
        <el-input v-model="formData.xjBz" placeholder="请输入销假备注" />
      </el-form-item>
      <el-form-item label="销假审批状态" prop="xjSpzt">
        <el-input v-model="formData.xjSpzt" placeholder="请输入销假审批状态" />
      </el-form-item>
      <el-form-item label="销假审批意见" prop="xjOption">
        <el-input v-model="formData.xjOption" placeholder="请输入销假审批意见" />
      </el-form-item>
      <el-form-item label="销假意见审核人" prop="xjOpinionShr">
        <el-input v-model="formData.xjOpinionShr" placeholder="请输入销假意见审核人" />
      </el-form-item>
      <el-form-item label="请假时间描述（当请休假时间修改的时候进行更新）" prop="dateDesc">
        <el-input v-model="formData.dateDesc" placeholder="请输入请假时间描述（当请休假时间修改的时候进行更新）" />
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
import { VacationrecordApi, Vacationrecord } from '@/api/bpm/vacationrecord'

/** 假期申请审批 表单 */
defineOptions({ name: 'VacationrecordForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  applyDate: undefined,
  qxjStartDate: undefined,
  qxjEndDate: undefined,
  qxjType: undefined,
  sjReason: undefined,
  totalTs: undefined,
  unitOpinion: undefined,
  unitOpinionShr: undefined,
  unitOpinionDate: undefined,
  jbgsOpinion: undefined,
  jbgsOpinionShr: undefined,
  jbgsOpinionDate: undefined,
  fjzOpinion: undefined,
  fjzOpinionShr: undefined,
  fjzOpinionDate: undefined,
  cwfjzOpinion: undefined,
  cwfjzOpinionShr: undefined,
  cwfjzOpinionDate: undefined,
  jzOpinion: undefined,
  jzOpinionShr: undefined,
  jzOpinionDate: undefined,
  spzt: undefined,
  userid: undefined,
  xjDate: undefined,
  xjTs: undefined,
  xjBz: undefined,
  xjSpzt: undefined,
  xjOption: undefined,
  xjOpinionShr: undefined,
  dateDesc: undefined
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
      formData.value = await VacationrecordApi.getVacationrecord(id)
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
    const data = formData.value as unknown as Vacationrecord
    if (formType.value === 'create') {
      await VacationrecordApi.createVacationrecord(data)
      message.success(t('common.createSuccess'))
    } else {
      await VacationrecordApi.updateVacationrecord(data)
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
    applyDate: undefined,
    qxjStartDate: undefined,
    qxjEndDate: undefined,
    qxjType: undefined,
    sjReason: undefined,
    totalTs: undefined,
    unitOpinion: undefined,
    unitOpinionShr: undefined,
    unitOpinionDate: undefined,
    jbgsOpinion: undefined,
    jbgsOpinionShr: undefined,
    jbgsOpinionDate: undefined,
    fjzOpinion: undefined,
    fjzOpinionShr: undefined,
    fjzOpinionDate: undefined,
    cwfjzOpinion: undefined,
    cwfjzOpinionShr: undefined,
    cwfjzOpinionDate: undefined,
    jzOpinion: undefined,
    jzOpinionShr: undefined,
    jzOpinionDate: undefined,
    spzt: undefined,
    userid: undefined,
    xjDate: undefined,
    xjTs: undefined,
    xjBz: undefined,
    xjSpzt: undefined,
    xjOption: undefined,
    xjOpinionShr: undefined,
    dateDesc: undefined
  }
  formRef.value?.resetFields()
}
</script>
