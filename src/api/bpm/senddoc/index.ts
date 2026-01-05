import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 发文信息 */
export interface SendDoc {
          id: number; // 发文表主键
          sendDocDraft: byte[]; // 发文草稿内容
          sendDocResult: byte[]; // 发文结果内容
          docProperty: string; // 公文性质
          primarySendDept: string; // 主送机关
          copySendDept: string; // 抄送机关
          reportSendDept: string; // 抄报机关
          deliverSendDept: string; // 抄送机关
          sendDocNumber: string; // 发文号
          sendTime: string | Dayjs; // 发文日期
          signPrintCount: string; // 签印份数
          keepTerm: string; // 保管期限
          projectId: string; // 项目内码
          subject: string; // 主题
          urgencyDegree: string; // 紧急程度
          secretDegree: string; // 机密程度
          remark: string; // 备注
          docSequence: number; // 文号
          year: string; // 年份
          keyWords: string; // 主题词
          sendDept: string; // 发文单位
          draftPerson: string; // 拟稿人
          draftDate: string | Dayjs; // 拟稿时间
          draftIdea: string; // 事业单位拟稿人意见
          contactPhone: string; // 拟稿人联系电话
          resultFileName: string; // 最终公文名称
          docSecondClass: number; // 二级分类
          docClass: number; // 一级分类
          dealTimelimit: string | Dayjs; // 办件时限
          releasetoout: number; // 是否发布到外网
          releasetospecial: number; // 是否发布到专网
          releasetoin: number; // 是否发布到内网
          updatereleaseman: string; // 最近修改发布人
          updatereleasedate: string | Dayjs; // 最近修改发布时间
          releasetoother: string; // 内部传阅
          receiveDocId: number; // 收文内码(收文转发文时用)
          checkoutUserId: number; // 正文稿子签出人
          checkoutTime: string | Dayjs; // 签出时间
          secretaryidea: string; // 办公室秘书意见
          secretaryideaPerson: string; // 办公室秘书
          secretaryideaDate: string | Dayjs; // 办公室秘书意见日期
          directoridea: string; // 办公室主任意见
          directorideaPerson: string; // 办公室主任
          directorideaDate: string | Dayjs; // 办公室主任意见日期
          couldquery: number; // 能否查询
          vdformpage: string; // 表单页面
          defaultAccess: number; // 能否访问
          printbarcode: number; // 打印条形码
          inforelease: string; // 信息公开
          noreleasecause: string; // 不予公开理由
          attachFilePath: string; // 附件路径
          filetag: string; // 判断正文草稿，审批搞，套红正文是否存在
          draftDept: string; // 拟稿单位
          responsibleDept: string; // 主办部门
          isexported: number; // 是否导出
          iscanexport: number; // 是否可以导出
          customnumber: string; // 自定义编号
          draftPersonUserid: number; // 拟稿人用户ID
          ishavetif: number; // 是否需要TIF文件
          exPrimarySendDept: string; // 公文交换主送机关
          exCopySendDept: string; // 公文交换抄送机关
          ispolicynorm: string; // 是否行政规范性文件
          fzjgyjTz: string; // 法制机构意见
          fzjgyjTzPerson: string; // 法制机构意见用户
          fzjgyjTzDate: string | Dayjs; // 法制机构意见日期
          customnumber2: string; // 法制编号2
          customnumber3: string; // 法制编号3
          hqdept: string; // 会签部门
          hqname: string; // 会签人员姓名
          hqidea: string; // 会签意见
          hqdate: string | Dayjs; // 会签时间
          issuedName: string; // 签发人
          proofreader: string; // 校对
          proofreaderDate: string | Dayjs; // 校对日期
          yinzhiren: string; // 印制
          yongyinren: string; // 用印
          fenfaren: string; // 分发
          docType: number; // 文件类型 1党务 2政务
          sendDocNotion: byte[]; // 发文审批内容
          docRange: string; // 公文范围
          isunion: string; // 是否是联合发文
          uniondepts: string; // 联合发文单位
          uniondeptscomments: string; // 联合发文单位意见
          forceexchangepdf: number; // 是否强制交换pdf正文
          isuploadwordformal: number; // 是否上传了word套红正文
          typist: string; // 打字员
          typistDate: string | Dayjs; // 打印日期
          thwordupdate: string | Dayjs; // word套红正文上传时间
          fugleidea: string; // 厅/局长审批意见
          fuglename: string; // 厅/局意见人
          fugledate: string | Dayjs; // 厅/局意见时间
          organize: string; // 发文组织
          sendUnitid: number; // 发文单位
          sendStatus: number; // 发送状态 0为拟发 1为已发 2为退回
          acceptNumber: string; // 受理文号
          acceptStarttime: string | Dayjs; // 受理申请时间
          acceptEndtime: string | Dayjs; // 受理到期时间
          acceptDelaytime: string | Dayjs; // 受理延期后到期时间
          isNormativeDocument: number; // 是否属于规范性文件,是1，否2
          ifimportant: number; // 是否重要
          secretaryimplementidea: string; // 办公室秘书落实意见
          secretaryimplementideaPerson: string; // 办公室秘书
          secretaryimplementideaDate: string | Dayjs; // 办公室秘书落实意见日期
          miniknow: number; // 最小知悉范围
          selecttype: string; // 省厅便函选择类型结果
          ifpigeonhold: number; // 是否已归档,1已归档，否则未归档
          pigeonholeNum: string; // 归档号
          pigeonholeSeq: number; // 归档序号
          pigeonholeResult: string; // 归档结果
          processInstanceId: string; // 流程实例的编号
  }

// 发文 API
export const SendDocApi = {
  // 查询发文分页
  getSendDocPage: async (params: any) => {
    return await request.get({ url: `/bpm/send-doc/page`, params })
  },

  // 查询发文详情
  getSendDoc: async (id: number) => {
    return await request.get({ url: `/bpm/send-doc/get?id=` + id })
  },

  // 新增发文
  createSendDoc: async (data: SendDoc) => {
    return await request.post({ url: `/bpm/send-doc/create`, data })
  },

  // 修改发文
  updateSendDoc: async (data: SendDoc) => {
    return await request.put({ url: `/bpm/send-doc/update`, data })
  },

  // 删除发文
  deleteSendDoc: async (id: number) => {
    return await request.delete({ url: `/bpm/send-doc/delete?id=` + id })
  },

  /** 批量删除发文 */
  deleteSendDocList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/send-doc/delete-list?ids=${ids.join(',')}` })
  },

  // 导出发文 Excel
  exportSendDoc: async (params) => {
    return await request.download({ url: `/bpm/send-doc/export-excel`, params })
  }
}