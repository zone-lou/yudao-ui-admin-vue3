<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="发文号" prop="sendDocNumber">
        <el-input
          v-model="queryParams.sendDocNumber"
          placeholder="请输入发文号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发文日期" prop="sendTime">
        <el-date-picker
          v-model="queryParams.sendTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="主题" prop="subject">
        <el-input
          v-model="queryParams.subject"
          placeholder="请输入主题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="文件类型" prop="docType">
        <el-select
          v-model="queryParams.docType"
          placeholder="请选择文件类型"
          clearable
          class="!w-240px"
        >
          <el-option label="党务" :value="1" />
          <el-option label="政务" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgencyDegree">
        <el-select
          v-model="queryParams.urgencyDegree"
          placeholder="请选择紧急程度"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_EMERGENCY_DEGREE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="拟稿人" prop="draftPerson">
        <el-input
          v-model="queryParams.draftPerson"
          placeholder="请输入拟稿人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发文单位" prop="sendUnitid">
        <el-input
          v-model="queryParams.sendUnitid"
          placeholder="请输入发文单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="handleCreate" v-hasPermi="['bpm:send-doc:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['bpm:send-doc:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['bpm:send-doc:delete']"
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
      <el-table-column label="发文号" align="center" prop="sendDocNumber" min-width="180">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <span>{{ scope.row.sendDocNumber }}</span>
            <el-tag
              v-if="!scope.row.processInstanceId"
              type="warning"
              size="small"
              effect="plain"
              class="ml-2"
            >
              草稿
            </el-tag>
            <el-tag v-else type="success" size="small" effect="plain" class="ml-2"> 流程中 </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="主题" align="center" prop="subject" show-overflow-tooltip />
      <el-table-column label="发文单位" align="center" prop="sendDept" />
      <el-table-column
        label="发文日期"
        align="center"
        prop="sendTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="拟稿人" align="center" prop="draftPerson" />
      <el-table-column label="紧急程度" align="center" prop="urgencyDegree" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_EMERGENCY_DEGREE" :value="scope.row.urgencyDegree" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180px" fixed="right">
        <template #default="scope">
          <el-button
            v-if="!scope.row.processInstanceId"
            link
            type="primary"
            @click="handleEdit(scope.row.id)"
            v-hasPermi="['bpm:send-doc:update']"
          >
            编辑
          </el-button>

          <el-button v-else link type="primary" @click="handleDetail(scope.row)"> 详情 </el-button>

          <el-button
            v-if="scope.row.processInstanceId"
            link
            type="warning"
            @click="handleEdit(scope.row.id)"
            v-hasPermi="['bpm:send-doc:update']"
          >
            修改
          </el-button>

          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['bpm:send-doc:delete']"
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
</template>

<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { SendDocApi, SendDoc } from '@/api/bpm/senddoc'
import { useRouter } from 'vue-router'

/** 发文 列表 */
defineOptions({ name: 'SendDoc' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter()

const loading = ref(true) // 列表的加载中
const list = ref<SendDoc[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  sendDocNumber: undefined,
  sendTime: [],
  subject: undefined,
  docType: undefined,
  urgencyDegree: undefined,
  draftPerson: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SendDocApi.getSendDocPage(queryParams)
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

/** 新增操作 - 跳转到 create 页面 */
const handleCreate = () => {
  router.push({
    name: 'OAsenddocCreate'
  })
}

/** 编辑操作 - 跳转到 create 页面 */
const handleEdit = (id: number) => {
  router.push({
    name: 'OAsenddocCreate',
    query: { id }
  })
}

/** 详情跳转 */
const handleDetail = (row: any) => {
  router.push({
    name: 'BpmProcessInstanceDetail',
    query: { id: row.processInstanceId }
  })
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SendDocApi.deleteSendDoc(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除发文 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await SendDocApi.deleteSendDocList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: SendDoc[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await SendDocApi.exportSendDoc(queryParams)
    download.excel(data, '发文.xls')
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
