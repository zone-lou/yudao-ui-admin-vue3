import { Base64 } from 'js-base64'
import CryptoJS from 'crypto-js'

/** 所有流程共用的 kkFileView 链接生成；调用方先完成内外网地址选择。 */
export const buildFilePreviewUrl = (sourceUrl: string, previewBase: string, extension?: string) => {
  let fullUrl = sourceUrl.trim()
  const ext = (extension || fullUrl.split(/[?#]/)[0].split('.').pop() || '').toLowerCase()
  if (['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) {
    const source = new URL(fullUrl, window.location.origin)
    // 只规范路径段，避免 #、?、%、+ 被解码成 URL 分隔符或二次编码。
    source.pathname = source.pathname
      .split('/')
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join('/')
    source.searchParams.delete('fullfilename')
    const storagePath = source.pathname.match(/\/infra\/file\/(\d+)\/get\/(.+)$/)
    const identity = storagePath
      ? `${storagePath[1]}/${storagePath[2]}`
      : `${source.origin}${source.pathname}${source.search}`
    const previewName = `oa_${CryptoJS.SHA256(identity).toString()}.${ext}`
    // kkFileView 4.4.0 按 ASCII 文件名跳过重复编码，并据此命名 PDF 缓存。
    // 该版本仅移除 &fullfilename，不能使它成为首个参数。
    if (!source.search) source.searchParams.set('kk', '1')
    source.searchParams.set('fullfilename', previewName)
    fullUrl = source.toString()
  }
  const preview = new URL(previewBase.trim(), window.location.origin)
  // 同时支持服务根地址与已有 /onlinePreview?url= 配置。
  if (!preview.pathname.endsWith('/onlinePreview')) {
    preview.pathname = `${preview.pathname.replace(/\/$/, '')}/onlinePreview`
  }
  preview.searchParams.set('url', Base64.encode(fullUrl))
  return preview.toString()
}
