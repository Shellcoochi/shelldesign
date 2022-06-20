const path = require("path");
const fs = require("fs");

function copyDirectory(src, dest) {
  if (fs.existsSync(dest) == false) {
    fs.mkdirSync(dest);
  }
  if (fs.existsSync(src) == false) {
    return false;
  }
  // 拷贝新的内容进去
  const dirs = fs.readdirSync(src);
  dirs.forEach(function(item) {
    const item_path = path.join(src, item);
    const temp = fs.statSync(item_path);
    if (temp.isFile()) {
      // 是文件
      const includesFile = [".ts", ".tsx"];
      const extname = path.extname(item);
      if (!includesFile.includes(extname)) {
        fs.copyFileSync(item_path, path.join(dest, item));
      }
    } else if (temp.isDirectory()) {
      // 是目录
      copyDirectory(item_path, path.join(dest, item));
    }
  });
}

module.exports = { copyDirectory };
