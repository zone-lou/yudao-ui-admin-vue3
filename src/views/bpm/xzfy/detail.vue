<template>
  <div v-loading="detailLoading">
    <div v-if="viewType === 'basic'">
      <el-descriptions
        title="基本信息"
        :column="3"
        border
        size="large"
        class="info-section mb-20px"
      >
        <el-descriptions-item label="来文号" label-align="center" align="center">
          {{ detailData.swWh }}
        </el-descriptions-item>
        <el-descriptions-item label="来文机关" label-align="center" align="center">
          {{ detailData.swJg }}
        </el-descriptions-item>
        <el-descriptions-item label="来文日期" label-align="center" align="center">
          {{ formatDate(detailData.swRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人" label-align="center" align="center">
          {{ detailData.sqr }}
        </el-descriptions-item>
        <el-descriptions-item label="被申请人" label-align="center" align="center">
          {{ detailData.bsqr }}
        </el-descriptions-item>
        <el-descriptions-item label="第三人" label-align="center" align="center">
          {{ detailData.dsr }}
        </el-descriptions-item>
        <el-descriptions-item label="土地坐落" label-align="center" align="center" :span="2">
          {{ detailData.tdZl }}
        </el-descriptions-item>

        <el-descriptions-item label="诉讼案号" label-align="center" align="center">
          {{ detailData.tdZl }}
        </el-descriptions-item>

        <el-descriptions-item label="案件分类" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZFY_CLASS1" :value="detailData.lb1" />
        </el-descriptions-item>
        <el-descriptions-item label="涉及事项" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZFY_CLASS2" :value="detailData.lb2" />
        </el-descriptions-item>
        <el-descriptions-item label="案件类型" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZFY_CLASS3" :value="detailData.lb3" />
        </el-descriptions-item>

        <el-descriptions-item label="复议请求" label-align="center" align="center" :span="3">
          {{ detailData.fyNr }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="info-section mb-20px">
        <h4 class="related-title">诉讼信息</h4>
        <el-table :data="detailData.xzssList || []" border empty-text="暂无诉讼信息">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="诉讼文号" prop="swWh" min-width="150" align="center" />
          <el-table-column label="申请人" prop="sqr" min-width="130" align="center" />
          <el-table-column label="收文日期" min-width="150" align="center">
            <template #default="{ row }">{{ formatDate(row.swRq) }}</template>
          </el-table-column>
          <el-table-column label="收文机关" prop="swJg" min-width="160" align="center" />
        </el-table>
      </div>

      <div class="info-section mb-20px">
        <h4 class="related-title">其他信息</h4>
        <el-descriptions
          v-if="detailData.xzfyKz || detailData.xzfykz"
          :column="3"
          border
          size="large"
          class="mb-20px"
        >
        <el-descriptions-item label="复议决定日期" label-align="center" align="center">
          {{ formatDate(getKzData().fyjdRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="复议结果" label-align="center" align="center">
          {{ formatFyJg(getKzData().fyJg) }}
        </el-descriptions-item>
        <el-descriptions-item label="是否装订" label-align="center" align="center">
          {{ formatBoolean(getKzData().sfZd) }}
        </el-descriptions-item>
        <el-descriptions-item label="装订人" label-align="center" align="center">
          {{ getKzData().zdr }}
        </el-descriptions-item>
        <el-descriptions-item label="装订日期" label-align="center" align="center">
          {{ formatDate(getKzData().zdRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="是否移交" label-align="center" align="center">
          {{ formatBoolean(getKzData().sfYj) }}
        </el-descriptions-item>
        <el-descriptions-item label="移交人" label-align="center" align="center">
          {{ getKzData().yjr }}
        </el-descriptions-item>
        <el-descriptions-item label="移交日期" label-align="center" align="center">
          {{ formatDate(getKzData().yjRq) }}
        </el-descriptions-item>
        <el-descriptions-item
          label="复议结果执行情况"
          label-align="center"
          align="center"
          :span="3"
        >
          {{ getKzData().zxQk }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" label-align="center" align="center" :span="3">
          {{ getKzData().bz }}
        </el-descriptions-item>
        </el-descriptions>

        <h4 class="related-title">相关文书列表</h4>
        <el-table :data="docList" border style="width: 100%">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="文书名称" prop="docName" align="center" />
          <el-table-column label="收文日期" align="center">
            <template #default="{ row }">
              {{ formatDate(row.docDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="主要内容"
            prop="docContent"
            align="center"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </div>

    <div v-if="viewType !== 'basic'">
      <div id="printDivTag">
        <div class="oa-container" style="position: relative">
          <div
            v-if="props.taskId"
            class="absolute print-hide-row flex items-center"
            style="top: 40px; right: 40px"
          >
            <el-upload
              action="#"
              :http-request="customUpload"
              :show-file-list="false"
              multiple
              class="inline-block"
            >
              <el-button type="primary" plain size="small">
                <Icon icon="ep:upload" class="mr-1" />上传附件
              </el-button>
            </el-upload>
          </div>

          <div class="doc-title">义乌市自然资源和规划局行政复议审批表</div>

          <div class="meta-info">
            <div class="meta-left">
              <span
                >收文日期：<span class="meta-input">{{ formatDate(detailData.swRq) }}</span></span
              >
            </div>
            <div class="meta-right">
              <span
                >来文号：<span class="meta-input">{{ detailData.swWh }}</span></span
              >
            </div>
          </div>

          <table class="oa-table">
            <colgroup>
              <col style="width: 120px" />
              <col style="width: auto" />
              <col style="width: 140px" />
              <col style="width: 150px" />
            </colgroup>
            <tbody>
              <tr>
                <td class="label-cell">监督监管</td>
                <td class="data-text">
                  <div class="check-item">
                    <span class="checkbox-mock">
                      <span
                        v-if="
                          detailData.issupervise === 1 ||
                          detailData.issupervise === undefined ||
                          detailData.issupervise === null
                        "
                        >✔</span
                      >
                    </span>
                    进行监督监管
                  </div>
                </td>
                <td class="label-cell" style="white-space: nowrap">科室办理办结日期</td>
                <td class="data-text center-text">
                  {{ formatDate(detailData.zhubandate) }}
                </td>
              </tr>

              <tr>
                <td class="label-cell">复议附件</td>
                <td colspan="3" class="data-text" style="padding: 6px 8px">
                  <div
                    v-if="getBaseAttachCount() > 0"
                    style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start"
                  >
                    <div
                      v-for="(file, index) in allDocAttachments.filter((a) =>
                        isBaseAttach(a.taskId)
                      )"
                      :key="index"
                      style="display: flex; align-items: center; width: 100%"
                    >
                      <span
                        class="mr-2 cursor-pointer"
                        style="
                          font-size: 14px;
                          line-height: 1.5;
                          color: #303133;
                          word-break: break-all;
                        "
                        @click="handlePreview(file)"
                      >
                        <Icon icon="ep:paperclip" class="mr-1" />{{ file.filename }}
                      </span>
                      <div style="display: flex; flex-shrink: 0; align-items: center">
                        <el-button
                          link
                          type="primary"
                          size="small"
                          @click="handlePreview(file)"
                          style="margin-left: 0"
                        >
                          预览
                        </el-button>
                        <el-button
                          link
                          type="primary"
                          size="small"
                          @click="handleDownload(file)"
                          style="margin-left: 8px"
                        >
                          下载
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <span v-else style="font-size: 14px; color: #909399">暂无附件</span>
                </td>
              </tr>

              <tr>
                <td class="label-cell" rowspan="2">拟办意见</td>
                <td colspan="3" class="h-80 data-text" style="padding: 0; vertical-align: top">
                  <div
                    v-if="isEditable('法规科交办')"
                    class="w-full h-full print-hide-row relative"
                  >
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入拟办意见"
                      class="w-full h-full"
                      style="border: none"
                    />
                    <div
                      class="absolute whitespace-nowrap"
                      style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                      v-if="getAttachCount(props.taskId) > 0"
                    >
                      <el-button type="primary" size="small" @click="showAttachments(props.taskId)">
                        附件({{ getAttachCount(props.taskId) }})
                      </el-button>
                    </div>
                  </div>

                  <div v-else class="w-full h-full">
                    <div
                      v-for="(info, index) in ensureMinRows(nibanList, 3)"
                      :key="index"
                      class="relative w-full min-h-[24px] mb-1"
                    >
                      <div class="text-left break-all whitespace-pre-wrap">{{ info.comment }}</div>
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="getInfoAttachCount(info) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showInfoAttachments(info)"
                        >
                          附件({{ getInfoAttachCount(info) }})
                        </el-button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="signature-row">
                  <div class="sig-container">
                    <span style="width: 40%"
                      >办理人：<span class="sign-input">{{
                        isEditable('法规科交办')
                          ? userStore.getUser.nickname
                          : nibanList.length > 0
                            ? nibanList[0].assigneeUser?.nickname
                            : ''
                      }}</span></span
                    >
                    <span style="width: 40%"
                      >日期：<span class="sign-input">{{
                        isEditable('法规科交办')
                          ? formatDate(new Date())
                          : nibanList.length > 0
                            ? formatDate(nibanList[0].endTime)
                            : ''
                      }}</span></span
                    >
                  </div>
                </td>
              </tr>

              <tr>
                <td class="label-cell" rowspan="2">局长意见</td>
                <td colspan="3" class="h-80 data-text" style="padding: 0; vertical-align: top">
                  <div
                    v-if="isEditable('局长') && !isEditable('分管局长')"
                    class="w-full h-full print-hide-row relative"
                  >
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入局长意见"
                      class="w-full h-full"
                      style="border: none"
                    />
                    <div
                      class="absolute whitespace-nowrap"
                      style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                      v-if="getAttachCount(props.taskId) > 0"
                    >
                      <el-button type="primary" size="small" @click="showAttachments(props.taskId)">
                        附件({{ getAttachCount(props.taskId) }})
                      </el-button>
                    </div>
                  </div>

                  <div v-else class="w-full h-full">
                    <div
                      v-for="(info, index) in ensureMinRows(juzhangList, 3)"
                      :key="index"
                      class="relative w-full min-h-[24px] mb-1"
                    >
                      <div class="text-left break-all whitespace-pre-wrap">{{ info.comment }}</div>
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="getInfoAttachCount(info) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showInfoAttachments(info)"
                        >
                          附件({{ getInfoAttachCount(info) }})
                        </el-button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="signature-row">
                  <div class="sig-container">
                    <span style="width: 40%"
                      >办理人：<span class="sign-input">{{
                        isEditable('局长') && !isEditable('分管局长')
                          ? userStore.getUser.nickname
                          : juzhangList.length > 0
                            ? juzhangList[juzhangList.length - 1].assigneeUser?.nickname
                            : ''
                      }}</span></span
                    >
                    <span style="width: 40%"
                      >日期：<span class="sign-input">{{
                        isEditable('局长') && !isEditable('分管局长')
                          ? formatDate(new Date())
                          : juzhangList.length > 0
                            ? formatDate(juzhangList[juzhangList.length - 1].endTime)
                            : ''
                      }}</span></span
                    >
                  </div>
                </td>
              </tr>

              <tr>
                <td class="label-cell" :rowspan="getDynamicRowspan(['分管局长'], lingdaoList)"
                  >局领导<br />意见</td
                >
                <td class="sub-header"><div class="sub-header-text">办理意见</div></td>
                <td class="sub-header"><div class="sub-header-text">办理人员</div></td>
                <td class="sub-header"><div class="sub-header-text">办理日期</div></td>
              </tr>
              <tr v-if="isEditable('分管局长')" class="print-hide-row">
                <td class="h-60 data-text" style="padding: 0; vertical-align: top">
                  <div class="w-full h-full relative" style="padding: 6px 8px">
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入分管局长意见"
                      class="w-full h-full"
                      style="border: none"
                    />
                  </div>
                </td>
                <td class="h-60 data-text center-text">{{ userStore.getUser.nickname }}</td>
                <td class="h-60 data-text center-text">
                  <div class="relative w-full h-full flex items-center justify-center">
                    {{ formatDate(new Date()) }}
                    <div
                      class="absolute whitespace-nowrap"
                      style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                      v-if="getAttachCount(props.taskId) > 0"
                    >
                      <el-button type="primary" size="small" @click="showAttachments(props.taskId)">
                        附件({{ getAttachCount(props.taskId) }})
                      </el-button>
                    </div>
                  </div>
                </td>
              </tr>
              <template v-if="lingdaoList.length > 0">
                <tr v-for="(info, index) in lingdaoList" :key="index">
                  <td class="h-60 data-text" style="padding: 0; vertical-align: top">
                    <div class="relative w-full h-full" style="padding: 6px 8px">
                      <div class="text-left break-all whitespace-pre-wrap">{{ info.comment }}</div>
                    </div>
                  </td>
                  <td class="h-60 data-text center-text">{{ info.assigneeUser?.nickname }}</td>
                  <td class="h-60 data-text center-text">
                    <div class="relative w-full h-full flex items-center justify-center">
                      {{ formatDate(info.endTime) }}
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="getInfoAttachCount(info) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showInfoAttachments(info)"
                        >
                          附件({{ getInfoAttachCount(info) }})
                        </el-button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else-if="!isEditable('分管局长')">
                <td class="h-60 data-text"></td>
                <td class="h-60 data-text center-text"></td>
                <td class="h-60 data-text center-text"></td>
              </tr>

              <tr>
                <td
                  class="label-cell"
                  :rowspan="getDynamicRowspan(['相关单位', '法规科办理', '科室'], keshiList)"
                  >科室单位<br />办理意见</td
                >
                <td class="sub-header"><div class="sub-header-text">办理意见</div></td>
                <td class="sub-header"><div class="sub-header-text">办理人员</div></td>
                <td class="sub-header"><div class="sub-header-text">办理日期</div></td>
              </tr>
              <tr
                v-if="isEditable('相关单位') || isEditable('法规科办理') || isEditable('科室')"
                class="print-hide-row"
              >
                <td class="h-60 data-text" style="padding: 0; vertical-align: top">
                  <div class="w-full h-full relative" style="padding: 6px 8px">
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入办理意见"
                      class="w-full h-full"
                      style="border: none"
                    />
                  </div>
                </td>
                <td class="h-60 data-text center-text">{{ userStore.getUser.nickname }}</td>
                <td class="h-60 data-text center-text">
                  <div class="relative w-full h-full flex items-center justify-center">
                    {{ formatDate(new Date()) }}
                    <div
                      class="absolute whitespace-nowrap"
                      style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                      v-if="getAttachCount(props.taskId) > 0"
                    >
                      <el-button type="primary" size="small" @click="showAttachments(props.taskId)">
                        附件({{ getAttachCount(props.taskId) }})
                      </el-button>
                    </div>
                  </div>
                </td>
              </tr>
              <template v-if="keshiList.length > 0">
                <tr v-for="(info, index) in keshiList" :key="'keshi' + index">
                  <td class="h-60 data-text" style="padding: 0; vertical-align: top">
                    <div class="relative w-full h-full" style="padding: 6px 8px">
                      <div class="text-left break-all whitespace-pre-wrap">{{ info.comment }}</div>
                    </div>
                  </td>
                  <td class="h-60 data-text center-text">{{ info.assigneeUser?.nickname }}</td>
                  <td class="h-60 data-text center-text">
                    <div class="relative w-full h-full flex items-center justify-center">
                      {{ formatDate(info.endTime) }}
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="getInfoAttachCount(info) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showInfoAttachments(info)"
                        >
                          附件({{ getInfoAttachCount(info) }})
                        </el-button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr
                v-else-if="
                  !(isEditable('相关单位') || isEditable('法规科办理') || isEditable('科室'))
                "
              >
                <td class="h-60 data-text"></td>
                <td class="h-60 data-text center-text"></td>
                <td class="h-60 data-text center-text"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <el-dialog v-model="attachDialogVisible" title="附件信息" width="800px" append-to-body>
      <el-table :data="currentAttachments" border>
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="文件名称" prop="filename" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
                flex-wrap: nowrap;
              "
            >
              <el-button link type="primary" size="small" @click="handlePreview(row)"
                >预览</el-button
              >
              <el-button link type="primary" size="small" @click="handleDownload(row)"
                >下载</el-button
              >
              <el-button
                v-if="normalizeTaskId(row.taskId) === normalizeTaskId(props.taskId) && props.taskId"
                link
                type="danger"
                size="small"
                @click="handleDeleteAttach(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { XzfyApi } from '@/api/bpm/xzfy'
import { CommentAttachApi } from '@/api/bpm/commentattach'
import { uploadReturnInfo } from '@/api/infra/file'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Base64 } from 'js-base64'
import * as ConfigApi from '@/api/infra/config'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE } from '@/utils/dict'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'BpmXzfyDetail' })

const userStore = useUserStore()

const props = defineProps({
  id: propTypes.oneOfType([Number, String]).def(undefined),
  activityNodes: propTypes.array.def([]),
  viewType: propTypes.string.def(''),
  taskId: propTypes.string.def(undefined),
  currentNode: propTypes.object.def({}),
  attachments: propTypes.array.def([]),
  initialData: propTypes.object.def(undefined)
})

const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<any>({})
const docList = ref<any[]>([])

// ================= 附件相关逻辑开始 =================
const allDocAttachments = ref<any[]>([])
const attachDialogVisible = ref(false)
const currentAttachments = ref<any[]>([])
const fileViewBaseUrl = ref('')
const externalPrefix = ref('') // 外网地址前缀
const internalPrefix = ref('') // 内网地址前缀
const normalizeTaskId = (value: any) =>
  value === undefined || value === null || value === '' ? '' : String(value)
const normalizeTaskIds = (values: any[]) =>
  Array.from(new Set(values.map(normalizeTaskId).filter(Boolean)))

// 获取本单据的所有评论附件
const getDocAttachments = async () => {
  if (props.attachments?.length) {
    allDocAttachments.value = props.attachments.map(normalizeAttachment)
    return
  }
  const docId = String(detailData.value.xmGuid)
  if (!docId || docId === 'undefined' || docId === 'null') return
  try {
    const res = await CommentAttachApi.getAttachListByDoc({
      docId,
      docType: 'XZFY'
    })
    allDocAttachments.value = (res || []).map(normalizeAttachment)
  } catch (error) {
    console.error('获取关联附件失败:', error)
  }
}

const normalizeAttachment = (item: any) => ({
  ...item,
  taskId: normalizeTaskId(item.taskId ?? item.task_id),
  filepath: item.filepath || item.filePath,
  filename: item.filename || item.fileName,
  fileextension: item.fileextension || item.fileExtension
})

const getInfoAttachmentTaskIds = (info: any) =>
  normalizeTaskIds([info?.taskId, ...(info?.attachmentTaskIds || [])])

const getInfoAttachCount = (info: any) => {
  const taskIds = getInfoAttachmentTaskIds(info)
  if (!taskIds.length) return 0
  return allDocAttachments.value.filter((a) => taskIds.includes(normalizeTaskId(a.taskId))).length
}

const showInfoAttachments = (info: any) => {
  const taskIds = getInfoAttachmentTaskIds(info)
  if (!taskIds.length) return
  currentAttachments.value = allDocAttachments.value.filter((a) =>
    taskIds.includes(normalizeTaskId(a.taskId))
  )
  attachDialogVisible.value = true
}

// 辅助方法：判断是否为复议本身附件（taskId为空/null/undefined）
const isBaseAttach = (taskId: any) => {
  const normalizedTaskId = normalizeTaskId(taskId)
  if (!normalizedTaskId || normalizedTaskId === 'null' || normalizedTaskId === 'undefined') return true

  const opinionKeys = [
    '拟办', '法规科交办', '局长', '分管局长', '相关单位', 
    '局领导', '法规科办理', '科室', '科室单位', '法规科审核', '分管领导', '协助人员'
  ]

  // 1. 当前正在办理的任务
  if (normalizedTaskId === normalizeTaskId(props.taskId)) {
    const hasOpinionBox = opinionKeys.some((key) => isEditable(key))
    if (!hasOpinionBox) return true // 没有意见框的环节，附件放主列表
    return false
  }

  // 已经展示在阅办单意见行里的任务，附件跟随意见展示
  const displayedTaskIds = [
    ...(nibanList?.value || []),
    ...(juzhangList?.value || []),
    ...(lingdaoList?.value || []),
    ...(keshiList?.value || [])
  ].flatMap((item) => getInfoAttachmentTaskIds(item))
  if (displayedTaskIds.includes(normalizedTaskId)) {
    return false
  }

  // 2. 历史任务：去 activityNodes 里找对应的环节名称
  let taskName = ''
  for (const node of (props.activityNodes || [])) {
    if (node.tasks) {
      for (const task of node.tasks) {
        if (normalizeTaskId(task.id) === normalizedTaskId) {
          taskName = task.name || node.name || ''
          break
        }
      }
    }
    if (taskName) break
  }

  if (taskName) {
    if (taskName.includes('结果录入')) return true
    const isOpinionBox = opinionKeys.some(key => taskName.includes(key))
    if (!isOpinionBox) {
      return true // 名字不包含意见关键字的环节，附件放主列表
    }
  }

  // 3. 兜底逻辑：没在表格展示出来的任务附件放主列表
  return true
}

// 统计复议本身的附件数量
const getBaseAttachCount = () => {
  return allDocAttachments.value.filter((a) => isBaseAttach(a.taskId)).length
}

// 统计特定 taskId 的附件数量
const getAttachCount = (taskId?: string) => {
  const normalizedTaskId = normalizeTaskId(taskId)
  if (!normalizedTaskId) return 0
  return allDocAttachments.value.filter((a) => normalizeTaskId(a.taskId) === normalizedTaskId).length
}

// 弹出展示某 taskId 下的附件
const showAttachments = (taskId?: string) => {
  const normalizedTaskId = normalizeTaskId(taskId)
  if (!normalizedTaskId) return
  currentAttachments.value = allDocAttachments.value.filter(
    (a) => normalizeTaskId(a.taskId) === normalizedTaskId
  )
  attachDialogVisible.value = true
}

// 预览附件
const handlePreview = (file: any) => {
  const filepath = typeof file === 'string' ? file : file.filepath
  if (!filepath) return ElMessage.warning('文件路径不存在')

  const kkBaseUrl = fileViewBaseUrl.value || 'http://192.168.50.239:8012'
  let fullUrl = filepath

  // 内外网预览地址转换
  if (externalPrefix.value && internalPrefix.value && fullUrl.includes(externalPrefix.value)) {
    fullUrl = fullUrl.replace(externalPrefix.value, internalPrefix.value)
  }

  const encodedUrl = Base64.encode(fullUrl)
  const previewUrl = `${kkBaseUrl}${encodeURIComponent(encodedUrl)}`
  window.open(previewUrl, '_blank')
}

// 下载附件
const handleDownload = (file: any) => {
  const filepath = typeof file === 'string' ? file : file.filepath
  const filename = typeof file === 'string' ? filepath.split('/').pop() : file.filename

  if (!filepath) return ElMessage.warning('文件路径不存在')

  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = filepath
  link.setAttribute('download', filename || '下载文件')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 删除附件弹窗操作
const handleDeleteAttach = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认要删除附件 "${row.filename}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await CommentAttachApi.deleteCommentAttach(row.id)
    ElMessage.success('删除成功')

    // 重新拉取所有附件信息以更新视图
    await getDocAttachments()

    // 刷新弹窗里的数据
    if (isBaseAttach(row.taskId)) {
      currentAttachments.value = allDocAttachments.value.filter((a) => isBaseAttach(a.taskId))
    } else {
      currentAttachments.value = allDocAttachments.value.filter(
        (a) => normalizeTaskId(a.taskId) === normalizeTaskId(row.taskId)
      )
    }

    // 如果全删完了，直接关掉弹窗
    if (currentAttachments.value.length === 0) {
      attachDialogVisible.value = false
    }
  } catch (error) {
    // 取消删除
  }
}

// 自定义上传附件逻辑：上传完毕即刻入库
const customUpload = async (options: any) => {
  try {
    const docId = detailData.value.xmGuid
    if (!props.taskId) {
      ElMessage.warning('当前无关联的任务环节，无法上传附件')
      options.onError(new Error('无关联任务环节'))
      return
    }

    const formData = new FormData()
    formData.append('file', options.file)
    const uploadRes = await uploadReturnInfo(formData)

    const fileResponse = uploadRes?.data || uploadRes
    let fileName = options.file.name
    let fileUrl = ''

    if (typeof fileResponse === 'object' && fileResponse !== null) {
      fileName = fileResponse.name || options.file.name
      fileUrl = fileResponse.url || fileResponse.filepath
    } else if (typeof uploadRes === 'string') {
      fileUrl = uploadRes
    }

    let extension = ''
    if (fileName && fileName.lastIndexOf('.') > -1) {
      extension = fileName.substring(fileName.lastIndexOf('.') + 1)
    }

    await CommentAttachApi.createCommentAttach({
      taskId: props.taskId as string,
      filepath: fileUrl,
      filename: fileName,
      fileextension: extension,
      docType: 'XZFY',
      docId: docId,
      commentType: props.currentNode?.name || '办理意见附件'
    } as any)

    ElMessage.success('附件上传成功')

    await getDocAttachments()
    options.onSuccess(uploadRes, options.file)
  } catch (error) {
    ElMessage.error('附件上传失败')
    console.error('上传异常:', error)
    options.onError(error)
  }
}
// ================= 附件相关逻辑结束 =================

/** 获取详情数据 */
const getInfo = async (id?: number) => {
  const rawId = id || props.id || query.id
  if (!rawId || rawId === 'null' || rawId === 'undefined') {
    return
  }
  const queryId = Number(rawId)
  if (isNaN(queryId)) {
    return
  }

  detailLoading.value = true
  try {
    // 获取预览/地址前缀配置
    fileViewBaseUrl.value = await ConfigApi.getConfigKey('url.fileview.address')
    externalPrefix.value = await ConfigApi.getConfigKey('url.external.prefix')
    internalPrefix.value = await ConfigApi.getConfigKey('url.internal.prefix')

    const res = await XzfyApi.getXzfy(queryId)
    detailData.value = res || {}

    if (detailData.value.xmGuid) {
      const kzDetail = await XzfyApi.getXzfyKzByXmGuid(detailData.value.xmGuid)
      detailData.value.xzfyKz = kzDetail || {}
    }

    if (res.otherRelatedInfo) {
      try {
        docList.value = JSON.parse(res.otherRelatedInfo)
      } catch (e) {
        docList.value = []
      }
    } else {
      docList.value = []
    }

    await getDocAttachments()
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    detailLoading.value = false
  }
}

const getKzData = () => {
  return detailData.value.xzfyKz || detailData.value.xzfykz || {}
}

const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD HH:mm')
}

const formatBoolean = (val: any) => {
  if (val === 1) return '是'
  if (val === 0) return '否'
  return ''
}

const formatFyJg = (val: any) => {
  if (val === 1) return '维持'
  if (val === 0) return '撤销'
  return val
}

const currentOpinion = ref('')

const isEditable = (keyword: string) => {
  if (!props.taskId) return false
  const nodeName = props.currentNode?.name || ''

  // 为防止“局长（主要领导）”与“分管局长”产生的关键词包含冲突，显式添加分管过滤
  if (keyword === '局长' && nodeName.includes('分管')) {
    return false
  }

  return nodeName.includes(keyword)
}

const getOpinion = () => {
  const keys = [
    '拟办',
    '法规科交办',
    '局长',
    '分管局长',
    '相关单位',
    '法规科办理',
    '科室',
    '法规科审核',
    '分管领导',
    '协助人员'
  ]
  if (!keys.some((key) => isEditable(key))) {
    return undefined
  }
  return currentOpinion.value
}

const getDynamicRowspan = (editKeys: string[], list: any[]) => {
  const isEdit = editKeys.some((key) => isEditable(key))
  const dataRows = (isEdit ? 1 : 0) + list.length
  return 1 + Math.max(1, dataRows)
}

const nibanList = ref<any[]>([])
const juzhangList = ref<any[]>([])
const lingdaoList = ref<any[]>([])
const keshiList = ref<any[]>([])

const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  const tempNiban: any[] = []
  const tempJuzhang: any[] = []
  const tempLingdao: any[] = []
  const tempKeshi: any[] = []

  props.activityNodes.forEach((node: any) => {
    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        if (task.reason) {
          const info = {
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime,
            taskName: task.name,
            taskId: normalizeTaskId(task.id),
            attachmentTaskIds: normalizeTaskIds([
              task.id,
              task.commentId,
              task.closed,
              ...(task.attachmentTaskIds || [])
            ])
          }
          const taskName = task.name || node.name || ''

          if (taskName.includes('法规科(结果录入)')) {
            return
          }

          if (taskName.includes('法规科交办') || taskName.includes('拟办')) {
            tempNiban.push(info)
          } else if (taskName.includes('分管局长') || taskName.includes('局领导')) {
            tempLingdao.push(info)
          } else if (taskName.includes('局长')) {
            tempJuzhang.push(info)
          } else if (
            taskName.includes('相关单位') ||
            taskName.includes('法规科办理') ||
            taskName.includes('科室')
          ) {
            tempKeshi.push(info)
          } else {
            tempKeshi.push(info)
          }
        }
      })
    }
  })

  nibanList.value = tempNiban
  juzhangList.value = tempJuzhang
  lingdaoList.value = tempLingdao
  keshiList.value = tempKeshi
}

watch(
  () => props.activityNodes,
  () => {
    processActivityNodes()
  },
  { immediate: true }
)

watch(
  () => props.attachments,
  () => {
    if (props.attachments?.length) {
      allDocAttachments.value = props.attachments.map(normalizeAttachment)
    }
  },
  { immediate: true, deep: true }
)

const ensureMinRows = (list: any[], min: number) => {
  const result = [...list]
  while (result.length < min) {
    result.push({ comment: '', taskId: '' })
  }
  return result
}

const getDetailData = () => detailData.value

defineExpose({ open: getInfo, getOpinion, getDetailData })

onMounted(() => {
  if (props.initialData !== undefined) {
    detailData.value = props.initialData
    return
  }
  getInfo()
})
</script>

<style scoped>
/* stylelint-disable selector-id-pattern */

.related-title {
  margin: 0 0 10px;
  font-weight: 700;
  color: #303133;
}

.info-section {
  box-sizing: border-box;
  padding: 18px 20px 20px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);
}

:deep(.el-descriptions__label) {
  width: 15%;
  font-weight: bold;
  color: #606266;
  word-break: keep-all;
  background-color: #f5f7fa;
}

#printDivTag {
  padding: 20px;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

#printDivTag .oa-container {
  box-sizing: border-box !important;
  width: 994px !important;
  max-width: 100% !important;
  min-height: 1123px !important;
  padding: 40px 50px !important;
  margin: 20px auto !important;
  overflow: visible;
  background-color: #fff;
  box-shadow: 0 4px 16px rgb(0 0 0 / 15%) !important;
}

#printDivTag .doc-title {
  margin-bottom: 20px;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

#printDivTag .meta-info {
  display: flex;
  padding: 0 5px;
  margin-bottom: 5px;
  font-size: 15px;
  color: #333;
}

#printDivTag .meta-left {
  width: 50%;
}

#printDivTag .meta-right {
  width: 50%;
  text-align: right;
}

#printDivTag .meta-input {
  display: inline-block;
  min-width: 120px;
  text-align: center;
}

#printDivTag .oa-table {
  width: 100%;
  font-size: 15px !important;
  border: 2px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

#printDivTag .oa-table td {
  padding: 16px 12px !important;
  font-size: 15px !important;
  line-height: 1.5 !important;
  color: #000;
  word-wrap: break-word;
  vertical-align: middle;
  border: 1px solid #d71920;
}

#printDivTag .label-cell {
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

#printDivTag .h-80 {
  height: 80px;
  vertical-align: top;
}

#printDivTag .h-large {
  height: 120px;
  vertical-align: top;
}

#printDivTag .h-60 {
  height: 60px;
}

#printDivTag .h-35 {
  height: 35px;
}

#printDivTag .oa-table td.signature-row {
  height: 35px;
  padding: 5px 12px !important;
}

#printDivTag .sig-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  color: #444;
}

#printDivTag .sign-input {
  display: inline-block;
  min-width: 100px;
}

#printDivTag .oa-table td.sub-header {
  height: 35px;
  padding: 5px 12px !important;
  font-weight: normal;
  text-align: center;
  background-color: transparent !important;
}

#printDivTag .sub-header-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

#printDivTag .check-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

#printDivTag .checkbox-mock {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
  border: 1px solid #000;
}

#printDivTag .center-text {
  text-align: center;
}
</style>
