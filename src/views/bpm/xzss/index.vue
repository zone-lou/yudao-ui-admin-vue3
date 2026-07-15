<template>
  <ContentWrap>
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="来文号" prop="swWh">
        <el-input
          v-model="queryParams.swWh"
          placeholder="请输入来文号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="来文机关" prop="swJg">
        <el-input
          v-model="queryParams.swJg"
          placeholder="请输入来文机关"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="收文日期" prop="swRq">
        <el-date-picker
          v-model="queryParams.swRq"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          :shortcuts="defaultShortcuts"
        />
      </el-form-item>
      <el-form-item label="原告" prop="sqr">
        <el-input
          v-model="queryParams.sqr"
          placeholder="请输入原告"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="被告" prop="bsqr">
        <el-input
          v-model="queryParams.bsqr"
          placeholder="请输入被告"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="第三人" prop="dsr">
        <el-input
          v-model="queryParams.dsr"
          placeholder="请输入第三人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="街道地址" prop="tdZl">
        <el-input
          v-model="queryParams.tdZl"
          placeholder="请输入街道地址"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="诉讼类型" prop="ssLx">
        <el-select
          v-model="queryParams.ssLx"
          placeholder="请选择诉讼类型"
          clearable
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_ADMINISTRATIVE_LITIGATION_STAGE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="办理状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择办理状态" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_TASK_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="案件类别" prop="lb1">
        <el-select
          v-model="queryParams.lb1"
          placeholder="请选择案件类别"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS1)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="案件分类" prop="lb2">
        <el-select
          v-model="queryParams.lb2"
          placeholder="请选择案件分类"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS2)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="涉及事项" prop="lb3">
        <el-select
          v-model="queryParams.lb3"
          placeholder="请选择涉及事项"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS3)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="案件类型" prop="lb4">
        <el-select
          v-model="queryParams.lb4"
          placeholder="请选择案件类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS4)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showMore" label="诉讼类别" prop="lb5">
        <el-select
          v-model="queryParams.lb5"
          placeholder="请选择诉讼类别"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS5)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
<!--      <el-form-item v-show="showMore" label="诉讼内容" prop="ssNr">-->
<!--        <el-input-->
<!--          v-model="queryParams.ssNr"-->
<!--          placeholder="请输入诉讼内容"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item v-show="showMore" label="承办人" prop="cbr">-->
<!--        <el-input-->
<!--          v-model="queryParams.cbr"-->
<!--          placeholder="请输入承办人"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item v-show="showMore" label="承办日期" prop="cbRq">-->
<!--        <el-date-picker-->
<!--          v-model="queryParams.cbRq"-->
<!--          value-format="YYYY-MM-DD HH:mm:ss"-->
<!--          type="daterange"-->
<!--          start-placeholder="开始日期"-->
<!--          end-placeholder="结束日期"-->
<!--          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"-->
<!--          :shortcuts="defaultShortcuts"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item v-show="showMore" label="送法院日期" prop="sfyjgRq">-->
<!--        <el-date-picker-->
<!--          v-model="queryParams.sfyjgRq"-->
<!--          value-format="YYYY-MM-DD HH:mm:ss"-->
<!--          type="daterange"-->
<!--          start-placeholder="开始日期"-->
<!--          end-placeholder="结束日期"-->
<!--          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"-->
<!--          :shortcuts="defaultShortcuts"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item v-show="showMore" label="监督监管" prop="issupervise">-->
<!--        <el-select v-model="queryParams.issupervise" placeholder="请选择监督监管状态" clearable>-->
<!--          <el-option label="是" :value="1" />-->
<!--          <el-option label="否" :value="0" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
<!--      <el-form-item v-show="showMore" label="寄件提醒" prop="mailTip">-->
<!--        <el-select v-model="queryParams.mailTip" placeholder="请选择寄件提醒状态" clearable>-->
<!--          <el-option label="已提醒" :value="1" />-->
<!--          <el-option label="未提醒" :value="0" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
<!--      <el-form-item v-show="showMore" label="创建时间" prop="createTime">-->
<!--        <el-date-picker-->
<!--          v-model="queryParams.createTime"-->
<!--          value-format="YYYY-MM-DD HH:mm:ss"-->
<!--          type="daterange"-->
<!--          start-placeholder="开始日期"-->
<!--          end-placeholder="结束日期"-->
<!--          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"-->
<!--          :shortcuts="defaultShortcuts"-->
<!--        />-->
<!--      </el-form-item>-->
    </el-form>
    <div class="search-actions">
      <el-button link type="primary" @click="showMore = !showMore">
        {{ showMore ? '收起条件' : '更多条件' }}
        <Icon :icon="showMore ? 'ep:arrow-up' : 'ep:arrow-down'" class="ml-5px" />
      </el-button>
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      <el-button type="primary" @click="handleQuery">
        <Icon icon="ep:search" class="mr-5px" /> 搜索
      </el-button>
    </div>
  </ContentWrap>

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
      border
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" fixed="left" resizable />
<!--      <el-table-column type="expand">-->
<!--        <template #default="scope">-->
<!--          <el-tabs model-value="xzssKz">-->
<!--            <el-tab-pane label="行政诉讼拓展" name="xzssKz">-->
<!--              <XzssKzList :xm-guid="scope.row.id" />-->
<!--            </el-tab-pane>-->
<!--          </el-tabs>-->
<!--        </template>-->
<!--      </el-table-column>-->

      <el-table-column v-if="visibleColumn('swWh')" label="来文号" align="center" prop="swWh" min-width="180px" sortable="custom" resizable>
        <template #default="scope">
          <div class="flex items-center justify-center">
            <span>{{ scope.row.swWh }}</span>
            <dict-tag
              class="ml-2"
              :type="DICT_TYPE.BPM_TASK_STATUS"
              :value="scope.row.status !== null ? scope.row.status : 0"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column v-if="visibleColumn('swJg')" label="来文机关" align="center" prop="swJg" width="150px" sortable="custom" resizable>
        <template #default="scope">
          {{ formatDictOrStr(scope.row.swJg, DICT_TYPE.BPM_INCOMING_AUTHORITY_XZSS) }}
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('swRq')" label="收文日期" align="center" prop="swRq" width="200px" sortable="custom" resizable>
        <template #default="scope">
          {{ scope.row.swRq ? dateUtil(scope.row.swRq).format('YYYY-MM-DD HH:mm') : '' }}
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('sqr')" label="原告" align="center" prop="sqr" width="150px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('bsqr')" label="被告" align="center" prop="bsqr" width="150px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('dsr')" label="第三人" align="center" prop="dsr" width="150px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('tdZl')" label="土地坐落" align="center" prop="tdZl" width="200px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('ssLx')" label="诉讼类型" align="center" prop="ssLx" width="120px" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.ssLx != null"
            :type="DICT_TYPE.BPM_ADMINISTRATIVE_LITIGATION_STAGE"
            :value="scope.row.ssLx"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('lb1')" label="案件类别" align="center" prop="lb1" width="120px" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb1 != null"
            :type="DICT_TYPE.BPM_XZSS_CLASS1"
            :value="scope.row.lb1"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('lb2')" label="案件分类" align="center" prop="lb2" width="120px" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb2 != null"
            :type="DICT_TYPE.BPM_XZSS_CLASS2"
            :value="scope.row.lb2"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('lb3')" label="涉及事项" align="center" prop="lb3" width="120px" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb3 != null"
            :type="DICT_TYPE.BPM_XZSS_CLASS3"
            :value="scope.row.lb3"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('lb4')" label="案件类型" align="center" prop="lb4" width="120px" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb4 != null"
            :type="DICT_TYPE.BPM_XZSS_CLASS4"
            :value="scope.row.lb4"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('lb5')" label="诉讼类别" align="center" prop="lb5" width="120px" sortable="custom" resizable>
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb5 != null"
            :type="DICT_TYPE.BPM_XZSS_CLASS5"
            :value="scope.row.lb5"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('fyAh')" label="复议案号" align="center" prop="fyAh" min-width="160" show-overflow-tooltip sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('ssAh')" label="上一审案号" align="center" prop="ssAh" min-width="160" show-overflow-tooltip sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('ssNr')" label="诉讼请求" align="center" prop="ssNr" min-width="220" show-overflow-tooltip sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('cbr')" label="承办人" align="center" prop="cbr" width="120px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('cbRq')" label="承办日期" align="center" prop="cbRq" width="180px" sortable="custom" resizable>
        <template #default="scope">
          {{ scope.row.cbRq ? dateUtil(scope.row.cbRq).format('YYYY-MM-DD HH:mm') : '' }}
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('sfyjgRq')" label="送法院日期" align="center" prop="sfyjgRq" width="180px" sortable="custom" resizable>
        <template #default="scope">
          {{ scope.row.sfyjgRq ? dateUtil(scope.row.sfyjgRq).format('YYYY-MM-DD HH:mm') : '' }}
        </template>
      </el-table-column>
      <el-table-column v-if="visibleColumn('ssr')" label="上诉人" align="center" prop="ssr" width="150px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('bssr')" label="被上诉人" align="center" prop="bssr" width="150px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('zssqr')" label="再审申请人" align="center" prop="zssqr" width="150px" sortable="custom" resizable />
      <el-table-column v-if="visibleColumn('zsbsqr')" label="再审被申请人" align="center" prop="zsbsqr" width="160px" sortable="custom" resizable />
      <el-table-column label="操作" align="center" fixed="right" width="180px" resizable>
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)"> 详情 </el-button>

          <el-button
            link
            type="warning"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bpm:xzss:update']"
          >
            修改
          </el-button>

          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
            v-hasPermi="['bpm:xzss:delete']"
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

  <XzssForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getDictOptions, getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateUtil } from '@/utils/dateUtil'
import { defaultShortcuts } from '@/utils/formatTime'
import { XzssApi, Xzss } from '@/api/bpm/xzss'
import XzssForm from './XzssForm.vue'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'
import { useRouter } from 'vue-router'
import BpmColumnSetting from '@/views/bpm/components/BpmColumnSetting.vue'
import { useBpmColumnSetting } from '@/hooks/bpm/useBpmColumnSetting'

/** 行政诉讼 列表 */
defineOptions({ name: 'Xzss' })

const router = useRouter()
const loading = ref(true) // 列表的加载中
const list = ref<Xzss[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  swWh: undefined,
  swJg: undefined,
  swRq: [],
  sqr: undefined,
  bsqr: undefined,
  dsr: undefined,
  tdZl: undefined,
  ssLx: undefined,
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  lb4: undefined,
  lb5: undefined,
  ssNr: undefined,
  cbr: undefined,
  cbRq: [],
  sfyjgRq: [],
  issupervise: undefined,
  mailTip: undefined,
  status: undefined,
  createTime: [],
  orderField: undefined as string | undefined,
  orderDirection: undefined as string | undefined
})
const queryFormRef = ref() // 搜索的表单
const showMore = ref(false)
const { columnOptions, checkedColumnKeys, visibleColumn, resetColumns } = useBpmColumnSetting(
  'bpm:xzss:columns',
  [
    { key: 'swWh', label: '来文号' },
    { key: 'swJg', label: '来文机关' },
    { key: 'swRq', label: '收文日期' },
    { key: 'sqr', label: '原告' },
    { key: 'bsqr', label: '被告' },
    { key: 'dsr', label: '第三人' },
    { key: 'tdZl', label: '土地坐落' },
    { key: 'ssLx', label: '诉讼类型' },
    { key: 'lb1', label: '案件类别' },
    { key: 'lb2', label: '案件分类' },
    { key: 'lb3', label: '涉及事项' },
    { key: 'lb4', label: '案件类型' },
    { key: 'lb5', label: '诉讼类别' },
    { key: 'fyAh', label: '复议案号' },
    { key: 'ssAh', label: '上一审案号' },
    { key: 'ssNr', label: '诉讼请求' },
    { key: 'cbr', label: '承办人' },
    { key: 'cbRq', label: '承办日期' },
    { key: 'sfyjgRq', label: '送法院日期' },
    { key: 'ssr', label: '上诉人' },
    { key: 'bssr', label: '被上诉人' },
    { key: 'zssqr', label: '再审申请人' },
    { key: 'zsbsqr', label: '再审被申请人' }
  ],
  ['swWh', 'swJg', 'swRq', 'sqr', 'bsqr', 'dsr', 'tdZl', 'ssLx', 'lb1', 'lb2', 'lb3', 'lb4', 'lb5']
)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await XzssApi.getXzssPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const { handleInvalidate: handleDelete } = useBpmInvalidate(XzssApi.deleteXzss, getList)

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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleUpdate = (row: any) => {
  router.push({ name: 'OAxzssCreate', query: { businessId: row.id } })
}

/** 详情跳转逻辑 - 跳转到流程详情页 */
const handleDetail = (row: any) => {
  if (row.projectId) {
    router.push({
      name: 'BpmHistoryWorkflowDetail',
      query: { processInstanceId: row.processInstanceId, projectId: row.projectId }
    })
    return
  }
  if (!row.processInstanceId) {
    openForm('update', row.id)
    return
  }
  router.push({
    name: 'BpmProcessInstanceDetail',
    query: { id: row.processInstanceId }
  })
}

const formatDictOrStr = (val: any, dictType: string) => {
  if (val === undefined || val === null || val === '') return val
  const strVal = String(val)
  // 尝试在字典中查找
  const dicts = getDictOptions(dictType)
  const dict = dicts.find((d) => String(d.value) === strVal)
  if (dict) {
    return dict.label
  }
  // 如果字典没找到，说明可能是手动输入的文本，或者本身就是文本
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
