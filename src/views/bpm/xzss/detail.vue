<template>
  <div v-loading="detailLoading">
    <template v-if="viewType !== 'basic'">
      <div id="printDivTag" class="form-scroll-area">
        <div class="oa-container">
          <div class="doc-title">义乌市国土资源局行政诉讼审批表</div>

          <div class="meta-info">
            <div class="meta-left">
              <span
                >收文日期：<span class="meta-input">{{ formatDate(detailData.swRq) }}</span></span
              >
            </div>
            <div class="meta-right">
              <span
                >来文号：<span class="meta-input">{{ detailData.swWh }}</span></span
              >
            </div>
          </div>

          <table class="oa-table">
            <colgroup>
              <col style="width: 120px" />
              <col style="width: auto" />
              <col style="width: 140px" />
              <col style="width: 150px" />
            </colgroup>
            <tbody>
              <tr>
                <td class="label-cell">监督监管</td>
                <td class="data-text">
                  <div class="check-item">
                    <span class="checkbox-mock">
                      <span
                        v-if="
                          detailData.issupervise === 1 ||
                          detailData.issupervise === undefined ||
                          detailData.issupervise === null
                        "
                        >✔</span
                      >
                    </span>
                    进行监督监管
                  </div>
                </td>
                <td class="label-cell">科室办理办结日期</td>
                <td class="data-text center-text">
                  {{ formatDate(detailData.zhubandate) }}
                </td>
              </tr>

              <!-- 拟办意见 -->
              <tr>
                <td class="label-cell" rowspan="2">拟办意见</td>
                <td colspan="3" class="h-80 data-text text-left">
                  <div v-if="isEditable('拟办') || isEditable('法规科交办')" class="w-full h-full">
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      placeholder="请输入拟办意见..."
                      :rows="3"
                    />
                  </div>
                  <div v-else>
                    <div v-for="(item, index) in nibanList" :key="index" class="mb-5px">
                      {{ item.comment }}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="signature-row">
                  <div class="sig-container">
                    <span style="width: 40%">
                      审批人：
                      <span
                        v-if="isEditable('拟办') || isEditable('法规科交办')"
                        class="sign-input"
                        >{{ userStore.getUser.nickname }}</span
                      >
                      <span v-else class="sign-input">
                        <span v-for="(item, index) in nibanList" :key="index" class="mr-2">
                          {{ item.assigneeUser?.nickname }}
                        </span>
                      </span>
                    </span>
                    <span style="width: 40%">
                      日期：
                      <span
                        v-if="!(isEditable('拟办') || isEditable('法规科交办'))"
                        class="sign-input"
                      >
                        <span v-for="(item, index) in nibanList" :key="index" class="mr-2">
                          {{ formatDate(item.endTime) }}
                        </span>
                      </span>
                      <span v-else class="sign-input"></span>
                    </span>
                  </div>
                </td>
              </tr>

              <!-- 局长意见 -->
              <tr>
                <td class="label-cell" rowspan="2">局长意见</td>
                <td colspan="3" class="h-80 data-text text-left">
                  <div v-if="isEditable('局长') || isEditable('主要领导')" class="w-full h-full">
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      placeholder="请输入局长意见..."
                      :rows="3"
                    />
                  </div>
                  <div v-else>
                    <div v-for="(item, index) in juzhangList" :key="index" class="mb-5px">
                      {{ item.comment }}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="signature-row">
                  <div class="sig-container">
                    <span style="width: 40%">
                      审批人：
                      <span
                        v-if="isEditable('局长') || isEditable('主要领导')"
                        class="sign-input"
                        >{{ userStore.getUser.nickname }}</span
                      >
                      <span v-else class="sign-input">
                        <span v-for="(item, index) in juzhangList" :key="index" class="mr-2">
                          {{ item.assigneeUser?.nickname }}
                        </span>
                      </span>
                    </span>
                    <span style="width: 40%">
                      日期：
                      <span
                        v-if="!isEditable('局长') && !isEditable('主要领导')"
                        class="sign-input"
                      >
                        <span v-for="(item, index) in juzhangList" :key="index" class="mr-2">
                          {{ formatDate(item.endTime) }}
                        </span>
                      </span>
                      <span v-else class="sign-input"></span>
                    </span>
                  </div>
                </td>
              </tr>

              <!-- 局领导意见 (多人列表) -->
              <tr>
                <td class="label-cell" rowspan="2">局领导<br />意见</td>
                <td class="sub-header">办理意见</td>
                <td class="sub-header">办理人员</td>
                <td class="sub-header">办理日期</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 0; vertical-align: top; border: none">
                  <table style="width: 100%; border-collapse: collapse; table-layout: fixed">
                    <colgroup>
                      <col style="width: auto" />
                      <col style="width: 140px" />
                      <col style="width: 150px" />
                    </colgroup>
                    <tbody>
                      <tr
                        v-for="(item, index) in ensureMinRows(lingdaoList, 1)"
                        :key="index"
                        class="h-35"
                      >
                        <td
                          class="data-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          {{ item.comment }}
                        </td>
                        <td
                          class="data-text center-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          {{ item.assigneeUser?.nickname }}
                        </td>
                        <td
                          class="data-text center-text"
                          style="border: none; border-bottom: 1px solid #d71920"
                        >
                          {{ formatDate(item.endTime) }}
                        </td>
                      </tr>
                      <!-- 如果在当前节点办理，增加一行输入框 -->
                      <tr v-if="isEditable('分管领导') || isEditable('分管局长')" class="h-35">
                        <td
                          class="data-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          <el-input
                            v-model="currentOpinion"
                            type="textarea"
                            autosize
                            placeholder="请输入意见..."
                          />
                        </td>
                        <td
                          class="data-text center-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          {{ userStore.getUser.nickname }}
                        </td>
                        <td
                          class="data-text center-text"
                          style="border: none; border-bottom: 1px solid #d71920"
                        ></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- 科室单位办理意见 (多人列表) -->
              <tr>
                <td class="label-cell" rowspan="2">科室单位<br />办理意见</td>
                <td class="sub-header">办理意见</td>
                <td class="sub-header">办理人员</td>
                <td class="sub-header">办理日期</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 0; vertical-align: top; border: none">
                  <table style="width: 100%; border-collapse: collapse; table-layout: fixed">
                    <colgroup>
                      <col style="width: auto" />
                      <col style="width: 140px" />
                      <col style="width: 150px" />
                    </colgroup>
                    <tbody>
                      <tr
                        v-for="(item, index) in ensureMinRows(keshiList, 1)"
                        :key="index"
                        class="h-35"
                      >
                        <td
                          class="data-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          {{ item.comment }}
                        </td>
                        <td
                          class="data-text center-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          {{ item.assigneeUser?.nickname }}
                        </td>
                        <td
                          class="data-text center-text"
                          style="border: none; border-bottom: 1px solid #d71920"
                        >
                          {{ formatDate(item.endTime) }}
                        </td>
                      </tr>
                      <!-- 如果在当前节点办理，增加一行输入框 -->
                      <tr
                        v-if="
                          isEditable('相关单位') || isEditable('法规科办理') || isEditable('科室')
                        "
                        class="h-35"
                      >
                        <td
                          class="data-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          <el-input
                            v-model="currentOpinion"
                            type="textarea"
                            autosize
                            placeholder="请输入科室办理意见..."
                          />
                        </td>
                        <td
                          class="data-text center-text"
                          style="
                            border: none;
                            border-right: 1px solid #d71920;
                            border-bottom: 1px solid #d71920;
                          "
                        >
                          {{ userStore.getUser.nickname }}
                        </td>
                        <td
                          class="data-text center-text"
                          style="border: none; border-bottom: 1px solid #d71920"
                        ></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-if="viewType === 'basic'">
      <el-descriptions title="基本信息" :column="2" border size="large" class="mb-20px">
        <el-descriptions-item label="原告" label-align="center" align="center">
          {{ detailData.sqr }}
        </el-descriptions-item>
        <el-descriptions-item label="被告" label-align="center" align="center">
          {{ detailData.bsqr }}
        </el-descriptions-item>
        <el-descriptions-item label="第三人" label-align="center" align="center">
          {{ detailData.dsr }}
        </el-descriptions-item>
        <el-descriptions-item label="土地坐落" label-align="center" align="center">
          {{ detailData.tdZl }}
        </el-descriptions-item>
        <el-descriptions-item label="来文号" label-align="center" align="center">
          {{ detailData.swWh }}
        </el-descriptions-item>
        <el-descriptions-item label="来文机关" label-align="center" align="center">
          {{ detailData.swJg }}
        </el-descriptions-item>
        <el-descriptions-item label="复议案号" label-align="center" align="center">
          {{ detailData.fyAh }}
        </el-descriptions-item>
        <el-descriptions-item label="上一审案号" label-align="center" align="center">
          {{ detailData.ssAh }}
        </el-descriptions-item>
        <el-descriptions-item label="后一审案号" label-align="center" align="center" :span="2">
          {{ detailData.hysAh }}
        </el-descriptions-item>
        <el-descriptions-item label="收文日期" label-align="center" align="center">
          {{ formatDate(detailData.swRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="办理时限" label-align="center" align="center">
          {{ formatDate(detailData.zhubandate) }}
        </el-descriptions-item>

        <el-descriptions-item label="诉讼类型" label-align="center" align="center">
          {{ formatSsLx(detailData.ssLx) }}
        </el-descriptions-item>
        <el-descriptions-item label="送法院日期" label-align="center" align="center">
          {{ formatDate(detailData.sfyjgRq) }}
        </el-descriptions-item>

        <el-descriptions-item label="案件类别" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS1" :value="detailData.lb1" />
        </el-descriptions-item>
        <el-descriptions-item label="案件分类" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS2" :value="detailData.lb2" />
        </el-descriptions-item>
        <el-descriptions-item label="涉及事项" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS3" :value="detailData.lb3" />
        </el-descriptions-item>
        <el-descriptions-item label="案件类型" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS4" :value="detailData.lb4" />
        </el-descriptions-item>
        <el-descriptions-item label="诉讼类别" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS5" :value="detailData.lb5" />
        </el-descriptions-item>

        <el-descriptions-item label="复议请求" label-align="center" align="center" :span="2">
          {{ detailData.ssNr }}
        </el-descriptions-item>
        <el-descriptions-item label="诉讼内容" label-align="center" align="center" :span="2">
          {{ detailData.ssnr }}
        </el-descriptions-item>

        <el-descriptions-item label="承办人" label-align="center" align="center">
          {{ detailData.cbr }}
        </el-descriptions-item>
        <el-descriptions-item label="承办日期" label-align="center" align="center">
          {{ formatDate(detailData.cbRq) }}
        </el-descriptions-item>

        <el-descriptions-item label="上诉人" label-align="center" align="center">
          {{ detailData.ssr }}
        </el-descriptions-item>
        <el-descriptions-item label="被上诉人" label-align="center" align="center">
          {{ detailData.bssr }}
        </el-descriptions-item>
        <el-descriptions-item label="再审申请人" label-align="center" align="center">
          {{ detailData.zssqr }}
        </el-descriptions-item>
        <el-descriptions-item label="再审被申请人" label-align="center" align="center">
          {{ detailData.zsbsqr }}
        </el-descriptions-item>

        <el-descriptions-item label="监督监管" label-align="center" align="center">
          {{ formatBoolean(detailData.issupervise) }}
        </el-descriptions-item>
        <el-descriptions-item label="寄件提醒" label-align="center" align="center">
          {{ formatBoolean(detailData.mailTip) }}
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions
        title="行政诉讼拓展信息"
        :column="2"
        border
        size="large"
        class="mb-20px"
        v-if="detailData.xzssKz || detailData.xzsskz"
      >
        <el-descriptions-item label="裁定判决日期" label-align="center" align="center">
          {{ formatDate(getKzData().cdpjRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="建议函日期" label-align="center" align="center">
          {{ formatDate(getKzData().jyhRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="建议函内容" label-align="center" align="center" :span="2">
          {{ getKzData().jyhNr }}
        </el-descriptions-item>
        <el-descriptions-item label="转业务科室" label-align="center" align="center">
          {{ formatDate(getKzData().zksRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="开庭日期" label-align="center" align="center">
          {{ formatDate(getKzData().ktRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="判决结果" label-align="center" align="center">
          {{ getKzData().pjJg }}
        </el-descriptions-item>
        <el-descriptions-item label="裁定结果" label-align="center" align="center">
          {{ getKzData().cdJg }}
        </el-descriptions-item>
        <el-descriptions-item label="行政赔偿" label-align="center" align="center">
          {{ getKzData().xzPc ? getKzData().xzPc + ' 元' : '' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行情况" label-align="center" align="center">
          {{ getKzData().zxQk }}
        </el-descriptions-item>
        <el-descriptions-item label="装订人" label-align="center" align="center">
          {{ getKzData().zdr }}
        </el-descriptions-item>
        <el-descriptions-item label="装订日期" label-align="center" align="center">
          {{ formatDate(getKzData().zdRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="装订情况" label-align="center" align="center" :span="2">
          {{ getKzData().zdQk }}
        </el-descriptions-item>
        <el-descriptions-item label="移交人" label-align="center" align="center">
          {{ getKzData().yjr }}
        </el-descriptions-item>
        <el-descriptions-item label="移交日期" label-align="center" align="center">
          {{ formatDate(getKzData().yjRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="移交情况" label-align="center" align="center" :span="2">
          {{ getKzData().yjQk }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" label-align="center" align="center" :span="2">
          {{ getKzData().bz }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-20px">
        <h4 style="margin-bottom: 10px; font-weight: bold; color: #303133">相关文书列表</h4>
        <el-table :data="docList" border style="width: 100%">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="文书名称" prop="docName" align="center" />
          <el-table-column label="收文日期" align="center">
            <template #default="{ row }">
              {{ formatDate(row.docDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="主要内容"
            prop="docContent"
            align="center"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { XzssApi } from '@/api/bpm/xzss'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import type { PropType } from 'vue'

defineOptions({ name: 'BpmXzssDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined),
  viewType: propTypes.string.def(''),
  activityNodes: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  currentNode: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  taskId: propTypes.string.def('')
})

const userStore = useUserStore()
const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<any>({})
const docList = ref<any[]>([])

/** 获取详情数据 */
const getInfo = async (id?: number) => {
  const rawId = id || props.id || query.id
  if (!rawId || rawId === 'null' || rawId === 'undefined') {
    return
  }

  const queryId = Number(rawId)
  if (isNaN(queryId)) {
    console.error('Invalid ID:', rawId)
    return
  }

  detailLoading.value = true
  try {
    const res = await XzssApi.getXzss(queryId)
    detailData.value = res || {}

    // 解析动态表格数据
    if (res.otherRelatedInfo) {
      try {
        docList.value = JSON.parse(res.otherRelatedInfo)
      } catch (e) {
        console.warn('解析文书列表失败', e)
        docList.value = []
      }
    } else {
      docList.value = []
    }
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    detailLoading.value = false
  }
}

/** 辅助函数：获取扩展表数据 */
const getKzData = () => {
  return detailData.value.xzssKz || detailData.value.xzsskz || {}
}

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

/** 格式化布尔值 */
const formatBoolean = (val: any) => {
  if (val === 1) return '是'
  if (val === 0) return '否'
  return ''
}

/** 格式化诉讼类型 */
const formatSsLx = (val: any) => {
  const map: Record<number, string> = {
    1: '一审',
    2: '二审',
    3: '再审'
  }
  return map[val] || val
}

// ============== 审批意见内联填报设置 =================
const currentOpinion = ref('')
const getOpinion = () => currentOpinion.value

/** 检查节点是否出于当前激活环节 */
const isEditable = (keyword: string) => {
  if (!props.taskId) return false
  const nodeName = props.currentNode?.name || ''

  // 屏蔽带有“(上诉)”的审批节点，强制它们使用全局原生弹窗处理
  if (nodeName.includes('(上诉)')) return false

  return nodeName.includes(keyword)
}

// ============== 审批意见节点数据 =================
const nibanList = ref<any[]>([])
const juzhangList = ref<any[]>([])
const lingdaoList = ref<any[]>([])
const keshiList = ref<any[]>([])

/** 解析 Activity Nodes 填充审批表 */
const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  const tempNiban: any[] = []
  const tempJuzhang: any[] = []
  const tempLingdao: any[] = []
  const tempKeshi: any[] = []

  props.activityNodes.forEach((node: any) => {
    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        if (task.reason) {
          // 仅拉取已填写的意见
          const info = {
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime,
            taskName: task.name
          }
          const taskName = task.name || node.name || ''

          // 排除“法规科(结果录入)”，不在审批表中展示
          if (taskName.includes('法规科(结果录入)')) {
            return
          }
          // 排除所有带有“(上诉)”关键字的特定审批环节，交由弹窗处理
          if (taskName.includes('(上诉)')) {
            return
          }

          if (taskName.includes('法规科交办') || taskName.includes('拟办')) {
            tempNiban.push(info)
          } else if (
            taskName.includes('分管局长') ||
            taskName.includes('局领导') ||
            taskName.includes('分管领导')
          ) {
            tempLingdao.push(info)
          } else if (taskName.includes('局长') || taskName.includes('主要领导')) {
            tempJuzhang.push(info)
          } else if (
            taskName.includes('相关单位') ||
            taskName.includes('法规科办理') ||
            taskName.includes('科室')
          ) {
            tempKeshi.push(info)
          } else {
            // 兜底进入科室办理
            tempKeshi.push(info)
          }
        }
      })
    }
  })

  nibanList.value = tempNiban
  juzhangList.value = tempJuzhang
  lingdaoList.value = tempLingdao
  keshiList.value = tempKeshi
}

watch(
  () => props.activityNodes,
  () => {
    processActivityNodes()
  },
  { immediate: true }
)

const ensureMinRows = (list: any[], min: number) => {
  const result = [...list]
  while (result.length < min) {
    result.push({ comment: '' })
  }
  return result
}

defineExpose({ open: getInfo, getOpinion })

onMounted(() => {
  getInfo()
})
</script>

<style scoped>
/* stylelint-disable selector-id-pattern */

:deep(.el-descriptions__label) {
  font-weight: bold;
  color: #606266;
  background-color: #f5f7fa;
}

/* ================= 导入红头审批表专用样式 ================= */
#printDivTag {
  padding: 20px;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

#printDivTag .oa-container {
  width: 800px;
  padding: 40px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 0 10px rgb(0 0 0 / 10%);
}

#printDivTag .doc-title {
  margin-bottom: 25px;
  font-size: 30px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

#printDivTag .meta-info {
  display: flex;
  padding: 0 5px;
  margin-bottom: 5px;
  font-size: 15px;
  color: #333;
}

#printDivTag .meta-left {
  width: 50%;
}

#printDivTag .meta-right {
  width: 50%;
  text-align: right;
}

#printDivTag .meta-input {
  display: inline-block;
  min-width: 120px;
  text-align: center;
}

#printDivTag .oa-table {
  width: 100%;
  border: 2px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

#printDivTag .oa-table td {
  padding: 6px 8px;
  font-size: 15px;
  line-height: 1.5;
  color: #000;
  word-wrap: break-word;
  vertical-align: middle;
  border: 1px solid #d71920;
}

#printDivTag .label-cell {
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

#printDivTag .h-80 {
  height: 80px;
  vertical-align: top;
}

#printDivTag .h-large {
  height: 120px;
  vertical-align: top;
}

#printDivTag .h-35 {
  height: 35px;
}

#printDivTag .signature-row {
  height: 30px;
  padding: 0 !important;
}

#printDivTag .sig-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  color: #444;
}

#printDivTag .sign-input {
  display: inline-block;
  min-width: 100px;
}

#printDivTag .sub-header {
  height: 30px;
  font-weight: normal;
  text-align: center;
}

#printDivTag .text-left {
  text-align: left !important;
}

#printDivTag .check-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

#printDivTag .checkbox-mock {
  position: relative;
  display: inline-flex;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
  background-color: transparent !important;
  border: 1px solid #000;
  align-items: center;
  justify-content: center;
}

#printDivTag .center-text {
  text-align: center;
}
</style>
