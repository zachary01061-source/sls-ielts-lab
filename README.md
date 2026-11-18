# SLS IELTS：网站源码与完整资源包

网站： https://sls-reading-zac.b-cdn.net/

## 下载哪一个

| 下载内容 | 包含什么 | 用途 |
| --- | --- | --- |
| `sls-ielts-source.zip` | 网站代码、阅读／听力题目与答案、配置模板、脚本及文档 | 修改代码、重新构建网站 |
| `sls-ielts-images.zip` | 文章与题目图片 | 与源码包解压到同一目录 |
| Release 中的 `sls-ielts.zip` | 源码、全部图片、原581段OGG、新增256段MP3及原有资源 | 需要全部本地资源时下载此包 |

完整资源包约1.73GB，将作为同一仓库的Release附件提供。发布完成后，本节会补上实际下载链接。

## 从ZIP搭建

推荐先下载完整资源包，解压后进入 `sls-ielts/`。如果只下载仓库内的小包，将两个ZIP解压到同一父目录，它们会合并成同一个 `sls-ielts/` 目录；音频与教材另从完整资源包取得。

环境要求：Node.js 22.13.0或更新版本、pnpm 11.25.0。

在 `sls-ielts/` 内执行：

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

按终端显示的本地地址打开网站。构建生产版本：

```bash
pnpm run build
```

默认源码入口位于 `sls-ielts/` 根目录；`legacy_source/` 是原项目源码存档。部署到自己的云端环境时，按项目内README配置自己的数据库DB、对象存储BUCKET和媒体地址；`.openai/hosting.json`保留现有网站标识，不要用它部署覆盖不属于自己的站点。仓库中没有账号数据库、真实环境变量或密钥。

## 本次题库范围

- 剑桥雅思5—20：16册、64套，192篇阅读、256个听力部分，共5120题；不含剑21。
- 原阅读题库355篇，新增货币起源文章后共356篇。
- 货币起源文章：`Did it really originate from bartering?`；目录别名`The controversy about the origins of money`；完整A—F正文与原题27—40。
- 题型难度：简单／中／难；阅读和听力冲刺筛选；当季口语标签。
- Q29保留来源D与本库按作者立场校对为C的差异说明，详见题目解析。

文件SHA-256见 `CHECKSUMS.sha256`。
