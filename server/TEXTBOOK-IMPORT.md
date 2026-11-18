# 教材导入

Worker 内只保留教材目录和已审核的 526 项批改任务，其中 500 项来自教材。四本原书的全文 JSON 与 PDF 均放在私有 R2，通过登录后的 `/api/textbooks/*` 接口读取，不能复制到 `public/`。

运行时需要 `BUCKET` R2 绑定。管理员导入接口：

- `GET /api/admin/textbooks/import`：每份文件的实际导入状态。
- `PUT /api/admin/textbooks/import/:bookId/json`：原始 JSON 字节。
- `PUT /api/admin/textbooks/import/:bookId/pdf`：原始 PDF 字节。

主 API 先检查登录、账号状态、管理员角色和 CSRF。教材处理器再次检查账号、角色和请求来源；文件大小与 SHA-256 必须匹配随部署打包的清单。文件采用内容哈希作为 R2 对象名，重复导入相同文件不会覆盖其他内容。仅当 JSON 和 PDF 都通过校验时，学生目录才显示已导入。

部署后，由学校管理员登录，取得该会话的 cookie 和 csrfToken，存入仅本人可读（0600）的临时 JSON 文件：`{"cookie":"...","csrfToken":"..."}`。不要提交该文件或输出其内容。

```bash
node scripts/import-textbooks.mjs \
  --origin 'https://实际部署地址' \
  --directory '/原项目/server/materials/textbooks' \
  --session-file '/受保护的临时目录/admin-session.json'
```

脚本会先在本地核对所有 8 个文件，再逐个上传并读取云端状态。也可通过 `SLS_IMPORT_COOKIE` 和 `SLS_IMPORT_CSRF` 环境变量传入已有管理员会话。不要将密码或会话作为命令行参数。

更新教材需先在原项目完成内容核对，再运行构建工具重新生成清单与审核任务：

```bash
node scripts/build-textbook-manifest.mjs /原项目目录
```

此工具仅用于本地构建，不会部署或导入云端。它保留最新题目、分层练习、教材来源页码及 IELTS 评分元数据。更换清单后需要重新导入哈希变化的文件。
