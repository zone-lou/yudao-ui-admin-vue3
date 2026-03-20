<template>
  <div class="oa-container">
    <div class="doc-title">义乌市自然资源和规划局因公外出审批单</div>

    <table class="oa-table">
      <colgroup>
        <col width="130px" />
        <col width="35%" />
        <col width="130px" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td class="label-cell">申请人</td>
          <td class="input-cell">{{ startUser }}</td>
          <td class="label-cell">所在科室</td>
          <td class="input-cell">{{ deptName }}</td>
        </tr>

        <!--        <tr>-->
        <!--          <td class="label-cell">外出类型</td>-->
        <!--          <td class="input-cell">{{ leaveType }}</td>-->
        <!--          <td class="label-cell">申请日期</td>-->
        <!--          <td class="input-cell">{{ applyDate }}</td>-->
        <!--        </tr>-->

        <tr>
          <td class="label-cell">公出开始 从</td>
          <td class="input-cell">{{ startTime }}</td>
          <td class="label-cell">时段</td>
          <td class="input-cell">{{ startSession }}</td>
        </tr>

        <tr>
          <td class="label-cell">公出结束 至</td>
          <td class="input-cell">{{ endTime }}</td>
          <td class="label-cell">时段</td>
          <td class="input-cell">{{ endSession }}</td>
        </tr>

        <tr>
          <td class="label-cell">出发地</td>
          <td class="input-cell">{{ startPlace }}</td>
          <td class="label-cell">目的地</td>
          <td class="input-cell">{{ endPlace }}</td>
        </tr>

        <tr>
          <td class="label-cell">附件列表</td>
          <td class="input-cell">
            <div v-if="fileList.length > 0">
              <div v-for="(file, index) in fileList" :key="index" style="margin-bottom: 2px">
                <el-link type="primary" @click="handlePreview(file)" :underline="false">
                  {{ file.name }}
                </el-link>
              </div>
            </div>
            <span v-else>无</span>
          </td>
          <td class="label-cell">天数</td>
          <td class="input-cell">{{ leaveDays }} 天</td>
        </tr>

        <!--        <tr>-->
        <!--          <td class="label-cell">外出天数</td>-->
        <!--          <td class="input-cell" colspan="3">{{ leaveDays }} 天</td>-->
        <!--        </tr>-->

        <!--        <tr class="print-hide-row">-->
        <!--          <td class="label-cell">附件列表</td>-->
        <!--          <td class="input-cell" colspan="3">-->
        <!--            <div v-if="fileList.length > 0">-->
        <!--              <div v-for="(file, index) in fileList" :key="index" style="margin-bottom: 2px">-->
        <!--                <el-link type="primary" @click="handlePreview(file)" :underline="false">-->
        <!--                  {{ file.name }}-->
        <!--                </el-link>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--            <span v-else>无</span>-->
        <!--          </td>-->
        <!--        </tr>-->

        <tr>
          <td class="label-cell">外出事由</td>
          <td
            colspan="3"
            class="input-cell h-reason"
            style="padding: 10px; text-align: left; vertical-align: top"
          >
            {{ reason }}
          </td>
        </tr>

        <tr>
          <td class="label-cell" rowspan="2">科室(单位)负责人意见</td>
          <td
            class="input-cell h-large"
            colspan="3"
            style="padding: 10px; text-align: left; vertical-align: top"
          >
            <div
              v-if="isEditable('科室') || isEditable('负责人')"
              class="w-full h-full print-hide-row"
            >
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入科室(单位)负责人意见"
                class="w-full h-full"
                style="border: none"
              />
            </div>
            <div v-else>
              <div v-for="(info, index) in ensureMinRows(deptHeadList, 1)" :key="index">
                {{ info.comment }}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="signature-row">
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                deptHeadList.length > 0
                  ? deptHeadList[deptHeadList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                deptHeadList.length > 0
                  ? formatDate(deptHeadList[deptHeadList.length - 1].endTime)
                  : ''
              }}</span></span
            >
          </td>
        </tr>

        <tr>
          <td class="label-cell" rowspan="2">办公室意见</td>
          <td
            class="input-cell h-large"
            colspan="3"
            style="padding: 10px; text-align: left; vertical-align: top"
          >
            <div v-if="isEditable('办公室')" class="w-full h-full print-hide-row">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入办公室意见"
                class="w-full h-full"
              />
            </div>
            <div v-else>
              <div
                v-for="(info, index) in ensureMinRows(officeList, 1)"
                :key="index"
                class="mb-5px"
              >
                <div>{{ info.comment }}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="signature-row">
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                officeList.length > 0
                  ? officeList[officeList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                officeList.length > 0 ? formatDate(officeList[officeList.length - 1].endTime) : ''
              }}</span></span
            >
          </td>
        </tr>

        <tr>
          <td class="label-cell" rowspan="2">局分管领导意见</td>
          <td
            class="input-cell h-large"
            colspan="3"
            style="padding: 10px; text-align: left; vertical-align: top"
          >
            <div
              v-if="isEditable('分管') || isEditable('局领导')"
              class="w-full h-full print-hide-row"
            >
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入局分管领导意见"
                class="w-full h-full"
              />
            </div>
            <div v-else>
              <div
                v-for="(info, index) in ensureMinRows(deputyLeaderList, 1)"
                :key="index"
                class="mb-5px"
              >
                <div>{{ info.comment }}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="signature-row">
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                deputyLeaderList.length > 0
                  ? deputyLeaderList[deputyLeaderList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                deputyLeaderList.length > 0
                  ? formatDate(deputyLeaderList[deputyLeaderList.length - 1].endTime)
                  : ''
              }}</span></span
            >
          </td>
        </tr>

        <tr>
          <td class="label-cell" rowspan="2">局主要领导意见</td>
          <td
            class="input-cell h-large"
            colspan="3"
            style="padding: 10px; text-align: left; vertical-align: top"
          >
            <div
              v-if="isEditable('主要领导') || isEditable('局长')"
              class="w-full h-full print-hide-row"
            >
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入局主要领导意见"
                class="w-full h-full"
              />
            </div>
            <div v-else>
              <div
                v-for="(info, index) in ensureMinRows(mainLeaderList, 1)"
                :key="index"
                class="mb-5px"
              >
                <div>{{ info.comment }}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="signature-row">
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                mainLeaderList.length > 0
                  ? mainLeaderList[mainLeaderList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                mainLeaderList.length > 0
                  ? formatDate(mainLeaderList[mainLeaderList.length - 1].endTime)
                  : ''
              }}</span></span
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { dateUtil } from '@/utils/dateUtil'
import { TimeExplainApi } from '@/api/bpm/timeexplain'
import { propTypes } from '@/utils/propTypes'
import { useUserStore } from '@/store/modules/user'
import { Base64 } from 'js-base64'
import * as ConfigApi from '@/api/infra/config'

defineOptions({ name: 'BpmTimeExplainDetail' })

const props = defineProps({
  id: propTypes.oneOfType([Number, String]).def(undefined),
  processInstance: propTypes.object.def({}),
  activityNodes: propTypes.array.def([]),
  taskId: propTypes.string.def(undefined), // 当前任务ID
  currentNode: propTypes.object.def({}) // 当前节点信息
})

const { query } = useRoute()
const userStore = useUserStore()

const deptName = computed(() => {
  if (detailData.value.deptName) return detailData.value.deptName
  if (props.activityNodes && props.activityNodes.length > 0) {
    for (const node of props.activityNodes as any[]) {
      if (node.tasks && node.tasks.length > 0) {
        for (const task of node.tasks) {
          if (task.assigneeUser && task.assigneeUser.deptName) {
            return task.assigneeUser.deptName
          }
        }
      }
    }
  }
  return ''
})

const detailLoading = ref(false)
const detailData = ref<any>({})
const fileList = ref<any[]>([])
const fileViewBaseUrl = ref('')

// Template data fields
const startUser = computed(() => {
  if (detailData.value.userName) return detailData.value.userName
  if (detailData.value.nickname) return detailData.value.nickname
  if (detailData.value.nickName) return detailData.value.nickName
  if (props.activityNodes && props.activityNodes.length > 0) {
    for (const node of props.activityNodes as any[]) {
      if (node.tasks && node.tasks.length > 0) {
        for (const task of node.tasks) {
          if (task.assigneeUser && task.assigneeUser.nickname) {
            return task.assigneeUser.nickname
          }
        }
      }
    }
  }
  return ''
})
const leaveType = computed(() => '因公外出')
const applyDate = computed(() => formatDate(detailData.value.checkDate))
const startTime = computed(() => formatDate(detailData.value.checkBegin))
const startSession = computed(() => getPeriod(detailData.value.checkBegin))
const endTime = computed(() => formatDate(detailData.value.checkEnd))
const endSession = computed(() => getPeriod(detailData.value.checkEnd))
const leaveDays = computed(() => detailData.value.days)
const reason = computed(() => detailData.value.reason)
const startPlace = computed(() => detailData.value.startPlace)
const endPlace = computed(() => detailData.value.endPlace)

// Historical Opinions list
const deptHeadList = ref<any[]>([]) // 科室(单位)负责人意见
const officeList = ref<any[]>([]) // 办公室意见
const deputyLeaderList = ref<any[]>([]) // 局分管领导意见
const mainLeaderList = ref<any[]>([]) // 局主要领导意见
const currentOpinion = ref('') // 当前正在填写的审批意见

/** 判断当前节点是否可编辑 */
const isEditable = (keyword: string) => {
  if (!props.taskId) return false
  const nodeName = props.currentNode?.name || ''
  return nodeName.indexOf(keyword) !== -1
}

/** 暴露给父组件的方法：获取当前填写的意见 */
const getOpinion = () => {
  return currentOpinion.value
}

/** 确保列表至少有 minRows 行空数据 */
const ensureMinRows = (list: any[], minRows: number) => {
  const res = [...list]
  if (res.length < minRows) {
    const emptyCount = minRows - res.length
    for (let i = 0; i < emptyCount; i++) {
      res.push({ comment: '', isPlaceholder: true })
    }
  }
  return res
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

const externalPrefix = ref('') // 外网地址前缀
const internalPrefix = ref('') // 内网地址前缀

/** 获取详情数据 */
const getInfo = async () => {
  const queryId = props.id || (query.id as unknown as number)
  if (!queryId) return

  detailLoading.value = true
  try {
    fileViewBaseUrl.value = await ConfigApi.getConfigKey('url.fileview.address')
    externalPrefix.value = await ConfigApi.getConfigKey('url.external.prefix')
    internalPrefix.value = await ConfigApi.getConfigKey('url.internal.prefix')
    const res = await TimeExplainApi.getTimeExplain(Number(queryId))
    detailData.value = res || {}
    processFileList(res.filepath)
    processActivityNodes()
  } finally {
    detailLoading.value = false
  }
}

/** 分类处理审批节点意见 */
const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  // 清空
  deptHeadList.value = []
  officeList.value = []
  deputyLeaderList.value = []
  mainLeaderList.value = []

  const userId = userStore.getUser.id
  props.activityNodes.forEach((node: any) => {
    // 新增：过滤掉“备案”性质的节点意见显示
    const nodeName = node.name || ''
    if (nodeName.includes('备案')) {
      return
    }

    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        // 状态 1 为处理中，2 为通过/结束
        if (task.status === 1) {
          if (task.assigneeUser?.id === userId && task.reason) {
            currentOpinion.value = task.reason
          }
          return
        }

        if (task.reason) {
          const name = node.name || ''
          const info = {
            name: name,
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime
          }

          if (name.includes('科室') || name.includes('负责人')) {
            deptHeadList.value.push(info)
          } else if (name.includes('办公室')) {
            officeList.value.push(info)
          } else if (name.includes('分管') || name.includes('局领导')) {
            deputyLeaderList.value.push(info)
          } else if (name.includes('主要领导') || name.includes('局长')) {
            mainLeaderList.value.push(info)
          } else {
            // 没有精准命中的就放入主要的里面兜底
            deptHeadList.value.push(info)
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

/** 预览文件 */
const handlePreview = (file: any) => {
  if (!file || !file.url) return

  // 1. 基础配置
  const kkBaseUrl = fileViewBaseUrl.value || 'http://192.168.50.239:8012'
  let fullUrl = file.url

  if (fullUrl.startsWith('/')) {
    fullUrl = window.location.origin + fullUrl
  }

  // 内外网预览地址转换
  if (externalPrefix.value && internalPrefix.value && fullUrl.includes(externalPrefix.value)) {
    fullUrl = fullUrl.replace(externalPrefix.value, internalPrefix.value)
  }

  // 2. Base64 编码
  const encodedUrl = Base64.encode(fullUrl)

  // 3. 拼接并打开
  const previewUrl = `${kkBaseUrl}${encodeURIComponent(encodedUrl)}`
  window.open(previewUrl, '_blank')
}

defineExpose({
  open: getInfo,
  getOpinion
})

onMounted(() => {
  getInfo()
})
</script>

<style scoped>
@media print {
  .print-hide-row {
    display: none !important;
  }
}

.oa-container {
  width: 100%;
  max-width: 900px;
  padding: 20px;
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', serif;
  background-color: #fff;
}

.doc-title {
  margin-bottom: 25px;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #b1351e;
  text-align: center;
}

.oa-table {
  width: 100%;
  font-size: 14px;
  border: 1px solid #8cb4e0;
  border-collapse: collapse;
}

.oa-table td {
  padding: 6px 10px;
  line-height: 1.4;
  color: #333;
  vertical-align: middle;
  border: 1px solid #8cb4e0;
}

.label-cell {
  font-weight: bold;
  color: #333;
  text-align: center;
  white-space: nowrap;
  background-color: #dbe9f8;
}

.input-cell {
  min-height: 24px;
  text-align: left;
  vertical-align: top;
  background-color: #fff;
}

.h-large {
  height: 100px;
}

.h-reason {
  height: 120px;
}

.signature-row {
  padding: 5px 20px;
  color: #555;
  text-align: right;
  background-color: #fff;
}

.sig-item {
  display: inline-block;
  margin-left: 30px;
}

.sig-line {
  display: inline-block;
  min-width: 80px;
  padding-left: 5px;
  text-align: left;

  /* 下面这行改为 none，去除下划线 */
  border-bottom: none;
}

/* 隐藏已废弃的预览专用 CSS */

/* 强制使得表单的文本域撑满外层 td 单元格的高度 */
:deep(.h-large .el-textarea) {
  height: 100%;
}

:deep(.h-large .el-textarea__inner) {
  height: 100%;
  resize: none; /* 顺便去掉重置大小手柄以保持页面规整 */
}
</style>
