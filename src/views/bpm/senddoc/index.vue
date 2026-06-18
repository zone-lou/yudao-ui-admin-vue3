<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="主题" prop="subject">
        <el-input
          v-model="queryParams.subject"
          placeholder="请输入主题"
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
          :shortcuts="defaultShortcuts"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办理状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择办理状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_TASK_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
      <el-form-item label="发文字号" prop="sendDocNumber">
        <el-input
          v-model="queryParams.sendDocNumber"
          placeholder="请输入发文字号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
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
      <el-form-item label="发文单位" prop="sendDept">
        <el-input
          v-model="queryParams.sendDept"
          placeholder="请输入发文单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
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
    <div class="mb-15px flex items-center justify-end gap-8px">
      <BpmColumnSetting
        v-model="checkedColumnKeys"
        :columns="columnOptions"
        @reset="resetColumns"
      />
    </div>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column type="index" label="序号" width="60" align="center" fixed="left" resizable />
      <el-table-column v-if="visibleColumn('sendDocNumber')" label="发文字号" align="center" prop="sendDocNumber" min-width="180">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <span>{{ formatSendDocNumber(scope.row.sendDocNumber) }}</span>
            <dict-tag
              class="ml-2"
              :type="DICT_TYPE.BPM_TASK_STATUS"
              :value="scope.row.status !== null ? scope.row.status : 0"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('subject')" label="主题" align="center" prop="subject" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('sendDept')" label="发文单位" align="center" prop="sendDept" />
      <el-table-column
        v-if="visibleColumn('sendTime')"
        label="发文日期"
        align="center"
        prop="sendTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column v-if="visibleColumn('draftPerson')" label="拟稿人" align="center" prop="draftPerson" />
      <el-table-column v-if="visibleColumn('urgencyDegree')" label="紧急程度" align="center" prop="urgencyDegree" width="100">
        <template #default="scope">
          <dict-tag v-if="scope.row.urgencyDegree != null" :type="DICT_TYPE.BPM_EMERGENCY_DEGREE" :value="scope.row.urgencyDegree" />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('docProperty')" label="公文性质" align="center" prop="docProperty" width="120" />
      <el-table-column v-if="visibleColumn('primarySendDept')" label="主送机关" align="center" prop="primarySendDept" min-width="160" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('copySendDept')" label="抄送机关" align="center" prop="copySendDept" min-width="160" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('secretDegree')" label="机密程度" align="center" prop="secretDegree" width="120" />
      <el-table-column v-if="visibleColumn('draftDate')" label="拟稿时间" align="center" prop="draftDate" :formatter="dateFormatter" width="180px" />
      <el-table-column v-if="visibleColumn('draftDept')" label="拟稿单位" align="center" prop="draftDept" min-width="150" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('responsibleDept')" label="主办部门" align="center" prop="responsibleDept" min-width="150" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('dealTimelimit')" label="办件时限" align="center" prop="dealTimelimit" :formatter="dateFormatter" width="180px" />
      <el-table-column v-if="visibleColumn('docClass')" label="一级分类" align="center" prop="docClass" width="120" />
      <el-table-column v-if="visibleColumn('docSecondClass')" label="二级分类" align="center" prop="docSecondClass" width="120" />
      <el-table-column v-if="visibleColumn('docType')" label="文件类型" align="center" prop="docType" width="120" />
      <el-table-column v-if="visibleColumn('acceptNumber')" label="受理文号" align="center" prop="acceptNumber" min-width="160" show-overflow-tooltip />
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
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
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
import { dateFormatter, defaultShortcuts } from '@/utils/formatTime'
import { SendDocApi, SendDoc } from '@/api/bpm/senddoc'
import { useRouter } from 'vue-router'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'
import BpmColumnSetting from '@/views/bpm/components/BpmColumnSetting.vue'
import { useBpmColumnSetting } from '@/hooks/bpm/useBpmColumnSetting'

/** 发文 列表 */
defineOptions({ name: 'SendDoc' })

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
  draftPerson: undefined,
  sendDept: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const { columnOptions, checkedColumnKeys, visibleColumn, resetColumns } = useBpmColumnSetting(
  'bpm:senddoc:columns',
  [
    { key: 'sendDocNumber', label: '发文字号' },
    { key: 'subject', label: '主题' },
    { key: 'sendDept', label: '发文单位' },
    { key: 'sendTime', label: '发文日期' },
    { key: 'draftPerson', label: '拟稿人' },
    { key: 'urgencyDegree', label: '紧急程度' },
    { key: 'docProperty', label: '公文性质' },
    { key: 'primarySendDept', label: '主送机关' },
    { key: 'copySendDept', label: '抄送机关' },
    { key: 'secretDegree', label: '机密程度' },
    { key: 'draftDate', label: '拟稿时间' },
    { key: 'draftDept', label: '拟稿单位' },
    { key: 'responsibleDept', label: '主办部门' },
    { key: 'dealTimelimit', label: '办件时限' },
    { key: 'docClass', label: '一级分类' },
    { key: 'docSecondClass', label: '二级分类' },
    { key: 'docType', label: '文件类型' },
    { key: 'acceptNumber', label: '受理文号' }
  ],
  ['sendDocNumber', 'subject', 'sendDept', 'sendTime', 'draftPerson', 'urgencyDegree']
)

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

const { handleInvalidate: handleDelete } = useBpmInvalidate(SendDocApi.deleteSendDoc, getList)

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

const formatSendDocNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return val
  const strVal = String(val)
  // 如果是数字（历史字典键值），进行匹配转换
  if (/^\d+$/.test(strVal)) {
    const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
    const dict = dicts.find((d) => String(d.value) === strVal)
    if (dict) {
      return dict.label
    }
  }
  return val
}

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
