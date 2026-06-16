<template>
  <ContentWrap>
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="标题" prop="subject">
        <el-input
          v-model="queryParams.subject"
          placeholder="请输入标题"
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
          :shortcuts="defaultShortcuts"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办理状态" prop="status">
        <el-select v-model="queryParams.status" clearable class="!w-240px" placeholder="请选择办理状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_TASK_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来源" prop="source">
        <el-select
          v-model="queryParams.source"
          placeholder="请选择来源"
          clearable
          class="!w-240px"
          @change="handleQuery"
        >
          <el-option
            v-for="item in sourceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="收文编号" prop="receiveDocNumber">
        <el-input
          v-model="queryParams.receiveDocNumber"
          placeholder="请输入收文编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item v-show="showMore" label="来文字号" prop="sendDocNumber">
        <el-input
          v-model="queryParams.sendDocNumber"
          placeholder="请输入来文字号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item v-show="showMore" label="来文单位" prop="sendDept">
        <el-select
          v-model="queryParams.sendDept"
          placeholder="请选择或输入来文单位"
          clearable
          filterable
          allow-create
          default-first-option
          @blur="(e) => handleSelectBlur(e, 'sendDept', DICT_TYPE.BPM_AGENCY_NAME)"
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_AGENCY_NAME)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="单位类别" prop="docClass">
        <el-select
          v-model="queryParams.docClass"
          placeholder="请选择单位类别"
          clearable
          filterable
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
      <el-form-item v-show="showMore" label="文件类别" prop="docSecondClass">
        <el-select
          v-model="queryParams.docSecondClass"
          placeholder="请选择或输入文件类别"
          clearable
          filterable
          allow-create
          default-first-option
          @blur="(e) => handleSelectBlur(e, 'docSecondClass', DICT_TYPE.BPM_DOC_CLASS, true)"
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_DOC_CLASS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="紧急程度" prop="urgencyDegree">
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
      <el-button link type="primary" @click="showMore = !showMore">
        {{ showMore ? '收起条件' : '更多条件' }}
        <Icon :icon="showMore ? 'ep:arrow-up' : 'ep:arrow-down'" class="ml-5px" />
      </el-button>
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
      <el-button type="primary" @click="handleQuery">
        <Icon icon="ep:search" class="mr-5px" />查询
      </el-button>
    </div>
  </ContentWrap>

  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      border
      @sort-change="handleSortChange"
    >
      <el-table-column label="标题" align="center" prop="subject" show-overflow-tooltip width="355" sortable="custom" resizable>
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row.id)">{{ scope.row.subject }}</span>
        </template>
      </el-table-column>

      <el-table-column label="单位类别" align="center" prop="docClass" width="120" sortable="custom" resizable>
        <template #default="scope">
          <el-tag
            v-if="scope.row.docClass != null"
            :style="getTagStyle('docClass', scope.row.docClass)"
          >
            {{ getDisplayText(DICT_TYPE.BPM_RECEICE_CLASS, scope.row.docClass) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="收文编号" align="center" prop="receiveDocNumber" min-width="180" sortable="custom" resizable>
        <template #default="scope">
          <div class="flex items-center justify-center">
            <span>{{ scope.row.receiveDocNumber }}</span>
            <dict-tag
              class="ml-2"
              :type="DICT_TYPE.BPM_TASK_STATUS"
              :value="scope.row.status !== null ? scope.row.status : 0"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column label="来源" align="center" prop="source" width="128" sortable="custom" resizable>
        <template #default="scope">
          <el-tag :style="getSourceTagStyle(scope.row.source)">
            {{ getSourceText(scope.row.source) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="来文单位" align="center" prop="sendDept" min-width="150" sortable="custom" resizable>
        <template #default="scope">
          <template v-if="scope.row.sendDept">
            <el-tag :style="getTagStyle('sendDept', scope.row.sendDept)">
              {{ getDisplayText(DICT_TYPE.BPM_AGENCY_NAME, scope.row.sendDept) }}
            </el-tag>
          </template>
          <span v-else class="text-gray-400">—</span>
        </template>
      </el-table-column>
      <el-table-column label="来文字号" align="center" prop="sendDocNumber" min-width="150" sortable="custom" resizable>
        <template #default="scope">
          {{ formatSendDocNumber(scope.row.sendDocNumber) }}
        </template>
      </el-table-column>
      <el-table-column label="文件类别" align="center" prop="docSecondClass" width="120" sortable="custom" resizable>
        <template #default="scope">
          <el-tag
            v-if="String(scope.row.docSecondClass ?? '').trim()"
            :style="getTagStyle('docSecondClass', scope.row.docSecondClass)"
          >
            {{ getDisplayText(DICT_TYPE.BPM_DOC_CLASS, scope.row.docSecondClass, true) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="紧急程度" align="center" prop="urgencyDegree" width="120" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.urgencyDegree != null"
            :type="DICT_TYPE.BPM_EMERGENCY_DEGREE"
            :value="scope.row.urgencyDegree"
          />
        </template>
      </el-table-column>

      <el-table-column label="收文日期" align="center" prop="receiveTime" width="200px" sortable="custom" resizable>
        <template #default="scope">
          {{ scope.row.receiveTime ? dateUtil(scope.row.receiveTime).format('YYYY-MM-DD HH:mm') : '' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180px" fixed="right" resizable>
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
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
            v-hasPermi="['bpm:receive-doc:delete']"
          >
            作废
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
import { dateUtil } from '@/utils/dateUtil'
import { defaultShortcuts } from '@/utils/formatTime'
import { ReceiveDocApi, ReceiveDoc } from '@/api/bpm/receivedoc'
import { useRouter } from 'vue-router'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'

/** 收文 列表 */
defineOptions({ name: 'ReceiveDoc' })

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
  docSecondClass: undefined,
  status: 0,
  source: undefined,
  orderField: undefined as string | undefined,
  orderDirection: undefined as string | undefined
})
const queryFormRef = ref() // 搜索的表单
const showMore = ref(false)
const WEB_CREATE_SOURCE = '网页新建'
const sourceOptions = [
  { label: '市局公文', value: '市局公文' },
  { label: '通知公告', value: '通知公告' },
  { label: '两办转部门文件', value: '两办转部门文件' },
  { label: '林业局收文', value: '林业局收文' },
  { label: '省厅收文', value: '省厅收文' },
  { label: WEB_CREATE_SOURCE, value: WEB_CREATE_SOURCE },
  { label: '未知来源', value: '未知来源' }
]


/** 处理输入框直接失去焦点时保留文字 */
const handleSelectBlur = (e: any, field: string, dictType: string, isInt: boolean = false) => {
  const val = e.target?.value
  if (val === undefined) return
  if (!val) {
    return
  }
  const dicts = isInt ? getIntDictOptions(dictType as any) : getStrDictOptions(dictType as any)
  const match = (dicts || []).find((d: any) => d.label === val)
  if (match) {
    ;(queryParams as any)[field] =
      field === 'sendDept' || field === 'docSecondClass' ? match.label : match.value
  } else {
    ;(queryParams as any)[field] = isInt && !isNaN(Number(val)) ? Number(val) : val
  }
}

/** 获取自定义样式，契合政务OA主题 */
const getTagStyle = (type: string, val: string | number) => {
  if (!val) return {}

  // 采用契合党政机关或企业正式公文的沉稳色系
  if (type === 'docClass') {
    // 绿色系 (沉稳环保绿)
    return {
      backgroundColor: '#f0f9eb',
      borderColor: '#e1f3d8',
      color: '#2d8a4e'
    }
  } else if (type === 'sendDept') {
    // 蓝色系 (政务/商务经典蓝)
    return {
      backgroundColor: '#f0f5ff',
      borderColor: '#c6d9fd',
      color: '#1d5bd1'
    }
  } else if (type === 'docSecondClass') {
    // 红色系 (贴合红头文件/重点标识)
    return {
      backgroundColor: '#fdf2f2',
      borderColor: '#fcd3d3',
      color: '#d71920'
    }
  }
  return {}
}

const getSourceText = (source?: string) => source || WEB_CREATE_SOURCE

const getSourceTagStyle = (source?: string) => {
  const sourceText = getSourceText(source)
  const styleMap: Record<string, any> = {
    市局公文: { backgroundColor: '#eef6ff', borderColor: '#bfdbfe', color: '#1d4ed8' },
    通知公告: { backgroundColor: '#fefce8', borderColor: '#fde68a', color: '#a16207' },
    两办转部门文件: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' },
    林业局收文: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' },
    省厅收文: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8', color: '#be185d' },
    网页新建: { backgroundColor: '#f4f4f5', borderColor: '#d4d4d8', color: '#52525b' },
    未知来源: { backgroundColor: '#fff7ed', borderColor: '#fed7aa', color: '#c2410c' }
  }
  return styleMap[sourceText] || styleMap[WEB_CREATE_SOURCE]
}

/** 获取显示文本 */
const getDisplayText = (dictType: string, val: string | number, isInt: boolean = false) => {
  if (val === null || val === undefined) return ''
  const dicts = isInt ? getIntDictOptions(dictType as any) : getStrDictOptions(dictType as any)
  if (!dicts) return String(val)
  const text = String(val)
  const match = dicts.find((d: any) => {
    const dictValue = String(d.value)
    const dictLabel = String(d.label)
    return dictValue === text || dictLabel === text
  })
  return match ? match.label : text
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
      docClass: queryParams.docClass,
      sendDept: queryParams.sendDept,
      sendDocNumber: queryParams.sendDocNumber,
      receiveDocNumber: queryParams.receiveDocNumber,
      receiveTime: queryParams.receiveTime,
      subject: queryParams.subject,
      urgencyDegree: queryParams.urgencyDegree,
      docSecondClass: queryParams.docSecondClass,
      status: queryParams.status,
      source: queryParams.source,
      orderField: queryParams.orderField,
      orderDirection: queryParams.orderDirection
    }
    const data = await ReceiveDocApi.getReceiveDocPage(params)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const { handleInvalidate: handleDelete } = useBpmInvalidate(ReceiveDocApi.deleteReceiveDoc, getList)

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const handleSortChange = ({ prop, order }: any) => {
  queryParams.orderField = order ? prop : undefined
  queryParams.orderDirection = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined
  handleQuery()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
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

const formatSendDocNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return val
  const strVal = String(val)
  // 如果是数字（字典键值），则进行转换
  if (/^\d+$/.test(strVal)) {
    const dicts = getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)
    const dict = dicts.find((d) => String(d.value) === strVal)
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

<style scoped>
.link-type {
  color: #303133;
  text-decoration: underline;
  cursor: pointer;
}

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
