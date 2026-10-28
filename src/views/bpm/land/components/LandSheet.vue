<template>
  <article class="land-sheet">
    <div v-if="$slots.toolbar" class="sheet-toolbar">
      <slot name="toolbar"></slot>
    </div>
    <header class="sheet-heading">
      <h1>义乌市自然资源和规划局土地用途认定阅办单</h1>
    </header>
    <el-form :ref="setFormRef" :model="modelValue" :rules="rules" label-width="0">
      <table class="sheet-table">
        <colgroup>
          <col class="label-column" />
          <col />
          <col class="label-column" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th scope="row">发起单位</th>
            <td>登记中心</td>
            <th scope="row">登记日期</th>
            <td>{{ formatDate(modelValue.applyDate) }}</td>
          </tr>
          <tr>
            <th scope="row">发起人</th>
            <td>{{ modelValue.startUserName || '—' }}</td>
            <th scope="row">所属科室</th>
            <td>{{ modelValue.deptName || '—' }}</td>
          </tr>
          <tr>
            <th scope="row"><span v-if="editable" class="required">*</span>项目名称</th>
            <td colspan="3">
              <el-form-item v-if="editable" prop="projectName">
                <el-input
                  :model-value="modelValue.projectName"
                  aria-label="项目名称"
                  placeholder="请输入项目名称"
                  maxlength="200"
                  @update:model-value="patch({ projectName: $event })"
                />
              </el-form-item>
              <div v-else class="text-value">{{ modelValue.projectName || '—' }}</div>
            </td>
          </tr>
          <tr>
            <th scope="row"><span v-if="editable" class="required">*</span>坐落</th>
            <td colspan="3">
              <el-form-item v-if="editable" prop="location">
                <el-input
                  :model-value="modelValue.location"
                  aria-label="坐落"
                  placeholder="请输入土地坐落"
                  maxlength="500"
                  @update:model-value="patch({ location: $event })"
                />
              </el-form-item>
              <div v-else class="text-value">{{ modelValue.location || '—' }}</div>
            </td>
          </tr>
          <tr>
            <th scope="row">科室意见</th>
            <td colspan="3" class="opinion-cell">
              <el-input
                v-if="editable"
                :model-value="modelValue.deptOpinion"
                aria-label="科室意见"
                placeholder="请输入发起科室意见"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 10 }"
                maxlength="4000"
                show-word-limit
                @update:model-value="patch({ deptOpinion: $event })"
              />
              <div v-else class="text-value">{{ modelValue.deptOpinion || '—' }}</div>
            </td>
          </tr>
          <tr>
            <th scope="row">附件</th>
            <td colspan="3">
              <div class="screen-attachments">
                <UploadFile
                  :ref="setUploadRef"
                  :model-value="modelValue.filepath"
                  :disabled="!editable"
                  :upload-api="uploadReturnInfo"
                  @update:model-value="patch({ filepath: String($event || '') })"
                />
                <span v-if="!editable && !modelValue.fileList.length" class="empty-text"
                  >无附件</span
                >
              </div>
              <div class="print-attachments">{{
                modelValue.fileList.map((file) => file.fileName).join('、') || '无附件'
              }}</div>
            </td>
          </tr>
          <slot></slot>
        </tbody>
      </table>
    </el-form>
  </article>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { FormInstance, FormRules, UploadUserFile } from 'element-plus'
import dayjs from 'dayjs'
import { UploadFile } from '@/components/UploadFile'
import { uploadReturnInfo } from '@/api/infra/file'
import type { LandAttachment, LandRecord } from '@/api/bpm/land'

const props = withDefaults(defineProps<{ modelValue: LandRecord; editable?: boolean }>(), {
  editable: false
})
const emit = defineEmits<{ 'update:modelValue': [value: LandRecord] }>()
const formRef = ref<FormInstance>()
const uploadRef = ref<InstanceType<typeof UploadFile>>()
const setFormRef = (element: Element | ComponentPublicInstance | null) => {
  formRef.value = element as FormInstance | undefined
}
const setUploadRef = (element: Element | ComponentPublicInstance | null) => {
  uploadRef.value = element as InstanceType<typeof UploadFile> | undefined
}
const patch = (value: Partial<LandRecord>) =>
  emit('update:modelValue', { ...props.modelValue, ...value })
const formatDate = (value: number | string) => (value ? dayjs(value).format('YYYY年MM月DD日') : '—')
const rules: FormRules = {
  projectName: [{ required: true, whitespace: true, message: '请填写项目名称', trigger: 'blur' }],
  location: [{ required: true, whitespace: true, message: '请填写坐落', trigger: 'blur' }]
}

watch(
  () => props.modelValue.fileList,
  async (files) => {
    await nextTick()
    if (uploadRef.value) {
      uploadRef.value.fileList = files.map((file) => ({
        name: file.fileName,
        url: file.fileUrl || file.filePath,
        status: 'success',
        id: file.id,
        attachFileId: file.attachFileId,
        response: {
          data: {
            id: file.attachFileId,
            name: file.fileName,
            url: file.fileUrl || file.filePath,
            path: file.filePath
          }
        }
      }))
    }
  },
  { immediate: true }
)

type UploadedFile = UploadUserFile & { id?: number; attachFileId?: number }
const getFiles = (): LandAttachment[] =>
  (uploadRef.value?.fileList || []).map((raw) => {
    const file = raw as UploadedFile
    const response = file.response as
      | { data?: { id?: number; name?: string; path?: string; url?: string } }
      | undefined
    const data = response?.data
    const attachFileId = data?.id || file.attachFileId
    if (!attachFileId) throw new Error(`附件“${file.name}”缺少文件编号，请重新上传`)
    const fileName = data?.name || file.name
    return {
      id: file.id,
      attachFileId,
      fileName,
      filePath: data?.path || data?.url || file.url || '',
      fileExtension: fileName.split('.').pop() || ''
    }
  })
const validate = async () => {
  const files = uploadRef.value?.fileList || []
  if (files.some((file) => file.status === 'ready' || file.status === 'uploading'))
    throw new Error('附件正在上传，请稍后再操作')
  if (files.some((file) => file.status === 'fail'))
    throw new Error('有附件上传失败，请重新上传或移除后再操作')
  return await formRef.value?.validate().catch(() => false)
}
defineExpose({ validate, getFiles })
</script>

<style scoped>
.land-sheet {
  width: 1040px;
  max-width: 100%;
  min-height: 1123px;
  padding: 40px 45px;
  margin: 20px auto;
  font-family: SimSun, 'Songti SC', STSong, serif;
  color: #333;
  background: #fff;
  box-shadow: 0 4px 16px rgb(0 0 0 / 15%);
  box-sizing: border-box;
}

.sheet-heading {
  margin-bottom: 24px;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 30px;
  font-weight: bold;
  line-height: 1.5;
  letter-spacing: 1px;
  color: #b1351e;
}

.sheet-table {
  width: 100%;
  font-size: 17px;
  border: 1px solid #8cb4e0;
  border-collapse: collapse;
  table-layout: fixed;
}

.label-column {
  width: 160px;
}

.sheet-table :deep(th),
.sheet-table :deep(td) {
  padding: 18px 14px;
  font-size: 17px;
  line-height: 1.6;
  border: 1px solid #8cb4e0;
  overflow-wrap: anywhere;
}

.sheet-table :deep(th) {
  padding: 16px 6px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  background: #dbe9f8;
}

.sheet-table :deep(.el-form-item) {
  margin-bottom: 0;
}

.sheet-table :deep(.el-form-item__error) {
  position: absolute;
  top: -20px;
  left: 0;
  z-index: 1000;
  padding: 2px 8px;
  font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 11px;
  font-weight: normal;
  line-height: 1.2;
  color: #fff;
  white-space: nowrap;
  pointer-events: none;
  background: #f56c6c;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 20%);
}

.sheet-table :deep(.el-form-item__error)::after {
  position: absolute;
  top: 100%;
  left: 10px;
  display: block;
  border-color: #f56c6c transparent transparent;
  border-style: solid;
  border-width: 4px 4px 0;
  content: '';
}

.sheet-table :deep(.el-input__wrapper),
.sheet-table :deep(.el-textarea__inner) {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.sheet-table :deep(.el-input__inner),
.sheet-table :deep(.el-textarea__inner) {
  font-family: SimSun, 'Songti SC', STSong, serif;
  font-size: 16px;
  color: #333;
}

.sheet-table :deep(.el-textarea__inner) {
  resize: none;
}

.sheet-table :deep(.el-input__inner::placeholder),
.sheet-table :deep(.el-textarea__inner::placeholder) {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.sheet-table :deep(.el-input__wrapper) {
  border: none;
  box-shadow: none !important;
}

.sheet-table :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #8cb4e0 inset;
}

.sheet-table :deep(.el-form-item.is-error .el-input__wrapper),
.sheet-table :deep(.el-form-item.is-error .el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
}

.opinion-cell {
  height: 140px;
  vertical-align: top;
}

.text-value {
  white-space: pre-wrap;
}

.required {
  margin-right: 5px;
  color: #c33737;
}

.empty-text {
  color: #909399;
}

.print-attachments {
  display: none;
}

@media (width <= 760px) {
  .land-sheet {
    width: 100%;
    min-height: auto;
    padding: 16px 8px;
    margin: 0 auto;
    box-shadow: none;
  }

  .label-column {
    width: 88px;
  }

  h1 {
    font-size: 21px;
    letter-spacing: 1px;
  }

  .sheet-table :deep(th),
  .sheet-table :deep(td) {
    padding: 10px 8px;
    font-size: 14px;
  }

  .sheet-table :deep(th) {
    white-space: normal;
  }
}

@media print {
  .sheet-toolbar {
    display: none;
  }

  .land-sheet {
    width: 100%;
    max-width: none;
    min-height: auto;
    padding: 0;
    margin: 0;
    box-shadow: none;
  }

  .screen-attachments {
    display: none;
  }

  .print-attachments {
    display: block;
  }

  .sheet-table :deep(tr) {
    break-inside: avoid;
  }
}
</style>
