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
      <!--      <el-row :gutter="20">-->

      <!--      </el-row>-->
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
          class="!w-220px"
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
      <el-form-item label="诉讼类型" prop="ssLx">
        <el-input
          v-model="queryParams.ssLx"
          placeholder="请输入诉讼类型"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="案件类别" prop="lb1">
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
      <el-form-item label="案件分类" prop="lb2">
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
      <el-form-item label="涉及事项" prop="lb3">
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
      <el-form-item label="案件类型" prop="lb4">
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
      <el-form-item label="诉讼类别" prop="lb5">
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
      <!-- <el-form-item label="复议请求" prop="ssNr">
        <el-input
          v-model="queryParams.ssNr"
          placeholder="请输入复议请求"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="承办人" prop="cbr">
        <el-input
          v-model="queryParams.cbr"
          placeholder="请输入承办人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="承办日期" prop="cbRq">
        <el-date-picker
          v-model="queryParams.cbRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择承办日期"
          clearable
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="送法院日期" prop="sfyjgRq">
        <el-date-picker
          v-model="queryParams.sfyjgRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择送法院日期"
          clearable
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="监督监管" prop="issupervise">
        <el-input
          v-model="queryParams.issupervise"
          placeholder="请输入监督监管"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!--       <el-form-item label="是否已寄件提醒" prop="mailTip">
        <el-input
          v-model="queryParams.mailTip"
          placeholder="请输入是否已寄件提醒"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
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
      <!-- 子表的列表 -->
      <el-table-column type="expand">
        <template #default="scope">
          <el-tabs model-value="xzssKz">
            <el-tab-pane label="行政诉讼拓展" name="xzssKz">
              <XzssKzList :xm-guid="scope.row.id" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-table-column>
      <!-- <el-table-column label="主键" align="center" prop="id" /> -->
      <el-table-column label="来文号" align="center" prop="swWh" width="130px" />
      <el-table-column label="来文机关" align="center" prop="swJg" width="150px">
        <template #default="scope">
          {{ formatDictOrStr(scope.row.swJg, DICT_TYPE.BPM_INCOMING_AUTHORITY_XZSS) }}
        </template>
      </el-table-column>
      <el-table-column
        label="收文日期"
        align="center"
        prop="swRq"
        :formatter="dateFormatter2"
        width="120px"
      />
      <el-table-column label="原告" align="center" prop="sqr" width="100px" />
      <el-table-column label="被告" align="center" prop="bsqr" width="100px" />
      <el-table-column label="第三人" align="center" prop="dsr" width="100px" />
      <el-table-column label="土地坐落" align="center" prop="tdZl" width="100px" />
      <el-table-column label="诉讼类型" align="center" prop="ssLx" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_ADMINISTRATIVE_LITIGATION_STAGE" :value="scope.row.ssLx" />
        </template>
      </el-table-column>
      <el-table-column label="案件类别" align="center" prop="lb1" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS1" :value="scope.row.lb1" />
        </template>
      </el-table-column>
      <el-table-column label="案件分类" align="center" prop="lb2" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS2" :value="scope.row.lb2" />
        </template>
      </el-table-column>
      <el-table-column label="涉及事项" align="center" prop="lb3" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS3" :value="scope.row.lb3" />
        </template>
      </el-table-column>
      <el-table-column label="案件类型" align="center" prop="lb4" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS4" :value="scope.row.lb4" />
        </template>
      </el-table-column>
      <el-table-column label="诉讼类别" align="center" prop="lb5" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS5" :value="scope.row.lb5" />
        </template>
      </el-table-column>
      <el-table-column label="复议请求" align="center" prop="ssNr" />
      <el-table-column label="承办人" align="center" prop="cbr" />
      <el-table-column
        label="承办日期"
        align="center"
        prop="cbRq"
        :formatter="dateFormatter2"
        width="120px"
      />
      <el-table-column
        label="送法院日期"
        align="center"
        prop="sfyjgRq"
        :formatter="dateFormatter2"
        width="120px"
      />
      <el-table-column label="上诉人" align="center" prop="ssr" />
      <el-table-column label="被上诉人" align="center" prop="bssr" />
      <el-table-column label="再审申请人" align="center" prop="zssqr" />
      <el-table-column label="再审被申请人" align="center" prop="zsbsqr" />
      <el-table-column label="监督监管" align="center" prop="issupervise">
        <template #default="scope">
          {{ formatBoolean(scope.row.issupervise) }}
        </template>
      </el-table-column>
      <el-table-column
        label="办理时限"
        align="center"
        prop="zhubandate"
        :formatter="dateFormatter2"
        width="120px"
      />
      <el-table-column label="诉讼内容" align="center" prop="ssnr" />
      <el-table-column label="是否已寄件提醒" align="center" prop="mailTip">
        <template #default="scope">
          {{ formatBoolean(scope.row.mailTip) }}
        </template>
      </el-table-column>
      <el-table-column label="办理状态" align="center" prop="status">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <dict-tag
              class="ml-2"
              :type="DICT_TYPE.BPM_TASK_STATUS"
              :value="scope.row.status !== null ? scope.row.status : 0"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:xzss:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
            v-hasPermi="['bpm:xzss:delete']"
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
  <XzssForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, getDictOptions, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { XzssApi, Xzss } from '@/api/bpm/xzss'
import XzssForm from './XzssForm.vue'
import XzssKzList from './components/XzssKzList.vue'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'

/** 行政诉讼 列表 */
defineOptions({ name: 'Xzss' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

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
  ssLx: undefined,
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  lb4: undefined,
  lb5: undefined,
  ssNr: undefined,
  cbr: undefined,
  cbRq: undefined,
  cbRq: [],
  sfyjgRq: undefined,
  sfyjgRq: [],
  issupervise: undefined,
  mailTip: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

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

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Xzss[]) => {
  checkedIds.value = records.map((item) => item.id!)
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

const formatBoolean = (val: any) => {
  if (val === 1) return '是'
  if (val === 0) return '否'
  return val
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
