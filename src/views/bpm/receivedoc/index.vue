<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="单位类别" prop="docClass">
        <el-select
          v-model="queryParams.docClass"
          placeholder="请选择单位类别"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_RECEICE_CLASS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来文单位" prop="sendDept">
        <el-select
          v-model="queryParams.sendDept"
          placeholder="请选择来文单位"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_AGENCY_NAME)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来文字号" prop="sendDocNumber">
        <el-input
          v-model="queryParams.sendDocNumber"
          placeholder="请输入来文字号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="收文日期" prop="receiveTime">
        <el-date-picker
          v-model="queryParams.receiveTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
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
      <el-form-item label="文件类别" prop="docSecondClass">
        <el-select
          v-model="queryParams.docSecondClass"
          placeholder="请选择文件类别"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_DOC_CLASS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="handleCreate"
          v-hasPermi="['bpm:receive-doc:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['bpm:receive-doc:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['bpm:receive-doc:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

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
      <el-table-column label="单位类别" align="center" prop="docClass" width="120">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_RECEICE_CLASS" :value="scope.row.docClass" />
        </template>
      </el-table-column>

      <el-table-column label="收文编号" align="center" prop="receiveDocNumber" min-width="180">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <span>{{ scope.row.receiveDocNumber }}</span>
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

      <el-table-column label="来文单位" align="center" prop="sendDept">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_AGENCY_NAME" :value="scope.row.sendDept" />
        </template>
      </el-table-column>
      <el-table-column label="来文字号" align="center" prop="sendDocNumber">
        <template #default="scope">
          {{ formatSendDocNumber(scope.row.sendDocNumber) }}
        </template>
      </el-table-column>
      <el-table-column
        label="收文日期"
        align="center"
        prop="receiveTime"
        :formatter="dateFormatter"
        width="120px"
      />
      <el-table-column label="主题" align="center" prop="subject" show-overflow-tooltip />
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
            v-hasPermi="['bpm:receive-doc:update']"
          >
            编辑
          </el-button>

          <el-button v-else link type="primary" @click="handleDetail(scope.row)"> 详情 </el-button>

          <el-button
            v-if="scope.row.processInstanceId"
            link
            type="warning"
            @click="handleEdit(scope.row.id)"
            v-hasPermi="['bpm:receive-doc:update']"
          >
            修改
          </el-button>

          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['bpm:receive-doc:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
import { ReceiveDocApi, ReceiveDoc } from '@/api/bpm/receivedoc'
import { useRouter } from 'vue-router'

/** 收文 列表 */
defineOptions({ name: 'ReceiveDoc' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter()

const loading = ref(true) // 列表的加载中
const list = ref<ReceiveDoc[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  docClass: undefined,
  sendDept: undefined,
  sendDocNumber: undefined,
  receiveDocNumber: undefined,
  receiveTime: [],
  subject: undefined,
  urgencyDegree: undefined,
  docSecondClass: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ReceiveDocApi.getReceiveDocPage(queryParams)
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
    name: 'OAReceiveDocCreate'
  })
}

/** 编辑操作 - 跳转到 create 页面 */
const handleEdit = (id: number) => {
  router.push({
    name: 'OAReceiveDocCreate',
    query: { id }
  })
}

// 修改点：详情跳转逻辑改为跳转到流程详情页
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
    await ReceiveDocApi.deleteReceiveDoc(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除收文 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ReceiveDocApi.deleteReceiveDocList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ReceiveDoc[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ReceiveDocApi.exportReceiveDoc(queryParams)
    download.excel(data, '收文.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const formatSendDocNumber = (val: string) => {
  if (!val) return val
  // 如果是数字（字典键值），则进行转换
  if (/^\d+$/.test(val)) {
    const dicts = getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)
    const dict = dicts.find((d) => d.value === val)
    if (dict) {
      const year = new Date().getFullYear()
      return `${dict.label}[${year}]号`
    }
  }
  return val
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
