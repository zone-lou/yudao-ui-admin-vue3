<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="auto"
    >
      <el-form-item label="值班日期" prop="dutyDate">
        <el-date-picker
          v-model="queryParams.dutyDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="人员类型" prop="staffType">
        <el-select
          v-model="queryParams.staffType"
          placeholder="请选择人员类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.DUTY_STAFF_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
<!--      <el-form-item label="人员ID" prop="userId">-->
<!--        <el-input-->
<!--          v-model="queryParams.userId"-->
<!--          placeholder="请输入人员ID"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--          class="!w-240px"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="人员姓名" prop="staffName">
        <el-input
          v-model="queryParams.staffName"
          placeholder="请输入人员姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
<!--      <el-form-item label="提醒次数" prop="smsCount">-->
<!--        <el-input-->
<!--          v-model="queryParams.smsCount"-->
<!--          placeholder="请输入提醒次数"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--          class="!w-240px"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['duty:staff:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button type="warning" plain @click="handleImport" v-hasPermi="['system:user:import']">
          <Icon icon="ep:upload" /> 导入
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['duty:staff:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button plain @click="openTemplateDialog" v-hasPermi="['duty:staff:query']">
          <Icon icon="ep:message" class="mr-5px" /> 提醒模板
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['duty:staff:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="值班日期"
        align="center"
        prop="dutyDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="人员类型" align="center" prop="staffType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.DUTY_STAFF_TYPE" :value="scope.row.staffType" />
        </template>
      </el-table-column>
      <el-table-column label="人员姓名" align="center" prop="staffName" />
      <el-table-column label="所属部门" align="center" prop="deptName" />
      <el-table-column label="提醒次数" align="center" prop="smsCount" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['duty:staff:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['duty:staff:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <StaffForm ref="formRef" @success="getList" />
  <SystemDutyImportForm ref="importFormRef" @success="getList" />
  <Dialog v-model="templateDialogVisible" title="值班提醒模板" width="800px">
<!--    <el-alert type="info" :closable="false" class="mb-4">-->
<!--      日常只需编辑消息文案。日期和变量值由系统自动填入，渠道等技术配置沿用现有模板。-->
<!--    </el-alert>-->
    <el-table v-loading="templateLoading" :data="templateRows">
      <el-table-column label="渠道名称 · 模板名称" prop="label" min-width="220" />
      <el-table-column label="当前文案" prop="content" min-width="250" show-overflow-tooltip>
        <template #default="scope">{{ scope.row.content || '未配置' }}</template>
      </el-table-column>
      <el-table-column label="状态" min-width="100">
        <template #default="scope">
          <dict-tag v-if="scope.row.configured" :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
          <span v-else>未配置</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            v-if="scope.row.configured"
            link
            type="primary"
            v-hasPermi="['duty:staff:update']"
            @click="templateEditorRef.open(scope.row.code, scope.row.label)"
          >编辑文案</el-button>
          <span v-else>请管理员配置</span>
        </template>
      </el-table-column>
    </el-table>
  </Dialog>
  <DutyTemplateEditor ref="templateEditorRef" @success="loadTemplates" />
</template>

<script setup lang="ts">
import { getStrDictOptions, getDictLabel, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { StaffApi, Staff } from '@/api/system/dutystaff'
import StaffForm from './StaffForm.vue'
import SystemDutyImportForm from '@/views/system/dutystaff/DutyImportForm.vue'
import * as DutyMessageApi from '@/api/system/dutystaff/message'
import DutyTemplateEditor from './DutyTemplateEditor.vue'

/** 值班 列表 */
defineOptions({ name: 'DutyStaff' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Staff[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  dutyDate: [],
  staffType: undefined,
  userId: undefined,
  staffName: undefined,
  smsCount: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

type DutyTemplateRow = DutyMessageApi.DutyTemplateVO & { label: string }
const templateDialogVisible = ref(false)
const templateLoading = ref(false)
const templateRows = ref<DutyTemplateRow[]>([])
const templateEditorRef = ref()

const loadTemplates = async () => {
  templateLoading.value = true
  try {
    const templates = await DutyMessageApi.getDutyTemplates()
    templateRows.value = templates.map((template) => {
      const channelName = template.channelCode
        ? getDictLabel(DICT_TYPE.SYSTEM_SMS_CHANNEL_CODE, template.channelCode) || template.channelCode
        : ''
      const label = template.configured
        ? [channelName, template.name].filter(Boolean).join(' · ') || template.code
        : template.code
      return { ...template, label }
    })
  } finally {
    templateLoading.value = false
  }
}

const openTemplateDialog = async () => {
  templateDialogVisible.value = true
  templateRows.value = []
  await loadTemplates()
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await StaffApi.getStaffPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 用户导入 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await StaffApi.deleteStaff(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除值班 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await StaffApi.deleteStaffList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Staff[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await StaffApi.exportStaff(queryParams)
    download.excel(data, '值班.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
