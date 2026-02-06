<template>
  <Dialog title="关联分管部门" v-model="dialogVisible" width="800px">
    <el-form ref="formRef" :model="formData" v-loading="formLoading" label-width="80px">
      <el-form-item label="用户名称">
        <el-input v-model="formData.username" disabled />
      </el-form-item>
      <el-form-item label="选择部门" required>
        <el-transfer
          v-model="selectedDeptIds"
          :data="deptList"
          :props="{
            key: 'id',
            label: 'name'
          }"
          :titles="['未选部门', '已选部门']"
          filterable
          filter-placeholder="请输入部门名称搜索"
          style="width: 100%; display: flex; justify-content: center; align-items: center"
        >
          <template #default="{ option }">
            <span>{{ option.name }}</span>
          </template>
        </el-transfer>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElTree, ElMessage } from 'element-plus'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

const dialogVisible = ref(false)
const formLoading = ref(false)
const deptList = ref<any[]>([])
// 已选中的部门ID数组
const selectedDeptIds = ref<number[]>([])

const formData = reactive({
  userId: 0,
  username: ''
})

/** 打开弹窗 */
const open = async (row: any) => {
  dialogVisible.value = true
  formData.userId = row.id
  formData.username = row.nickname
  formLoading.value = true

  selectedDeptIds.value = []
  deptList.value = []

  try {
    // 1. 并行获取部门列表和用户已关联ID
    const [deptResult, userDeptResult] = await Promise.all([
      DeptApi.getSimpleDeptList(),
      UserApi.getUserDeptIds(row.id)
    ])

    deptList.value = deptResult

    // 设置右侧已选数据
    // 注意：el-transfer 对类型敏感，确保 userDeptResult 里的 ID 是 number 类型
    selectedDeptIds.value = userDeptResult
  } finally {
    formLoading.value = false
  }
}

/** 提交表单 */
const submitForm = async () => {
  formLoading.value = true
  try {
    await UserApi.assignUserDept({
      userId: formData.userId,
      deptIds: selectedDeptIds.value // 直接传数组即可
    })

    ElMessage.success('关联部门成功')
    dialogVisible.value = false
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })
</script>

<!--<style scoped>-->
<!--/* 调整穿梭框内部宽度，使其更美观 */-->
<!--//:deep(.el-transfer-panel) {-->
<!--//  width: 300px;-->
<!--//}-->
<!--</style>-->
