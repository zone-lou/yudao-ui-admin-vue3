<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="行政诉讼申请信息" v-loading="formLoading">
        <template #header>
          <el-button type="primary" @click="handleSendClick" :loading="formLoading">
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
        </template>

        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="表单信息" name="form">
            <el-form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              label-width="140px"
              v-loading="formLoading"
            >
              <h3 class="section-title">基本信息</h3>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="文号" prop="swWh">
                    <el-input v-model="formData.swWh" placeholder="请输入文号" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="来文机关" prop="swJg">
                    <el-select
                      v-model="formData.swJg"
                      placeholder="请输入或选择来文机关"
                      filterable
                      allow-create
                      default-first-option
                      style="width: 100%"
                    >
                      <el-option
                        v-for="dict in getDictOptions(DICT_TYPE.BPM_INCOMING_AUTHORITY_XZSS)"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="收文日期" prop="swRq">
                    <el-date-picker
                      v-model="formData.swRq"
                      type="date"
                      value-format="x"
                      placeholder="选择收文日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="原告" prop="sqr">
                    <el-input v-model="formData.sqr" placeholder="请输入原告" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="被告" prop="bsqr">
                    <el-input v-model="formData.bsqr" placeholder="请输入被告" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="第三人" prop="dsr">
                    <el-input v-model="formData.dsr" placeholder="请输入第三人" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="上诉人" prop="ssr">
                    <el-input v-model="formData.ssr" placeholder="请输入上诉人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="被上诉人" prop="bssr">
                    <el-input v-model="formData.bssr" placeholder="请输入被上诉人" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="再审申请人" prop="zssqr">
                    <el-input v-model="formData.zssqr" placeholder="请输入再审申请人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="再审被申请人" prop="zsbsqr">
                    <el-input v-model="formData.zsbsqr" placeholder="请输入再审被申请人" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="诉讼阶段" prop="ssLx">
                    <el-radio-group v-model="formData.ssLx">
                      <el-radio
                        v-for="dict in getDictOptions(
                          DICT_TYPE.BPM_ADMINISTRATIVE_LITIGATION_STAGE
                        )"
                        :key="dict.value"
                        :label="dict.value"
                      >
                        {{ dict.label }}
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item label="土地坐落" prop="tdZl">
                    <div class="flex w-full gap-2">
                      <el-select
                        v-model="tdZlPart1"
                        placeholder="镇街"
                        style="width: 200px"
                        filterable
                        allow-create
                        clearable
                        @change="handleTdZlChange"
                      >
                        <el-option
                          v-for="dict in getDictOptions(DICT_TYPE.BPM_LOCATION_STREET)"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.label"
                        />
                      </el-select>
                      <el-input
                        v-model="tdZlPart2"
                        placeholder="请输入具体坐落详情"
                        @input="handleTdZlChange"
                      />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="复议案号" prop="fyAh">
                    <el-input v-model="formData.fyAh" placeholder="请输入复议案号">
                      <template #append>
                        <el-button @click="openFySelect">选择</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="前一审案号" prop="ssAh">
                    <el-input v-model="formData.ssAh" placeholder="请输入前一审案号">
                      <template #append>
                        <el-button @click="openSsSelect">选择</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="后一审案号" prop="ssAh">
                    <el-input  placeholder="自动获取后一审案号" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="案件类别" prop="lb1">
                <el-radio-group v-model="formData.lb1">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS1)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="案件分类" prop="lb2">
                <el-radio-group v-model="formData.lb2">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS2)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="涉及事项" prop="lb3">
                <el-radio-group v-model="formData.lb3">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS3)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="案件类型" prop="lb4">
                <el-radio-group v-model="formData.lb4">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS4)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="诉讼类别" prop="lb5">
                <el-radio-group v-model="formData.lb5">
                  <el-radio
                    v-for="dict in getDictOptions(DICT_TYPE.BPM_XZSS_CLASS5)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="诉讼请求" prop="ssNr">
                <el-input
                  v-model="formData.ssNr"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入诉讼请求"
                />
              </el-form-item>

              <el-form-item label="复议附件" prop="attachFilePath">
                <UploadFile
                  v-model="formData.attachFilePath"
                  ref="uploadFileRef"
                  :upload-api="uploadReturnInfo"
                />
              </el-form-item>

              <h3 class="section-title" style="margin-top: 20px">其他相关信息</h3>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="承办人" prop="cbr">
                    <el-input v-model="formData.cbr" placeholder="请输入承办人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="承办日期" prop="cbRq">
                    <el-date-picker
                      v-model="formData.cbRq"
                      type="date"
                      value-format="x"
                      placeholder="选择承办日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="送法院机关日期" prop="sfyjgRq">
                    <el-date-picker
                      v-model="formData.sfyjgRq"
                      type="date"
                      value-format="x"
                      placeholder="选择送法院机关日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="开庭日期" prop="xzssKz.ktRq">
                    <el-date-picker
                      v-model="formData.xzssKz.ktRq"
                      type="date"
                      value-format="x"
                      placeholder="选择开庭日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="判决结果" prop="xzssKz.pjJg">
                    <el-input v-model="formData.xzssKz.pjJg" placeholder="请输入判决结果" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="裁定结果" prop="xzssKz.cdJg">
                    <el-input v-model="formData.xzssKz.cdJg" placeholder="请输入裁定结果" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="裁定判决日期" prop="xzssKz.cdpjRq">
                    <el-date-picker
                      v-model="formData.xzssKz.cdpjRq"
                      type="date"
                      value-format="x"
                      placeholder="选择裁定判决日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="执行情况" prop="xzssKz.zxQk">
                <el-input
                  v-model="formData.xzssKz.zxQk"
                  placeholder="请输入执行情况"
                  type="textarea"
                />
              </el-form-item>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="是否装订" prop="xzssKz.zdQk">
                    <el-select
                      v-model="formData.xzssKz.zdQk"
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option label="是" :value="1" />
                      <el-option label="否" :value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="装订人" prop="xzssKz.zdr">
                    <el-input v-model="formData.xzssKz.zdr" placeholder="请输入装订人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="装订日期" prop="xzssKz.zdRq">
                    <el-date-picker
                      v-model="formData.xzssKz.zdRq"
                      type="date"
                      value-format="x"
                      placeholder="选择装订日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item label="是否移交" prop="xzssKz.yjQk">
                    <el-select
                      v-model="formData.xzssKz.yjQk"
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option label="是" :value="1" />
                      <el-option label="否" :value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="移交人" prop="xzssKz.yjr">
                    <el-input v-model="formData.xzssKz.yjr" placeholder="请输入移交人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="移交日期" prop="xzssKz.yjRq">
                    <el-date-picker
                      v-model="formData.xzssKz.yjRq"
                      type="date"
                      value-format="x"
                      placeholder="选择移交日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="备注" prop="xzssKz.bz">
                <el-input v-model="formData.xzssKz.bz" type="textarea" placeholder="请输入备注" />
              </el-form-item>

              <h3 class="section-title" style="margin-top: 20px">相关文书列表</h3>

              <div style="margin-bottom: 10px; text-align: right">
                <el-button type="primary" plain size="small" @click="addDocRow">
                  <Icon icon="ep:plus" class="mr-5px" /> 添加行
                </el-button>
              </div>

              <el-table :data="docList" border style="width: 100%; margin-bottom: 18px">
                <el-table-column label="序号" type="index" width="60" align="center" />
                <el-table-column label="文书名称" align="center">
                  <template #default="{ row }">
                    <el-input v-model="row.docName" placeholder="请输入文书名称" />
                  </template>
                </el-table-column>
                <el-table-column label="收文日期" align="center">
                  <template #default="{ row }">
                    <el-date-picker
                      v-model="row.docDate"
                      type="date"
                      value-format="x"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="主要内容" align="center">
                  <template #default="{ row }">
                    <el-input v-model="row.docContent" placeholder="请输入主要内容" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button link type="danger" @click="deleteDocRow($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="办理单" name="oaForm">
            <div id="printDivTag" class="form-scroll-area">
              <div class="oa-container">
                <div class="doc-title">义乌市国土资源局行政诉讼审批表</div>

                <div class="meta-info">
                  <div class="meta-left">
                    <span
                    >收文日期：<span class="meta-input">{{
                        formatDate(formData.swRq)
                      }}</span></span
                    >
                  </div>
                  <div class="meta-right">
                    <span
                    >来文号：<span class="meta-input">{{ formData.swWh }}</span></span
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
                      <div
                        class="check-item w-full h-full cursor-pointer select-none"
                        @click="formData.issupervise = formData.issupervise === 1 ? 0 : 1"
                      >
                          <span class="checkbox-mock">
                            <span v-if="formData.issupervise === 1">✔</span>
                          </span>
                        进行监督监管
                      </div>
                    </td>
                    <td class="label-cell">科室办理办结日期</td>
                    <td class="data-text center-text" style="padding: 0">
                      <el-date-picker
                        v-model="formData.zhubandate"
                        type="date"
                        value-format="x"
                        placeholder="选择日期"
                        style="width: 100%; border: none"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell" rowspan="2">拟办意见</td>
                    <td colspan="3" class="h-80 data-text text-left"> </td>
                  </tr>
                  <tr>
                    <td colspan="3" class="signature-row">
                      <div class="sig-container">
                        <span style="width: 40%">办理人：<span class="sign-input"></span></span>
                        <span style="width: 40%">日期：<span class="sign-input"></span></span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell" rowspan="2">局长意见</td>
                    <td colspan="3" class="h-80 data-text text-left"> </td>
                  </tr>
                  <tr>
                    <td colspan="3" class="signature-row">
                      <div class="sig-container">
                        <span style="width: 40%">办理人：<span class="sign-input"></span></span>
                        <span style="width: 40%">日期：<span class="sign-input"></span></span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td class="label-cell" rowspan="2">局领导<br />意见</td>
                    <td class="sub-header">办理意见</td>
                    <td class="sub-header">办理人员</td>
                    <td class="sub-header">办理日期</td>
                  </tr>
                  <tr>
                    <td class="h-35 data-text"></td>
                    <td class="h-35 data-text center-text"></td>
                    <td class="h-35 data-text center-text"></td>
                  </tr>

                  <tr>
                    <td class="label-cell" rowspan="2">科室单位<br />办理意见</td>
                    <td class="sub-header">办理意见</td>
                    <td class="sub-header">办理人员</td>
                    <td class="sub-header">办理日期</td>
                  </tr>
                  <tr>
                    <td class="h-35 data-text"></td>
                    <td class="h-35 data-text center-text"></td>
                    <td class="h-35 data-text center-text"></td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </ContentWrap>
    </el-col>
  </el-row>

  <el-dialog v-model="dialogVisible" title="流程处理" width="500px" append-to-body>
    <el-form
      ref="dialogFormRef"
      :model="formData"
      :rules="dialogRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="下一环节" prop="nextNode">
        <el-select
          v-model="formData.nextNode"
          placeholder="请选择下一环节"
          @change="nodeChange"
          value-key="taskDefKey"
          :empty-values="[null, undefined]"
          style="width: 100%"
        >
          <el-option
            v-for="dict in nextNodeOptions"
            :key="dict.taskDefKey"
            :label="dict.taskName"
            :value="dict"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="办理人" prop="tempNextUserSelectAssignees">
        <el-select
          v-model="formData.tempNextUserSelectAssignees"
          placeholder="请选择办理人"
          :multiple="multipleFlag"
          style="width: 100%"
        >
          <el-option
            v-for="dict in selectUserOptions"
            :key="dict.id"
            :label="dict.nickname"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="fySelectVisible" title="选择复议案件" width="70%" append-to-body>
    <el-form :inline="true" :model="queryParamsFy" class="-mb-15px">
      <el-form-item label="案号">
        <el-input
          v-model="queryParamsFy.swWh"
          placeholder="请输入案号模糊搜索"
          clearable
          @keyup.enter="getFyList"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="getFyList"><Icon icon="ep:search" class="mr-5px" />查询</el-button>
        <el-button @click="resetQueryFy"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="xzfyList" border style="margin-top: 15px">
      <el-table-column label="诉讼文号" prop="swWh" />
      <el-table-column label="来文机关" prop="swJg" />
      <el-table-column label="收文日期" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.swRq) }}
        </template>
      </el-table-column>
      <el-table-column label="原告" prop="sqr" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button type="primary" link @click="selectFy(scope.row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrapper">
      <Pagination
        :total="totalFy"
        v-model:page="queryParamsFy.pageNo"
        v-model:limit="queryParamsFy.pageSize"
        @pagination="getFyList"
      />
    </div>
  </el-dialog>

  <el-dialog v-model="ssSelectVisible" title="选择上一审案件" width="70%" append-to-body>
    <el-form :inline="true" :model="queryParamsSs" class="-mb-15px">
      <el-form-item label="案号">
        <el-input
          v-model="queryParamsSs.swWh"
          placeholder="请输入案号模糊搜索"
          clearable
          @keyup.enter="getSsList"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="getSsList"><Icon icon="ep:search" class="mr-5px" />查询</el-button>
        <el-button @click="resetQuerySs"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="historyXzssList" border style="margin-top: 15px">
      <el-table-column label="诉讼文号" prop="swWh" />
      <el-table-column label="来文机关" prop="swJg" />
      <el-table-column label="收文日期" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.swRq) }}
        </template>
      </el-table-column>
      <el-table-column label="原告" prop="sqr" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button type="primary" link @click="selectSs(scope.row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrapper">
      <Pagination
        :total="totalSs"
        v-model:page="queryParamsSs.pageNo"
        v-model:limit="queryParamsSs.pageSize"
        @pagination="getSsList"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import { XzssApi } from '@/api/bpm/xzss'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'

import { XzfyApi } from '@/api/bpm/xzfy'
import { dateUtil } from '@/utils/dateUtil'
import { uploadReturnInfo } from '@/api/infra/file'

defineOptions({ name: 'BpmXzssCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('form')

const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

const handleTdZlChange = () => {
  formData.value.tdZl = (tdZlPart1.value || '') + (tdZlPart2.value || '')
  if (!tdZlPart1.value && !tdZlPart2.value) {
    formData.value.tdZl = undefined
  }
}

const formLoading = ref(false)
const formRef = ref()
const uploadFileRef = ref()

// 弹窗相关
const dialogVisible = ref(false)
const dialogFormRef = ref()

// === 复议案件选择逻辑 ===
const queryParamsFy = reactive({
  pageNo: 1,
  pageSize: 10,
  swWh: undefined // 对应案号模糊搜索
})
const totalFy = ref(0)

// === 上一审案件选择逻辑 ===
const queryParamsSs = reactive({
  pageNo: 1,
  pageSize: 10,
  swWh: undefined
})
const totalSs = ref(0)

// 流程相关
const processDefineKey = 'oa_lawsuit' // 流程 Key
const startUserSelectTasks = ref([])
const startUserSelectAssignees = ref({})
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const processDefinitionId = ref('')

const nextNodeOptions = ref([])
const selectUserOptions = ref([])
const multipleFlag = ref(false)

const tdZlPart1 = ref('')
const tdZlPart2 = ref('')

// 表单数据
const formData = ref({
  id: undefined,
  // 主表字段
  sqr: undefined,
  bsqr: undefined,
  dsr: undefined,
  tdZl: undefined,
  swWh: undefined,
  swJg: '义乌市人民法院',
  swRq: undefined,
  zhubandate: undefined,
  ssLx: undefined, // 诉讼类型(其实是诉讼阶段)
  lb1: undefined,
  lb2: undefined,
  lb3: undefined,
  lb4: undefined,
  lb5: undefined,
  ssNr: undefined, // 复议请求
  ssnr: undefined, // 诉讼内容
  cbr: undefined,
  cbRq: undefined,
  sfyjgRq: undefined,
  ssr: undefined,
  bssr: undefined,
  zssqr: undefined,
  zsbsqr: undefined,
  fyAh: undefined,
  fyGuid: undefined, // 复议关联ID
  ssAh: undefined,
  ssGuid: undefined, // 上一审关联ID
  issupervise: 1, // 默认打勾监督监管
  mailTip: 0,

  // 子表字段
  xzssKz: {
    cdpjRq: undefined,
    jyhRq: undefined,
    jyhNr: undefined,
    zksRq: undefined,
    pjJg: undefined,
    cdJg: undefined,
    xzPc: undefined,
    zxQk: undefined,
    zdr: undefined,
    zdRq: undefined,
    zdQk: undefined,
    yjr: undefined,
    yjRq: undefined,
    yjQk: undefined,
    bz: undefined,
    ktRq: undefined
  },

  // 流程字段
  nextNode: undefined,
  tempNextUserSelectAssignees: undefined,

  attachFilePath: '',
  fileList: []
})

const docList = ref([{ docName: '', docDate: '', docContent: '' }])

// 基础表单校验规则
const formRules = reactive({
  swWh: [{ required: true, message: '来文号不能为空', trigger: 'blur' }],
  swJg: [{ required: true, message: '来文机关不能为空', trigger: 'change' }],
  sqr: [{ required: true, message: '原告不能为空', trigger: 'blur' }],
  bsqr: [{ required: true, message: '被告不能为空', trigger: 'blur' }],
  swRq: [{ required: true, message: '收文日期不能为空', trigger: 'change' }],
  tdZl: [{ required: true, message: '土地坐落不能为空', trigger: 'blur' }],
  fyAh: [{ required: true, message: '复议案号不能为空', trigger: 'blur' }],
  lb1: [{ required: true, message: '案件类别不能为空', trigger: 'change' }],
  lb2: [{ required: true, message: '案件分类不能为空', trigger: 'change' }],
  lb3: [{ required: true, message: '涉及事项不能为空', trigger: 'change' }],
  lb4: [{ required: true, message: '案件类型不能为空', trigger: 'change' }],
  lb5: [{ required: true, message: '诉讼类别不能为空', trigger: 'change' }]
})

// 弹窗流程处理校验规则
const dialogRules = reactive({
  nextNode: [{ required: true, message: '下一环节不能为空', trigger: 'change' }],
  tempNextUserSelectAssignees: [{ required: true, message: '办理人不能为空', trigger: 'change' }]
})

// === 动态表格操作 ===
const addDocRow = () => {
  docList.value.push({ docName: '', docDate: '', docContent: '' })
}

const deleteDocRow = (index: number) => {
  docList.value.splice(index, 1)
}

// === 复议案号、上一审案号 选择逻辑 ===
const fySelectVisible = ref(false)
const ssSelectVisible = ref(false)
const xzfyList = ref<any[]>([])
const historyXzssList = ref<any[]>([])
const listLoading = ref(false)

const openFySelect = async () => {
  fySelectVisible.value = true
  // 重置页码
  queryParamsFy.pageNo = 1
  // 直接调用统一的获取数据方法
  await getFyList()
}

const getFyList = async () => {
  listLoading.value = true
  try {
    // 确保调用接口并赋值 total
    const res = await XzfyApi.getXzfyPageUnlinked(queryParamsFy)
    if (res) {
      xzfyList.value = res.list
      totalFy.value = res.total // 必须赋值，否则分页组件不显示
    }
  } catch (e) {
    console.error(e)
  } finally {
    listLoading.value = false
  }
}
const selectFy = (row: any) => {
  formData.value.fyAh = row.swWh // 备注：复议列表的 swWh 对应 复议案号
  formData.value.fyGuid = row.xmGuid // 关联ID
  fySelectVisible.value = false
}

const selectSs = (row: any) => {
  formData.value.ssAh = row.swWh // 备注：上一审列表的 swWh 对应 案号
  formData.value.ssGuid = row.xmGuid // 关联ID
  ssSelectVisible.value = false
}

// === 下一步节点与选人逻辑 ===
const nodeChange = async (val: any) => {
  await getSelectUsers(val.extensionProperties)
}

const getSelectUsers = async (item: any) => {
  const data = await ProcessInstanceApi.getSelectUserOptions({
    chooseRule: item.choose_rule,
    ruleValue: item.rule_value
  })
  multipleFlag.value = item.multiple_flag === '1'
  selectUserOptions.value = data
}

const getNextApprovalNodes = async () => {
  if (!processDefinitionId.value) return

  const data = await ProcessInstanceApi.getNextSelectNodes({
    processDefinitionId: processDefinitionId.value,
    activityId: NodeId.START_USER_NODE_ID
  })

  nextNodeOptions.value = data
  if (data.length > 0) {
    formData.value.nextNode = data[0]
    await getSelectUsers(data[0].extensionProperties)
  }
}

// 顶部发送按钮点击处理
const handleSendClick = async () => {
  // 1. 校验文件上传状态
  const rawFileList = uploadFileRef.value?.fileList || []
  const isUploading = rawFileList.some(
    (file: any) => file.status === 'ready' || file.status === 'uploading'
  )
  if (isUploading) {
    message.warning('还有文件正在上传中，请稍后提交')
    return
  }

  // 2. 校验主表单必填项
  if (!formRef.value) return
  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) {
    message.warning('请检查并完善基础信息必填项')
    return
  }

  // 3. 校验通过，打开弹窗
  dialogVisible.value = true
}

// 弹窗确认提交
const submitForm = async () => {
  // 校验弹窗表单
  if (!dialogFormRef.value) return
  const isValid = await dialogFormRef.value.validate().catch(() => false)
  if (!isValid) return

  // 自选审批人校验
  if (startUserSelectTasks.value?.length > 0) {
    for (const userTask of startUserSelectTasks.value) {
      if (
        Array.isArray(startUserSelectAssignees.value[userTask.id]) &&
        startUserSelectAssignees.value[userTask.id].length === 0
      ) {
        return message.warning(`请选择${userTask.name}的办理人`)
      }
    }
  }

  formLoading.value = true
  try {
    const data = { ...formData.value } as any

    // 1. 处理动态表格数据 (复用 otherRelatedInfo 字段逻辑)
    data.otherRelatedInfo = JSON.stringify(docList.value)

    // 2. 处理发起人自选审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    // 3. 处理下一步流程选择
    data.nextNodeAssignees = {}
    const assignees = formData.value.tempNextUserSelectAssignees
    if (assignees) {
      const taskKey = formData.value.nextNode.taskDefKey
      data.nextNodeAssignees[taskKey] = Array.isArray(assignees) ? assignees : [assignees]
    }

    // 4. 附件处理逻辑
    const rawFileList = uploadFileRef.value?.fileList || []
    data.fileList = rawFileList
      .filter((item: any) => item.status === 'success' || item.id)
      .map((item: any) => {
        let fileId = undefined
        let fileName = item.name
        let fileUrl = item.url

        if (item.response?.data) {
          const fileResponse = item.response.data
          fileId =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.id
              : fileResponse
          fileName =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.name || item.name
              : item.name
          fileUrl =
            typeof fileResponse === 'object' && fileResponse !== null
              ? fileResponse.url || item.url
              : item.url
        } else if (item.id) {
          fileId = item.id
          fileName = item.name
        }

        let extension = ''
        if (fileName && fileName.lastIndexOf('.') > -1) {
          extension = fileName.substring(fileName.lastIndexOf('.') + 1)
        }

        return {
          id: fileId,
          filename: fileName,
          filepath: fileUrl,
          fileextension: extension
        }
      })
      .filter((item: any) => item.filepath)

    await XzssApi.createXzss(data)
    message.success('行政诉讼申请发起成功')

    dialogVisible.value = false

    // 【关键修改】加入宏任务延迟，彻底避免页面过快重定向致使自身 tab 仍在 keep-alive 存活列队中
    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/unified')
    }, 200)
  } finally {
    formLoading.value = false
  }
}

// === 初始化 ===
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({})
    })
    if (!data) return
    activityNodes.value = data.activityNodes
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
  } catch (e) {
    console.error(e)
  }
}

const resetQueryFy = () => {
  queryParamsFy.pageNo = 1
  queryParamsFy.swWh = undefined
  getFyList()
}

const openSsSelect = () => {
  ssSelectVisible.value = true
  resetQuerySs()
}

const getSsList = async () => {
  listLoading.value = true
  try {
    // @ts-ignore
    const res = await XzssApi.getXzssPage(queryParamsSs)
    if (res) {
      historyXzssList.value = res.list
      totalSs.value = res.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    listLoading.value = false
  }
}

const resetQuerySs = () => {
  queryParamsSs.pageNo = 1
  queryParamsSs.swWh = undefined
  getSsList()
}

const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

onMounted(async () => {
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('流程未配置，请检查 Key: ' + processDefineKey)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  await getNextApprovalNodes()
  await getApprovalDetail()
})

watch(
  () => formData.value.nextNode,
  () => {
    getApprovalDetail()
  }
)
</script>

<style scoped>
/* stylelint-disable selector-id-pattern */

.section-title {
  padding-left: 10px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  border-left: 4px solid #409eff;
}

.custom-tabs {
  margin-top: -10px;
}

/* ================= 导入红头办理单专用样式 ================= */
#printDivTag {
  padding: 20px;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

#printDivTag .oa-container {
  width: 100%;
  padding: 10px 20px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: none;
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
  font-weight: normal;
  text-align: center;
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
.pagination-wrapper {
  overflow: hidden; /* 核心：强制包含内部的 float-right 元素 */
  width: 100%;
  padding-top: 10px;
}
</style>
