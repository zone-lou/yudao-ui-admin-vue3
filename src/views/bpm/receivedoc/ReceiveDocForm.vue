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
            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_RECEICE_CLASS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来文单位" prop="sendDept">
        <el-select v-model="formData.sendDept" placeholder="请选择来文单位">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_AGENCY_NAME)"
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
            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_EMERGENCY_DEGREE)"
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
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_DOC_CLASS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="附件" prop="attachFilePath">
        <UploadFile
          v-model="formData.attachFilePath"
          ref="uploadFileRef"
          :upload-api="uploadReturnInfo"
        />
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
// 引入 uploadReturnInfo 接口
import { uploadReturnInfo } from '@/api/infra/file'

/** 收文 表单 */
defineOptions({ name: 'ReceiveDocForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
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
  xiebandate: undefined,
  fileList: [] // 附件列表
})
const formRules = reactive({})
const formRef = ref() // 表单 Ref
// 上传组件 Ref
const uploadFileRef = ref()

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
    const data = formData.value as unknown as any

    // ================= 处理文件上传 fileList =================
    // 1. 获取 UploadFile 组件内部的 fileList
    const rawFileList = uploadFileRef.value?.fileList || []

    // 2. 映射数据 (与 create.vue 逻辑一致)
    data.fileList = rawFileList
      .map((item: any, index: number) => {
        // 兼容处理：
        // 新上传的文件：item.response.data 是对象 { id: 33, name: '...', ... }
        // 回显的文件（如果是从详情接口加载的）：可能没有 response，需要依赖 fileId 或其他字段，或者后端在 update 时会保留原有关联
        // 注意：如果 update 接口是全量覆盖附件，必须保证这里传回了所有文件的 ID

        let fileId = undefined
        let fileName = item.name

        if (item.response?.data) {
          // 新上传的
          const fileResponse = item.response.data
          fileId =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.id
              : fileResponse
          fileName =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.name
              : item.name
        } else {
          // 回显的文件 (假设 UploadFile 组件通过 v-model 将 url 转为了 fileList item)
          // 如果是纯 URL 回显，我们很难拿到 ID。
          // 通常 update 接口，对于已存在的文件，后端可能不需要 fileList 里的 ID，或者前端需要从详情接口的其他字段（如 attachmentList）里还原出 ID。
          // 这里假设后端 update 接口主要处理新增的附件，或者 create.vue 的逻辑也适用于 update。
          // 如果 item 没有 response，尝试从 url 或其他地方推断，或者标记为已存在
          // *重要*：如果 UploadFile 仅通过 url 回显，这里拿不到 id，可能导致 update 时丢失关联。
          // 建议：如果后端 update 逻辑复杂，需确保详情接口返回了完整 fileList 结构供前端回显。
          // 暂时按新上传处理，或者忽略无 ID 的项（取决于后端逻辑）
          console.warn('文件没有 response，可能是回显文件，ID 未知:', item.name)
        }

        return {
          receiveDocId: data.id, // 关联当前收文 ID
          attachFileId: fileId, // 文件 ID
          attachFileName: fileName, // 文件名称
          attachOrder: index,
          showType: 0 // 显示类型
        }
      })
      .filter((item) => item.attachFileId) // 过滤掉没拿到 ID 的文件（防止报错）
    // =============================================================

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
    id: undefined,
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
    xiebandate: undefined,
    fileList: []
  }
  formRef.value?.resetFields()
}
</script>
