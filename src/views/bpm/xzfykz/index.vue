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
      <el-form-item label="复议决定日期" prop="fyjdRq">
        <el-date-picker
          v-model="queryParams.fyjdRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择复议决定日期"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="复议结果：0撤销，1维持" prop="fyJg">
        <el-input
          v-model="queryParams.fyJg"
          placeholder="请输入复议结果：0撤销，1维持"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="转业务科室日期" prop="zksRq">
        <el-date-picker
          v-model="queryParams.zksRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择转业务科室日期"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="意见书文号" prop="yjsWh">
        <el-input
          v-model="queryParams.yjsWh"
          placeholder="请输入意见书文号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="意见书日期" prop="yjsRq">
        <el-date-picker
          v-model="queryParams.yjsRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择意见书日期"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="行政赔偿，单位：元" prop="xzPc">
        <el-input
          v-model="queryParams.xzPc"
          placeholder="请输入行政赔偿，单位：元"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="执行情况" prop="zxQk">
        <el-input
          v-model="queryParams.zxQk"
          placeholder="请输入执行情况"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否装订：0否，1是" prop="sfZd">
        <el-input
          v-model="queryParams.sfZd"
          placeholder="请输入是否装订：0否，1是"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="装订人" prop="zdr">
        <el-input
          v-model="queryParams.zdr"
          placeholder="请输入装订人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="装订日期" prop="zdRq">
        <el-date-picker
          v-model="queryParams.zdRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择装订日期"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否移交：0否，1是" prop="sfYj">
        <el-input
          v-model="queryParams.sfYj"
          placeholder="请输入是否移交：0否，1是"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="移交人" prop="yjr">
        <el-input
          v-model="queryParams.yjr"
          placeholder="请输入移交人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="移交日期" prop="yjRq">
        <el-date-picker
          v-model="queryParams.yjRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择移交日期"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="备注" prop="bz">
        <el-input
          v-model="queryParams.bz"
          placeholder="请输入备注"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="意见书内容" prop="yjsNr">
        <el-input
          v-model="queryParams.yjsNr"
          placeholder="请输入意见书内容"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="听证日期" prop="tzRq">
        <el-date-picker
          v-model="queryParams.tzRq"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择听证日期"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="流程实例的编号" prop="processInstanceId">
        <el-input
          v-model="queryParams.processInstanceId"
          placeholder="请输入流程实例的编号"
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
          v-hasPermi="['bpm:xzfy-kz:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['bpm:xzfy-kz:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['bpm:xzfy-kz:delete']"
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
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column
        label="复议决定日期"
        align="center"
        prop="fyjdRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="复议结果：0撤销，1维持" align="center" prop="fyJg" />
      <el-table-column
        label="转业务科室日期"
        align="center"
        prop="zksRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="意见书文号" align="center" prop="yjsWh" />
      <el-table-column
        label="意见书日期"
        align="center"
        prop="yjsRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="行政赔偿，单位：元" align="center" prop="xzPc" />
      <el-table-column label="执行情况" align="center" prop="zxQk" />
      <el-table-column label="是否装订：0否，1是" align="center" prop="sfZd" />
      <el-table-column label="装订人" align="center" prop="zdr" />
      <el-table-column
        label="装订日期"
        align="center"
        prop="zdRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="是否移交：0否，1是" align="center" prop="sfYj" />
      <el-table-column label="移交人" align="center" prop="yjr" />
      <el-table-column
        label="移交日期"
        align="center"
        prop="yjRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="备注" align="center" prop="bz" />
      <el-table-column label="意见书内容" align="center" prop="yjsNr" />
      <el-table-column
        label="听证日期"
        align="center"
        prop="tzRq"
        :formatter="dateFormatter"
        width="180px"
      />
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
            v-hasPermi="['bpm:xzfy-kz:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['bpm:xzfy-kz:delete']"
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
  <XzfyKzForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { XzfyKzApi, XzfyKz } from '@/api/bpm/xzfykz'
import XzfyKzForm from './XzfyKzForm.vue'

/** 行政复议扩展 列表 */
defineOptions({ name: 'XzfyKz' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<XzfyKz[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  fyjdRq: undefined,
  fyjdRq: [],
  fyJg: undefined,
  zksRq: undefined,
  zksRq: [],
  yjsWh: undefined,
  yjsRq: undefined,
  yjsRq: [],
  xzPc: undefined,
  zxQk: undefined,
  sfZd: undefined,
  zdr: undefined,
  zdRq: undefined,
  zdRq: [],
  sfYj: undefined,
  yjr: undefined,
  yjRq: undefined,
  yjRq: [],
  bz: undefined,
  yjsNr: undefined,
  tzRq: undefined,
  tzRq: [],
  processInstanceId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await XzfyKzApi.getXzfyKzPage(queryParams)
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
    await XzfyKzApi.deleteXzfyKz(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除行政复议扩展 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await XzfyKzApi.deleteXzfyKzList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: XzfyKz[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await XzfyKzApi.exportXzfyKz(queryParams)
    download.excel(data, '行政复议扩展.xls')
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