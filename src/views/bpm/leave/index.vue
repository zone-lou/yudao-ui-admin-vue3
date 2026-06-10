<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="申请用户" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入申请用户"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="请假时间" prop="leaveTime">
        <el-date-picker
          v-model="queryParams.leaveTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          :shortcuts="defaultShortcuts"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="请(休)假种类" prop="qxjType">
        <el-select
          v-model="queryParams.qxjType"
          placeholder="请选择请(休)假种类"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="办理状态" prop="spzt">
        <el-select
          v-model="queryParams.spzt"
          placeholder="请选择办理状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请时间" prop="applyDate">
        <el-date-picker
          v-model="queryParams.applyDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          :shortcuts="defaultShortcuts"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="请假事由" prop="sjReason">
        <el-input
          v-model="queryParams.sjReason"
          placeholder="请输入请假事由"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
    </el-form>
    <div class="search-actions">
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      <el-button type="primary" @click="handleQuery">
        <Icon icon="ep:search" class="mr-5px" /> 搜索
      </el-button>
    </div>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <div class="mb-15px flex justify-end">
      <el-button
        type="success"
        plain
        @click="handleExport"
        :loading="exportLoading"
        v-hasPermi="['bpm:leave:export']"
      >
        <Icon icon="ep:download" class="mr-5px" /> 导出
      </el-button>
    </div>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column label="申请用户" align="center" prop="nickName" width="120" />
      <el-table-column
        label="开始时间"
        align="center"
        prop="qxjStartDate"
        :formatter="dateTimeFormatter"
        width="180px"
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="qxjEndDate"
        :formatter="dateTimeFormatter"
        width="180px"
      />
      <el-table-column label="请(休)假种类" align="center" prop="qxjType" width="130">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_LEAVE_TYPE" :value="scope.row.qxjType" />
        </template>
      </el-table-column>
      <el-table-column label="请假事由" align="center" prop="sjReason" min-width="180" />
      <el-table-column label="请假天数" align="center" prop="totalTs" width="100" />
      <el-table-column label="办理状态" align="center" prop="spzt">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.spzt" />
        </template>
      </el-table-column>
      <el-table-column
        label="申请时间"
        align="center"
        prop="applyDate"
        :formatter="dateTimeFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="180px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)"> 详情 </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:leave:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="!['4', '5', 4, 5].includes(scope.row.spzt)"
            v-hasPermi="['bpm:leave:delete']"
          >
            作废
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
  <leaveForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { defaultShortcuts, formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import { leaveApi, leave } from '@/api/bpm/leave'
import leaveForm from './leaveForm.vue'
import { useRouter } from 'vue-router'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'

/** 假期申请审批 列表 */
defineOptions({ name: 'Leave' })

const message = useMessage() // 消息弹窗
const router = useRouter()

const loading = ref(true) // 列表的加载中
const list = ref<leave[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  nickName: undefined as string | undefined,
  leaveTime: [],
  qxjType: undefined,
  sjReason: undefined,
  spzt: undefined,
  applyDate: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const dateTimeFormatter = (_row: any, _column: any, cellValue: any) => {
  return cellValue ? formatDate(cellValue, 'YYYY-MM-DD HH:mm') : ''
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await leaveApi.getleavePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const { handleInvalidate: handleDelete } = useBpmInvalidate(leaveApi.deleteleave, getList)
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

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await leaveApi.exportleave(queryParams)
    download.excel(data, '假期申请审批.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 详情跳转 */
const handleDetail = (row: any) => {
  router.push({
    name: 'BpmProcessInstanceDetail',
    query: { id: row.processInstanceId }
  })
}

/** 激活时 **/
onActivated(() => {
  getList()
})

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  margin-bottom: -18px;
}

.search-form :deep(.el-form-item) {
  margin-right: 0;
}

.search-form :deep(.el-form-item__content > .el-input),
.search-form :deep(.el-form-item__content > .el-select),
.search-form :deep(.el-form-item__content > .el-date-editor) {
  width: 240px !important;
  max-width: 240px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  padding-top: 16px;
}
</style>
