<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="发文草稿内容" prop="sendDocDraft">
        <el-input v-model="formData.sendDocDraft" placeholder="请输入发文草稿内容" />
      </el-form-item>
      <el-form-item label="发文结果内容" prop="sendDocResult">
        <el-input v-model="formData.sendDocResult" placeholder="请输入发文结果内容" />
      </el-form-item>
      <el-form-item label="公文性质" prop="docProperty">
        <el-input v-model="formData.docProperty" placeholder="请输入公文性质" />
      </el-form-item>
      <el-form-item label="主送机关" prop="primarySendDept">
        <el-input v-model="formData.primarySendDept" placeholder="请输入主送机关" />
      </el-form-item>
      <el-form-item label="抄送机关" prop="copySendDept">
        <el-input v-model="formData.copySendDept" placeholder="请输入抄送机关" />
      </el-form-item>
      <el-form-item label="抄报机关" prop="reportSendDept">
        <el-input v-model="formData.reportSendDept" placeholder="请输入抄报机关" />
      </el-form-item>
      <el-form-item label="抄送机关" prop="deliverSendDept">
        <el-input v-model="formData.deliverSendDept" placeholder="请输入抄送机关" />
      </el-form-item>
      <el-form-item label="发文字号" prop="sendDocNumber">
        <el-input v-model="formData.sendDocNumber" placeholder="请输入发文字号" />
      </el-form-item>
      <el-form-item label="发文日期" prop="sendTime">
        <el-date-picker
          v-model="formData.sendTime"
          type="date"
          value-format="x"
          placeholder="选择发文日期"
        />
      </el-form-item>
      <el-form-item label="签印份数" prop="signPrintCount">
        <el-input v-model="formData.signPrintCount" placeholder="请输入签印份数" />
      </el-form-item>
      <el-form-item label="保管期限" prop="keepTerm">
        <el-input v-model="formData.keepTerm" placeholder="请输入保管期限" />
      </el-form-item>
      <el-form-item label="项目内码" prop="projectId">
        <el-input v-model="formData.projectId" placeholder="请输入项目内码" />
      </el-form-item>
      <el-form-item label="主题" prop="subject">
        <el-input v-model="formData.subject" placeholder="请输入主题" />
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgencyDegree">
        <el-input v-model="formData.urgencyDegree" placeholder="请输入紧急程度" />
      </el-form-item>
      <el-form-item label="机密程度" prop="secretDegree">
        <el-input v-model="formData.secretDegree" placeholder="请输入机密程度" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="文号" prop="docSequence">
        <el-input v-model="formData.docSequence" placeholder="请输入文号" />
      </el-form-item>
      <el-form-item label="年份" prop="year">
        <el-input v-model="formData.year" placeholder="请输入年份" />
      </el-form-item>
      <el-form-item label="主题词" prop="keyWords">
        <el-input v-model="formData.keyWords" placeholder="请输入主题词" />
      </el-form-item>
      <el-form-item label="发文单位" prop="sendDept">
        <el-input v-model="formData.sendDept" placeholder="请输入发文单位" />
      </el-form-item>
      <el-form-item label="拟稿人" prop="draftPerson">
        <el-input v-model="formData.draftPerson" placeholder="请输入拟稿人" />
      </el-form-item>
      <el-form-item label="拟稿时间" prop="draftDate">
        <el-date-picker
          v-model="formData.draftDate"
          type="date"
          value-format="x"
          placeholder="选择拟稿时间"
        />
      </el-form-item>
      <el-form-item label="事业单位拟稿人意见" prop="draftIdea">
        <el-input v-model="formData.draftIdea" placeholder="请输入事业单位拟稿人意见" />
      </el-form-item>
      <el-form-item label="拟稿人联系电话" prop="contactPhone">
        <el-input v-model="formData.contactPhone" placeholder="请输入拟稿人联系电话" />
      </el-form-item>
      <el-form-item label="最终公文名称" prop="resultFileName">
        <el-input v-model="formData.resultFileName" placeholder="请输入最终公文名称" />
      </el-form-item>
      <el-form-item label="二级分类" prop="docSecondClass">
        <el-input v-model="formData.docSecondClass" placeholder="请输入二级分类" />
      </el-form-item>
      <el-form-item label="一级分类" prop="docClass">
        <el-input v-model="formData.docClass" placeholder="请输入一级分类" />
      </el-form-item>
      <el-form-item label="办件时限" prop="dealTimelimit">
        <el-date-picker
          v-model="formData.dealTimelimit"
          type="date"
          value-format="x"
          placeholder="选择办件时限"
        />
      </el-form-item>
      <el-form-item label="是否发布到外网" prop="releasetoout">
        <el-input v-model="formData.releasetoout" placeholder="请输入是否发布到外网" />
      </el-form-item>
      <el-form-item label="是否发布到专网" prop="releasetospecial">
        <el-input v-model="formData.releasetospecial" placeholder="请输入是否发布到专网" />
      </el-form-item>
      <el-form-item label="是否发布到内网" prop="releasetoin">
        <el-input v-model="formData.releasetoin" placeholder="请输入是否发布到内网" />
      </el-form-item>
      <el-form-item label="最近修改发布人" prop="updatereleaseman">
        <el-input v-model="formData.updatereleaseman" placeholder="请输入最近修改发布人" />
      </el-form-item>
      <el-form-item label="最近修改发布时间" prop="updatereleasedate">
        <el-date-picker
          v-model="formData.updatereleasedate"
          type="date"
          value-format="x"
          placeholder="选择最近修改发布时间"
        />
      </el-form-item>
      <el-form-item label="内部传阅" prop="releasetoother">
        <el-input v-model="formData.releasetoother" placeholder="请输入内部传阅" />
      </el-form-item>
      <el-form-item label="收文内码(收文转发文时用)" prop="receiveDocId">
        <el-input v-model="formData.receiveDocId" placeholder="请输入收文内码(收文转发文时用)" />
      </el-form-item>
      <el-form-item label="正文稿子签出人" prop="checkoutUserId">
        <el-input v-model="formData.checkoutUserId" placeholder="请输入正文稿子签出人" />
      </el-form-item>
      <el-form-item label="签出时间" prop="checkoutTime">
        <el-date-picker
          v-model="formData.checkoutTime"
          type="date"
          value-format="x"
          placeholder="选择签出时间"
        />
      </el-form-item>
      <el-form-item label="办公室秘书意见" prop="secretaryidea">
        <el-input v-model="formData.secretaryidea" placeholder="请输入办公室秘书意见" />
      </el-form-item>
      <el-form-item label="办公室秘书" prop="secretaryideaPerson">
        <el-input v-model="formData.secretaryideaPerson" placeholder="请输入办公室秘书" />
      </el-form-item>
      <el-form-item label="办公室秘书意见日期" prop="secretaryideaDate">
        <el-date-picker
          v-model="formData.secretaryideaDate"
          type="date"
          value-format="x"
          placeholder="选择办公室秘书意见日期"
        />
      </el-form-item>
      <el-form-item label="办公室主任意见" prop="directoridea">
        <el-input v-model="formData.directoridea" placeholder="请输入办公室主任意见" />
      </el-form-item>
      <el-form-item label="办公室主任" prop="directorideaPerson">
        <el-input v-model="formData.directorideaPerson" placeholder="请输入办公室主任" />
      </el-form-item>
      <el-form-item label="办公室主任意见日期" prop="directorideaDate">
        <el-date-picker
          v-model="formData.directorideaDate"
          type="date"
          value-format="x"
          placeholder="选择办公室主任意见日期"
        />
      </el-form-item>
      <el-form-item label="能否查询" prop="couldquery">
        <el-input v-model="formData.couldquery" placeholder="请输入能否查询" />
      </el-form-item>
      <el-form-item label="表单页面" prop="vdformpage">
        <el-input v-model="formData.vdformpage" placeholder="请输入表单页面" />
      </el-form-item>
      <el-form-item label="能否访问" prop="defaultAccess">
        <el-input v-model="formData.defaultAccess" placeholder="请输入能否访问" />
      </el-form-item>
      <el-form-item label="打印条形码" prop="printbarcode">
        <el-input v-model="formData.printbarcode" placeholder="请输入打印条形码" />
      </el-form-item>
      <el-form-item label="信息公开" prop="inforelease">
        <el-input v-model="formData.inforelease" placeholder="请输入信息公开" />
      </el-form-item>
      <el-form-item label="不予公开理由" prop="noreleasecause">
        <el-input v-model="formData.noreleasecause" placeholder="请输入不予公开理由" />
      </el-form-item>
      <el-form-item label="附件路径" prop="attachFilePath">
        <el-input v-model="formData.attachFilePath" placeholder="请输入附件路径" />
      </el-form-item>
      <el-form-item label="判断正文草稿，审批搞，套红正文是否存在" prop="filetag">
        <el-input
          v-model="formData.filetag"
          placeholder="请输入判断正文草稿，审批搞，套红正文是否存在"
        />
      </el-form-item>
      <el-form-item label="拟稿单位" prop="draftDept">
        <el-input v-model="formData.draftDept" placeholder="请输入拟稿单位" />
      </el-form-item>
      <el-form-item label="主办部门" prop="responsibleDept">
        <el-input v-model="formData.responsibleDept" placeholder="请输入主办部门" />
      </el-form-item>
      <el-form-item label="是否导出" prop="isexported">
        <el-input v-model="formData.isexported" placeholder="请输入是否导出" />
      </el-form-item>
      <el-form-item label="是否可以导出" prop="iscanexport">
        <el-input v-model="formData.iscanexport" placeholder="请输入是否可以导出" />
      </el-form-item>
      <el-form-item label="自定义编号" prop="customnumber">
        <el-input v-model="formData.customnumber" placeholder="请输入自定义编号" />
      </el-form-item>
      <el-form-item label="拟稿人用户ID" prop="draftPersonUserid">
        <el-input v-model="formData.draftPersonUserid" placeholder="请输入拟稿人用户ID" />
      </el-form-item>
      <el-form-item label="是否需要TIF文件" prop="ishavetif">
        <el-input v-model="formData.ishavetif" placeholder="请输入是否需要TIF文件" />
      </el-form-item>
      <el-form-item label="公文交换主送机关" prop="exPrimarySendDept">
        <el-input v-model="formData.exPrimarySendDept" placeholder="请输入公文交换主送机关" />
      </el-form-item>
      <el-form-item label="公文交换抄送机关" prop="exCopySendDept">
        <el-input v-model="formData.exCopySendDept" placeholder="请输入公文交换抄送机关" />
      </el-form-item>
      <el-form-item label="是否行政规范性文件" prop="ispolicynorm">
        <el-input v-model="formData.ispolicynorm" placeholder="请输入是否行政规范性文件" />
      </el-form-item>
      <el-form-item label="法制机构意见" prop="fzjgyjTz">
        <el-input v-model="formData.fzjgyjTz" placeholder="请输入法制机构意见" />
      </el-form-item>
      <el-form-item label="法制机构意见用户" prop="fzjgyjTzPerson">
        <el-input v-model="formData.fzjgyjTzPerson" placeholder="请输入法制机构意见用户" />
      </el-form-item>
      <el-form-item label="法制机构意见日期" prop="fzjgyjTzDate">
        <el-date-picker
          v-model="formData.fzjgyjTzDate"
          type="date"
          value-format="x"
          placeholder="选择法制机构意见日期"
        />
      </el-form-item>
      <el-form-item label="法制编号2" prop="customnumber2">
        <el-input v-model="formData.customnumber2" placeholder="请输入法制编号2" />
      </el-form-item>
      <el-form-item label="法制编号3" prop="customnumber3">
        <el-input v-model="formData.customnumber3" placeholder="请输入法制编号3" />
      </el-form-item>
      <el-form-item label="会签部门" prop="hqdept">
        <el-input v-model="formData.hqdept" placeholder="请输入会签部门" />
      </el-form-item>
      <el-form-item label="会签人员姓名" prop="hqname">
        <el-input v-model="formData.hqname" placeholder="请输入会签人员姓名" />
      </el-form-item>
      <el-form-item label="会签意见" prop="hqidea">
        <el-input v-model="formData.hqidea" placeholder="请输入会签意见" />
      </el-form-item>
      <el-form-item label="会签时间" prop="hqdate">
        <el-date-picker
          v-model="formData.hqdate"
          type="date"
          value-format="x"
          placeholder="选择会签时间"
        />
      </el-form-item>
      <el-form-item label="签发人" prop="issuedName">
        <el-input v-model="formData.issuedName" placeholder="请输入签发人" />
      </el-form-item>
      <el-form-item label="校对" prop="proofreader">
        <el-input v-model="formData.proofreader" placeholder="请输入校对" />
      </el-form-item>
      <el-form-item label="校对日期" prop="proofreaderDate">
        <el-date-picker
          v-model="formData.proofreaderDate"
          type="date"
          value-format="x"
          placeholder="选择校对日期"
        />
      </el-form-item>
      <el-form-item label="印制" prop="yinzhiren">
        <el-input v-model="formData.yinzhiren" placeholder="请输入印制" />
      </el-form-item>
      <el-form-item label="用印" prop="yongyinren">
        <el-input v-model="formData.yongyinren" placeholder="请输入用印" />
      </el-form-item>
      <el-form-item label="分发" prop="fenfaren">
        <el-input v-model="formData.fenfaren" placeholder="请输入分发" />
      </el-form-item>
      <el-form-item label="文件类型" prop="docType">
        <el-select v-model="formData.docType" placeholder="请选择文件类型">
          <el-option label="党务" :value="1" />
          <el-option label="政务" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="发文审批内容" prop="sendDocNotion">
        <el-input v-model="formData.sendDocNotion" placeholder="请输入发文审批内容" />
      </el-form-item>
      <el-form-item label="公文范围" prop="docRange">
        <el-input v-model="formData.docRange" placeholder="请输入公文范围" />
      </el-form-item>
      <el-form-item label="是否是联合发文" prop="isunion">
        <el-input v-model="formData.isunion" placeholder="请输入是否是联合发文" />
      </el-form-item>
      <el-form-item label="联合发文单位" prop="uniondepts">
        <el-input v-model="formData.uniondepts" placeholder="请输入联合发文单位" />
      </el-form-item>
      <el-form-item label="联合发文单位意见" prop="uniondeptscomments">
        <el-input v-model="formData.uniondeptscomments" placeholder="请输入联合发文单位意见" />
      </el-form-item>
      <el-form-item label="是否强制交换pdf正文" prop="forceexchangepdf">
        <el-input v-model="formData.forceexchangepdf" placeholder="请输入是否强制交换pdf正文" />
      </el-form-item>
      <el-form-item label="是否上传了word套红正文" prop="isuploadwordformal">
        <el-input
          v-model="formData.isuploadwordformal"
          placeholder="请输入是否上传了word套红正文"
        />
      </el-form-item>
      <el-form-item label="打字员" prop="typist">
        <el-input v-model="formData.typist" placeholder="请输入打字员" />
      </el-form-item>
      <el-form-item label="打印日期" prop="typistDate">
        <el-date-picker
          v-model="formData.typistDate"
          type="date"
          value-format="x"
          placeholder="选择打印日期"
        />
      </el-form-item>
      <el-form-item label="word套红正文上传时间" prop="thwordupdate">
        <el-date-picker
          v-model="formData.thwordupdate"
          type="date"
          value-format="x"
          placeholder="选择word套红正文上传时间"
        />
      </el-form-item>
      <el-form-item label="厅/局长审批意见" prop="fugleidea">
        <el-input v-model="formData.fugleidea" placeholder="请输入厅/局长审批意见" />
      </el-form-item>
      <el-form-item label="厅/局意见人" prop="fuglename">
        <el-input v-model="formData.fuglename" placeholder="请输入厅/局意见人" />
      </el-form-item>
      <el-form-item label="厅/局意见时间" prop="fugledate">
        <el-date-picker
          v-model="formData.fugledate"
          type="date"
          value-format="x"
          placeholder="选择厅/局意见时间"
        />
      </el-form-item>
      <el-form-item label="发文组织" prop="organize">
        <el-input v-model="formData.organize" placeholder="请输入发文组织" />
      </el-form-item>
      <el-form-item label="发文单位" prop="sendUnitid">
        <el-input v-model="formData.sendUnitid" placeholder="请输入发文单位" />
      </el-form-item>
      <el-form-item label="发送状态" prop="sendStatus">
        <el-radio-group v-model="formData.sendStatus">
          <el-radio :label="0">拟发</el-radio>
          <el-radio :label="1">已发</el-radio>
          <el-radio :label="2">退回</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="受理文号" prop="acceptNumber">
        <el-input v-model="formData.acceptNumber" placeholder="请输入受理文号" />
      </el-form-item>
      <el-form-item label="受理申请时间" prop="acceptStarttime">
        <el-date-picker
          v-model="formData.acceptStarttime"
          type="date"
          value-format="x"
          placeholder="选择受理申请时间"
        />
      </el-form-item>
      <el-form-item label="受理到期时间" prop="acceptEndtime">
        <el-date-picker
          v-model="formData.acceptEndtime"
          type="date"
          value-format="x"
          placeholder="选择受理到期时间"
        />
      </el-form-item>
      <el-form-item label="受理延期后到期时间" prop="acceptDelaytime">
        <el-date-picker
          v-model="formData.acceptDelaytime"
          type="date"
          value-format="x"
          placeholder="选择受理延期后到期时间"
        />
      </el-form-item>
      <el-form-item label="是否属于规范性文件,是1，否2" prop="isNormativeDocument">
        <el-input
          v-model="formData.isNormativeDocument"
          placeholder="请输入是否属于规范性文件,是1，否2"
        />
      </el-form-item>
      <el-form-item label="是否重要" prop="ifimportant">
        <el-input v-model="formData.ifimportant" placeholder="请输入是否重要" />
      </el-form-item>
      <el-form-item label="办公室秘书落实意见" prop="secretaryimplementidea">
        <el-input
          v-model="formData.secretaryimplementidea"
          placeholder="请输入办公室秘书落实意见"
        />
      </el-form-item>
      <el-form-item label="办公室秘书" prop="secretaryimplementideaPerson">
        <el-input v-model="formData.secretaryimplementideaPerson" placeholder="请输入办公室秘书" />
      </el-form-item>
      <el-form-item label="办公室秘书落实意见日期" prop="secretaryimplementideaDate">
        <el-date-picker
          v-model="formData.secretaryimplementideaDate"
          type="date"
          value-format="x"
          placeholder="选择办公室秘书落实意见日期"
        />
      </el-form-item>
      <el-form-item label="最小知悉范围" prop="miniknow">
        <el-input v-model="formData.miniknow" placeholder="请输入最小知悉范围" />
      </el-form-item>
      <el-form-item label="省厅便函选择类型结果" prop="selecttype">
        <el-input v-model="formData.selecttype" placeholder="请输入省厅便函选择类型结果" />
      </el-form-item>
      <el-form-item label="是否已归档,1已归档，否则未归档" prop="ifpigeonhold">
        <el-input
          v-model="formData.ifpigeonhold"
          placeholder="请输入是否已归档,1已归档，否则未归档"
        />
      </el-form-item>
      <el-form-item label="归档号" prop="pigeonholeNum">
        <el-input v-model="formData.pigeonholeNum" placeholder="请输入归档号" />
      </el-form-item>
      <el-form-item label="归档序号" prop="pigeonholeSeq">
        <el-input v-model="formData.pigeonholeSeq" placeholder="请输入归档序号" />
      </el-form-item>
      <el-form-item label="归档结果" prop="pigeonholeResult">
        <el-input v-model="formData.pigeonholeResult" placeholder="请输入归档结果" />
      </el-form-item>
      <el-form-item label="流程实例的编号" prop="processInstanceId">
        <el-input v-model="formData.processInstanceId" placeholder="请输入流程实例的编号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { SendDocApi, SendDoc } from '@/api/bpm/senddoc'

/** 发文 表单 */
defineOptions({ name: 'SendDocForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  sendDocDraft: undefined,
  sendDocResult: undefined,
  docProperty: undefined,
  primarySendDept: undefined,
  copySendDept: undefined,
  reportSendDept: undefined,
  deliverSendDept: undefined,
  sendDocNumber: undefined,
  sendTime: undefined,
  signPrintCount: undefined,
  keepTerm: undefined,
  projectId: undefined,
  subject: undefined,
  urgencyDegree: undefined,
  secretDegree: undefined,
  remark: undefined,
  docSequence: undefined,
  year: undefined,
  keyWords: undefined,
  sendDept: undefined,
  draftPerson: undefined,
  draftDate: undefined,
  draftIdea: undefined,
  contactPhone: undefined,
  resultFileName: undefined,
  docSecondClass: undefined,
  docClass: undefined,
  dealTimelimit: undefined,
  releasetoout: undefined,
  releasetospecial: undefined,
  releasetoin: undefined,
  updatereleaseman: undefined,
  updatereleasedate: undefined,
  releasetoother: undefined,
  receiveDocId: undefined,
  checkoutUserId: undefined,
  checkoutTime: undefined,
  secretaryidea: undefined,
  secretaryideaPerson: undefined,
  secretaryideaDate: undefined,
  directoridea: undefined,
  directorideaPerson: undefined,
  directorideaDate: undefined,
  couldquery: undefined,
  vdformpage: undefined,
  defaultAccess: undefined,
  printbarcode: undefined,
  inforelease: undefined,
  noreleasecause: undefined,
  attachFilePath: undefined,
  filetag: undefined,
  draftDept: undefined,
  responsibleDept: undefined,
  isexported: undefined,
  iscanexport: undefined,
  customnumber: undefined,
  draftPersonUserid: undefined,
  ishavetif: undefined,
  exPrimarySendDept: undefined,
  exCopySendDept: undefined,
  ispolicynorm: undefined,
  fzjgyjTz: undefined,
  fzjgyjTzPerson: undefined,
  fzjgyjTzDate: undefined,
  customnumber2: undefined,
  customnumber3: undefined,
  hqdept: undefined,
  hqname: undefined,
  hqidea: undefined,
  hqdate: undefined,
  issuedName: undefined,
  proofreader: undefined,
  proofreaderDate: undefined,
  yinzhiren: undefined,
  yongyinren: undefined,
  fenfaren: undefined,
  docType: undefined,
  sendDocNotion: undefined,
  docRange: undefined,
  isunion: undefined,
  uniondepts: undefined,
  uniondeptscomments: undefined,
  forceexchangepdf: undefined,
  isuploadwordformal: undefined,
  typist: undefined,
  typistDate: undefined,
  thwordupdate: undefined,
  fugleidea: undefined,
  fuglename: undefined,
  fugledate: undefined,
  organize: undefined,
  sendUnitid: undefined,
  sendStatus: undefined,
  acceptNumber: undefined,
  acceptStarttime: undefined,
  acceptEndtime: undefined,
  acceptDelaytime: undefined,
  isNormativeDocument: undefined,
  ifimportant: undefined,
  secretaryimplementidea: undefined,
  secretaryimplementideaPerson: undefined,
  secretaryimplementideaDate: undefined,
  miniknow: undefined,
  selecttype: undefined,
  ifpigeonhold: undefined,
  pigeonholeNum: undefined,
  pigeonholeSeq: undefined,
  pigeonholeResult: undefined,
  processInstanceId: undefined
})
const formRules = reactive({})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await SendDocApi.getSendDoc(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as SendDoc
    if (formType.value === 'create') {
      await SendDocApi.createSendDoc(data)
      message.success(t('common.createSuccess'))
    } else {
      await SendDocApi.updateSendDoc(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    sendDocDraft: undefined,
    sendDocResult: undefined,
    docProperty: undefined,
    primarySendDept: undefined,
    copySendDept: undefined,
    reportSendDept: undefined,
    deliverSendDept: undefined,
    sendDocNumber: undefined,
    sendTime: undefined,
    signPrintCount: undefined,
    keepTerm: undefined,
    projectId: undefined,
    subject: undefined,
    urgencyDegree: undefined,
    secretDegree: undefined,
    remark: undefined,
    docSequence: undefined,
    year: undefined,
    keyWords: undefined,
    sendDept: undefined,
    draftPerson: undefined,
    draftDate: undefined,
    draftIdea: undefined,
    contactPhone: undefined,
    resultFileName: undefined,
    docSecondClass: undefined,
    docClass: undefined,
    dealTimelimit: undefined,
    releasetoout: undefined,
    releasetospecial: undefined,
    releasetoin: undefined,
    updatereleaseman: undefined,
    updatereleasedate: undefined,
    releasetoother: undefined,
    receiveDocId: undefined,
    checkoutUserId: undefined,
    checkoutTime: undefined,
    secretaryidea: undefined,
    secretaryideaPerson: undefined,
    secretaryideaDate: undefined,
    directoridea: undefined,
    directorideaPerson: undefined,
    directorideaDate: undefined,
    couldquery: undefined,
    vdformpage: undefined,
    defaultAccess: undefined,
    printbarcode: undefined,
    inforelease: undefined,
    noreleasecause: undefined,
    attachFilePath: undefined,
    filetag: undefined,
    draftDept: undefined,
    responsibleDept: undefined,
    isexported: undefined,
    iscanexport: undefined,
    customnumber: undefined,
    draftPersonUserid: undefined,
    ishavetif: undefined,
    exPrimarySendDept: undefined,
    exCopySendDept: undefined,
    ispolicynorm: undefined,
    fzjgyjTz: undefined,
    fzjgyjTzPerson: undefined,
    fzjgyjTzDate: undefined,
    customnumber2: undefined,
    customnumber3: undefined,
    hqdept: undefined,
    hqname: undefined,
    hqidea: undefined,
    hqdate: undefined,
    issuedName: undefined,
    proofreader: undefined,
    proofreaderDate: undefined,
    yinzhiren: undefined,
    yongyinren: undefined,
    fenfaren: undefined,
    docType: undefined,
    sendDocNotion: undefined,
    docRange: undefined,
    isunion: undefined,
    uniondepts: undefined,
    uniondeptscomments: undefined,
    forceexchangepdf: undefined,
    isuploadwordformal: undefined,
    typist: undefined,
    typistDate: undefined,
    thwordupdate: undefined,
    fugleidea: undefined,
    fuglename: undefined,
    fugledate: undefined,
    organize: undefined,
    sendUnitid: undefined,
    sendStatus: undefined,
    acceptNumber: undefined,
    acceptStarttime: undefined,
    acceptEndtime: undefined,
    acceptDelaytime: undefined,
    isNormativeDocument: undefined,
    ifimportant: undefined,
    secretaryimplementidea: undefined,
    secretaryimplementideaPerson: undefined,
    secretaryimplementideaDate: undefined,
    miniknow: undefined,
    selecttype: undefined,
    ifpigeonhold: undefined,
    pigeonholeNum: undefined,
    pigeonholeSeq: undefined,
    pigeonholeResult: undefined,
    processInstanceId: undefined
  }
  formRef.value?.resetFields()
}
</script>
