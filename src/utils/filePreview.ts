import { Base64 } from 'js-base64'
import { prepareFilePreview, type FilePreviewRequest } from '@/api/infra/file'
import { config } from '@/config/axios/config'

interface PreviewAttachment {
  url?: string
  path?: string
  filepath?: string
  fileId?: number | string
  file_id?: number | string
  attachFileId?: number | string
  configId?: number
}

interface PreviewOptions {
  previewBase: string
  internalPrefix: string
}

// 与移动端保持一致：直出类型由浏览器取文件，其余由 kkFileView 服务端取文件转换。
const DIRECT_RENDER_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'ico',
  'webp',
  'svg',
  'tif',
  'tiff',
  'mp4',
  'webm',
  'mkv',
  'avi',
  'flv',
  'mov',
  'wmv',
  'mp3',
  'wav',
  'flac',
  'ogg',
  'aac',
  'txt',
  'json',
  'xml',
  'md',
  'java',
  'js',
  'css',
  'html',
  'sql'
])

export const resolveFilePreview = (file: PreviewAttachment | string) => {
  if (!file) throw new Error('文件路径为空，无法预览')
  const attachment = typeof file === 'string' ? { path: file } : file
  // 附件子表的 id 不是 infra_file.id，只接受明确的文件 ID 字段。
  const fileId = attachment.fileId ?? attachment.file_id ?? attachment.attachFileId
  if (fileId != null && fileId !== '') {
    if (!/^[1-9]\d*$/.test(String(fileId))) throw new Error('文件 ID 不正确')
    return prepareFilePreview({ fileId })
  }
  let path = attachment.path || attachment.url || attachment.filepath
  if (!path) throw new Error('文件路径为空，无法预览')
  // 历史附件可能是带 /oa 前缀的站内地址，转换为后端可识别的完整系统文件 URL。
  if (path.startsWith('/') && /\/infra\/file\/\d+\/get\//.test(path)) {
    path = new URL(path, window.location.origin).href
  }
  const urlConfigId = path.match(/\/infra\/file\/(\d+)\/get\//)?.[1]
  const data: FilePreviewRequest = {
    configId: attachment.configId ?? (urlConfigId ? Number(urlConfigId) : undefined),
    path
  }
  return prepareFilePreview(data)
}

export const buildFilePreviewUrl = (
  previewPath: string,
  cacheName: string,
  options: PreviewOptions
) => {
  if (!/^\/infra\/file\/preview\/content\/[a-f0-9]{32}\/[\w.-]+$/.test(previewPath)) {
    throw new Error('文件预览地址不正确')
  }
  if (previewPath.split('/').pop() !== cacheName) throw new Error('文件缓存标识不正确')
  const previewBase = options.previewBase.trim()
  if (!previewBase) throw new Error('未配置文件预览服务，请联系管理员')

  // 保留业务 API 的公网入口前缀（例如 /oa/admin-api），不使用原始附件域名。
  const apiBase = new URL(config.base_url.replace(/\/+$/, '') + '/', window.location.origin)
  let source = new URL(previewPath.slice(1), apiBase)
  const extension = cacheName.split('.').pop()?.toLowerCase() || ''
  if (!DIRECT_RENDER_EXTENSIONS.has(extension) && options.internalPrefix.trim()) {
    const internal = new URL(options.internalPrefix.trim())
    const prefix = internal.pathname.replace(/\/+$/, '')
    internal.pathname = `${prefix.endsWith('/admin-api') ? prefix : `${prefix}/admin-api`}${previewPath}`
    internal.search = ''
    internal.hash = ''
    source = internal
  }
  // 凭证会变化，稳定缓存名已包含在路径中；与移动端保持相同的结束参数。
  source.searchParams.set('kk_tail', '1')
  const preview = new URL(previewBase, window.location.origin)
  if (!preview.pathname.endsWith('/onlinePreview')) {
    preview.pathname = `${preview.pathname.replace(/\/$/, '')}/onlinePreview`
  }
  preview.searchParams.set('url', Base64.encode(source.href))
  return preview.href
}

export const openFilePreview = async (
  file: PreviewAttachment | string,
  options: PreviewOptions
) => {
  // 点击时先打开窗口，避免申请凭证后再打开被浏览器当作弹窗拦截。
  const previewWindow = window.open('about:blank', '_blank')
  if (!previewWindow) throw new Error('预览窗口被拦截，请允许本站弹出窗口后重试')
  previewWindow.opener = null
  try {
    const preview = await resolveFilePreview(file)
    const url = buildFilePreviewUrl(preview.previewPath, preview.cacheName, options)
    if (!previewWindow.closed) previewWindow.location.replace(url)
  } catch (error) {
    previewWindow.close()
    throw error
  }
}
