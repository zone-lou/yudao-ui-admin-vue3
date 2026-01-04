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
      <el-form-item label="诉讼类型：1一审，2二审，3再审，如果多次，继续记录" prop="ssLx">
        <el-input
          v-model="queryParams.ssLx"
          placeholder="请输入诉讼类型：1一审，2二审，3再审，如果多次，继续记录"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="类别一" prop="lb1">
        <el-input
          v-model="queryParams.lb1"
          placeholder="请输入类别一"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="类别二" prop="lb2">
        <el-input
          v-model="queryParams.lb2"
          placeholder="请输入类别二"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="类别三" prop="lb3">
        <el-input
          v-model="queryParams.lb3"
          placeholder="请输入类别三"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="类别四" prop="lb4">
        <el-input
          v-model="queryParams.lb4"
          placeholder="请输入类别四"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="类别五" prop="lb5">
        <el-input
          v-model="queryParams.lb5"
          placeholder="请输入类别五"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="复议请求" prop="ssNr">
        <el-input
          v-model="queryParams.ssNr"
          placeholder="请输入复议请求"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="承办人" prop="cbr">
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
      </el-form-item>
      <el-form-item label="送法院日期" prop="sfyjgRq">
        <el-date-picker
          v-model="queryParams.sfyjgRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择送法院日期"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="监督监管" prop="issupervise">
        <el-input
          v-model="queryParams.issupervise"
          placeholder="请输入监督监管"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否已寄件提醒" prop="mailTip">
        <el-input
          v-model="queryParams.mailTip"
          placeholder="请输入是否已寄件提醒"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
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
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['bpm:xzss:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['bpm:xzss:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['bpm:xzss:delete']"
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
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="来文号" align="center" prop="swWh" />
      <el-table-column label="来文机关" align="center" prop="swJg" />
      <el-table-column
        label="收文日期"
        align="center"
        prop="swRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="原告" align="center" prop="sqr" />
      <el-table-column label="被告" align="center" prop="bsqr" />
      <el-table-column label="第三人" align="center" prop="dsr" />
      <el-table-column label="土地坐落" align="center" prop="tdZl" />
      <el-table-column label="诉讼类型：1一审，2二审，3再审，如果多次，继续记录" align="center" prop="ssLx" />
      <el-table-column label="类别一" align="center" prop="lb1" />
      <el-table-column label="类别二" align="center" prop="lb2" />
      <el-table-column label="类别三" align="center" prop="lb3" />
      <el-table-column label="类别四" align="center" prop="lb4" />
      <el-table-column label="类别五" align="center" prop="lb5" />
      <el-table-column label="复议请求" align="center" prop="ssNr" />
      <el-table-column label="承办人" align="center" prop="cbr" />
      <el-table-column
        label="承办日期"
        align="center"
        prop="cbRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="送法院日期"
        align="center"
        prop="sfyjgRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="上诉人" align="center" prop="ssr" />
      <el-table-column label="被上诉人" align="center" prop="bssr" />
      <el-table-column label="再审申请人" align="center" prop="zssqr" />
      <el-table-column label="再审被申请人" align="center" prop="zsbsqr" />
      <el-table-column label="监督监管" align="center" prop="issupervise" />
      <el-table-column
        label="办理时限"
        align="center"
        prop="zhubandate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="诉讼内容" align="center" prop="ssnr" />
      <el-table-column label="是否已寄件提醒" align="center" prop="mailTip" />
      <el-table-column label="流程实例的编号" align="center" prop="processInstanceId" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
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
            v-hasPermi="['bpm:xzss:delete']"
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
  <XzssForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { XzssApi, Xzss } from '@/api/bpm/xzss'
import XzssForm from './XzssForm.vue'
import XzssKzList from './components/XzssKzList.vue'

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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await XzssApi.deleteXzss(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除行政诉讼 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await XzssApi.deleteXzssList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Xzss[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await XzssApi.exportXzss(queryParams)
    download.excel(data, '行政诉讼.xls')
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