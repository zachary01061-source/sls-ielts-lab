# SLS 学习平台 · 雅思机考与练习

本仓库保存 SLS 学习平台第 12 版，包含阅读、听力、口语、写作、当季口语题库和剑桥 5–20，以及账号、练习记录、教材和批改服务的前后端源码。项目来自 [学校站点](https://sls-school-learning.nicecream33.chatgpt.site)，对应 Sites 提交 `d24971292f4225a94e5b241754300ebdfede7678`。获邀成员登录 GitHub 后可以克隆本仓库，也可以选择 **Code → Download ZIP**。

## 在自己的电脑运行

安装 Node.js 22.13 或更高版本和 pnpm 11.25.0。打开项目根目录，在终端依次执行以下命令。数据库初始化命令用于首次启动。

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm exec wrangler d1 execute DB --config dist/server/wrangler.json --local --persist-to .wrangler/state --file drizzle/0000_heavy_pet_avengers.sql
pnpm run start
```

打开终端打印的本地网址进入练习。开发时可用 `pnpm run dev`。本地账号、数据库与对象存储由 Wrangler 独立维护。部署到自己的云端需要创建 D1 数据库与 R2 存储桶，分别绑定为 `DB`、`BUCKET`，并执行同一份数据库迁移。教材管理员导入见 [教材导入说明](server/TEXTBOOK-IMPORT.md)。

## 源码和大文件

| 位置 | 内容 |
| --- | --- |
| `public/` | 当前前端、题图、阅读与听力题库、练习数据和两个题库下载包 |
| `app/`、`worker/`、`server/` | 站点、服务路由、账号、教材、语料与批改功能 |
| `drizzle/`、`db/`、`scripts/`、`tests/` | 数据库结构、迁移、构建和验证脚本 |
| [第 12 版 Release](https://github.com/zachary01061-source/sls-ielts-lab/releases/tag/sites-v12) | 音频、剑桥媒体、原始源码快照及旧项目资料 |
| `server/materials/textbooks/` | 私有教材清单及与清单哈希相符的教材原件 |

联网模式使用学校的原题库音频 CDN、剑桥媒体来源和语料库出版方提供的 175 个外部资源入口。581 段原题录音和 337 个剑桥媒体文件可从 Release 获取。源代码内的清单记录了对应文件的字节数和 SHA-256。学校生产数据库、老师及学生账号、作业、录音提交和线上密钥由原部署单独保管。题库、教材与媒体保留原有来源和使用范围。

开发者可运行 `node --test tests/*.test.mjs server/*.test.mjs` 验证项目。历史交接说明见 [原站 README](docs/SITES_V12_README.md)，其中描述的原上传包与线上源码快照是两种交付物。
