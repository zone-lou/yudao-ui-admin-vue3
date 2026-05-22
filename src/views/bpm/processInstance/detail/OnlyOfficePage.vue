<template>
  <div v-loading="loading" class="office-page">
    <div id="onlyoffice-editor" class="office-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'BpmOnlyOfficeEditor' })

const ONLYOFFICE_API_URL =
  import.meta.env.VITE_ONLYOFFICE_API_URL || '/onlyoffice/web-apps/apps/api/documents/api.js'
const BACKEND_URL =
  import.meta.env.VITE_ONLYOFFICE_BACKEND_URL || import.meta.env.VITE_BASE_URL || window.location.origin

const route = useRoute()
const id = route.query.id as string
const loading = ref(true)
let editorInstance: any = null

function loadScript(url: string, callback: () => void) {
  if ((window as any).DocsAPI) { callback(); return }
  const existing = document.querySelector(`script[src="${url}"]`)
  if (existing) { existing.addEventListener('load', callback); return }
  const script = document.createElement('script')
  script.src = url
  script.onload = callback
  script.onerror = () => ElMessage.error('OnlyOffice 服务不可用')
  document.head.appendChild(script)
}

function initEditor(fileUrl: string) {
  const DocsAPI = (window as any).DocsAPI
  if (!DocsAPI?.DocEditor) { ElMessage.error('SDK 加载失败'); return }

  editorInstance = new DocsAPI.DocEditor('onlyoffice-editor', {
    document: {
      fileType: 'docx',
      key: 'print_' + id + '_' + Date.now(),
      title: '阅办单.docx',
      url: fileUrl,
      permissions: { edit: true, download: true, print: true }
    },
    documentType: 'word',
    editorConfig: {
      mode: 'edit',
      callbackUrl: BACKEND_URL + '/admin-api/bpm/process-instance/save-print-word',
      lang: 'zh-CN',
      customization: { autosave: false, forcesave: false, help: false, chat: false, comments: false }
    },
    height: '100%',
    width: '100%',
    events: {
      onDocumentReady: () => { loading.value = false },
      onError: () => { loading.value = false; ElMessage.error('编辑器加载失败') }
    }
  })
  setTimeout(() => { loading.value = false }, 10000)
}

onMounted(async () => {
  if (!id) { ElMessage.error('缺少流程实例 ID'); return }
  try {
    const fileUrl = await ProcessInstanceApi.getProcessInstancePrintWordFile(id)
    await nextTick()
    loadScript(ONLYOFFICE_API_URL, () => initEditor(fileUrl))
  } catch {
    ElMessage.error('加载文档失败')
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (editorInstance) { editorInstance.destroyEditor(); editorInstance = null }
})
</script>

<style scoped>
.office-page { width: 100vw; height: 100vh; }
.office-placeholder { width: 100%; height: 100%; }
#onlyoffice-editor { width: 100%; height: 100%; }
</style>
