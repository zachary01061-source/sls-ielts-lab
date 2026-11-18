# 本地离线练习

在项目根目录建立 `media-backup/`，将 GitHub Release 中四个原题库 MP3 压缩包和全部剑桥媒体压缩包解压到该目录。解压后可看到 `media-backup/media/listening/*.mp3`、`media-backup/cambridge/audio/*.mp3` 和 `media-backup/cambridge/images/`。本版本需要约 3.2 GB 的额外空间来生成独立站点。

```bash
python3 scripts/prepare-offline.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory offline-site
```

打开 <http://127.0.0.1:8000/>。运行需要 Python 3，仅使用标准库。准备程序按仓库清单核对 581 条原听力音频、256 条剑桥听力音频和 81 张剑桥题图的大小及 SHA-256。程序只在新目录中复制公开前端和媒体，修正进阶练习和普通听力的音频地址。可以使用 `--media-dir` 指定解压位置，使用 `--output` 指定新的输出目录。请从生成目录的根路径提供 HTTP 服务。

阅读、原题库听力、剑桥阅读与听力可在本机练习，浏览器本地保存的记录随浏览器和访问地址保留。需要服务端的功能仍须运行完整应用，包括账号同步、教材全文、语料库接口、教师反馈和云端批改。外部发布方的参考链接及配套资源仍需联网。
