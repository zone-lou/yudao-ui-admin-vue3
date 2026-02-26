<template>
  <div v-if="!disabled" class="upload-file">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="uploadUrl"
      :auto-upload="autoUpload"
      :before-upload="beforeUpload"
      :disabled="disabled"
      :drag="drag"
      :http-request="httpRequest"
      :limit="props.limit"
      :multiple="props.limit > 1"
      :on-error="excelUploadError"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleFileSuccess"
      :show-file-list="true"
      class="upload-file-uploader"
      name="file"
    >
      <el-button type="primary">
        <Icon icon="ep:upload-filled" />
        选取文件
      </el-button>

      <template #file="row">
        <div class="flex items-center">
          <span :title="row.file.name">{{ row.file.name }}</span>
          <div class="ml-10px flex-shrink-0">
            <el-link
              :href="row.file.url"
              :underline="false"
              download
              target="_blank"
              type="primary"
            >
              下载
            </el-link>
          </div>
          <div class="ml-10px flex-shrink-0">
            <el-button link type="danger" @click="handleRemove(row.file)"> 删除</el-button>
          </div>
        </div>
      </template>
    </el-upload>
  </div>

  <div v-if="disabled" class="upload-file">
    <div v-for="(file, index) in fileList" :key="index" class="flex items-center file-list-item">
      <span :title="file.name">{{ file.name }}</span>
      <div class="ml-10px flex-shrink-0">
        <el-link :href="file.url" :underline="false" download target="_blank" type="primary">
          下载
        </el-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import type {
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadUserFile,
  UploadRequestOptions,
  UploadFile // 引入 UploadFile 类型
} from 'element-plus'
import { isString } from '@/utils/is'
import { useUpload } from '@/components/UploadFile/src/useUpload'

defineOptions({ name: 'UploadFile' })

const message = useMessage()
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: propTypes.oneOfType<string | string[]>([String, Array<String>]).isRequired,
  limit: propTypes.number.def(5), // 仅保留了文件数量限制，按需调整
  autoUpload: propTypes.bool.def(true),
  drag: propTypes.bool.def(false),
  disabled: propTypes.bool.def(false),
  directory: propTypes.string.def(undefined),
  uploadApi: propTypes.func.def(undefined)
})

const uploadRef = ref<UploadInstance>()
const uploadList = ref<UploadUserFile[]>([])
const fileList = ref<UploadUserFile[]>([])
const uploadNumber = ref<number>(0)

const { uploadUrl, httpRequest: defaultHttpRequest } = useUpload(props.directory)

/** 重写 httpRequest */
const httpRequest = async (options: UploadRequestOptions) => {
  if (props.uploadApi) {
    return props.uploadApi({ file: options.file })
  }
  return defaultHttpRequest(options)
}

const beforeUpload: UploadProps['beforeUpload'] = (file: UploadRawFile) => {
  // 仅保留数量限制校验
  if (fileList.value.length >= props.limit) {
    message.error(`上传文件数量不能超过${props.limit}个!`)
    return false
  }

  // 删除了 fileType 和 fileSize 的判断逻辑

  message.success('正在上传文件，请稍候...')
  uploadNumber.value++
  return true
}

// 接收 uploadFile 参数，使用 uid 移除临时文件
const handleFileSuccess: UploadProps['onSuccess'] = (res: any, uploadFile: UploadFile): void => {
  // 兼容处理：解析名称和远程URL
  let name = ''
  let url = ''
  if (typeof res.data === 'object' && res.data !== null) {
    name = res.data.name
    url = res.data.url
  } else {
    url = res.data
    const decodedUrl = decodeURIComponent(url)
    const urlWithoutQuery = decodedUrl.split('?')[0]
    name = urlWithoutQuery.substring(urlWithoutQuery.lastIndexOf('/') + 1)
  }

  // 1. 核心改变：不删除原文件，而是通过 uid 找到它，直接覆盖信息以保持原有占位和顺序
  const targetFile = fileList.value.find((item) => item.uid === uploadFile.uid)
  if (targetFile) {
    targetFile.name = name
    targetFile.url = url
    targetFile.response = res
    targetFile.status = 'success'
  }

  // 2. 利用 uploadList 当作已完成文件的计数器
  uploadList.value.push({} as UploadUserFile)

  // 3. 当全部选中的文件都处理完时，统一触发更新
  if (uploadList.value.length === uploadNumber.value) {
    message.success('文件上传成功')
    uploadList.value = []
    uploadNumber.value = 0
    emitUpdateModelValue()
  }
}
const handleExceed: UploadProps['onExceed'] = (): void => {
  message.error(`上传文件数量不能超过${props.limit}个!`)
}

const excelUploadError: UploadProps['onError'] = (err: any, uploadFile: UploadFile): void => {
  message.error(`${uploadFile.name} 上传失败，请稍后重试！`)

  // 1. 从 fileList 中移除这个上传失败的占位文件
  const index = fileList.value.findIndex((item) => item.uid === uploadFile.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }

  // 2. 将预计需要等待的上传总数减 1
  uploadNumber.value = Math.max(0, uploadNumber.value - 1)

  // 3. 检查剩余的成功文件是否已经全部处理完毕
  // 如果 选了3个文件，1个失败，2个成功。失败时把总数从3减到2，如果此时成功的2个已经处理完了，就触发完成逻辑
  if (uploadNumber.value > 0 && uploadList.value.length === uploadNumber.value) {
    message.success('其他文件上传处理完成')
    uploadList.value = []
    uploadNumber.value = 0
    emitUpdateModelValue()
  } else if (uploadNumber.value === 0) {
    // 如果全部都失败了，清空状态
    uploadList.value = []
  }
}

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.map((f) => f.name).indexOf(file.name)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emitUpdateModelValue()
  }
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}

// 监听模型绑定值变动
watch(
  () => props.modelValue,
  (val: string | string[]) => {
    // 1. 解析传入的 URLs
    let newUrls: string[] = []
    if (isString(val)) {
      newUrls = (val as string).split(',').filter(Boolean) // 过滤空串
    } else if (Array.isArray(val)) {
      newUrls = val as string[]
    }

    // 2. 获取当前的 URLs
    const currentUrls = fileList.value.map((f) => f.url).filter((u): u is string => !!u)

    // 3. 比较：如果 URL 列表一致（长度和内容都对），则不刷新 fileList
    // 这样可以保留 handleFileSuccess 中设置的 response 对象（包含文件ID）
    const isSame =
      newUrls.length === currentUrls.length &&
      newUrls.every((url, index) => url === currentUrls[index])

    if (isSame) {
      return
    }

    // 4. 如果不一致（通常是回显），则重建 fileList
    fileList.value = newUrls.map((url) => ({
      name: url.substring(url.lastIndexOf('/') + 1),
      url
    }))
  },
  { immediate: true, deep: true }
)

const emitUpdateModelValue = () => {
  // 过滤掉尚未上传成功（没有真实远程url）的文件
  const successFiles = fileList.value.filter(
    (file) => file.status === 'success' && file.url && !file.url.startsWith('blob:')
  )

  let result: string | string[] = successFiles.map((file) => file.url!)

  if (props.limit === 1 || isString(props.modelValue)) {
    result = result.join(',')
  }
  emit('update:modelValue', result)
}

/** 暴露 fileList 给父组件，以便 create.vue 获取文件ID */
defineExpose({ fileList })
</script>

<style lang="scss" scoped>
.upload-file-uploader {
  margin-bottom: 5px;
}

:deep(.upload-file-list .el-upload-list__item) {
  position: relative;
  margin-bottom: 10px;
  line-height: 2;
  border: 1px solid #e4e7ed;
}

:deep(.el-upload-list__item-file-name) {
  max-width: 250px;
}

:deep(.upload-file-list .ele-upload-list__item-content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}

:deep(.ele-upload-list__item-content-action .el-link) {
  margin-right: 10px;
}

.file-list-item {
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 8px;
}
</style>
