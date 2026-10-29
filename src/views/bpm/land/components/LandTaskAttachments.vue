<template>
  <div class="task-attachments">
    <el-upload v-if="canUpload" action="#" :http-request="upload" :show-file-list="false" multiple>
      <el-button type="primary" plain size="small">
        <Icon icon="ep:upload" class="mr-1" />上传附件
      </el-button>
    </el-upload>
    <span v-if="uploading" class="upload-status">附件上传中（{{ uploading }}）</span>
    <el-alert
      v-if="failedFiles.length"
      type="error"
      :title="`附件上传失败：${failedFiles.join('、')}，请重试或关闭此提示后继续。`"
      show-icon
      @close="failedFiles = []"
    />
    <el-alert v-if="loadFailed" type="error" title="办理附件加载失败" :closable="false">
      <el-button link type="primary" @click="load">重新加载</el-button>
    </el-alert>
    <el-dialog v-model="visible" title="办理附件" width="800px" append-to-body>
      <el-table :data="shownAttachments" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="filename" label="文件名称" min-width="250" show-overflow-tooltip />
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="preview(row)">预览</el-button>
            <el-button link type="primary" @click="download(row)">下载</el-button>
            <el-button
              v-if="canRemove(row)"
              link
              type="danger"
              :disabled="deleting"
              @click="remove(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { UploadRequestOptions } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { landApi } from '@/api/bpm/land'
import type { LandTaskAttachment } from '@/api/bpm/land'
import { uploadReturnInfo } from '@/api/infra/file'
import * as ConfigApi from '@/api/infra/config'
import { openFilePreview } from '@/utils/filePreview'
import { downloadFileByUrl } from '@/utils/fileDownload'
import { useMessage } from '@/hooks/web/useMessage'
import { useUserStore } from '@/store/modules/user'

const props = defineProps<{ landId?: number; taskId?: string; canUpload: boolean }>()
const message = useMessage()
const user = useUserStore()
const attachments = ref<LandTaskAttachment[]>([])
const visible = ref(false)
const selectedTaskIds = ref<string[]>([])
const uploading = ref(0)
const deleting = ref(false)
const failedFiles = ref<string[]>([])
const loadFailed = ref(false)
const previewBase = ref('')
const internalPrefix = ref('')
const shownAttachments = computed(() =>
  attachments.value.filter((file) => selectedTaskIds.value.includes(String(file.taskId)))
)
let loadVersion = 0
const load = async () => {
  const version = ++loadVersion
  if (!props.landId) {
    attachments.value = []
    return
  }
  try {
    const result = await landApi.getTaskAttachments(props.landId)
    if (version === loadVersion) {
      attachments.value = result || []
      loadFailed.value = false
    }
  } catch {
    if (version === loadVersion) loadFailed.value = true
  }
}
const forTasks = (taskIds: string[]) =>
  attachments.value.filter((file) => taskIds.includes(String(file.taskId)))
const count = (taskIds: string[]) => forTasks(taskIds).length
const names = (taskIds: string[]) =>
  forTasks(taskIds)
    .map((file) => file.filename)
    .join('、')
const show = (taskIds: string[]) => {
  selectedTaskIds.value = taskIds
  visible.value = true
}
const canRemove = (file: LandTaskAttachment) =>
  props.canUpload &&
  String(file.taskId) === String(props.taskId) &&
  String(file.creator) === String(user.getUser.id)
const preview = async (file: LandTaskAttachment) => {
  try {
    await openFilePreview(file, {
      previewBase: previewBase.value,
      internalPrefix: internalPrefix.value
    })
  } catch (error) {
    message.error(error instanceof Error ? error.message : '附件预览失败')
  }
}
const download = async (file: LandTaskAttachment) => {
  try {
    await downloadFileByUrl(file.filepath, file.filename)
  } catch {
    message.error('附件下载失败，请重试')
  }
}
const remove = async (file: LandTaskAttachment) => {
  if (!canRemove(file) || deleting.value) return
  try {
    await ElMessageBox.confirm(`确认删除附件“${file.filename}”吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  deleting.value = true
  try {
    await landApi.deleteTaskAttachment(file.id)
    await load()
    message.success('附件已删除')
    if (!shownAttachments.value.length) visible.value = false
  } finally {
    deleting.value = false
  }
}
const upload = async (options: UploadRequestOptions) => {
  const landId = props.landId
  const taskId = props.taskId
  if (!landId || !taskId || !props.canUpload) {
    options.onError(new Error('当前任务不能上传附件'))
    return
  }
  uploading.value++
  failedFiles.value = failedFiles.value.filter((name) => name !== options.file.name)
  try {
    const form = new FormData()
    form.append('file', options.file)
    const result = await uploadReturnInfo(form)
    const file = result?.data || result
    const fileId = Number(file?.id)
    if (!Number.isSafeInteger(fileId) || fileId <= 0)
      throw new Error('上传未返回文件编号，请重新上传')
    await landApi.createTaskAttachment({ landId, taskId, fileId })
    options.onSuccess(result)
    if (props.landId === landId) await load()
    message.success('附件上传成功')
  } catch (error) {
    failedFiles.value = [...new Set([...failedFiles.value, options.file.name])]
    options.onError(error as Parameters<UploadRequestOptions['onError']>[0])
    message.error(error instanceof Error ? error.message : '附件上传失败')
  } finally {
    uploading.value--
  }
}
const validateUploads = () => {
  if (uploading.value) throw new Error('附件正在上传，请稍后办理')
  if (failedFiles.value.length) throw new Error('有附件上传失败，请重试或关闭失败提示后继续')
  if (deleting.value) throw new Error('附件正在删除，请稍后办理')
  if (loadFailed.value) throw new Error('请先重新加载办理附件后再办理')
}
watch(
  () => props.landId,
  () => {
    attachments.value = []
    visible.value = false
    failedFiles.value = []
    load()
  },
  { immediate: true }
)
onMounted(async () => {
  const results = await Promise.allSettled([
    ConfigApi.getConfigKey('url.fileview.address'),
    ConfigApi.getConfigKey('url.internal.prefix')
  ])
  if (results[0].status === 'fulfilled') previewBase.value = results[0].value || ''
  if (results[1].status === 'fulfilled') internalPrefix.value = results[1].value || ''
})
defineExpose({ load, count, names, show, validateUploads })
</script>

<style scoped>
.task-attachments {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-status {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

@media print {
  .task-attachments {
    display: none;
  }
}
</style>
