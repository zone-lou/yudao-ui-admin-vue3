<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="auto"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="来文号" prop="swWh">
            <el-input
              v-model="queryParams.swWh"
              placeholder="请输入来文号"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="来文机关" prop="swJg">
            <el-input
              v-model="queryParams.swJg"
              placeholder="请输入来文机关"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收文日期" prop="swRq">
            <el-date-picker
              v-model="queryParams.swRq"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请人" prop="sqr">
            <el-input
              v-model="queryParams.sqr"
              placeholder="请输入申请人"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="案件分类" prop="lb1">
            <el-select
              v-model="queryParams.lb1"
              placeholder="请选择案件分类"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.BPM_XZFY_CLASS1)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="涉及事项" prop="lb2">
            <el-select
              v-model="queryParams.lb2"
              placeholder="请选择涉及事项"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.BPM_XZFY_CLASS2)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="案件类型" prop="lb3">
            <el-select
              v-model="queryParams.lb3"
              placeholder="请选择案件类型"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.BPM_XZFY_CLASS3)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-col :span="24" class="text-right" style="margin-top: 10px">
      <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />查询</el-button>
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
    </el-col>
  </ContentWrap>

  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column type="selection" width="55" />
      <!--      <el-table-column type="expand">-->
      <!--        <template #default="scope">-->
      <!--          <el-tabs model-value="xzfyKz">-->
      <!--            <el-tab-pane label="行政复议扩展" name="xzfyKz">-->
      <!--              <XzfyKzList :xm-guid="scope.row.id" />-->
      <!--            </el-tab-pane>-->
      <!--          </el-tabs>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <el-table-column label="来文号" align="center" prop="swWh" min-width="180px">
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

      <el-table-column label="来文机关" align="center" prop="swJg" width="150px">
        <template #default="scope">
          {{ formatDictOrStr(scope.row.swJg, DICT_TYPE.BPM_INCOMING_AUTHORITY) }}
        </template>
      </el-table-column>
      <el-table-column label="来文日期" align="center" prop="swRq" width="200px">
        <template #default="scope">
          {{ scope.row.swRq ? dateUtil(scope.row.swRq).format('YYYY-MM-DD HH:mm') : '' }}
        </template>
      </el-table-column>
      <el-table-column label="申请人" align="center" prop="sqr" width="150px" />
      <el-table-column label="被申请人" align="center" prop="bsqr" width="150px" />
      <el-table-column label="第三人" align="center" prop="dsr" width="150px" />
      <el-table-column label="土地坐落" align="center" prop="tdZl" width="200px" />
      <el-table-column label="案件分类" align="center" prop="lb1" width="100px">
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb1 != null"
            :type="DICT_TYPE.BPM_XZFY_CLASS1"
            :value="scope.row.lb1"
          />
        </template>
      </el-table-column>
      <el-table-column label="涉及事项" align="center" prop="lb2" width="100px">
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb2 != null"
            :type="DICT_TYPE.BPM_XZFY_CLASS2"
            :value="scope.row.lb2"
          />
        </template>
      </el-table-column>
      <el-table-column label="案件类型" align="center" prop="lb3" width="100px">
        <template #default="scope">
          <dict-tag
            v-if="scope.row.lb3 != null"
            :type="DICT_TYPE.BPM_XZFY_CLASS3"
            :value="scope.row.lb3"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="180px">
        <template #default="scope">
          <el-button
            v-if="!scope.row.processInstanceId"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:xzfy:update']"
          >
            编辑
          </el-button>

          <el-button v-else link type="primary" @click="handleDetail(scope.row)"> 详情 </el-button>

          <el-button
            v-if="scope.row.processInstanceId"
            link
            type="warning"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:xzfy:update']"
          >
            修改
          </el-button>

          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
            v-hasPermi="['bpm:xzfy:delete']"
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

  <XzfyForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, getDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateUtil } from '@/utils/dateUtil'
import { XzfyApi, Xzfy } from '@/api/bpm/xzfy'
import XzfyForm from './XzfyForm.vue'
import XzfyKzList from './components/XzfyKzList.vue'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'
import { useRouter } from 'vue-router'

/** 行政复议 列表 */
defineOptions({ name: 'Xzfy' })

const router = useRouter()

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

const { handleInvalidate: handleDelete } = useBpmInvalidate(XzfyApi.deleteXzfy, getList)

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

/** 详情跳转逻辑 - 跳转到流程详情页 */
const handleDetail = (row: any) => {
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
