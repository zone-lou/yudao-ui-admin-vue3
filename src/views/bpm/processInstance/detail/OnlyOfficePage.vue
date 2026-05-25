<template>
  <div v-loading="loading" class="office-page">
    <div v-if="errorMsg" class="error-tip">{{ errorMsg }}</div>
    <div id="onlyoffice-editor" class="office-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { getConfigKey } from '@/api/infra/config'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'BpmOnlyOfficeEditor' })

const ONLYOFFICE_API_URL =
  import.meta.env.VITE_ONLYOFFICE_API_URL || '/onlyoffice/web-apps/apps/api/documents/api.js'
const BACKEND_URL =
  import.meta.env.VITE_ONLYOFFICE_BACKEND_URL || import.meta.env.VITE_BASE_URL || window.location.origin

const route = useRoute()
const id = route.query.id as string
const loading = ref(true)
const errorMsg = ref('')
let editorInstance: any = null

function loadScript(url: string, callback: () => void) {
  if ((window as any).DocsAPI) { callback(); return }
  const existing = document.querySelector(`script[src="${url}"]`)
  if (existing) { existing.addEventListener('load', callback); return }
  const script = document.createElement('script')
  script.src = url
  script.onload = callback
  script.onerror = () => {
    errorMsg.value = 'OnlyOffice 服务不可用，请确认服务已启动'
    loading.value = false
  }
  document.head.appendChild(script)
}

function initEditor(fileUrl: string) {
  const DocsAPI = (window as any).DocsAPI
  if (!DocsAPI?.DocEditor) {
    errorMsg.value = 'OnlyOffice SDK 加载失败'
    loading.value = false
    return
  }

  if (editorInstance) editorInstance.destroyEditor()

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
    events: {
      onDocumentReady: () => { loading.value = false },
      onError: () => {
        loading.value = false
        errorMsg.value = '编辑器加载失败'
      }
    }
  })

  setTimeout(() => {
    if (loading.value) {
      loading.value = false
      errorMsg.value = errorMsg.value || '编辑器加载超时，请刷新重试'
    }
  }, 15000)
}

onMounted(async () => {
  if (!id) {
    errorMsg.value = '缺少流程实例 ID'
    loading.value = false
    return
  }
  try {
    // 获取内外网前缀配置，跟 UploadFile 预览保持一致
    const [extRes, intRes] = await Promise.all([
      getConfigKey('url.external.prefix'),
      getConfigKey('url.internal.prefix')
    ])
    const externalPrefix = extRes?.data ?? extRes
    const internalPrefix = intRes?.data ?? intRes
    let fileUrl = await ProcessInstanceApi.getProcessInstancePrintWordFile(id)
    // 外网前缀替换为内网前缀，OnlyOffice 容器才能下载
    if (externalPrefix && internalPrefix && typeof externalPrefix === 'string' && fileUrl.includes(externalPrefix)) {
      fileUrl = fileUrl.replace(externalPrefix, internalPrefix)
    }
    if (!fileUrl) {
      errorMsg.value = '获取文件地址失败'
      loading.value = false
      return
    }
    await nextTick()
    loadScript(ONLYOFFICE_API_URL, () => initEditor(fileUrl))
  } catch (e: any) {
    console.error('加载失败:', e)
    errorMsg.value = '加载文档失败: ' + (e?.message || '未知错误')
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (editorInstance) { editorInstance.destroyEditor(); editorInstance = null }
})
</script>

<style scoped>
.office-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.office-placeholder {
  width: 100%;
  height: 100%;
}
#onlyoffice-editor {
  width: 100%;
  height: 100%;
}
.error-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #f56c6c;
  z-index: 1000;
  background: #fff;
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
</style>
