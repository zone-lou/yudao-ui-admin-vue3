<template>
  <el-button
    v-if="guide"
    plain
    type="primary"
    class="guide-floating-button"
    :title="buttonText"
    @click="drawerVisible = true"
  >
    <Icon icon="ep:picture" class="guide-button-icon" />
    <span class="guide-button-text">{{ buttonText }}</span>
  </el-button>

  <el-drawer
    v-model="drawerVisible"
    :size="drawerSize"
    append-to-body
    destroy-on-close
    class="bpm-operation-guide"
  >
    <template #header>
      <div class="guide-header">
        <div class="guide-title">{{ guide?.title || defaultTitle }}</div>
        <div v-if="guide?.description" class="guide-description">
          {{ guide.description }}
        </div>
      </div>
    </template>

    <div class="guide-list">
      <section v-for="(item, index) in guide?.images" :key="`${item.url}-${index}`" class="guide-step">
        <div class="guide-step-title">
          <span class="guide-step-index">{{ index + 1 }}</span>
          <span>{{ item.title || `操作步骤 ${index + 1}` }}</span>
        </div>
        <div v-if="item.description" class="guide-step-description">
          {{ item.description }}
        </div>
        <el-image
          :alt="item.title || `操作步骤 ${index + 1}`"
          :src="item.url"
          fit="contain"
          class="guide-image"
          @click="previewImage(index)"
        >
          <template #error>
            <div class="guide-image-error">
              <Icon icon="ep:picture-filled" :size="28" />
              <span>图片加载失败</span>
            </div>
          </template>
        </el-image>
        <div class="guide-preview-tip">
          <Icon icon="ep:zoom-in" /> 点击图片放大查看
        </div>
      </section>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import * as ConfigApi from '@/api/infra/config'
import { createImageViewer } from '@/components/ImageViewer'

defineOptions({ name: 'BpmOperationGuide' })

type GuideImage = {
  url: string
  title?: string
  description?: string
}

type GuideConfig = {
  title?: string
  description?: string
  images: GuideImage[]
}

const props = withDefaults(
  defineProps<{
    sceneKeys: string[]
    buttonText?: string
    defaultTitle?: string
  }>(),
  {
    buttonText: '操作说明',
    defaultTitle: '操作说明'
  }
)

const CONFIG_PREFIX = 'bpm.operation.guide.'
const drawerVisible = ref(false)
const guide = ref<GuideConfig>()
const drawerSize = computed(() => (window.innerWidth <= 768 ? '100%' : '520px'))
let loadSequence = 0

const normalizeImage = (item: unknown): GuideImage | undefined => {
  if (typeof item === 'string' && item.trim()) {
    return { url: item.trim() }
  }
  if (item && typeof item === 'object') {
    const source = item as Record<string, unknown>
    if (typeof source.url === 'string' && source.url.trim()) {
      return {
        url: source.url.trim(),
        title: typeof source.title === 'string' ? source.title : undefined,
        description: typeof source.description === 'string' ? source.description : undefined
      }
    }
  }
  return undefined
}

const parseGuide = (value?: string | null): GuideConfig | undefined => {
  if (!value?.trim()) return undefined
  try {
    const parsed = JSON.parse(value)
    const sourceImages = Array.isArray(parsed) ? parsed : parsed?.images
    if (!Array.isArray(sourceImages)) return undefined
    const images = sourceImages.map(normalizeImage).filter(Boolean) as GuideImage[]
    if (images.length === 0) return undefined
    return {
      title: Array.isArray(parsed) || typeof parsed.title !== 'string' ? undefined : parsed.title,
      description:
        Array.isArray(parsed) || typeof parsed.description !== 'string'
          ? undefined
          : parsed.description,
      images
    }
  } catch (error) {
    console.warn('操作说明配置格式错误:', error)
    return undefined
  }
}

const loadGuide = async () => {
  const currentSequence = ++loadSequence
  guide.value = undefined
  const sceneKeys = props.sceneKeys.filter(Boolean)
  for (const sceneKey of sceneKeys) {
    try {
      const value = await ConfigApi.getConfigKey(`${CONFIG_PREFIX}${sceneKey}`)
      if (currentSequence !== loadSequence) return
      const result = parseGuide(value)
      if (result) {
        guide.value = result
        return
      }
    } catch (error) {
      if (currentSequence !== loadSequence) return
      console.warn(`读取操作说明配置失败: ${sceneKey}`, error)
    }
  }
}

const previewImage = (initialIndex: number) => {
  if (!guide.value) return
  createImageViewer({
    urlList: guide.value.images.map((item) => item.url),
    initialIndex,
    zIndex: 9999999
  })
}

watch(() => props.sceneKeys, loadGuide, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.guide-floating-button {
  position: fixed;
  right: 20px;
  bottom: 110px;
  z-index: 1000;
  display: inline-flex;
  width: 46px;
  height: 46px;
  margin: 0;
  padding: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgb(0 0 0 / 16%);
  transition:
    width 0.25s ease,
    border-radius 0.25s ease,
    box-shadow 0.25s ease;

  &:hover,
  &:focus-visible {
    width: 138px;
    border-radius: 23px;
    box-shadow: 0 6px 20px rgb(0 0 0 / 22%);
  }
}

.guide-button-icon {
  flex: none;
}

.guide-button-text {
  max-width: 0;
  margin-left: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  transition:
    max-width 0.25s ease,
    margin-left 0.25s ease,
    opacity 0.18s ease;
}

.guide-floating-button:hover .guide-button-text,
.guide-floating-button:focus-visible .guide-button-text {
  max-width: 100px;
  margin-left: 7px;
  opacity: 1;
}

.guide-header {
  min-width: 0;
}

.guide-title {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
}

.guide-description,
.guide-step-description,
.guide-preview-tip {
  color: var(--el-text-color-secondary);
}

.guide-description {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 20px;
}

.guide-step {
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-lighter);
}

.guide-step-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.guide-step-index {
  display: inline-flex;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background: var(--el-color-primary);
  font-size: 13px;
}

.guide-step-description {
  margin: -4px 0 12px 32px;
  font-size: 13px;
  line-height: 1.6;
}

.guide-image {
  display: block;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
  cursor: zoom-in;

  :deep(.el-image__inner) {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
}

.guide-image-error {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: var(--el-text-color-placeholder);
}

.guide-preview-tip {
  display: flex;
  margin-top: 8px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .guide-floating-button {
    right: 8px;
    bottom: 80px;
    width: 42px;
    height: 42px;

    &:hover,
    &:focus-visible {
      width: 128px;
      border-radius: 21px;
    }
  }
}
</style>
