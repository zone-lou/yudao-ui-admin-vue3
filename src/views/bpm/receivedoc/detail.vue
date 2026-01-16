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
            <el-table-column label="文件名" prop="name" show-overflow-tooltip />
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
import { Base64 } from 'js-base64'

defineOptions({ name: 'BpmReceiveDocDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined)
})

const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<Partial<ReceiveDoc>>({})

// --- 附件相关状态 ---
const fileList = ref<any[]>([])

/** 获取详情数据 */
const getInfo = async () => {
  const queryId = props.id || (query.id as unknown as number)
  if (!queryId) return

  detailLoading.value = true
  try {
    // 1. 获取主表详情
    const res = await ReceiveDocApi.getReceiveDoc(queryId)
    detailData.value = res

    // 2. 获取附件列表 (修改点：调用 list-by-receive-doc-id 接口)
    // 注意：根据之前的 index.ts 定义，getReceiveDocXmGuid 对应的 url 是 list-by-receive-doc-id?xmGuid=...
    // 这里的参数传 queryId (收文的 ID)
    const attachData = await ReceiveDocApi.getReceiveDocXmGuid(queryId)

    if (attachData && Array.isArray(attachData)) {
      fileList.value = attachData.map((item: any) => {
        // 映射后端字段
        const name = item.attachFileName || ''
        const url = item.fileUrl || ''
        // 计算扩展名
        const ext =
          name.lastIndexOf('.') > -1 ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : ''

        return {
          name: name,
          url: url,
          ext: ext,
          id: item.id // 附件记录ID
        }
      })
    } else {
      fileList.value = []
    }
  } finally {
    detailLoading.value = false
  }
}

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
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

/**
 * 处理预览
 * 逻辑：使用 Base64 编码文件地址，拼接预览服务地址，打开新窗口
 */
const handlePreview = (file: any) => {
  if (!file || !file.url) {
    return
  }

  const kkBaseUrl = 'http://192.168.50.239:8012'
  let fullUrl = file.url

  // 2. 将文件链接进行 Base64 编码
  const encodedUrl = Base64.encode(fullUrl)

  // 3. 拼接最终预览地址
  const previewUrl = `${kkBaseUrl}/onlinePreview?url=${encodeURIComponent(encodedUrl)}`

  // 4. 打开新窗口预览
  window.open(previewUrl, '_blank')
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
