# 导出包资源映射

| 在线资料路径 | 完整ZIP中的路径 |
| --- | --- |
| 原上传`backend/public/media/listening/<id>.ogg` | `public/media/listening/<id>.ogg` |
| `/api/guest/cambridge/media/audio/<文件>` | `public/media/cambridge/audio/<文件>`，数据中引用`./media/cambridge/audio/<文件>`。 |
| `/api/guest/cambridge/media/images/<文件>` | `public/assets/cambridge/images/<文件>`，数据中引用`./assets/cambridge/images/<文件>`。 |
| 货币起源篇补录索引 | `public/data/reading-additions/index.json`。 |
| 货币起源篇正文与题目 | `public/data/reading-additions/passages/f0d6d731-6c32-42f3-a396-674b90976724.json`，包含A—F正文、Q27—40及答案说明。 |

图片使用assets路径，以通过当前前端的安全HTML过滤。原听力JSON保留与581条OGG一致的音频字段；导出时另外更新快照与资源清单中的校验信息，线上MP3题库不变。

只复制实际核实下载成功、文件大小及SHA-256正确的资源。剑桥5—20的256条听力录音均已核实，与题目逐一对应，没有缺失音频。

补录标题 `Did it really originate from bartering?` 与别名 `The controversy about the origins of money` 对应同一文章ID，不重复计数。线上通过补录索引并入阅读目录，原969个题库JSON保持原字节；本文不增加音频文件。Q29的来源键D、本库采用C的作者立场判定及差异解析均随补录JSON保留。

每个原文件的新保留路径和SHA-256见`EXPORT_PACKAGE_MANIFEST.json`。旧源文件中的媒体不会重复放入legacy_source，以免压缩包包含两份相同音频。
