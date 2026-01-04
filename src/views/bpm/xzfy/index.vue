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
      <el-form-item label="来文日期" prop="swRq">
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
      <el-form-item label="申请人" prop="sqr">
        <el-input
          v-model="queryParams.sqr"
          placeholder="请输入申请人"
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
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['bpm:xzfy:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['bpm:xzfy:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['bpm:xzfy:delete']"
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
          <el-tabs model-value="xzfyKz">
            <el-tab-pane label="行政复议扩展" name="xzfyKz">
              <XzfyKzList :xm-guid="scope.row.id" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-table-column>
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="来文号" align="center" prop="swWh" />
      <el-table-column label="来文机关" align="center" prop="swJg" />
      <el-table-column
        label="来文日期"
        align="center"
        prop="swRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="申请人" align="center" prop="sqr" />
      <el-table-column label="被申请人" align="center" prop="bsqr" />
      <el-table-column label="第三人" align="center" prop="dsr" />
      <el-table-column label="土地坐落" align="center" prop="tdZl" />
      <el-table-column label="类别一" align="center" prop="lb1" />
      <el-table-column label="类别二" align="center" prop="lb2" />
      <el-table-column label="类别三" align="center" prop="lb3" />
      <el-table-column label="承办人" align="center" prop="cbr" />
      <el-table-column
        label="承办日期"
        align="center"
        prop="cbRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="送复议机关日期"
        align="center"
        prop="sfyjgRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="行政区（街道、村）" align="center" prop="xzq" />
      <el-table-column label="监督监管" align="center" prop="issupervise" />
      <el-table-column
        label="办理时限"
        align="center"
        prop="zhubandate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="是否已寄件提醒" align="center" prop="mailTip" />
      <el-table-column label="流程实例的编号" align="center" prop="processInstanceId" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:xzfy:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['bpm:xzfy:delete']"
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
  <XzfyForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { XzfyApi, Xzfy } from '@/api/bpm/xzfy'
import XzfyForm from './XzfyForm.vue'
import XzfyKzList from './components/XzfyKzList.vue'

/** 行政复议 列表 */
defineOptions({ name: 'Xzfy' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Xzfy[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  swWh: undefined,
  swJg: undefined,
  swRq: [],
  sqr: undefined,
  dsr: undefined,
  lb1: undefined,
  lb2: undefined,
  lb3: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await XzfyApi.getXzfyPage(queryParams)
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
    await XzfyApi.deleteXzfy(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除行政复议 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await XzfyApi.deleteXzfyList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Xzfy[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await XzfyApi.exportXzfy(queryParams)
    download.excel(data, '行政复议.xls')
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