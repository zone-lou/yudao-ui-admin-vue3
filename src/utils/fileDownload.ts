/**
 * 先读取远程文件为 Blob，再触发浏览器下载。
 * 避免跨域 URL 的 download 属性被浏览器忽略并直接打开文件。
 */
export const downloadFileByUrl = async (url: string, fileName = '附件') => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const blobUrl = URL.createObjectURL(await response.blob())
  try {
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
