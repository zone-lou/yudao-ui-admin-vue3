<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    v-loading="formLoading"
  >
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
</template>
<script setup lang="ts">
import { XzfyApi } from '@/api/bpm/xzfy'

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
      processInstanceId: undefined,
    }
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      const data = await XzfyApi.getXzfyKzByXmGuid(val)
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