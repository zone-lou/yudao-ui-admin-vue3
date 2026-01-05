<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="发文草稿内容" prop="sendDocDraft">
        <el-input
          v-model="queryParams.sendDocDraft"
          placeholder="请输入发文草稿内容"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发文结果内容" prop="sendDocResult">
        <el-input
          v-model="queryParams.sendDocResult"
          placeholder="请输入发文结果内容"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="公文性质" prop="docProperty">
        <el-input
          v-model="queryParams.docProperty"
          placeholder="请输入公文性质"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="主送机关" prop="primarySendDept">
        <el-input
          v-model="queryParams.primarySendDept"
          placeholder="请输入主送机关"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="抄送机关" prop="copySendDept">
        <el-input
          v-model="queryParams.copySendDept"
          placeholder="请输入抄送机关"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="抄报机关" prop="reportSendDept">
        <el-input
          v-model="queryParams.reportSendDept"
          placeholder="请输入抄报机关"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="抄送机关" prop="deliverSendDept">
        <el-input
          v-model="queryParams.deliverSendDept"
          placeholder="请输入抄送机关"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发文号" prop="sendDocNumber">
        <el-input
          v-model="queryParams.sendDocNumber"
          placeholder="请输入发文号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发文日期" prop="sendTime">
        <el-date-picker
          v-model="queryParams.sendTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="签印份数" prop="signPrintCount">
        <el-input
          v-model="queryParams.signPrintCount"
          placeholder="请输入签印份数"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="保管期限" prop="keepTerm">
        <el-input
          v-model="queryParams.keepTerm"
          placeholder="请输入保管期限"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="项目内码" prop="projectId">
        <el-input
          v-model="queryParams.projectId"
          placeholder="请输入项目内码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="主题" prop="subject">
        <el-input
          v-model="queryParams.subject"
          placeholder="请输入主题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgencyDegree">
        <el-input
          v-model="queryParams.urgencyDegree"
          placeholder="请输入紧急程度"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="机密程度" prop="secretDegree">
        <el-input
          v-model="queryParams.secretDegree"
          placeholder="请输入机密程度"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="queryParams.remark"
          placeholder="请输入备注"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="文号" prop="docSequence">
        <el-input
          v-model="queryParams.docSequence"
          placeholder="请输入文号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="年份" prop="year">
        <el-input
          v-model="queryParams.year"
          placeholder="请输入年份"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="主题词" prop="keyWords">
        <el-input
          v-model="queryParams.keyWords"
          placeholder="请输入主题词"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发文单位" prop="sendDept">
        <el-input
          v-model="queryParams.sendDept"
          placeholder="请输入发文单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="拟稿人" prop="draftPerson">
        <el-input
          v-model="queryParams.draftPerson"
          placeholder="请输入拟稿人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="拟稿时间" prop="draftDate">
        <el-date-picker
          v-model="queryParams.draftDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="事业单位拟稿人意见" prop="draftIdea">
        <el-input
          v-model="queryParams.draftIdea"
          placeholder="请输入事业单位拟稿人意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="拟稿人联系电话" prop="contactPhone">
        <el-input
          v-model="queryParams.contactPhone"
          placeholder="请输入拟稿人联系电话"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="最终公文名称" prop="resultFileName">
        <el-input
          v-model="queryParams.resultFileName"
          placeholder="请输入最终公文名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="二级分类" prop="docSecondClass">
        <el-input
          v-model="queryParams.docSecondClass"
          placeholder="请输入二级分类"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="一级分类" prop="docClass">
        <el-input
          v-model="queryParams.docClass"
          placeholder="请输入一级分类"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办件时限" prop="dealTimelimit">
        <el-date-picker
          v-model="queryParams.dealTimelimit"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择办件时限"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否发布到外网" prop="releasetoout">
        <el-input
          v-model="queryParams.releasetoout"
          placeholder="请输入是否发布到外网"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否发布到专网" prop="releasetospecial">
        <el-input
          v-model="queryParams.releasetospecial"
          placeholder="请输入是否发布到专网"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否发布到内网" prop="releasetoin">
        <el-input
          v-model="queryParams.releasetoin"
          placeholder="请输入是否发布到内网"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="最近修改发布人" prop="updatereleaseman">
        <el-input
          v-model="queryParams.updatereleaseman"
          placeholder="请输入最近修改发布人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="最近修改发布时间" prop="updatereleasedate">
        <el-date-picker
          v-model="queryParams.updatereleasedate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="内部传阅" prop="releasetoother">
        <el-input
          v-model="queryParams.releasetoother"
          placeholder="请输入内部传阅"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="收文内码(收文转发文时用)" prop="receiveDocId">
        <el-input
          v-model="queryParams.receiveDocId"
          placeholder="请输入收文内码(收文转发文时用)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="正文稿子签出人" prop="checkoutUserId">
        <el-input
          v-model="queryParams.checkoutUserId"
          placeholder="请输入正文稿子签出人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="签出时间" prop="checkoutTime">
        <el-date-picker
          v-model="queryParams.checkoutTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="办公室秘书意见" prop="secretaryidea">
        <el-input
          v-model="queryParams.secretaryidea"
          placeholder="请输入办公室秘书意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办公室秘书" prop="secretaryideaPerson">
        <el-input
          v-model="queryParams.secretaryideaPerson"
          placeholder="请输入办公室秘书"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办公室秘书意见日期" prop="secretaryideaDate">
        <el-date-picker
          v-model="queryParams.secretaryideaDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="办公室主任意见" prop="directoridea">
        <el-input
          v-model="queryParams.directoridea"
          placeholder="请输入办公室主任意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办公室主任" prop="directorideaPerson">
        <el-input
          v-model="queryParams.directorideaPerson"
          placeholder="请输入办公室主任"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办公室主任意见日期" prop="directorideaDate">
        <el-date-picker
          v-model="queryParams.directorideaDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="能否查询" prop="couldquery">
        <el-input
          v-model="queryParams.couldquery"
          placeholder="请输入能否查询"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="表单页面" prop="vdformpage">
        <el-input
          v-model="queryParams.vdformpage"
          placeholder="请输入表单页面"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="能否访问" prop="defaultAccess">
        <el-input
          v-model="queryParams.defaultAccess"
          placeholder="请输入能否访问"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="打印条形码" prop="printbarcode">
        <el-input
          v-model="queryParams.printbarcode"
          placeholder="请输入打印条形码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="信息公开" prop="inforelease">
        <el-input
          v-model="queryParams.inforelease"
          placeholder="请输入信息公开"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="不予公开理由" prop="noreleasecause">
        <el-input
          v-model="queryParams.noreleasecause"
          placeholder="请输入不予公开理由"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="附件路径" prop="attachFilePath">
        <el-input
          v-model="queryParams.attachFilePath"
          placeholder="请输入附件路径"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="判断正文草稿，审批搞，套红正文是否存在" prop="filetag">
        <el-input
          v-model="queryParams.filetag"
          placeholder="请输入判断正文草稿，审批搞，套红正文是否存在"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="拟稿单位" prop="draftDept">
        <el-input
          v-model="queryParams.draftDept"
          placeholder="请输入拟稿单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="主办部门" prop="responsibleDept">
        <el-input
          v-model="queryParams.responsibleDept"
          placeholder="请输入主办部门"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否导出" prop="isexported">
        <el-input
          v-model="queryParams.isexported"
          placeholder="请输入是否导出"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否可以导出" prop="iscanexport">
        <el-input
          v-model="queryParams.iscanexport"
          placeholder="请输入是否可以导出"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="自定义编号" prop="customnumber">
        <el-input
          v-model="queryParams.customnumber"
          placeholder="请输入自定义编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="拟稿人用户ID" prop="draftPersonUserid">
        <el-input
          v-model="queryParams.draftPersonUserid"
          placeholder="请输入拟稿人用户ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否需要TIF文件" prop="ishavetif">
        <el-input
          v-model="queryParams.ishavetif"
          placeholder="请输入是否需要TIF文件"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="公文交换主送机关" prop="exPrimarySendDept">
        <el-input
          v-model="queryParams.exPrimarySendDept"
          placeholder="请输入公文交换主送机关"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="公文交换抄送机关" prop="exCopySendDept">
        <el-input
          v-model="queryParams.exCopySendDept"
          placeholder="请输入公文交换抄送机关"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否行政规范性文件" prop="ispolicynorm">
        <el-input
          v-model="queryParams.ispolicynorm"
          placeholder="请输入是否行政规范性文件"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="法制机构意见" prop="fzjgyjTz">
        <el-input
          v-model="queryParams.fzjgyjTz"
          placeholder="请输入法制机构意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="法制机构意见用户" prop="fzjgyjTzPerson">
        <el-input
          v-model="queryParams.fzjgyjTzPerson"
          placeholder="请输入法制机构意见用户"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="法制机构意见日期" prop="fzjgyjTzDate">
        <el-date-picker
          v-model="queryParams.fzjgyjTzDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="法制编号2" prop="customnumber2">
        <el-input
          v-model="queryParams.customnumber2"
          placeholder="请输入法制编号2"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="法制编号3" prop="customnumber3">
        <el-input
          v-model="queryParams.customnumber3"
          placeholder="请输入法制编号3"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会签部门" prop="hqdept">
        <el-input
          v-model="queryParams.hqdept"
          placeholder="请输入会签部门"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会签人员姓名" prop="hqname">
        <el-input
          v-model="queryParams.hqname"
          placeholder="请输入会签人员姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会签意见" prop="hqidea">
        <el-input
          v-model="queryParams.hqidea"
          placeholder="请输入会签意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会签时间" prop="hqdate">
        <el-date-picker
          v-model="queryParams.hqdate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="签发人" prop="issuedName">
        <el-input
          v-model="queryParams.issuedName"
          placeholder="请输入签发人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="校对" prop="proofreader">
        <el-input
          v-model="queryParams.proofreader"
          placeholder="请输入校对"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="校对日期" prop="proofreaderDate">
        <el-date-picker
          v-model="queryParams.proofreaderDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="印制" prop="yinzhiren">
        <el-input
          v-model="queryParams.yinzhiren"
          placeholder="请输入印制"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="用印" prop="yongyinren">
        <el-input
          v-model="queryParams.yongyinren"
          placeholder="请输入用印"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="分发" prop="fenfaren">
        <el-input
          v-model="queryParams.fenfaren"
          placeholder="请输入分发"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="文件类型 1党务 2政务" prop="docType">
        <el-select
          v-model="queryParams.docType"
          placeholder="请选择文件类型 1党务 2政务"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.$dictType.toUpperCase())"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发文审批内容" prop="sendDocNotion">
        <el-input
          v-model="queryParams.sendDocNotion"
          placeholder="请输入发文审批内容"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="公文范围" prop="docRange">
        <el-input
          v-model="queryParams.docRange"
          placeholder="请输入公文范围"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否是联合发文" prop="isunion">
        <el-input
          v-model="queryParams.isunion"
          placeholder="请输入是否是联合发文"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="联合发文单位" prop="uniondepts">
        <el-input
          v-model="queryParams.uniondepts"
          placeholder="请输入联合发文单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="联合发文单位意见" prop="uniondeptscomments">
        <el-input
          v-model="queryParams.uniondeptscomments"
          placeholder="请输入联合发文单位意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否强制交换pdf正文" prop="forceexchangepdf">
        <el-input
          v-model="queryParams.forceexchangepdf"
          placeholder="请输入是否强制交换pdf正文"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否上传了word套红正文" prop="isuploadwordformal">
        <el-input
          v-model="queryParams.isuploadwordformal"
          placeholder="请输入是否上传了word套红正文"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="打字员" prop="typist">
        <el-input
          v-model="queryParams.typist"
          placeholder="请输入打字员"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="打印日期" prop="typistDate">
        <el-date-picker
          v-model="queryParams.typistDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="word套红正文上传时间" prop="thwordupdate">
        <el-date-picker
          v-model="queryParams.thwordupdate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="厅/局长审批意见" prop="fugleidea">
        <el-input
          v-model="queryParams.fugleidea"
          placeholder="请输入厅/局长审批意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="厅/局意见人" prop="fuglename">
        <el-input
          v-model="queryParams.fuglename"
          placeholder="请输入厅/局意见人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="厅/局意见时间" prop="fugledate">
        <el-date-picker
          v-model="queryParams.fugledate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="发文组织" prop="organize">
        <el-input
          v-model="queryParams.organize"
          placeholder="请输入发文组织"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发文单位" prop="sendUnitid">
        <el-input
          v-model="queryParams.sendUnitid"
          placeholder="请输入发文单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发送状态 0为拟发 1为已发 2为退回" prop="sendStatus">
        <el-select
          v-model="queryParams.sendStatus"
          placeholder="请选择发送状态 0为拟发 1为已发 2为退回"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.$dictType.toUpperCase())"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="受理文号" prop="acceptNumber">
        <el-input
          v-model="queryParams.acceptNumber"
          placeholder="请输入受理文号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="受理申请时间" prop="acceptStarttime">
        <el-date-picker
          v-model="queryParams.acceptStarttime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="受理到期时间" prop="acceptEndtime">
        <el-date-picker
          v-model="queryParams.acceptEndtime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="受理延期后到期时间" prop="acceptDelaytime">
        <el-date-picker
          v-model="queryParams.acceptDelaytime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="是否属于规范性文件,是1，否2" prop="isNormativeDocument">
        <el-input
          v-model="queryParams.isNormativeDocument"
          placeholder="请输入是否属于规范性文件,是1，否2"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否重要" prop="ifimportant">
        <el-input
          v-model="queryParams.ifimportant"
          placeholder="请输入是否重要"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办公室秘书落实意见" prop="secretaryimplementidea">
        <el-input
          v-model="queryParams.secretaryimplementidea"
          placeholder="请输入办公室秘书落实意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办公室秘书" prop="secretaryimplementideaPerson">
        <el-input
          v-model="queryParams.secretaryimplementideaPerson"
          placeholder="请输入办公室秘书"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办公室秘书落实意见日期" prop="secretaryimplementideaDate">
        <el-date-picker
          v-model="queryParams.secretaryimplementideaDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="最小知悉范围" prop="miniknow">
        <el-input
          v-model="queryParams.miniknow"
          placeholder="请输入最小知悉范围"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="省厅便函选择类型结果" prop="selecttype">
        <el-select
          v-model="queryParams.selecttype"
          placeholder="请选择省厅便函选择类型结果"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.$dictType.toUpperCase())"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否已归档,1已归档，否则未归档" prop="ifpigeonhold">
        <el-input
          v-model="queryParams.ifpigeonhold"
          placeholder="请输入是否已归档,1已归档，否则未归档"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="归档号" prop="pigeonholeNum">
        <el-input
          v-model="queryParams.pigeonholeNum"
          placeholder="请输入归档号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="归档序号" prop="pigeonholeSeq">
        <el-input
          v-model="queryParams.pigeonholeSeq"
          placeholder="请输入归档序号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="归档结果" prop="pigeonholeResult">
        <el-input
          v-model="queryParams.pigeonholeResult"
          placeholder="请输入归档结果"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="流程实例的编号" prop="processInstanceId">
        <el-input
          v-model="queryParams.processInstanceId"
          placeholder="请输入流程实例的编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['bpm:send-doc:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['bpm:send-doc:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['bpm:send-doc:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="发文表主键" align="center" prop="id" />
      <el-table-column label="发文草稿内容" align="center" prop="sendDocDraft" />
      <el-table-column label="发文结果内容" align="center" prop="sendDocResult" />
      <el-table-column label="公文性质" align="center" prop="docProperty" />
      <el-table-column label="主送机关" align="center" prop="primarySendDept" />
      <el-table-column label="抄送机关" align="center" prop="copySendDept" />
      <el-table-column label="抄报机关" align="center" prop="reportSendDept" />
      <el-table-column label="抄送机关" align="center" prop="deliverSendDept" />
      <el-table-column label="发文号" align="center" prop="sendDocNumber" />
      <el-table-column
        label="发文日期"
        align="center"
        prop="sendTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="签印份数" align="center" prop="signPrintCount" />
      <el-table-column label="保管期限" align="center" prop="keepTerm" />
      <el-table-column label="项目内码" align="center" prop="projectId" />
      <el-table-column label="主题" align="center" prop="subject" />
      <el-table-column label="紧急程度" align="center" prop="urgencyDegree" />
      <el-table-column label="机密程度" align="center" prop="secretDegree" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="文号" align="center" prop="docSequence" />
      <el-table-column label="年份" align="center" prop="year" />
      <el-table-column label="主题词" align="center" prop="keyWords" />
      <el-table-column label="发文单位" align="center" prop="sendDept" />
      <el-table-column label="拟稿人" align="center" prop="draftPerson" />
      <el-table-column
        label="拟稿时间"
        align="center"
        prop="draftDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="事业单位拟稿人意见" align="center" prop="draftIdea" />
      <el-table-column label="拟稿人联系电话" align="center" prop="contactPhone" />
      <el-table-column label="最终公文名称" align="center" prop="resultFileName" />
      <el-table-column label="二级分类" align="center" prop="docSecondClass" />
      <el-table-column label="一级分类" align="center" prop="docClass" />
      <el-table-column
        label="办件时限"
        align="center"
        prop="dealTimelimit"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="是否发布到外网" align="center" prop="releasetoout" />
      <el-table-column label="是否发布到专网" align="center" prop="releasetospecial" />
      <el-table-column label="是否发布到内网" align="center" prop="releasetoin" />
      <el-table-column label="最近修改发布人" align="center" prop="updatereleaseman" />
      <el-table-column
        label="最近修改发布时间"
        align="center"
        prop="updatereleasedate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="内部传阅" align="center" prop="releasetoother" />
      <el-table-column label="收文内码(收文转发文时用)" align="center" prop="receiveDocId" />
      <el-table-column label="正文稿子签出人" align="center" prop="checkoutUserId" />
      <el-table-column
        label="签出时间"
        align="center"
        prop="checkoutTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="办公室秘书意见" align="center" prop="secretaryidea" />
      <el-table-column label="办公室秘书" align="center" prop="secretaryideaPerson" />
      <el-table-column
        label="办公室秘书意见日期"
        align="center"
        prop="secretaryideaDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="办公室主任意见" align="center" prop="directoridea" />
      <el-table-column label="办公室主任" align="center" prop="directorideaPerson" />
      <el-table-column
        label="办公室主任意见日期"
        align="center"
        prop="directorideaDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="能否查询" align="center" prop="couldquery" />
      <el-table-column label="表单页面" align="center" prop="vdformpage" />
      <el-table-column label="能否访问" align="center" prop="defaultAccess" />
      <el-table-column label="打印条形码" align="center" prop="printbarcode" />
      <el-table-column label="信息公开" align="center" prop="inforelease" />
      <el-table-column label="不予公开理由" align="center" prop="noreleasecause" />
      <el-table-column label="附件路径" align="center" prop="attachFilePath" />
      <el-table-column label="判断正文草稿，审批搞，套红正文是否存在" align="center" prop="filetag" />
      <el-table-column label="拟稿单位" align="center" prop="draftDept" />
      <el-table-column label="主办部门" align="center" prop="responsibleDept" />
      <el-table-column label="是否导出" align="center" prop="isexported" />
      <el-table-column label="是否可以导出" align="center" prop="iscanexport" />
      <el-table-column label="自定义编号" align="center" prop="customnumber" />
      <el-table-column label="拟稿人用户ID" align="center" prop="draftPersonUserid" />
      <el-table-column label="是否需要TIF文件" align="center" prop="ishavetif" />
      <el-table-column label="公文交换主送机关" align="center" prop="exPrimarySendDept" />
      <el-table-column label="公文交换抄送机关" align="center" prop="exCopySendDept" />
      <el-table-column label="是否行政规范性文件" align="center" prop="ispolicynorm" />
      <el-table-column label="法制机构意见" align="center" prop="fzjgyjTz" />
      <el-table-column label="法制机构意见用户" align="center" prop="fzjgyjTzPerson" />
      <el-table-column
        label="法制机构意见日期"
        align="center"
        prop="fzjgyjTzDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="法制编号2" align="center" prop="customnumber2" />
      <el-table-column label="法制编号3" align="center" prop="customnumber3" />
      <el-table-column label="会签部门" align="center" prop="hqdept" />
      <el-table-column label="会签人员姓名" align="center" prop="hqname" />
      <el-table-column label="会签意见" align="center" prop="hqidea" />
      <el-table-column
        label="会签时间"
        align="center"
        prop="hqdate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="签发人" align="center" prop="issuedName" />
      <el-table-column label="校对" align="center" prop="proofreader" />
      <el-table-column
        label="校对日期"
        align="center"
        prop="proofreaderDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="印制" align="center" prop="yinzhiren" />
      <el-table-column label="用印" align="center" prop="yongyinren" />
      <el-table-column label="分发" align="center" prop="fenfaren" />
      <el-table-column label="文件类型 1党务 2政务" align="center" prop="docType" />
      <el-table-column label="发文审批内容" align="center" prop="sendDocNotion" />
      <el-table-column label="公文范围" align="center" prop="docRange" />
      <el-table-column label="是否是联合发文" align="center" prop="isunion" />
      <el-table-column label="联合发文单位" align="center" prop="uniondepts" />
      <el-table-column label="联合发文单位意见" align="center" prop="uniondeptscomments" />
      <el-table-column label="是否强制交换pdf正文" align="center" prop="forceexchangepdf" />
      <el-table-column label="是否上传了word套红正文" align="center" prop="isuploadwordformal" />
      <el-table-column label="打字员" align="center" prop="typist" />
      <el-table-column
        label="打印日期"
        align="center"
        prop="typistDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="word套红正文上传时间"
        align="center"
        prop="thwordupdate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="厅/局长审批意见" align="center" prop="fugleidea" />
      <el-table-column label="厅/局意见人" align="center" prop="fuglename" />
      <el-table-column
        label="厅/局意见时间"
        align="center"
        prop="fugledate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="发文组织" align="center" prop="organize" />
      <el-table-column label="发文单位" align="center" prop="sendUnitid" />
      <el-table-column label="发送状态 0为拟发 1为已发 2为退回" align="center" prop="sendStatus" />
      <el-table-column label="受理文号" align="center" prop="acceptNumber" />
      <el-table-column
        label="受理申请时间"
        align="center"
        prop="acceptStarttime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="受理到期时间"
        align="center"
        prop="acceptEndtime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="受理延期后到期时间"
        align="center"
        prop="acceptDelaytime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="是否属于规范性文件,是1，否2" align="center" prop="isNormativeDocument" />
      <el-table-column label="是否重要" align="center" prop="ifimportant" />
      <el-table-column label="办公室秘书落实意见" align="center" prop="secretaryimplementidea" />
      <el-table-column label="办公室秘书" align="center" prop="secretaryimplementideaPerson" />
      <el-table-column
        label="办公室秘书落实意见日期"
        align="center"
        prop="secretaryimplementideaDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="最小知悉范围" align="center" prop="miniknow" />
      <el-table-column label="省厅便函选择类型结果" align="center" prop="selecttype" />
      <el-table-column label="是否已归档,1已归档，否则未归档" align="center" prop="ifpigeonhold" />
      <el-table-column label="归档号" align="center" prop="pigeonholeNum" />
      <el-table-column label="归档序号" align="center" prop="pigeonholeSeq" />
      <el-table-column label="归档结果" align="center" prop="pigeonholeResult" />
      <el-table-column label="流程实例的编号" align="center" prop="processInstanceId" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:send-doc:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['bpm:send-doc:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <SendDocForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { SendDocApi, SendDoc } from '@/api/bpm/senddoc'
import SendDocForm from './SendDocForm.vue'

/** 发文 列表 */
defineOptions({ name: 'SendDoc' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<SendDoc[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  sendDocDraft: undefined,
  sendDocResult: undefined,
  docProperty: undefined,
  primarySendDept: undefined,
  copySendDept: undefined,
  reportSendDept: undefined,
  deliverSendDept: undefined,
  sendDocNumber: undefined,
  sendTime: [],
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
  draftDate: [],
  draftIdea: undefined,
  contactPhone: undefined,
  resultFileName: undefined,
  docSecondClass: undefined,
  docClass: undefined,
  dealTimelimit: undefined,
  dealTimelimit: [],
  releasetoout: undefined,
  releasetospecial: undefined,
  releasetoin: undefined,
  updatereleaseman: undefined,
  updatereleasedate: [],
  releasetoother: undefined,
  receiveDocId: undefined,
  checkoutUserId: undefined,
  checkoutTime: [],
  secretaryidea: undefined,
  secretaryideaPerson: undefined,
  secretaryideaDate: [],
  directoridea: undefined,
  directorideaPerson: undefined,
  directorideaDate: [],
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
  fzjgyjTzDate: [],
  customnumber2: undefined,
  customnumber3: undefined,
  hqdept: undefined,
  hqname: undefined,
  hqidea: undefined,
  hqdate: [],
  issuedName: undefined,
  proofreader: undefined,
  proofreaderDate: [],
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
  typistDate: [],
  thwordupdate: [],
  fugleidea: undefined,
  fuglename: undefined,
  fugledate: [],
  organize: undefined,
  sendUnitid: undefined,
  sendStatus: undefined,
  acceptNumber: undefined,
  acceptStarttime: [],
  acceptEndtime: [],
  acceptDelaytime: [],
  isNormativeDocument: undefined,
  ifimportant: undefined,
  secretaryimplementidea: undefined,
  secretaryimplementideaPerson: undefined,
  secretaryimplementideaDate: [],
  miniknow: undefined,
  selecttype: undefined,
  ifpigeonhold: undefined,
  pigeonholeNum: undefined,
  pigeonholeSeq: undefined,
  pigeonholeResult: undefined,
  processInstanceId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SendDocApi.getSendDocPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SendDocApi.deleteSendDoc(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除发文 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await SendDocApi.deleteSendDocList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: SendDoc[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await SendDocApi.exportSendDoc(queryParams)
    download.excel(data, '发文.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>