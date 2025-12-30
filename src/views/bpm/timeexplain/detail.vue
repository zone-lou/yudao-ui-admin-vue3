<template>
  <div>
    <el-descriptions :column="2" border size="large">
      <el-descriptions-item label="申请人" label-align="center" align="center" width="120px">
        {{ nickname }}
      </el-descriptions-item>

      <el-descriptions-item label="所在科室" label-align="center" align="center" width="120px">
        {{ detailData.deptName || deptName }}
      </el-descriptions-item>

      <el-descriptions-item label="登记时间" label-align="center" align="center">
        {{ formatDate(detailData.checkDate) }}
      </el-descriptions-item>

      <el-descriptions-item label="公出天数" label-align="center" align="center">
        {{ detailData.days }} 天
      </el-descriptions-item>

      <el-descriptions-item label="开始时间" label-align="center" align="center">
        {{ formatDate(detailData.checkBegin) }}
      </el-descriptions-item>

      <el-descriptions-item label="时段" label-align="center" align="center">
        {{ getPeriod(detailData.checkBegin) }}
      </el-descriptions-item>

      <el-descriptions-item label="结束时间" label-align="center" align="center">
        {{ formatDate(detailData.checkEnd) }}
      </el-descriptions-item>

      <el-descriptions-item label="时段" label-align="center" align="center">
        {{ getPeriod(detailData.checkEnd) }}
      </el-descriptions-item>

      <el-descriptions-item label="原因说明" label-align="center" align="center" :span="2">
        {{ detailData.reason }}
      </el-descriptions-item>

      <el-descriptions-item label="附件材料" label-align="center" align="center" :span="2">
        <div v-if="fileList.length > 0">
          <el-table :data="fileList" border style="width: 100%" size="small">
            <el-table-column label="文件名" prop="name" show-overflow-tooltip />
            <el-table-column label="大小" prop="size" width="100" align="center">
              <template #default="scope">{{ formatFileSize(scope.row.size) }}</template>
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
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { TimeExplainApi } from '@/api/bpm/timeexplain'
import { propTypes } from '@/utils/propTypes'
import { useUserStore } from '@/store/modules/user'
import { Base64 } from 'js-base64'

defineOptions({ name: 'BpmTimeExplainDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined)
})

const { query } = useRoute()
const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref(userStore.user.dept?.name || '')

const detailLoading = ref(false)
const detailData = ref<any>({})
const fileList = ref<any[]>([])

/** 获取详情数据 */
const getInfo = async () => {
  const queryId = props.id || (query.id as unknown as number)
  if (!queryId) return

  detailLoading.value = true
  try {
    const res = await TimeExplainApi.getTimeExplain(queryId)
    detailData.value = res || {}
    processFileList(res.filepath)
  } finally {
    detailLoading.value = false
  }
}

/** 格式化日期 (兼容时间戳) */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

/** * 新增：根据时间戳计算时段 (上午/下午)
 * 逻辑：12点之前为上午，12点及以后为下午
 */
const getPeriod = (val: any) => {
  if (!val) return ''
  const date = new Date(val)
  const hours = date.getHours()
  return hours < 12 ? '上午' : '下午'
}

/** 处理附件列表 */
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
      return {
        name,
        url,
        size: 0
      }
    })
    .filter(Boolean)
}

/** 文件大小格式化 */
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** 预览文件 */
const handlePreview = (file: any) => {
  if (!file || !file.url) return

  // 1. 基础配置
  const kkBaseUrl = 'http://192.168.50.239:8012'
  let fullUrl = file.url

  if (fullUrl.startsWith('/')) {
    fullUrl = window.location.origin + fullUrl
  }

  // 2. Base64 编码
  const encodedUrl = Base64.encode(fullUrl)

  // 3. 拼接并打开
  const previewUrl = `${kkBaseUrl}/onlinePreview?url=${encodeURIComponent(encodedUrl)}`
  window.open(previewUrl, '_blank')
}

/** 下载文件 */
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
