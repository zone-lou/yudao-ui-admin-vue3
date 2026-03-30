const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /下一审批节点/g, replace: '下一办理节点' },
  { search: /审批流程预览/g, replace: '办理流程预览' },
  { search: /审批意见：\{\{\s*task.reason\s*\}\}/g, replace: '办理意见：{{ task.reason }}' },
  { search: /请选择审批人/g, replace: '请选择办理人' },
  { search: /审批人不能为空/g, replace: '办理人不能为空' },
  { search: /审批人：/g, replace: '办理人：' },
  { search: /审批人</g, replace: '办理人<' },
  { search: /的审批人/g, replace: '的办理人' },
  { search: /\]的审批人/g, replace: ']的办理人' },
  { search: /指定审批人/g, replace: '指定办理人' },
  { search: /自定义审批人/g, replace: '自定义办理人' },
  { search: /节点审批人/g, replace: '节点办理人' },
  { search: /审批意见：/g, replace: '办理意见：' },
  { search: /审批意见</g, replace: '办理意见<' },
  { search: /审批意见不能为空/g, replace: '办理意见不能为空' },
  { search: /填写审批意见/g, replace: '填写办理意见' },
  { search: /请输入审批意见/g, replace: '请输入办理意见' },
  { search: /当前正在填写的审批意见/g, replace: '当前正在填写的办理意见' },
  { search: /分类处理审批节点意见/g, replace: '分类处理办理节点意见' },
  { search: /厅\/局长审批意见/g, replace: '厅/局长办理意见' },
  { search: /销假审批意见/g, replace: '销假办理意见' },
  { search: /审批意见附件/g, replace: '办理意见附件' },
  { search: /提交审批/g, replace: '提交办理' },
  { search: /打开审批弹窗/g, replace: '打开办理弹窗' },
  { search: /审批状态/g, replace: '办理状态' },
  { search: /审批状态图标/g, replace: '办理状态图标' },
  { search: /审批建议/g, replace: '办理建议' },
  { search: /当前审批任务/g, replace: '当前办理任务' },
  { search: /审批参与人/g, replace: '办理参与人' },
  { search: /选择审批参与人/g, replace: '选择办理参与人' },
  { search: /待审批/g, replace: '待办理' },
  { search: /审批中/g, replace: '办理中' },
  { search: /审批通过中/g, replace: '办理通过中' },
  { search: /审批不通过/g, replace: '办理不通过' },
  { search: /单人审批/g, replace: '单人办理' },
  { search: /多人审批/g, replace: '多人办理' },
  { search: /无需审批/g, replace: '无需办理' },
  { search: /暂无需要选择的审批节点/g, replace: '暂无需要选择的办理节点' },
  { search: /自动分配或无需审批/g, replace: '自动分配或无需办理' },
  { search: /发文审批内容/g, replace: '发文办理内容' },
  { search: /销假审批状态/g, replace: '销假办理状态' },
  { search: /审批单/g, replace: '办理单' },
  { search: /审批表/g, replace: '办理单' },
  { search: /取消发起审批/g, replace: '取消发起' },
  { search: /审批接入/g, replace: '办理接入' },
  { search: /审批人权限/g, replace: '办理人权限' },
  { search: /允许办理人撤回任务/g, replace: '允许撤回任务' },
  { search: /允许审批人撤回任务/g, replace: '允许办理人撤回任务' },
  { search: /审批中的申请/g, replace: '办理中的申请' },
  { search: /仅审批一次/g, replace: '仅办理一次' },
  { search: /重复的审批节点/g, replace: '重复的办理节点' },
  { search: /连续审批的节点/g, replace: '连续办理的节点' },
  { search: /获取审批详情/g, replace: '获取办理详情' },
  { search: /查询不到审批详情信息/g, replace: '查询不到办理详情信息' },
  { search: /审批详情，/g, replace: '办理详情，' },
  { search: /审批节点/g, replace: '办理节点' },
  { search: /label="审批人"/g, replace: 'label="办理人"' },
  { search: /label="审批意见"/g, replace: 'label="办理意见"' },
  { search: /label="审批状态"/g, replace: 'label="办理状态"' },
  { search: /const nodeTypeName = ref\('审批'\)/g, replace: 'const nodeTypeName = ref(\'办理\')' },
  { search: /\? '办理' : '审批'/g, replace: '? \'办理\' : \'办理\'' },
  { search: /审批相关：/g, replace: '办理相关：' },
  { search: />审批</g, replace: '>办理<'},
  { search: /审批记录时间线/g, replace: '办理记录时间线' },
  { search: /审批任务/g, replace: '办理任务' },
  { search: /审批与办理/g, replace: '办理' },
  { search: /审批记录/g, replace: '办理记录' }
];

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    let filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) results = walk(filepath, results);
    else if (filepath.endsWith('.vue') || filepath.endsWith('.ts')) results.push(filepath);
  });
  return results;
}

const files = walk('d:\\\\WORK\\\\GIT\\\\yudao-ui-admin-vue3\\\\src\\\\views\\\\bpm');
let changeCount = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Protect doc-title from being replaced implicitly
  const docTitles = [];
  content = content.replace(/<div class="doc-title">.*?<\/div>/g, (match) => {
    docTitles.push(match);
    return `__DOC_TITLE_${docTitles.length - 1}__`;
  });

  // Protect specific code logic `displayName === '审批通过'` 
  const passLogic = [];
  content = content.replace(/(displayName\s*===\s*['"]审批通过['"])/g, (match) => {
    passLogic.push(match);
    return `__PASS_LOGIC_${passLogic.length - 1}__`;
  });

  replacements.forEach(rep => {
    content = content.replace(rep.search, rep.replace);
  });

  // Restore doc-titles
  docTitles.forEach((dt, i) => {
    content = content.replace(`__DOC_TITLE_${i}__`, dt);
  });

  // Restore logic
  passLogic.forEach((logic, i) => {
    content = content.replace(`__PASS_LOGIC_${i}__`, logic);
  });

  // Final sweep for any straggling obvious UI texts containing "审批" that we missed
  // Only if they are standalone tags like `<el-text>审批</el-text>` or plain text in templates
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Modified:', path.basename(f));
    changeCount++;
  }
});

console.log('Total files modified:', changeCount);
