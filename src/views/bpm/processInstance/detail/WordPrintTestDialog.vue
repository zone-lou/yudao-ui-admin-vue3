<script setup lang="ts">
import { ref } from 'vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import mammoth from 'mammoth'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const loading = ref(false)
const htmlContent = ref('')

const open = async (id: string) => {
  visible.value = true
  loading.value = true
  htmlContent.value = ''
  
  try {
    const res = await ProcessInstanceApi.getProcessInstancePrintData(id)
    
    // 如果用了 request.download，拿到的是完整的 Axios Response，流在 data 里
    const blob = res?.data ? res.data : res
    
    if (!blob || !(blob instanceof Blob)) {
      console.error('收到的响应不是 Blob:', res)
      ElMessage.error('返回的数据不是有效的文件流，请检查控制台网络面板')
      return
    }

    // 1. 尝试直接下载到本地，方便查看后端返回的真实文件
    try {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `打印模板_${id}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.warn('自动下载文件失败:', e)
    }

    // 2. 将流转化为 HTML 进行预览
    const arrayBuffer = await blob.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    htmlContent.value = result.value
    
    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth 转换消息:', result.messages)
    }
  } catch (error) {
    console.error('Word 转换 HTML 失败:', error)
    ElMessage.error('Word 转换 HTML 失败，请检查控制台')
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <el-dialog v-model="visible" title="Word 模板转 HTML 预览测试" width="900px">
    <div v-loading="loading" style="min-height: 200px;">
      <!-- HTML 预览区 -->
      <div v-if="htmlContent" class="word-html-preview" v-html="htmlContent"></div>
      <div v-else-if="!loading" class="text-center text-gray-500">
        暂无内容或转换失败
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关 闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.word-html-preview {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
