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
      <template v-if="isShowTip" #tip>
        <div>
          大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </div>
        <div>
          格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b> 的文件
        </div>
      </template>
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
  fileType: propTypes.array.def(['doc', 'xls', 'ppt', 'txt', 'pdf']),
  fileSize: propTypes.number.def(5),
  limit: propTypes.number.def(5),
  autoUpload: propTypes.bool.def(true),
  drag: propTypes.bool.def(false),
  isShowTip: propTypes.bool.def(true),
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
  if (fileList.value.length >= props.limit) {
    message.error(`上传文件数量不能超过${props.limit}个!`)
    return false
  }
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
  }
  const isImg = props.fileType.some((type: string) => {
    if (file.type.indexOf(type) > -1) return true
    return !!(fileExtension && fileExtension.indexOf(type) > -1)
  })
  const isLimit = file.size / 1024 / 1024 < props.fileSize
  if (!isImg) {
    message.error(`文件格式不正确, 请上传${props.fileType.join('/')}格式!`)
    return false
  }
  if (!isLimit) {
    message.error(`上传文件大小不能超过${props.fileSize}MB!`)
    return false
  }
  message.success('正在上传文件，请稍候...')
  uploadNumber.value++
  return true
}

// 【关键修改】接收 uploadFile 参数，使用 uid 移除临时文件
const handleFileSuccess: UploadProps['onSuccess'] = (res: any, uploadFile: UploadFile): void => {
  message.success('上传成功')

  // 移除 element-plus 自动添加到列表中的那个文件（因为它没有我们需要的数据结构）
  const index = fileList.value.findIndex((item) => item.uid === uploadFile.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }

  // 兼容处理：
  let name = ''
  let url = ''
  // 新接口：res.data 是对象
  if (typeof res.data === 'object' && res.data !== null) {
    name = res.data.name
    url = res.data.url
  } else {
    // 旧接口：res.data 是字符串URL
    url = res.data
    const decodedUrl = decodeURIComponent(url)
    const urlWithoutQuery = decodedUrl.split('?')[0]
    name = urlWithoutQuery.substring(urlWithoutQuery.lastIndexOf('/') + 1)
  }

  // 构建我们自己的文件对象，完整保留 response 以便父组件获取 ID
  uploadList.value.push({ name: name, url: url, response: res })

  if (uploadList.value.length == uploadNumber.value) {
    fileList.value.push(...uploadList.value)
    uploadList.value = []
    uploadNumber.value = 0
    emitUpdateModelValue()
  }
}

const handleExceed: UploadProps['onExceed'] = (): void => {
  message.error(`上传文件数量不能超过${props.limit}个!`)
}

const excelUploadError: UploadProps['onError'] = (): void => {
  message.error('导入数据失败，请您重新上传！')
  uploadNumber.value = Math.max(0, uploadNumber.value - 1)
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
  let result: string | string[] = fileList.value.map((file) => file.url!)
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
