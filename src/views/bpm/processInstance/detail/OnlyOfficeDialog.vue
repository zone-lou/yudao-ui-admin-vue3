<template>
  <el-dialog
    v-model="visible"
    title="阅办单 - OnlyOffice 编辑器"
    fullscreen
    destroy-on-close
    :show-close="true"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="office-wrapper">
      <div id="onlyoffice-editor" class="office-placeholder"></div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { ElMessage } from 'element-plus'
// ====== 配置（生产环境走 nginx 代理，开发环境走 .env 覆盖） ======
const ONLYOFFICE_API_URL =
  import.meta.env.VITE_ONLYOFFICE_API_URL || '/onlyoffice/web-apps/apps/api/documents/api.js'
const BACKEND_URL =
  import.meta.env.VITE_ONLYOFFICE_BACKEND_URL || import.meta.env.VITE_BASE_URL || window.location.origin

const visible = ref(false)
const loading = ref(false)
let editorInstance: any = null

const open = async (id: string) => {
  visible.value = true
  loading.value = true
  try {
    const fileUrl = await ProcessInstanceApi.getProcessInstancePrintWordFile(id)
    await nextTick()
    loadScript(ONLYOFFICE_API_URL, () => initEditor(id, fileUrl))
  } catch {
    ElMessage.error('加载文档失败')
    loading.value = false
  }
}

defineExpose({ open })

function loadScript(url: string, callback: () => void) {
  if ((window as any).DocsAPI) {
    callback()
    return
  }
  const existing = document.querySelector(`script[src="${url}"]`)
  if (existing) {
    existing.addEventListener('load', callback)
    return
  }
  const script = document.createElement('script')
  script.src = url
  script.onload = callback
  script.onerror = () => ElMessage.error('OnlyOffice 服务不可用')
  document.head.appendChild(script)
}

function initEditor(id: string, fileUrl: string) {
  const DocsAPI = (window as any).DocsAPI
  if (!DocsAPI?.DocEditor) {
    ElMessage.error('SDK 加载失败')
    return
  }

  if (editorInstance) {
    editorInstance.destroyEditor()
    editorInstance = null
  }

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
      customization: {
        autosave: false,
        forcesave: false,
        help: false,
        chat: false,
        comments: false
      }
    },
    height: '100%',
    width: '100%',
    events: {
      onDocumentReady: () => {
        loading.value = false
        console.log(BACKEND_URL + '/admin-api/bpm/process-instance/save-print-word')
      },
      onError: () => {
        loading.value = false
        ElMessage.error('编辑器加载失败')
      }
    }
  })

  // 兜底：10秒后强制关闭loading
  setTimeout(() => {
    loading.value = false
  }, 10000)
}

function handleClose() {
  if (editorInstance) {
    editorInstance.destroyEditor()
    editorInstance = null
  }
  visible.value = false
}
</script>

<style scoped>
.office-wrapper {
  width: 100%;
  height: calc(100vh - 100px);
}
.office-placeholder {
  width: 100%;
  height: 100%;
}
#onlyoffice-editor {
  width: 100%;
  height: 100%;
}
</style>
