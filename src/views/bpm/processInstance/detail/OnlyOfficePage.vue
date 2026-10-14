<template>
  <div v-loading="loading" class="office-page">
    <div v-if="errorMsg" class="error-tip">{{ errorMsg }}</div>
    <div id="onlyoffice-editor" class="office-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { getConfigKey } from '@/api/infra/config'

defineOptions({ name: 'BpmOnlyOfficeEditor' })

const ONLYOFFICE_API_URL =
  import.meta.env.VITE_ONLYOFFICE_API_URL || '/onlyoffice/web-apps/apps/api/documents/api.js'
const BACKEND_URL =
  import.meta.env.VITE_ONLYOFFICE_BACKEND_URL ||
  import.meta.env.VITE_BASE_URL ||
  window.location.origin

const route = useRoute()
const id = route.query.id as string
const loading = ref(true)
const errorMsg = ref('')
let editorInstance: any = null

let editorLoadTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false

function clearEditorLoadTimer() {
  clearTimeout(editorLoadTimer)
  editorLoadTimer = undefined
}

function loadScript(url: string): Promise<void> {
  if ((window as any).DocsAPI?.DocEditor) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find(
      (script) => script.src === new URL(url, window.location.href).href
    )
    const script = existing || document.createElement('script')
    const cleanup = () => {
      clearTimeout(timer)
      script.removeEventListener('load', onLoad)
      script.removeEventListener('error', onError)
    }
    const fail = (message: string) => {
      cleanup()
      script.remove()
      reject(new Error(message))
    }
    const onLoad = () => {
      if (!(window as any).DocsAPI?.DocEditor) {
        fail('OnlyOffice SDK 无效，请检查服务地址是否返回正确的 JavaScript')
        return
      }
      cleanup()
      resolve()
    }
    const onError = () => fail('OnlyOffice 服务连接失败，请检查服务是否启动及网络是否可达')
    const timer = setTimeout(() => fail('OnlyOffice SDK 加载超时，请检查服务地址和网络连接'), 15000)
    script.addEventListener('load', onLoad)
    script.addEventListener('error', onError)
    if (!existing) {
      script.src = url
      document.head.appendChild(script)
    }
  })
}

function initEditor(fileUrl: string) {
  const DocsAPI = (window as any).DocsAPI
  if (!DocsAPI?.DocEditor) {
    errorMsg.value = 'OnlyOffice SDK 加载失败'
    loading.value = false
    return
  }

  if (editorInstance) editorInstance.destroyEditor()

  clearEditorLoadTimer()
  editorLoadTimer = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      errorMsg.value = '文档加载超时，请检查 OnlyOffice 服务连接及文档下载是否正常后刷新重试'
    }
  }, 60000)

  editorInstance = new DocsAPI.DocEditor('onlyoffice-editor', {
    width: '100%',
    height: '100%',
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
        comments: false,
        spellcheck: false
      }
    },
    events: {
      onDocumentReady: () => {
        clearEditorLoadTimer()
        loading.value = false
        errorMsg.value = ''
      },
      onError: (event: { data?: { errorCode?: number; errorDescription?: string } }) => {
        clearEditorLoadTimer()
        loading.value = false
        const code = event.data?.errorCode
        const description = event.data?.errorDescription
        errorMsg.value =
          '编辑器加载失败' +
          (code != null ? `（错误码：${code}）` : '') +
          (description ? ': ' + description : '')
      }
    }
  })
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
    if (typeof fileUrl !== 'string' || !fileUrl.trim()) {
      throw new Error('获取文件地址失败')
    }
    // 外网前缀替换为内网前缀，OnlyOffice 容器才能下载
    if (
      externalPrefix &&
      internalPrefix &&
      typeof externalPrefix === 'string' &&
      fileUrl.includes(externalPrefix)
    ) {
      fileUrl = fileUrl.replace(externalPrefix, internalPrefix)
    }
    await nextTick()
    await loadScript(ONLYOFFICE_API_URL)
    if (!disposed) initEditor(fileUrl)
  } catch (e: any) {
    clearEditorLoadTimer()
    if (disposed) return
    errorMsg.value = '加载文档失败: ' + (e?.message || '未知错误')
    loading.value = false
  }
})

onBeforeUnmount(() => {
  disposed = true
  clearEditorLoadTimer()
  if (editorInstance) {
    editorInstance.destroyEditor()
    editorInstance = null
  }
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
