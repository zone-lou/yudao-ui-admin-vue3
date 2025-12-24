<template>
  <div>
    <el-descriptions :column="2" border size="large">
      <el-descriptions-item label="会议名称" label-align="center" align="center" :span="2">
        {{ detailData.title }}
      </el-descriptions-item>

      <el-descriptions-item label="申请人" label-align="center" align="center">
        {{ detailData.userName }}
      </el-descriptions-item>

      <el-descriptions-item label="申请部门" label-align="center" align="center">
        {{ detailData.deptName }}
      </el-descriptions-item>

      <el-descriptions-item label="申请日期" label-align="center" align="center">
        {{ formatDate(detailData.applyDate) }}
      </el-descriptions-item>

      <el-descriptions-item label="会议时间" label-align="center" align="center">
        {{ formatDate(detailData.startDate) }}
      </el-descriptions-item>

      <el-descriptions-item label="会议地点" label-align="center" align="center" :span="2">
        {{ detailData.venue }}
      </el-descriptions-item>

      <el-descriptions-item label="召集单位及召集人" label-align="center" align="center" :span="2">
        {{ detailData.joinUnit || '无' }}
      </el-descriptions-item>

      <el-descriptions-item label="我局参会科室" label-align="center" align="center">
        {{ detailData.offerUnit || '无' }}
      </el-descriptions-item>

      <el-descriptions-item label="我局参会人员" label-align="center" align="center">
        {{ detailData.offerPerson || '无' }}
      </el-descriptions-item>

      <el-descriptions-item
        label="参会人员情况及建议"
        label-align="center"
        align="center"
        :span="2"
      >
        {{ detailData.situation || '无' }}
      </el-descriptions-item>

      <el-descriptions-item label="提议内容" label-align="center" align="left" :span="2">
        <div class="editor-content-view" v-html="detailData.content || '无'"></div>
      </el-descriptions-item>

      <el-descriptions-item label="附件" label-align="center" align="center" :span="2">
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

    <el-dialog
      v-model="previewVisible"
      title="文件预览"
      width="800px"
      destroy-on-close
      append-to-body
    >
      <div class="preview-container">
        <img
          v-if="previewType === 'image'"
          :src="previewUrl"
          alt="preview"
          style="max-width: 100%"
        />
        <iframe
          v-else-if="previewType === 'iframe'"
          :src="previewUrl"
          width="100%"
          height="600px"
          frameborder="0"
        ></iframe>
        <div v-else class="unsupported-preview">
          <el-icon :size="40" color="#909399"><Document /></el-icon>
          <p>该文件类型暂不支持在线预览，请下载查看。</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { ConfflowApi, Confflow } from '@/api/bpm/confflow' // 引入API
import { propTypes } from '@/utils/propTypes'
import { Document } from '@element-plus/icons-vue'

defineOptions({ name: 'BpmConfflowDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined)
})

const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<Partial<Confflow>>({})

// --- 附件相关状态 ---
const fileList = ref<any[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')
const previewType = ref('image') // image | iframe | other

/** 获取详情数据 */
const getInfo = async () => {
  const queryId = props.id || (query.id as unknown as number)
  if (!queryId) return

  detailLoading.value = true
  try {
    const res = await ConfflowApi.getConfflow(queryId)
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
  return dateUtil(val).format('YYYY-MM-DD')
}

/** 处理预览 */
const handlePreview = (file: any) => {
  const { url, ext } = file
  const imgExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
  const officeExts = ['pdf', 'txt']

  if (imgExts.includes(ext)) {
    previewType.value = 'image'
    previewUrl.value = url
    previewVisible.value = true
  } else if (officeExts.includes(ext)) {
    previewType.value = 'iframe'
    previewUrl.value = url
    previewVisible.value = true
  } else {
    previewType.value = 'other'
    previewVisible.value = true
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

.preview-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.unsupported-preview {
  color: #909399;
  text-align: center;

  p {
    margin-top: 10px;
  }
}

/* 简单的富文本样式重置，防止内容溢出 */
.editor-content-view {
  overflow-wrap: break-word;
  word-break: break-all;

  :deep(img) {
    max-width: 100%;
  }
}
</style>
