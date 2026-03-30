<template>
  <div v-loading="detailLoading">
    <template v-if="viewType !== 'basic'">
      <div id="printDivTag" class="form-scroll-area">
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

          <div class="doc-title">义乌市国土资源局行政诉讼审批表</div>

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
                <td class="label-cell">诉讼附件</td>
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
                        class="mr-2"
                        style="
                          font-size: 14px;
                          line-height: 1.5;
                          color: #303133;
                          word-break: break-all;
                        "
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
                <td
                  colspan="3"
                  class="h-80 data-text text-left"
                  style="padding: 0; vertical-align: top"
                >
                  <div
                    v-if="isEditable('拟办') || isEditable('法规科交办')"
                    class="w-full h-full relative"
                    style="padding: 6px 8px"
                  >
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      placeholder="请输入拟办意见..."
                      :rows="3"
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
                  <div v-else class="w-full h-full" style="padding: 6px 8px">
                    <div
                      v-for="(item, index) in nibanList"
                      :key="index"
                      class="relative w-full min-h-[24px] mb-1"
                    >
                      <div class="text-left break-all whitespace-pre-wrap">{{ item.comment }}</div>
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="item.taskId && getAttachCount(item.taskId) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showAttachments(item.taskId)"
                        >
                          附件({{ getAttachCount(item.taskId) }})
                        </el-button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="signature-row">
                  <div class="sig-container">
                    <span style="width: 40%">
                      办理人：
                      <span
                        v-if="isEditable('拟办') || isEditable('法规科交办')"
                        class="sign-input"
                        >{{ userStore.getUser.nickname }}</span
                      >
                      <span v-else class="sign-input">
                        <span v-for="(item, index) in nibanList" :key="index" class="mr-2">
                          {{ item.assigneeUser?.nickname }}
                        </span>
                      </span>
                    </span>
                    <span style="width: 40%">
                      日期：
                      <span
                        v-if="!(isEditable('拟办') || isEditable('法规科交办'))"
                        class="sign-input"
                      >
                        <span v-for="(item, index) in nibanList" :key="index" class="mr-2">
                          {{ formatDate(item.endTime) }}
                        </span>
                      </span>
                      <span v-else class="sign-input">{{ formatDate(new Date()) }}</span>
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td class="label-cell" rowspan="2">局长意见</td>
                <td
                  colspan="3"
                  class="h-80 data-text text-left"
                  style="padding: 0; vertical-align: top"
                >
                  <div
                    v-if="isEditable('局长') || isEditable('主要领导')"
                    class="w-full h-full relative"
                    style="padding: 6px 8px"
                  >
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      placeholder="请输入局长意见..."
                      :rows="3"
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
                  <div v-else class="w-full h-full" style="padding: 6px 8px">
                    <div
                      v-for="(item, index) in juzhangList"
                      :key="'juzhang' + index"
                      class="relative w-full min-h-[24px] mb-1"
                    >
                      <div class="text-left break-all whitespace-pre-wrap">{{ item.comment }}</div>
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="item.taskId && getAttachCount(item.taskId) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showAttachments(item.taskId)"
                        >
                          附件({{ getAttachCount(item.taskId) }})
                        </el-button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="signature-row">
                  <div class="sig-container">
                    <span style="width: 40%">
                      办理人：
                      <span
                        v-if="isEditable('局长') || isEditable('主要领导')"
                        class="sign-input"
                        >{{ userStore.getUser.nickname }}</span
                      >
                      <span v-else class="sign-input">
                        <span v-for="(item, index) in juzhangList" :key="index" class="mr-2">
                          {{ item.assigneeUser?.nickname }}
                        </span>
                      </span>
                    </span>
                    <span style="width: 40%">
                      日期：
                      <span
                        v-if="!isEditable('局长') && !isEditable('主要领导')"
                        class="sign-input"
                      >
                        <span v-for="(item, index) in juzhangList" :key="index" class="mr-2">
                          {{ formatDate(item.endTime) }}
                        </span>
                      </span>
                      <span v-else class="sign-input">{{ formatDate(new Date()) }}</span>
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  class="label-cell"
                  :rowspan="getDynamicRowspan(['分管领导', '分管局长'], lingdaoList)"
                  >局领导<br />意见</td
                >
                <td class="sub-header"><div class="sub-header-text">办理意见</div></td>
                <td class="sub-header"><div class="sub-header-text">办理人员</div></td>
                <td class="sub-header"><div class="sub-header-text">办理日期</div></td>
              </tr>
              <tr v-if="isEditable('分管领导') || isEditable('分管局长')" class="print-hide-row">
                <td class="h-35 data-text" style="padding: 0; vertical-align: top">
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
                <td class="h-35 data-text center-text">{{ userStore.getUser.nickname }}</td>
                <td class="h-35 data-text center-text">
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
                <tr v-for="(item, index) in lingdaoList" :key="'lingdao' + index">
                  <td class="h-35 data-text" style="padding: 0; vertical-align: top">
                    <div class="relative w-full h-full" style="padding: 6px 8px">
                      <div class="text-left break-all whitespace-pre-wrap">{{ item.comment }}</div>
                    </div>
                  </td>
                  <td class="h-35 data-text center-text">{{ item.assigneeUser?.nickname }}</td>
                  <td class="h-35 data-text center-text">
                    <div class="relative w-full h-full flex items-center justify-center">
                      {{ formatDate(item.endTime) }}
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="item.taskId && getAttachCount(item.taskId) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showAttachments(item.taskId)"
                        >
                          附件({{ getAttachCount(item.taskId) }})
                        </el-button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else-if="!(isEditable('分管领导') || isEditable('分管局长'))">
                <td class="h-35 data-text"></td>
                <td class="h-35 data-text center-text"></td>
                <td class="h-35 data-text center-text"></td>
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
                <td class="h-35 data-text" style="padding: 0; vertical-align: top">
                  <div class="w-full h-full relative" style="padding: 6px 8px">
                    <el-input
                      v-model="currentOpinion"
                      type="textarea"
                      autosize
                      placeholder="请输入科室办理意见..."
                      style="border: none"
                    />
                  </div>
                </td>
                <td class="h-35 data-text center-text">{{ userStore.getUser.nickname }}</td>
                <td class="h-35 data-text center-text">
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
                <tr v-for="(item, index) in keshiList" :key="'keshi' + index">
                  <td class="h-35 data-text" style="padding: 0; vertical-align: top">
                    <div class="relative w-full h-full" style="padding: 6px 8px">
                      <div class="text-left break-all whitespace-pre-wrap">{{ item.comment }}</div>
                    </div>
                  </td>
                  <td class="h-35 data-text center-text">{{ item.assigneeUser?.nickname }}</td>
                  <td class="h-35 data-text center-text">
                    <div class="relative w-full h-full flex items-center justify-center">
                      {{ formatDate(item.endTime) }}
                      <div
                        class="absolute whitespace-nowrap"
                        style="top: 50%; left: calc(100% + 20px); transform: translateY(-50%)"
                        v-if="item.taskId && getAttachCount(item.taskId) > 0"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="showAttachments(item.taskId)"
                        >
                          附件({{ getAttachCount(item.taskId) }})
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
                <td class="h-35 data-text"></td>
                <td class="h-35 data-text center-text"></td>
                <td class="h-35 data-text center-text"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-if="viewType === 'basic'">
      <el-descriptions title="基本信息" :column="3" border size="large" class="mb-20px">
        <el-descriptions-item label="来文号" label-align="center" align="center">
          {{ detailData.swWh }}
        </el-descriptions-item>
        <el-descriptions-item label="来文机关" label-align="center" align="center">
          {{ detailData.swJg }}
        </el-descriptions-item>
        <el-descriptions-item label="收文日期" label-align="center" align="center">
          {{ formatDate(detailData.swRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="原告" label-align="center" align="center">
          {{ detailData.sqr }}
        </el-descriptions-item>
        <el-descriptions-item label="被告" label-align="center" align="center">
          {{ detailData.bsqr }}
        </el-descriptions-item>
        <el-descriptions-item label="第三人" label-align="center" align="center">
          {{ detailData.dsr }}
        </el-descriptions-item>
        <el-descriptions-item label="上诉人" label-align="center" align="center">
          {{ detailData.ssr }}
        </el-descriptions-item>
        <el-descriptions-item label="被上诉人" label-align="center" align="center">
          {{ detailData.bssr }}
        </el-descriptions-item>
        <el-descriptions-item label="再审申请人" label-align="center" align="center">
          {{ detailData.zssqr }}
        </el-descriptions-item>
        <el-descriptions-item label="再审被申请人" label-align="center" align="center">
          {{ detailData.zsbsqr }}
        </el-descriptions-item>
        <el-descriptions-item label="诉讼阶段" label-align="center" align="center">
          {{ formatSsLx(detailData.ssLx) }}
        </el-descriptions-item>

        <el-descriptions-item label="土地坐落" label-align="center" align="center" :span="2">
          {{ detailData.tdZl }}
        </el-descriptions-item>

        <el-descriptions-item label="复议案号" label-align="center" align="center">
          {{ detailData.fyAh }}
        </el-descriptions-item>
        <el-descriptions-item label="前一审案号" label-align="center" align="center">
          {{ detailData.ssAh }}
        </el-descriptions-item>
        <el-descriptions-item label="后一审案号" label-align="center" align="center" :span="2">
          {{ detailData.hysAh }}
        </el-descriptions-item>

        <el-descriptions-item label="案件类别" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS1" :value="detailData.lb1" />
        </el-descriptions-item>
        <el-descriptions-item label="案件分类" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS2" :value="detailData.lb2" />
        </el-descriptions-item>
        <el-descriptions-item label="涉及事项" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS3" :value="detailData.lb3" />
        </el-descriptions-item>
        <el-descriptions-item label="案件类型" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS4" :value="detailData.lb4" />
        </el-descriptions-item>
        <el-descriptions-item label="诉讼类别" label-align="center" align="center">
          <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS5" :value="detailData.lb5" />
        </el-descriptions-item>

        <el-descriptions-item label="诉讼请求" label-align="center" align="center" :span="3">
          {{ detailData.ssNr }}
        </el-descriptions-item>
        <el-descriptions-item label="诉讼内容" label-align="center" align="center" :span="3">
          {{ detailData.ssnr }}
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions
        title="行政诉讼拓展信息"
        :column="3"
        border
        size="large"
        class="mb-20px"
        v-if="detailData.xzssKz || detailData.xzsskz"
      >
        <el-descriptions-item label="承办人" label-align="center" align="center">
          {{ detailData.cbr }}
        </el-descriptions-item>
        <el-descriptions-item label="承办日期" label-align="center" align="center">
          {{ formatDate(getKzData().cbRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="送法院机关日期" label-align="center" align="center">
          {{ formatDate(getKzData().sfyjgRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="开庭日期" label-align="center" align="center">
          {{ formatDate(getKzData().ktRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="判决结果" label-align="center" align="center">
          {{ getKzData().pjJg }}
        </el-descriptions-item>
        <el-descriptions-item label="裁定结果" label-align="center" align="center">
          {{ getKzData().cdJg }}
        </el-descriptions-item>
        <el-descriptions-item label="裁定判决日期" label-align="center" align="center">
          {{ formatDate(getKzData().cdpjRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="裁定判决日期" label-align="center" align="center">
          {{ formatDate(getKzData().cdpjRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="执行情况" label-align="center" align="center" :span="3">
          {{ getKzData().zxQk }}
        </el-descriptions-item>
        <el-descriptions-item label="是否装订" label-align="center" align="center">
          {{ getKzData().zdQk }}
        </el-descriptions-item>
        <el-descriptions-item label="装订人" label-align="center" align="center">
          {{ getKzData().zdr }}
        </el-descriptions-item>
        <el-descriptions-item label="装订日期" label-align="center" align="center">
          {{ formatDate(getKzData().zdRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="是否移交" label-align="center" align="center">
          {{ getKzData().yjQk }}
        </el-descriptions-item>
        <el-descriptions-item label="移交人" label-align="center" align="center">
          {{ getKzData().yjr }}
        </el-descriptions-item>
        <el-descriptions-item label="移交日期" label-align="center" align="center">
          {{ formatDate(getKzData().yjRq) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" label-align="center" align="center" :span="3">
          {{ getKzData().bz }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-20px">
        <h4 style="margin-bottom: 10px; font-weight: bold; color: #303133">相关文书列表</h4>
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
    </template>

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
                v-if="row.taskId === props.taskId && props.taskId"
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
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { dateUtil } from '@/utils/dateUtil'
import { XzssApi } from '@/api/bpm/xzss'
import { CommentAttachApi } from '@/api/bpm/commentattach'
import { uploadReturnInfo } from '@/api/infra/file'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Base64 } from 'js-base64'
import * as ConfigApi from '@/api/infra/config'
import type { PropType } from 'vue'

defineOptions({ name: 'BpmXzssDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined),
  viewType: propTypes.string.def(''),
  activityNodes: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  currentNode: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  taskId: propTypes.string.def('')
})

const userStore = useUserStore()
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

// 获取本单据的所有评论附件
const getDocAttachments = async () => {
  const docId = String(detailData.value.xmGuid)
  if (!docId || docId === 'undefined' || docId === 'null') return
  try {
    const res = await CommentAttachApi.getAttachListByDoc({
      docId,
      docType: 'XZSS' // 确保类型为XZSS
    })
    allDocAttachments.value = res || []
  } catch (error) {
    console.error('获取关联附件失败:', error)
  }
}

// 辅助方法：判断是否为诉讼本身附件（taskId为空/null/undefined）
const isBaseAttach = (taskId: any) => {
  return !taskId || taskId === 'null' || taskId === 'undefined'
}

// 统计诉讼本身的附件数量
const getBaseAttachCount = () => {
  return allDocAttachments.value.filter((a) => isBaseAttach(a.taskId)).length
}

// 统计特定 taskId 的附件数量
const getAttachCount = (taskId?: string) => {
  if (!taskId) return 0
  return allDocAttachments.value.filter((a) => a.taskId === taskId).length
}

// 弹出展示某 taskId 下的附件
const showAttachments = (taskId?: string) => {
  if (!taskId) return
  currentAttachments.value = allDocAttachments.value.filter((a) => a.taskId === taskId)
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
      currentAttachments.value = allDocAttachments.value.filter((a) => a.taskId === row.taskId)
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
      docType: 'XZSS', // 确保类型为XZSS
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
    console.error('Invalid ID:', rawId)
    return
  }

  detailLoading.value = true
  try {
    // 获取预览/地址前缀配置
    fileViewBaseUrl.value = await ConfigApi.getConfigKey('url.fileview.address')
    externalPrefix.value = await ConfigApi.getConfigKey('url.external.prefix')
    internalPrefix.value = await ConfigApi.getConfigKey('url.internal.prefix')

    const res = await XzssApi.getXzss(queryId)
    detailData.value = res || {}

    if (detailData.value.xmGuid) {
      const kzDetail = await XzssApi.getXzssKzByXmGuid(detailData.value.xmGuid)
      detailData.value.xzssKz = kzDetail || {}
    }

    // 解析动态表格数据
    if (res.otherRelatedInfo) {
      try {
        docList.value = JSON.parse(res.otherRelatedInfo)
      } catch (e) {
        console.warn('解析文书列表失败', e)
        docList.value = []
      }
    } else {
      docList.value = []
    }

    // 在数据获取后拉取附件
    await getDocAttachments()
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    detailLoading.value = false
  }
}

const getDynamicRowspan = (editKeys: string[], list: any[]) => {
  const isEdit = editKeys.some((key) => isEditable(key))
  const dataRows = (isEdit ? 1 : 0) + list.length
  return 1 + Math.max(1, dataRows)
}

/** 辅助函数：获取扩展表数据 */
const getKzData = () => {
  return detailData.value.xzssKz || detailData.value.xzsskz || {}
}

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

/** 格式化诉讼类型 */
const formatSsLx = (val: any) => {
  const map: Record<number, string> = {
    1: '一审',
    2: '二审',
    3: '再审'
  }
  return map[val] || val
}

// ============== 审批意见内联填报设置 =================
const currentOpinion = ref('')

/** 检查节点是否出于当前激活环节 */
const isEditable = (keyword: string) => {
  if (!props.taskId) return false
  const nodeName = props.currentNode?.name || ''

  // 屏蔽带有“(上诉)”的办理节点，强制它们使用全局原生弹窗处理
  if (nodeName.includes('(上诉)')) return false

  // 特殊逻辑：排除“分管局长”对“局长”关键词的干扰
  if (keyword === '局长' && nodeName.includes('分管')) {
    return false
  }

  return nodeName.includes(keyword)
}

const getOpinion = () => {
  const keys = [
    '拟办',
    '法规科交办',
    '法规科审核',
    '协助人员',
    '协办科室',
    '分管领导',
    '分管局长',
    '局长',
    '主要领导',
    '承办人员',
    '法规科承办',
    '相关单位',
    '法规科办理',
    '科室'
  ]
  if (!keys.some((key) => isEditable(key))) {
    return undefined
  }
  return currentOpinion.value
}

// ============== 审批意见节点数据 =================
const nibanList = ref<any[]>([])
const juzhangList = ref<any[]>([])
const lingdaoList = ref<any[]>([])
const keshiList = ref<any[]>([])

/** 解析 Activity Nodes 填充办理单 */
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
          // 仅拉取已填写的意见，补充 taskId 和 taskName 以便绑定附件
          const info = {
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime,
            taskName: task.name,
            taskId: task.id
          }
          const taskName = task.name || node.name || ''

          // 排除“法规科(结果录入)”，不在办理单中展示
          if (taskName.includes('法规科(结果录入)')) {
            return
          }
          // 排除所有带有“(上诉)”关键字的特定审批环节，交由弹窗处理
          if (taskName.includes('(上诉)')) {
            return
          }

          if (taskName.includes('法规科交办') || taskName.includes('拟办')) {
            tempNiban.push(info)
          } else if (
            taskName.includes('分管局长') ||
            taskName.includes('局领导') ||
            taskName.includes('分管领导')
          ) {
            tempLingdao.push(info)
          } else if (taskName.includes('局长') || taskName.includes('主要领导')) {
            tempJuzhang.push(info)
          } else if (
            taskName.includes('相关单位') ||
            taskName.includes('法规科办理') ||
            taskName.includes('科室')
          ) {
            tempKeshi.push(info)
          } else {
            // 兜底进入科室办理
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

defineExpose({ open: getInfo, getOpinion })

onMounted(() => {
  getInfo()
})
</script>

<style scoped>
/* stylelint-disable selector-id-pattern */

:deep(.el-descriptions__label) {
  width: 15%; /* 建议使用百分比(如12%到15%)或固定像素(如120px)，根据你的UI需求调整 */
  font-weight: bold;
  color: #606266;
  word-break: keep-all; /* 防止文字意外换行破坏高度 */
  background-color: #f5f7fa;
}

/* ================= 导入红头办理单专用样式 ================= */
#printDivTag {
  padding: 20px;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

#printDivTag .oa-container {
  width: 1100px;
  max-width: 100%;
  padding: 40px;
  margin: 0 auto;
  overflow: visible; /* 必须加上这个以便绝对定位元素超出表格显示 */
  background-color: #fff;
  box-shadow: none;
}

#printDivTag .doc-title {
  margin-bottom: 25px;
  font-size: 30px;
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
  border: 2px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

#printDivTag .oa-table td {
  padding: 6px 8px;
  font-size: 15px;
  line-height: 1.5;
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

#printDivTag .h-35 {
  height: 35px;
}

#printDivTag .signature-row {
  height: 30px;
  padding: 0 !important;
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

#printDivTag .sub-header {
  height: 30px;
  padding: 0 !important;
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

#printDivTag .text-left {
  text-align: left !important;
}

#printDivTag .check-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

#printDivTag .checkbox-mock {
  position: relative;
  display: inline-flex;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
  background-color: transparent !important;
  border: 1px solid #000;
  align-items: center;
  justify-content: center;
}

#printDivTag .center-text {
  text-align: center;
}
</style>
