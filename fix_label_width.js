const fs = require('fs')
const path = require('path')

function walk(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    if (isDirectory) {
      if (!dirPath.includes('.git') && !dirPath.includes('node_modules')) {
        walk(dirPath, callback)
      }
    } else if (dirPath.endsWith('.vue') || dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      callback(path.join(dirPath))
    }
  })
}

let count = 0
walk('src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8')
  // 进行批量的硬编码替换，将原来的 68px/70px 定死距离全部释放为自适应 (auto)
  let newContent = content
    .replace(/label-width="68px"/g, 'label-width="auto"')
    .replace(/label-width="70px"/g, 'label-width="auto"')
    .replace(/labelWidth:\s*68\b/g, 'labelWidth: "auto"')
    .replace(/labelWidth:\s*70\b/g, 'labelWidth: "auto"')

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8')
    count++
  }
})

console.log(`Successly updated ${count} files.`)
