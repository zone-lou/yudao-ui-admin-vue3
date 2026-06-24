<template>
  <Dialog v-model="dialogVisible" title="值班导入" width="400">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            是否更新已经存在的数据
          </div>
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as DutyApi from '@/api/system/dutystaff'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/utils/download'
import { UserVO } from '@/api/system/user'

defineOptions({ name: 'SystemDutyImportForm' })

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const uploadRef = ref()
const importUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/system/duty/staff/import'
const uploadHeaders = ref() // 上传 Header 头
const fileList = ref([]) // 文件列表
const updateSupport = ref(0) // 是否更新已经存在的用户数据

/** 打开弹窗 */
const open = () => {
  dialogVisible.value = true
  updateSupport.value = 0
  fileList.value = []
  resetForm()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  if (fileList.value.length == 0) {
    message.error('请上传文件')
    return
  }
  // 提交请求
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
  formLoading.value = true
  uploadRef.value!.submit()
}

/** 文件上传成功 */
const emits = defineEmits(['success'])
// const submitFormSuccess = (response: any) => {
//   if (response.code !== 0) {
//     message.error(response.msg)
//     resetForm()
//     return
//   }
//   // 拼接提示语
//   const data = response.data
//   let text = '上传成功数量：' + data.createDutyNames.length + ';'
//   for (let username of data.createDutyNames) {
//     text += '< ' + username + ' >'
//   }
//   // text += '更新成功数量：' + data.updateUsernames.length + ';'
//   // for (const username of data.updateUsernames) {
//   //   text += '< ' + username + ' >'
//   // }
//   text += '插入失败数量：' + Object.keys(data.failureDutyNames).length + ';'
//   for (const username in data.failureDutyNames) {
//     text += '< ' + username + ': ' + data.failureDutyNames[username] + ' >'
//   }
//   message.alert(text)
//   formLoading.value = false
//   dialogVisible.value = false
//   // 发送操作成功的事件
//   emits('success')
// }

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error('上传失败，请您重新上传！')
  formLoading.value = false
}

/** 重置表单 */
const resetForm = async (): Promise<void> => {
  // 重置上传状态和文件
  formLoading.value = false
  await nextTick()
  uploadRef.value?.clearFiles()
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('最多只能上传一个文件！')
}

/** 下载模板操作 */
const importTemplate = async () => {
  const res = await DutyApi.StaffApi.importDutyTemplate()
  download.excel(res, '值班导入模版.xls')
}

const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    resetForm()
    return
  }

  const data = response.data
  const createCount = data.createDutyNames.length
  const updateCount = data.updateDutyNames.length // 获取更新数量
  const failureCount = Object.keys(data.failureDutyNames).length

  // 构建 HTML 字符串
  let htmlContent = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">'

  // 1. 新增成功部分 (绿色)
  if (createCount > 0) {
    htmlContent += `
      <div>
        <span style="font-weight: bold; font-size: 16px;">✅ 新增成功：<span style="color: #67C23A;">${createCount}</span> 条</span>
        <div style="font-size: 12px; color: #909399; margin-top: 5px; line-height: 1.5;">
          ${data.createDutyNames.join(', ')}
        </div>
      </div>
    `
  }

  // 2. 更新成功部分 (蓝色) - 新增的代码段
  if (updateCount > 0) {
    // 如果上面有内容，加分隔线
    if (createCount > 0) {
      htmlContent += '<el-divider style="margin: 10px 0;"></el-divider>'
    }

    htmlContent += `
      <div>
        <span style="font-weight: bold; font-size: 16px;">🔄 更新成功：<span style="color: #409EFF;">${updateCount}</span> 条</span>
        <div style="font-size: 12px; color: #909399; margin-top: 5px; line-height: 1.5;">
          ${data.updateDutyNames.join(', ')}
        </div>
      </div>
    `
  }

  // 3. 失败部分 (红色)
  if (failureCount > 0) {
    // 如果上面有“新增”或者“更新”，都加分隔线
    if (createCount > 0 || updateCount > 0) {
      htmlContent += '<el-divider style="margin: 10px 0;"></el-divider>'
    }

    htmlContent += `
      <div>
        <span style="font-weight: bold; font-size: 16px;">❌ 导入失败：<span style="color: #F56C6C;">${failureCount}</span> 条</span>
        <ul style="font-size: 12px; color: #F56C6C; margin-top: 5px; padding-left: 20px; line-height: 1.5;">
    `
    for (const key in data.failureDutyNames) {
      htmlContent += `<li><strong>${key}</strong>: ${data.failureDutyNames[key]}</li>`
    }
    htmlContent += `</ul></div>`
  }

  // 4. 兜底显示
  if (createCount === 0 && updateCount === 0 && failureCount === 0) {
    htmlContent += '<div>无数据变动</div>'
  }

  htmlContent += '</div>'

  // 弹出提示框
  ElMessageBox.alert(htmlContent, '导入结果', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '知道了',
    customStyle: { maxWidth: '600px' }
  })

  formLoading.value = false
  dialogVisible.value = false
  emits('success')
}
</script>
