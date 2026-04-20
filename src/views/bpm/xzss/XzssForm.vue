<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1200px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <!-- <el-col :span="12">
          <el-form-item label="备用主键" prop="xmGuid">
            <el-input v-model="formData.xmGuid" placeholder="请输入备用主键" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="来文号" prop="swWh">
            <el-input v-model="formData.swWh" placeholder="请输入来文号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="来文机关" prop="swJg">
            <el-input v-model="formData.swJg" placeholder="请输入来文机关" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收文日期" prop="swRq">
            <el-date-picker
              v-model="formData.swRq"
              type="date"
              value-format="x"
              placeholder="选择收文日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="原告" prop="sqr">
            <el-input v-model="formData.sqr" placeholder="请输入原告" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被告" prop="bsqr">
            <el-input v-model="formData.bsqr" placeholder="请输入被告" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="第三人" prop="dsr">
            <el-input v-model="formData.dsr" placeholder="请输入第三人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="诉讼类型" prop="ssLx">
            <el-input v-model="formData.ssLx" placeholder="请输入诉讼类型" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="土地坐落" prop="tdZl">
        <div class="flex w-full gap-2">
          <el-select
            v-model="tdZlPart1"
            placeholder="镇街"
            style="width: 200px"
            filterable
            allow-create
            clearable
            @change="handleTdZlChange"
          >
            <el-option
              v-for="dict in getDictOptions(DICT_TYPE.BPM_LOCATION_STREET)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.label"
            />
          </el-select>
          <el-input
            v-model="tdZlPart2"
            placeholder="请输入具体坐落详情"
            @input="handleTdZlChange"
          />
        </div>
      </el-form-item>

      <el-row>
        <!-- <el-col :span="12">
          <el-form-item label="复议项目主键" prop="fyGuid">
            <el-input v-model="formData.fyGuid" placeholder="请输入复议项目主键" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="复议案号" prop="fyAh">
            <el-input v-model="formData.fyAh" placeholder="请输入复议案号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <!-- <el-col :span="12">
          <el-form-item label="上一审项目主键" prop="ssGuid">
            <el-input v-model="formData.ssGuid" placeholder="请输入上一审项目主键" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="上一审案号" prop="ssAh">
            <el-input v-model="formData.ssAh" placeholder="请输入上一审案号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="案件类别" prop="lb1">
            <el-select
              v-model="formData.lb1"
              placeholder="请选择案件类别"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS1)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="案件分类" prop="lb2">
            <el-select
              v-model="formData.lb2"
              placeholder="请选择案件分类"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS2)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="涉及事项" prop="lb3">
            <el-select
              v-model="formData.lb3"
              placeholder="请选择涉及事项"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS3)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="案件类型" prop="lb4">
            <el-select
              v-model="formData.lb4"
              placeholder="请选择案件类型"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS4)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="诉讼类别" prop="lb5">
            <el-select
              v-model="formData.lb5"
              placeholder="请选择诉讼类别"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS5)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="承办人" prop="cbr">
            <el-input v-model="formData.cbr" placeholder="请输入承办人" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="复议请求" prop="ssNr">
        <el-input v-model="formData.ssNr" type="textarea" :rows="2" placeholder="请输入复议请求" />
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="承办日期" prop="cbRq">
            <el-date-picker
              v-model="formData.cbRq"
              type="date"
              value-format="x"
              placeholder="选择承办日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="送法院日期" prop="sfyjgRq">
            <el-date-picker
              v-model="formData.sfyjgRq"
              type="date"
              value-format="x"
              placeholder="选择送法院日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="上诉人" prop="ssr">
            <el-input v-model="formData.ssr" placeholder="请输入上诉人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被上诉人" prop="bssr">
            <el-input v-model="formData.bssr" placeholder="请输入被上诉人" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="再审申请人" prop="zssqr">
            <el-input v-model="formData.zssqr" placeholder="请输入再审申请人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="再审被申请人" prop="zsbsqr">
            <el-input v-model="formData.zsbsqr" placeholder="请输入再审被申请人" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="监督监管" prop="issupervise">
            <el-input v-model="formData.issupervise" placeholder="请输入监督监管" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="办理时限" prop="zhubandate">
            <el-date-picker
              v-model="formData.zhubandate"
              type="date"
              value-format="x"
              placeholder="选择办理时限"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="诉讼内容" prop="ssnr">
        <el-input v-model="formData.ssnr" type="textarea" :rows="2" placeholder="请输入诉讼内容" />
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="是否已寄件提醒" prop="mailTip">
            <el-input v-model="formData.mailTip" placeholder="请输入是否已寄件提醒" />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="流程实例的编号" prop="processInstanceId">
            <el-input v-model="formData.processInstanceId" placeholder="请输入流程实例的编号" />
          </el-form-item>
        </el-col> -->
      </el-row>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="行政诉讼拓展" name="xzssKz">
        <XzssKzForm ref="xzssKzFormRef" :xm-guid="formData.id" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { XzssApi, Xzss } from '@/api/bpm/xzss'
import XzssKzForm from './components/XzssKzForm.vue'

/** 行政诉讼 表单 */
defineOptions({ name: 'XzssForm' })
import { DICT_TYPE, getDictOptions } from '@/utils/dict'

const tdZlPart1 = ref('')
const tdZlPart2 = ref('')

const handleTdZlChange = () => {
  formData.value.tdZl = (tdZlPart1.value || '') + (tdZlPart2.value || '')
  if (!tdZlPart1.value && !tdZlPart2.value) {
    formData.value.tdZl = undefined
  }
}

const parseTdZl = (fullPath: string) => {
  if (!fullPath) return
  const options = getDictOptions(DICT_TYPE.BPM_LOCATION_STREET)
  const match = options.find((opt) => fullPath.startsWith(opt.label))
  if (match) {
    tdZlPart1.value = match.label
    tdZlPart2.value = fullPath.substring(match.label.length)
  } else {
    tdZlPart1.value = ''
    tdZlPart2.value = fullPath
  }
}

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
  ssLx: undefined,
  fyGuid: undefined,
  fyAh: undefined,
  ssGuid: undefined,
  ssAh: undefined,
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  lb4: undefined,
  lb5: undefined,
  ssNr: undefined,
  cbr: undefined,
  cbRq: undefined,
  sfyjgRq: undefined,
  ssr: undefined,
  bssr: undefined,
  zssqr: undefined,
  zsbsqr: undefined,
  issupervise: undefined,
  zhubandate: undefined,
  ssnr: undefined,
  mailTip: undefined,
  processInstanceId: undefined
})
// const formRules = reactive({
//   xmGuid: [{ required: true, message: '备用主键不能为空', trigger: 'blur' }]
// })
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('xzssKz')
const xzssKzFormRef = ref()

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
      formData.value = await XzssApi.getXzss(id)
      parseTdZl(formData.value.tdZl)
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
    await xzssKzFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'xzssKz'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Xzss
    // 拼接子表的数据
    data.xzssKz = xzssKzFormRef.value.getData()
    if (formType.value === 'create') {
      await XzssApi.createXzss(data)
      message.success(t('common.createSuccess'))
    } else {
      await XzssApi.updateXzss(data)
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
    ssLx: undefined,
    fyGuid: undefined,
    fyAh: undefined,
    ssGuid: undefined,
    ssAh: undefined,
    lb1: undefined,
    lb2: undefined,
    lb3: undefined,
    lb4: undefined,
    lb5: undefined,
    ssNr: undefined,
    cbr: undefined,
    cbRq: undefined,
    sfyjgRq: undefined,
    ssr: undefined,
    bssr: undefined,
    zssqr: undefined,
    zsbsqr: undefined,
    issupervise: undefined,
    zhubandate: undefined,
    ssnr: undefined,
    mailTip: undefined,
    processInstanceId: undefined
  }
  tdZlPart1.value = ''
  tdZlPart2.value = ''
  formRef.value?.resetFields()
}
</script>
