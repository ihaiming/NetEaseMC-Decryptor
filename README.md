# Minecraft 网易版存档解密工具

[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
![Stars](https://img.shields.io/github/stars/ihaiming/NetEaseMC-Decryptor)

## 项目简介

这是一个完全运行在浏览器的网易版我的世界（Minecraft）存档解密工具，无需安装任何软件，无需上传存档到服务器，所有操作均在本地完成并且完全开源

### **近期更新**

- 请参阅 [CHANGELOG](CHANGELOG.md) 文件

## 用户协议与隐私政策

为明确使用者权利义务并规避法律风险，本项目附带以下两份文件：

- **[用户协议](terms.md)**：规定使用本工具的条件、禁止行为、免责声明、责任限制等。
- **[隐私政策](privacy.md)**：说明本工具如何收集、处理和保护信息，核心原则是**所有操作均在浏览器本地完成，存档文件不会上传至任何服务器**。

**使用、修改或分发本工具即表示您已阅读并同意上述两份文件的内容。** 若您未满 18 周岁，请在监护人陪同下阅读。

若涉及修改或分发，请一并遵守 GPL-3.0 许可证。

## 🚀 快速开始

### 在线使用

1. 直接访问部署页面：[https://mc.hm0.top/](https://mc.hm0.top/)

2. Visit the deployment page directly (Please be advised that this English page has been machine-translated using DeepSeek. The project provider assumes no liability for any errors or ambiguities arising from the machine translation.):
[https://en.mc.hm0.top/](https://en.mc.hm0.top/) (English version)

### 本地运行

1. 克隆仓库：
```

git clone https://github.com/ihaiming/NetEaseMC-Decryptor.git

```

2. 直接打开 `index.html`（中文）或 `index_EN.html`（English）即可使用。

## 使用方法

### 方法一：ZIP文件解密（推荐）

1. 将整个网易版MC存档文件夹直接压缩为ZIP文件
2. 拖拽ZIP文件到上传区域，或点击"选择ZIP文件"按钮
3. 点击"开始解密"按钮
4. 下载解密后的完整存档包，可直接使用

### 方法二：文件夹解密（实验性）

1. 确保使用Chrome/Edge 86+等现代浏览器
2. 点击"选择文件夹"按钮
3. 选择包含CURRENT和MANIFEST文件的存档文件夹
4. 点击"开始解密"按钮
5. **注意**：此方式会直接覆盖原文件，请务必先备份！

## 注意事项

- 使用文件夹解密功能会直接覆盖原文件，请务必备份存档，特别是db目录
- 解密过程完全在浏览器本地进行，文件不会上传到任何服务器
- 如果解密失败，请检查存档是否为有效的网易版加密存档
- 建议使用最新版本的Chrome、Edge或Firefox浏览器

### 浏览器兼容性

| 浏览器 | ZIP文件解密 | 文件夹解密 |
|--------|-------------|------------|
| Chrome | 完全支持 | 完全支持 |
| Edge   | 完全支持 | 完全支持 |
| Firefox| 完全支持 | 部分支持 |
| Safari | 完全支持 | 部分支持 |
| 其他浏览器 | 基本支持 | 不支持 |

> 其他浏览器指在安卓上直接 **调用系统内核** 的浏览器，例如“Via”、“Xbext X浏览器”，也就是一切小于150MB的浏览器，即使您将 **Android System WebView** 更新至150.0.0.0以上也无法实现 **文件夹解密** 。

## **💡 说明**：除了本项目外，社区还存在其他优秀的实现，为使用者提供了多样化的选择。您可以根据自己的使用场景和技术偏好，选择最合适自己的工具：

### 我应该选择哪个项目？

| 对比维度 | [网页前端版（本项目）](https://github.com/ihaiming/NetEaseMC-Decryptor) | [C 语言工具](https://github.com/Carbonateds/MCWorld-Converter) | [Java 版工具](https://github.com/Jerbvsjhs/NeteaseMcDencrypter) | [NodeJS 版工具](https://github.com/HTMonkeyG/XOR-MC-Archive-Decrypt) |
| :--- | :--- | :--- | :--- | :--- |
| **适合人群** | 所有用户，尤其临时使用、注重隐私或非 Windows 用户 | 熟悉命令行、追求极简执行的 Windows 用户 | 需要批量处理或希望集成到其他程序的开发者/高级用户 | 习惯 Node.js 环境、喜欢脚本化或轻量集成的开发者 |
| **核心优势** | 零安装、零部署，浏览器打开即用；文件在本地处理，不上传 | 单文件可执行，无运行时依赖，原生性能 | 功能完整，提供编程接口，适合自动化调用 | 基于 Node.js，易安装、跨平台；可作为模块嵌入 JS/TS 项目 |
| **平台要求** | 任何现代浏览器（Windows、macOS、Linux、Android、iOS、ChromeOS 等） | Windows（或可在 Linux/macOS 编译） | 需要 Java 运行环境 | 需要 Node.js 环境 |
| **推荐场景** | 临时、一次性解密；在受限电脑上使用或者不想安装软件以及跨平台使用 | 在 Windows 上快速解密单个存档；偏好原生程序的速度与独立性 | 批量解密大量存档；集成到服务器、插件或其他 Java 程序 | 使用用脚本快速处理，在已有 NodeJS 环境中调用；作为 JS/TS 项目依赖 |

**快速选择推荐**：
- 追求**便捷、安全、零依赖** → 选 **网页前端版（本项目）**。
- 在 **Windows** 上喜欢**轻量命令行工具** → 选 **C 语言工具**。
- 需要**批量处理或二次开发** → 选 **Java 版工具**。
- 习惯 **Node.js 生态**、希望脚本/模块化集成 → 选 **NodeJS 版工具**。

---

### 分支版本说明

本项目是基于 [AS5L 的原项目](https://github.com/AS5L/AS5L.github.io) 核心算法进行二次开发的**独立分支版本**。在原项目提供的基础解密功能之上，本分支重点进行了**全面化的重构**，增强了**安全性、使用者体验、错误处理和多语言支持**，并作为独立分支持续维护。

### 🔁 与原版功能对比

下表列出本分支版本与 [AS5L 原版](https://github.com/AS5L/AS5L.github.io) 的主要差异：

| 功能项 | 原版 | 本优化版 |
|--------|------|----------|
| **存档上传方式** | 必须手动将`db`目录单独提取出来压缩 | ✅ 直接上传整个存档ZIP，自动定位并解密 |
| **文件夹解密协议提示** | 无提示，HTTP 下直接无法使用 | ✅ 自动检测协议，HTTP 下明确提示需切换至 HTTPS |
| **安全操作提示** | 无明确风险提示 | ✅ 包含文件覆盖警告和备份建议 |
| **进度显示** | 进度条动画 | ✅ 进度条 + 百分比数字 + 状态文字 |
| **错误处理** | 单个错误可能导致处理中断 | ✅ 单个文件错误不影响整体流程 |
| **界面结构** | 基础卡片布局 | ✅ 包含页脚、关于弹窗、响应式优化 |
| **多语言支持** | 仅中文 | ✅ 中文 + 英文版本 |
| **SEO与元信息** | 无 | ✅ 添加了 keywords、description、爬虫控制等 |
| **浏览器兼容提示** | 仅隐藏不支持的功能按钮 | ✅ 显示明确的 API 不支持提示 |
| **云端版本检测** | 无 | ✅ 自动检测新版本，可永久忽略指定版本，更新后再次提醒 |
| **文件夹上传检测** | 仅依赖 API 存在检测，部分浏览器误判 | ✅ 丰富的检测手段（UA 预判 + 首次点击超时），自动识别伪支持并隐藏按钮 |

> **关于存档上传方式的特别说明**：原版及其他多数解密工具要求使用者手动找到存档内的`db`目录，单独将其提取并压缩后才能解密。这对普通的玩家或不太熟悉文件结构的使用者来说，操作门槛较高。本工具支持直接上传整个存档的ZIP压缩包，自动在压缩包中定位`db`目录并完成解密，最终生成一个结构完整、可直接使用的存档包，无需任何手动拆解操作。

> **关于文件夹解密与 HTTPS 的特别说明**：文件夹解密功能依赖浏览器 File System Access API，该 API 要求页面必须通过 HTTPS 访问（本地文件除外）。原版工具未对此进行检测，若部署在 HTTP 环境下，使用者点击“选择文件夹”后可能直接失败，且无任何提示，容易误以为是浏览器不兼容。本项目会自动检测当前协议，若在不满足 HTTPS 的环境下打开，会在界面中给出明确的“请切换至 HTTPS”指引，避免不必要的困惑。

---

## 功能特性

- **完全本地解密** - 所有解密操作都在浏览器中完成，文件不会上传到任何服务器
- **双模式支持** - 支持ZIP文件上传和文件夹直接解密两种方式
- **直接上传整个存档** - 无需手动提取`db`目录，上传整个存档ZIP即可自动识别并解密
- **一键解密** - 简单易用的界面，拖拽上传，一键完成解密
- **响应式设计** - 完美适配桌面和移动设备，针对大屏幕进行了字体和留白优化

## 支持的解密类型

- 网易版Minecraft加密存档（ZIP格式）
- 包含CURRENT和MANIFEST文件的存档文件夹
- 实测支持`3.3.35.270123`及以下网易版我的世界加密算法

## 技术栈

- **前端框架**: 原生HTML5/CSS3/JavaScript
- **文件处理**: JSZip 3.10.1
- **加密算法**: XOR异或解密
- **UI设计**: Material Design 3
- **字体**: Google Fonts - Roboto

## 工作原理

1. **读取存档**：解析ZIP文件或文件夹结构
2. **定位加密文件**：自动识别存档结构，在压缩包中定位`CURRENT`和`MANIFEST`文件所在目录
3. **识别加密**：检查CURRENT文件的特定加密头(0x80, 0x1D, 0x30, 0x01)
4. **生成密钥**：结合MANIFEST文件名生成解密密钥
5. **文件解密**：使用异或算法逐文件解密
6. **完整打包**：将解密后的文件与原压缩包中的其他文件重新打包，输出可直接使用的完整存档

## 项目结构

```

NetEaseMC-Decryptor/
├── CHANGELOG.md              # 更新日志
├── LICENSE                   # GPL-3.0许可证
├── index.html                # 中文版主页面
├── index_EN.html             # 英文版主页面
├── terms.md                  # 用户协议
├── privacy.md                # 隐私政策
└── README.md                 # 说明文档

```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

本项目基于 **GNU 通用公共许可证第三版（GNU General Public License v3.0，简称 GPL-3.0）** 开源。

> 注意：本工具按“原样”提供，不附带任何明示或默示担保。使用本工具产生的任何风险由使用者自行承担。完整的许可证条款请参阅 [LICENSE](LICENSE) 文件。

## 致谢

- 感谢 JSZip 库提供的优秀文件处理能力
- 感谢所有参与测试和反馈的使用者
- 感谢开源社区的支持和贡献
- 特别感谢 *AS5L* 提供的核心解密算法

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 更多方式：[https://hm0.top/start-page.html](https://hm0.top/start-page.html)

---

## ⭐ 支持项目

如果这个项目对你有帮助，请给它一个 **Star**！这是对我们最大的鼓励！
