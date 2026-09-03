# BPM 操作说明配置

`BpmOperationGuide` 从“基础设施 → 参数配置”读取操作说明。参数必须设为可见；没有有效图片时，页面不会显示操作说明按钮。

## 参数键

- `bpm.operation.guide.list.unified`：查询办件
- `bpm.operation.guide.list.todo`：待办办件
- `bpm.operation.guide.list.done`：已办办件
- `bpm.operation.guide.process.{流程定义Key}.create`：指定流程新建
- `bpm.operation.guide.process.{流程定义Key}.handle`：指定流程办理
- `bpm.operation.guide.process.{流程定义Key}.task.{任务定义Key}`：指定流程节点办理
- `bpm.operation.guide.process.default.create`：所有流程新建的兜底说明
- `bpm.operation.guide.process.default.handle`：所有流程办理的兜底说明

办理页面按“具体节点 → 具体流程 → 通用办理”顺序查找，使用第一个有效配置。

## 参数值

简单多图可以直接配置 URL 数组：

```json
["https://file.example.com/guide/01.png", "https://file.example.com/guide/02.png"]
```

需要标题和文字说明时使用完整格式：

```json
{
  "title": "收文登记操作说明",
  "description": "请按照下列步骤完成登记和发送。",
  "images": [
    {
      "url": "https://file.example.com/guide/receive-01.png",
      "title": "填写收文信息",
      "description": "确认来文标题、文号和来文单位。"
    },
    {
      "url": "https://file.example.com/guide/receive-02.png",
      "title": "选择办理人员"
    }
  ]
}
```

图片使用现有文件管理上传后的访问地址。`infra_config.value` 长度有限，单个配置建议控制在 3～5 张图片；内容较多时优先缩短说明文字或拆分到具体节点。
