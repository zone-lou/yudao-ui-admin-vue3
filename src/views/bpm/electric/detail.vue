<template>
  <div>
    <el-descriptions :column="2" border size="large">
      <el-descriptions-item label="收文编号" label-align="center" align="center" width="120px">
        {{ detailData.receiveDocNumber }}
      </el-descriptions-item>

      <el-descriptions-item label="收文日期" label-align="center" align="center" width="120px">
        {{ formatDate(detailData.receiveTime) }}
      </el-descriptions-item>

      <el-descriptions-item label="来文字号" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_DOC_NUM_TYPE" :value="detailData.sendDocNumber" />
      </el-descriptions-item>

      <el-descriptions-item label="单位类别" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_RECEICE_CLASS" :value="detailData.docSecondClass" />
      </el-descriptions-item>

      <el-descriptions-item label="文件类别" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_DOC_CLASS" :value="detailData.docClass" />
      </el-descriptions-item>

      <el-descriptions-item label="紧急程度" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_EMERGENCY_DEGREE" :value="detailData.urgencyDegree" />
      </el-descriptions-item>

      <el-descriptions-item label="来文单位" label-align="center" align="center" :span="2">
        <dict-tag
          :type="DICT_TYPE.BPM_RECEICE_DOC_UNIT"
          :value="formatCommaData(detailData.sendDept)"
        />
      </el-descriptions-item>

      <el-descriptions-item label="主办办结时间" label-align="center" align="center">
        {{ formatDate(detailData.zhubandate) }}
      </el-descriptions-item>

      <el-descriptions-item label="协办办结时间" label-align="center" align="center">
        {{ formatDate(detailData.xiebandate) }}
      </el-descriptions-item>

      <el-descriptions-item label="文件标题" label-align="center" align="center" :span="2">
        {{ detailData.subject }}
      </el-descriptions-item>

      <el-descriptions-item label="收文附件" label-align="center" align="center" :span="2">
        <div v-if="fileList.length > 0">
          <el-table :data="fileList" border style="width: 100%" size="small">
            <el-table-column label="文件名" show-overflow-tooltip>
              <template #default="scope">
                <span class="link-type cursor-pointer" @click="handlePreview(scope.row)">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="格式" width="80" align="center">
              <template #default="scope">
                <el-tag size="small" type="info">{{ scope.row.ext }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="handlePreview(scope.row)">预览</el-button>
                <el-button link type="primary" @click="handleDownload(scope.row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="暂无附件" :image-size="60" />
      </el-descriptions-item>

      <el-descriptions-item label="备注" label-align="center" align="center" :span="2">
        {{ detailData.remark || '无' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { dateUtil } from '@/utils/dateUtil'
import { ReceiveDocApi, ReceiveDoc } from '@/api/bpm/receivedoc'
import { propTypes } from '@/utils/propTypes'
import { openFilePreview } from '@/utils/filePreview'
import * as ConfigApi from '@/api/infra/config'

defineOptions({ name: 'BpmReceiveDocDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined)
})

const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<Partial<ReceiveDoc>>({})

// --- 附件相关状态 ---
const fileList = ref<any[]>([])
const fileViewBaseUrl = ref('')
// const previewVisible = ref(false) // 已移除
// const previewUrl = ref('') // 已移除
// const previewType = ref('image') // 已移除

const internalPrefix = ref('') // 内网地址前缀

/** 获取详情数据 */
const getInfo = async () => {
  const queryId = props.id || (query.id as unknown as number)
  if (!queryId) return

  detailLoading.value = true
  try {
    fileViewBaseUrl.value = await ConfigApi.getConfigKey('url.fileview.address')
    internalPrefix.value = await ConfigApi.getConfigKey('url.internal.prefix')
    const res = await ReceiveDocApi.getReceiveDoc(queryId)
    detailData.value = res
    processFileList(res.attachFilePath)
  } finally {
    detailLoading.value = false
  }
}

/** 处理附件字符串 */
const processFileList = (pathStr: string | undefined) => {
  if (!pathStr) {
    fileList.value = []
    return
  }
  const paths = Array.isArray(pathStr) ? pathStr : pathStr.split(',')

  fileList.value = paths
    .map((url) => {
      if (!url) return null
      const rawName = url.substring(url.lastIndexOf('/') + 1)
      const name = decodeURIComponent(rawName)
      const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
      return { name, url, ext }
    })
    .filter(Boolean)
}

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD HH:mm')
}

/** 格式化多选数据 */
const formatCommaData = (val: any) => {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val.indexOf(',') !== -1) {
    const arr = val.split(',')
    if (arr.every((i) => !isNaN(Number(i)))) {
      return arr.map(Number)
    }
    return arr
  }
  if (typeof val === 'string' && !isNaN(Number(val))) {
    return Number(val)
  }
  return val
}

/** 通过后端流式接口预览附件。 */
const handlePreview = async (file: any) => {
  try {
    await openFilePreview(file, {
      previewBase: fileViewBaseUrl.value,
      internalPrefix: internalPrefix.value
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '文件预览失败，请稍后重试')
  }
}

/** 处理下载 */
const handleDownload = (file: any) => {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = file.url
  link.setAttribute('download', file.name)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

defineExpose({ open: getInfo })

onMounted(() => {
  getInfo()
})
</script>

<style scoped lang="scss">
:deep(.el-descriptions__label) {
  font-weight: bold;
  color: #606266;
  background-color: #f5f7fa;
}
</style>
