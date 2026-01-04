<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    v-loading="formLoading"
  >
     <el-form-item label="裁定判决日期" prop="cdpjRq">
      <el-date-picker
        v-model="formData.cdpjRq"
        type="date"
        value-format="x"
        placeholder="选择裁定判决日期"
      />
    </el-form-item>
    <el-form-item label="建议函日期" prop="jyhRq">
      <el-date-picker
        v-model="formData.jyhRq"
        type="date"
        value-format="x"
        placeholder="选择建议函日期"
      />
    </el-form-item>
    <el-form-item label="建议函内容" prop="jyhNr">
      <el-input v-model="formData.jyhNr" placeholder="请输入建议函内容" />
    </el-form-item>
    <el-form-item label="转业务科室日期" prop="zksRq">
      <el-date-picker
        v-model="formData.zksRq"
        type="date"
        value-format="x"
        placeholder="选择转业务科室日期"
      />
    </el-form-item>
    <el-form-item label="判决结果" prop="pjJg">
      <el-input v-model="formData.pjJg" placeholder="请输入判决结果" />
    </el-form-item>
    <el-form-item label="裁定结果" prop="cdJg">
      <el-input v-model="formData.cdJg" placeholder="请输入裁定结果" />
    </el-form-item>
    <el-form-item label="行政赔偿（单位：元）" prop="xzPc">
      <el-input v-model="formData.xzPc" placeholder="请输入行政赔偿（单位：元）" />
    </el-form-item>
    <el-form-item label="执行情况" prop="zxQk">
      <el-input v-model="formData.zxQk" placeholder="请输入执行情况" />
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
    <el-form-item label="装订情况" prop="zdQk">
      <el-input v-model="formData.zdQk" placeholder="请输入装订情况" />
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
    <el-form-item label="移交情况" prop="yjQk">
      <el-input v-model="formData.yjQk" placeholder="请输入移交情况" />
    </el-form-item>
    <el-form-item label="备注" prop="bz">
      <el-input v-model="formData.bz" placeholder="请输入备注" />
    </el-form-item>
    <el-form-item label="开庭日期" prop="ktRq">
      <el-date-picker
        v-model="formData.ktRq"
        type="date"
        value-format="x"
        placeholder="选择开庭日期"
      />
    </el-form-item>
    <el-form-item label="流程实例的编号" prop="processInstanceId">
      <el-input v-model="formData.processInstanceId" placeholder="请输入流程实例的编号" />
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { XzssApi } from '@/api/bpm/xzss'

const props = defineProps<{
  xmGuid: number // 备用主键（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref<any>({})
const formRules = reactive({
  xmGuid: [{ required: true, message: '备用主键不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.xmGuid,
  async (val) => {
    // 1. 重置表单
    formData.value = {
      id: undefined,
      xmGuid: undefined,
      cdpjRq: undefined,
      jyhRq: undefined,
      jyhNr: undefined,
      zksRq: undefined,
      pjJg: undefined,
      cdJg: undefined,
      xzPc: undefined,
      zxQk: undefined,
      zdr: undefined,
      zdRq: undefined,
      zdQk: undefined,
      yjr: undefined,
      yjRq: undefined,
      yjQk: undefined,
      bz: undefined,
      ktRq: undefined,
      processInstanceId: undefined,
    }
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      const data = await XzssApi.getXzssKzByXmGuid(val)
      if (!data) {
        return
      }
      formData.value = data
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}

/** 表单值 */
const getData = () => {
  return formData.value
}

defineExpose({ validate, getData })
</script>