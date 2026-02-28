<template>
  <div class="oa-container">
    <div class="doc-title">义乌市自然资源和规划局会议报告单</div>

    <table class="oa-table">
      <colgroup>
        <col style="width: 140px" />
        <col />
        <col style="width: 140px" />
        <col />
      </colgroup>

      <tr class="h-row">
        <td class="label-cell">会议名称</td>
        <td>{{ title }}</td>
        <td class="label-cell">会议时间</td>
        <td>{{ startDate }}</td>
      </tr>

      <tr class="h-row">
        <td class="label-cell">会议地点</td>
        <td>{{ venue }}</td>
        <td class="label-cell">召集单位<br />及召集人</td>
        <td>{{ joinUnit }}</td>
      </tr>

      <tr class="h-row">
        <td class="label-cell">我局参会科室</td>
        <td>{{ offerUnit }}</td>
        <td class="label-cell">我局参会人员</td>
        <td>{{ offerPerson }}</td>
      </tr>

      <tr>
        <td class="label-cell">会议主要内容<br />及我局承办事项</td>
        <td colspan="3" class="h-large" style="padding: 10px">
          <div class="editor-content-view" v-html="content || ''"></div>
        </td>
      </tr>

      <tr>
        <td class="label-cell">参会人员<br />会议表态情况<br />及建议意见</td>
        <td colspan="3" class="h-medium" style="padding: 10px">
          {{ situation }}
        </td>
      </tr>

      <tr>
        <td class="label-cell">附件</td>
        <td colspan="3" style="padding: 10px">
          <div v-if="fileList.length > 0">
            <div v-for="(file, index) in fileList" :key="index" style="margin-bottom: 2px">
              <el-link type="primary" @click="handlePreview(file)" :underline="false">
                {{ file.name }}
              </el-link>
            </div>
          </div>
          <span v-else>无</span>
        </td>
      </tr>

      <tr>
        <td class="label-cell" rowspan="2">科室负责人审核</td>
        <td colspan="3" style="height: 50px; padding: 10px">{{ deptHeadContent }}</td>
      </tr>
      <tr>
        <td colspan="3" class="footer-row">
          <div class="footer-content" style="justify-content: flex-start; padding-left: 20px">
            <span
              >办理人员：<span class="sign-input">{{ deptHeadHandler }}</span></span
            >
            <span
              >办理日期：<span class="sign-input">{{ deptHeadDate }}</span></span
            >
          </div>
        </td>
      </tr>

      <tr>
        <td class="label-cell">分管领导阅签</td>
        <td colspan="3" class="nested-table-container">
          <table class="nested-table">
            <tr>
              <td class="sub-header" style="width: 60%">办理意见</td>
              <td class="sub-header" style="width: 20%">办理人员</td>
              <td class="sub-header" style="width: 20%">办理日期</td>
            </tr>
            <tr v-for="(item, index) in deputyLeaderList" :key="index">
              <td class="sub-content">{{ item.comment }}</td>
              <td class="sub-content" style="text-align: center">{{
                item.assigneeUser?.nickname
              }}</td>
              <td class="sub-content" style="text-align: center">{{ formatDate(item.endTime) }}</td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="label-cell" rowspan="2">局长阅签</td>
        <td colspan="3" style="height: 50px; padding: 10px">{{ directorContent }}</td>
      </tr>
      <tr>
        <td colspan="3" class="footer-row">
          <div class="footer-content" style="justify-content: center">
            <span
              >办理人员：<span class="sign-input">{{ directorHandler }}</span></span
            >
            <span style="margin-left: 50px"
              >日期：<span class="sign-input">{{ directorDate }}</span></span
            >
          </div>
        </td>
      </tr>
    </table>

    <!-- 文件预览对话框 -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { dateUtil } from '@/utils/dateUtil'
import { useUserStore } from '@/store/modules/user'
import { ConfflowApi, Confflow } from '@/api/bpm/confflow' // 引入API
import { propTypes } from '@/utils/propTypes'
import { Document } from '@element-plus/icons-vue'

defineOptions({ name: 'BpmConfflowDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined),
  activityNodes: propTypes.array.def([])
})

const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<Partial<Confflow>>({})
const userStore = useUserStore()

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}
// Template data fields
const title = computed(() => detailData.value.title)
const userName = computed(() => detailData.value.userName)
const deptName = computed(() => detailData.value.deptName)
const applyDate = computed(() => formatDate(detailData.value.applyDate)) // However, template uses startDate
const startDate = computed(() => formatDate(detailData.value.startDate))
const venue = computed(() => detailData.value.venue)
const joinUnit = computed(() => detailData.value.joinUnit)
const offerUnit = computed(() => detailData.value.offerUnit)
const offerPerson = computed(() => detailData.value.offerPerson)
const content = computed(() => detailData.value.content)
const situation = computed(() => detailData.value.situation)

// Historical Opinions
const deptHeadContent = ref('')
const deptHeadHandler = ref('')
const deptHeadDate = ref('')

const directorContent = ref('')
const directorHandler = ref('')
const directorDate = ref('')

const deputyLeaderList = ref<any[]>([])

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
    detailData.value = res || {}
    processFileList(res.attachFilePath)
    processActivityNodes()
  } finally {
    detailLoading.value = false
  }
}

/** 分类处理审批节点意见 */
const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  // 清空各列表
  deputyLeaderList.value = []

  props.activityNodes.forEach((node: any) => {
    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        if (task.reason) {
          const name = node.name || ''
          const info = {
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime
          }
          const setOpinion = (contentRef, handlerRef, dateRef) => {
            contentRef.value = info.comment
            handlerRef.value = info.assigneeUser?.nickname
            dateRef.value = formatDate(info.endTime)
          }

          if (name.includes('科室负责人')) {
            setOpinion(deptHeadContent, deptHeadHandler, deptHeadDate)
          } else if (name.includes('局长') || name.includes('主要领导')) {
            setOpinion(directorContent, directorHandler, directorDate)
          } else if (name.includes('分管领导')) {
            deputyLeaderList.value.push(info)
          }
        }
      })
    }
  })
}

// 监听 activityNodes 变化
watch(
  () => props.activityNodes,
  () => {
    processActivityNodes()
  },
  { immediate: true }
)

/** 处理附件字符串 */
const processFileList = (pathStr: string | undefined) => {
  if (!pathStr) {
    fileList.value = []
    return
  }

  let paths: any[] = []
  try {
    const parsed = JSON.parse(pathStr)
    if (Array.isArray(parsed)) {
      paths = parsed
    } else {
      paths = [pathStr]
    }
  } catch (e) {
    paths = Array.isArray(pathStr) ? pathStr : pathStr.split(',')
  }

  fileList.value = paths
    .map((item) => {
      let url = ''
      let name = ''
      if (typeof item === 'string') {
        url = item
        const rawName = url.substring(url.lastIndexOf('/') + 1)
        name = decodeURIComponent(rawName)
      } else if (typeof item === 'object' && item.url) {
        url = item.url
        name = item.name || decodeURIComponent(url.substring(url.lastIndexOf('/') + 1))
      }
      if (!url) return null
      const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
      return { name, url, ext }
    })
    .filter(Boolean)
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

<style scoped>
.oa-container {
  width: 800px;
  padding: 30px 40px;
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
  box-shadow: 0 0 10px rgb(0 0 0 / 10%);
}

/* 标题样式 */
.doc-title {
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

/* 表格通用样式 */
.oa-table {
  width: 100%;
  border: 1px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

.oa-table td {
  padding: 8px;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  word-wrap: break-word;
  vertical-align: middle;
  border: 1px solid #d71920;
}

/* 左侧 Label 样式 */
.label-cell {
  width: 140px;
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

/* 高度辅助类 */
.h-row {
  height: 35px;
}

.h-large {
  height: 120px;
  text-align: left;
  vertical-align: top;
}

.h-medium {
  height: 80px;
  text-align: left;
  vertical-align: top;
}

/* 底部签字区域 */
.footer-row {
  height: 35px;
  vertical-align: middle;
}

.footer-content {
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  gap: 20px;
  color: #444;
}

.sign-input {
  display: inline-block;
  min-width: 80px;
  text-align: center;
  border-bottom: none;
}

/* === 修复后的嵌套表格样式 (核心修改) === */
.nested-table-container {
  height: 100%;
  padding: 0 !important; /* 强制移除内边距 */
}

.nested-table {
  width: 100%;
  height: 100%;
  margin: 0;
  border: none;
  border-collapse: collapse;
}

/* 强制定义单元格边框 */
.nested-table td,
.sub-header,
.sub-content {
  padding: 5px;
  vertical-align: middle;
  border: none; /* 重置 */
  border-right: 1px solid #d71920 !important;
  border-bottom: 1px solid #d71920 !important;
}

/* 移除最后一行和最后一列的多余边框 */
.nested-table tr:last-child td,
.nested-table tr:last-child .sub-content {
  border-bottom: none !important;
}

.nested-table tr td:last-child,
.nested-table tr .sub-header:last-child,
.nested-table tr .sub-content:last-child {
  border-right: none !important;
}

/* 子表头样式 */
.sub-header {
  height: 30px;
  font-weight: bold;
  color: #000;
  text-align: center;
  background-color: transparent;
}

.sub-content {
  height: 50px;
  vertical-align: top;
}

/* 简单的富文本样式重置，防止内容溢出 */
.editor-content-view {
  overflow-wrap: break-word;
  word-break: break-all;

  :deep(img) {
    max-width: 100%;
  }
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
</style>
