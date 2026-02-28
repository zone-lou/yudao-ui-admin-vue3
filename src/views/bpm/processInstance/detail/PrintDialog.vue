<script setup lang="ts">
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { getDictDataPage } from '@/api/system/dict/dict.data'
import { useUserStore } from '@/store/modules/user'
import { formatDate } from '@/utils/formatTime'
import { dateUtil } from '@/utils/dateUtil'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { decodeFields } from '@/utils/formCreate'

const userStore = useUserStore()

const visible = ref(false)
const loading = ref(false)

const printData = ref()
const userName = computed(() => userStore.user.nickname ?? '')
const printTime = ref(formatDate(new Date(), 'YYYY-MM-DD HH:mm'))
const formFields = ref()
const printDataMap = ref({})

const isCustomTemplate = ref(false)
const customTemplateHtml = ref('')

/** 通用模板渲染器 */
const renderTemplate = (templateStr: string, data: any) => {
  if (!templateStr) return ''
  return templateStr.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const val = data[key]
    return val !== undefined && val !== null ? val : ''
  })
}

/** 统一日期格式，带上时间 */
const formatD = (val: any) => (val ? dateUtil(val).format('YYYY-MM-DD HH:mm') : '')

/** 构建动态表格区域 */
const buildDynamicSectionHtml = (title: string, tasks: any[], minRows = 3) => {
  const rowCount = Math.max(tasks.length, minRows)
  let html = ''

  // 表头
  html += `
    <tr>
        <td class="label-cell">${title}</td>
        <td colspan="2" class="center-text label-cell" style="background: none;">意 见</td>
        <td class="center-text label-cell" style="background: none;">日 期</td>
    </tr>
  `

  // 数据行
  for (let i = 0; i < rowCount; i++) {
    const task = tasks[i]

    const name = task?.approveName || ''
    const content = task?.content || ''
    const date = task?.approveDate ? formatD(task.approveDate) : ''

    html += `
      <tr>
          <td class="center-text data-text" style="height: 35px;">${name}</td>
          <td colspan="2" class="data-text" style="text-align: left; padding: 4px 8px;">${content}</td>
          <td class="center-text data-text">${date}</td>
      </tr>
    `
  }

  return html
}

/** 准备打印数据 */
const preparePrintData = (rawData: any) => {
  console.log('【打印调试】原始业务数据 (rawData):', rawData)
  const data = { ...rawData }

  // 1. 辅助函数：根据时间戳计算时段
  const getPeriod = (val: any) => {
    if (!val) return ''
    const date = new Date(val)
    const hours = date.getHours()
    return hours < 12 ? '上午' : '下午'
  }

  // 2. 辅助函数：构建嵌套表格行 (会议报告单专用)
  // 【关键修复】这里使用了 sub-content 类，配合 HTML 中的 CSS 确保边框显示
  const buildNestedRows = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) {
      // 空行占位
      return `
        <tr>
            <td class="sub-content"></td>
            <td class="sub-content" style="text-align: center;"></td>
            <td class="sub-content" style="text-align: center;"></td>
        </tr>`
    }
    return tasks
      .map(
        (t) => `
        <tr>
            <td class="sub-content">${t.content || ''}</td>
            <td class="sub-content" style="text-align: center;">${t.approveName || ''}</td>
            <td class="sub-content" style="text-align: center;">${t.approveDate ? formatD(t.approveDate) : ''}</td>
        </tr>
    `
      )
      .join('')
  }

  // ==================== 【通用】 基础字段 ====================
  if (rawData.createTime) data.createTime = formatD(rawData.createTime)

  const baseDate = rawData.checkDate || rawData.applyDate || rawData.createTime
  data.applyDate = baseDate ? dateUtil(baseDate).format('YYYY-MM-DD') : ''

  data.startUser = printData.value.processInstance?.startUser?.nickname || ''
  data.deptName = rawData.deptName || printData.value.processInstance?.startUser?.deptName || ''
  data.printUser = userName.value
  data.printDate = formatD(new Date())

  // ==================== 【收文流程】 专属逻辑 ====================
  if (rawData.receiveDocNumber || rawData.sendDocNumber) {
    if (rawData.receiveTime) data.receiveTime = formatD(rawData.receiveTime)
    if (rawData.zhubandate) data.zhubandate = formatD(rawData.zhubandate)
    if (rawData.xiebandate) data.xiebandate = formatD(rawData.xiebandate)

    if (rawData.urgencyDegree) {
      data.urgencyDegree = getDictLabel(DICT_TYPE.BPM_EMERGENCY_DEGREE, rawData.urgencyDegree)
    }
    if (rawData.sendDocNumber) {
      data.sendDocNumber = getDictLabel(DICT_TYPE.BPM_DOC_NUM_TYPE, rawData.sendDocNumber)
    }
    if (rawData.sendDept) {
      try {
        const arr =
          typeof rawData.sendDept === 'string'
            ? rawData.sendDept.split(',')
            : Array.isArray(rawData.sendDept)
              ? rawData.sendDept
              : [rawData.sendDept]
        data.sendDept = arr
          .map((v: any) => getDictLabel(DICT_TYPE.BPM_RECEICE_DOC_UNIT, v))
          .filter(Boolean)
          .join('、')
      } catch (err) {
        data.sendDept = rawData.sendDept
      }
    }
    data.supervisionMark = rawData.zhubandate || rawData.xiebandate ? '✔' : ''
  }

  // ==================== 【请假/公出流程】 专属逻辑 ====================
  if (rawData.qxjStartDate || rawData.qxjType || rawData.checkBegin || rawData.reason) {
    // 请假
    if (rawData.qxjStartDate) {
      data.leaveType = getDictLabel(DICT_TYPE.BPM_LEAVE_TYPE, rawData.qxjType)
      data.startTime = dateUtil(rawData.qxjStartDate).format('YYYY-MM-DD')
      data.startSession = getPeriod(rawData.qxjStartDate)
      data.endTime = dateUtil(rawData.qxjEndDate).format('YYYY-MM-DD')
      data.endSession = getPeriod(rawData.qxjEndDate)
      data.leaveDays = rawData.totalTs
      data.reason = rawData.sjReason
    }
    // 公出
    if (rawData.checkBegin) {
      data.leaveType = '因公外出'
      data.startTime = dateUtil(rawData.checkBegin).format('YYYY-MM-DD')
      data.startSession = getPeriod(rawData.checkBegin)
      data.endTime = dateUtil(rawData.checkEnd).format('YYYY-MM-DD')
      data.endSession = getPeriod(rawData.checkEnd)
      data.leaveDays = rawData.days
      data.reason = rawData.reason
    }
  }

  // ==================== 【会议报告流程】 专属逻辑 ====================
  if (rawData.venue && rawData.title) {
    // 1. 基础字段
    if (rawData.startDate) {
      data.startDate = dateUtil(rawData.startDate).format('YYYY-MM-DD HH:mm')
    }
    // title, venue, joinUnit, offerUnit, offerPerson, content, situation 自动映射
  }

  // ==================== 【通用】 附件处理 ====================
  const fileSource = rawData.filepath || rawData.attachFilePath
  if (fileSource) {
    const pathStr = fileSource
    const files =
      typeof pathStr === 'string' ? pathStr.split(',') : Array.isArray(pathStr) ? pathStr : []
    data.fileNames = files
      .map((f: string) => decodeURIComponent(f.substring(f.lastIndexOf('/') + 1)))
      .filter(Boolean)
      .join('，')
  } else {
    data.fileNames = '无'
  }

  // ==================== 【审批任务】 统一处理 ====================
  const tasks = printData.value.tasks || []

  // --- 收文/请假 ---
  const niBanTask = tasks.find((t: any) => t.name === '主任拟办' && t.approveName)
  if (niBanTask) {
    data.nibanContent = niBanTask.content || '同意'
    data.nibanHandler = niBanTask.approveName
    data.nibanDate = formatD(niBanTask.approveDate)
  }

  const officeTask = tasks.find((t: any) => t.name.includes('办公室') && t.approveName)
  if (officeTask) {
    data.officeContent = officeTask.content || '已核实'
    data.officeHandler = officeTask.approveName
    data.officeDate = formatD(officeTask.approveDate)
  }

  // --- 通用/会议报告 ---

  // 1. 科室负责人 (通用)
  const deptHeadTask =
    tasks.find((t: any) => t.name.includes('科室') && t.name.includes('负责人') && t.approveName) ||
    tasks.find((t: any) => t.name === '部门经理' && t.approveName)
  if (deptHeadTask) {
    data.deptHeadContent = deptHeadTask.content || '同意'
    data.deptHeadHandler = deptHeadTask.approveName
    data.deptHeadDate = formatD(deptHeadTask.approveDate)
  } else {
    data.deptHeadContent = ''
    data.deptHeadHandler = ''
    data.deptHeadDate = ''
  }

  // 2. 分管领导 (根据是否有 venue 判断是否为会议报告单)
  const deputyLeaderTasks = tasks.filter((t: any) => t.name.includes('分管领导') && t.approveName)

  if (rawData.venue && rawData.title) {
    // 会议报告单：使用嵌套表格生成多行 HTML
    data.deputyLeaderRows = buildNestedRows(deputyLeaderTasks)
  } else {
    // 收文/请假：使用标准处理
    data.leaderSectionHtml = buildDynamicSectionHtml('分管领导批示', deputyLeaderTasks, 3)

    const lastDeputy =
      deputyLeaderTasks.length > 0 ? deputyLeaderTasks[deputyLeaderTasks.length - 1] : null
    if (lastDeputy) {
      data.deputyLeaderContent = lastDeputy.content || '同意'
      data.deputyLeaderHandler = lastDeputy.approveName
      data.deputyLeaderDate = formatD(lastDeputy.approveDate)
    } else {
      data.deputyLeaderContent = ''
      data.deputyLeaderHandler = ''
      data.deputyLeaderDate = ''
    }
  }

  // 3. 局长/主要领导
  const mainLeaderTask = tasks.find(
    (t: any) => (t.name.includes('主要领导') || t.name.includes('局长')) && t.approveName
  )
  if (mainLeaderTask) {
    data.directorContent = mainLeaderTask.content || '同意'
    data.mainLeaderContent = mainLeaderTask.content || '同意'
    data.directorHandler = mainLeaderTask.approveName
    data.directorDate = formatD(mainLeaderTask.approveDate)
    data.mainLeaderHandler = mainLeaderTask.approveName
    data.mainLeaderDate = formatD(mainLeaderTask.approveDate)
  } else {
    data.directorContent = ''
    data.directorHandler = ''
    data.directorDate = ''
    data.mainLeaderContent = ''
    data.mainLeaderHandler = ''
    data.mainLeaderDate = ''
  }

  // 4. 收文其他
  const opinionTasks = tasks.filter((t: any) => t.name === '领导意见' && t.approveName)
  data.leaderOpinionHtml = buildDynamicSectionHtml('领导意见', opinionTasks, 3)

  const readerNames = ['主办科室', '协办科室', '办公室转发']
  const readerTasks = tasks.filter((t: any) => readerNames.includes(t.name) && t.approveName)
  data.readerSectionHtml = buildDynamicSectionHtml('阅办者', readerTasks, 3)

  return data
}

const open = async (id: string) => {
  loading.value = true
  isCustomTemplate.value = false
  customTemplateHtml.value = ''

  try {
    printData.value = await ProcessInstanceApi.getProcessInstancePrintData(id)

    const processDefKey =
      printData.value.processDefinitionKey ||
      printData.value.processInstance?.processDefinition?.key ||
      printData.value.processInstance?.processDefinitionKey

    if (!processDefKey) {
      fallbackToDefault()
      return
    }

    // 获取字典
    const dictResp = await getDictDataPage({
      pageNo: 1,
      pageSize: 100,
      dictType: DICT_TYPE.BPM_PRINT_CLASS
    })
    const dictList = dictResp?.list || []

    // 匹配
    const matchDict = dictList.find((d: any) => d.value == processDefKey)

    // 渲染
    if (matchDict && matchDict.remark) {
      try {
        const rawData = printData.value.businessData || {}
        const formatData = preparePrintData(rawData)
        customTemplateHtml.value = renderTemplate(matchDict.remark, formatData)
        isCustomTemplate.value = true
      } catch (renderError) {
        console.error('【打印调试】渲染报错:', renderError)
        fallbackToDefault()
      }
    } else {
      fallbackToDefault()
    }
  } catch (e) {
    console.error('【打印调试】全局错误:', e)
    fallbackToDefault()
  } finally {
    loading.value = false
    visible.value = true
  }
}

const fallbackToDefault = () => {
  isCustomTemplate.value = false
  initPrintDataMap()
  parseFormFields()
}

defineExpose({ open })

const parseFormFields = () => {
  if (!printData.value) return
  const formFieldsObj = decodeFields(
    printData.value.processInstance.processDefinition?.formFields || []
  )
  const processVariables = printData.value.processInstance.formVariables
  let res: any = []
  for (const item of formFieldsObj) {
    const id = item['field']
    const name = item['title']
    const variable = processVariables[item['field']]
    let html = variable
    if (Array.isArray(variable)) html = variable.join(',')
    printDataMap.value[item['field']] = html
    res.push({ id, name, html })
  }
  formFields.value = res
}

const initPrintDataMap = () => {
  if (!printData.value?.processInstance) return
  printDataMap.value['startUser'] = printData.value.processInstance.startUser.nickname
  printDataMap.value['startTime'] = formatDate(printData.value.processInstance.startTime)
}

const getPrintTemplateHTML = () => {
  return printData.value?.printTemplateHtml || ''
}

const printObj = ref({
  id: 'printDivTag',
  popTitle: '&nbsp',
  extraHead: '',
  zIndex: 20003
})
</script>

<template>
  <el-dialog v-loading="loading" v-model="visible" :show-close="false" width="900px" top="5vh">
    <div class="print-dialog-scroll">
      <div id="printDivTag" style="word-break: break-all">
        <div v-if="isCustomTemplate" v-html="customTemplateHtml" class="custom-print-wrap"></div>
        <div v-else-if="printData?.printTemplateEnable" v-html="getPrintTemplateHTML()"></div>
        <div v-else>
          <h2 class="text-center">{{ printData?.processInstance?.name }}</h2>
          <table class="mt-20px w-100%" border="1" style="border-collapse: collapse">
            <tbody>
              <tr>
                <td class="p-5px w-25%">发起人</td>
                <td class="p-5px w-25%">{{ printData?.processInstance?.startUser?.nickname }}</td>
                <td class="p-5px w-25%">发起时间</td>
                <td class="p-5px w-25%">{{ formatDate(printData?.processInstance?.startTime) }}</td>
              </tr>
              <tr v-for="item in formFields" :key="item.id">
                <td class="p-5px w-20%">{{ item.name }}</td>
                <td class="p-5px w-80%" colspan="3"><div v-html="item.html"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" v-print="printObj"> 打 印</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.print-dialog-scroll {
  max-height: 65vh;
  padding: 10px;
  overflow: hidden auto;
  border: 1px solid #eee;
}
</style>

<style>
@media print {
  @page {
    margin: 8mm;
    size: auto;
  }

  body,
  html,
  #app,
  .el-dialog {
    height: auto !important;
    overflow: visible !important;
  }

  .print-dialog-scroll {
    max-height: none !important;
    overflow: visible !important;
    border: none !important;
  }

  /* stylelint-disable-next-line selector-id-pattern */
  #printDivTag .oa-container {
    width: 100% !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
}

/* 确保不光是打印，就连普通预览弹窗里也不显示含该类的行 */
.print-dialog-scroll .print-hide-row {
  display: none !important;
}
</style>
