# 🧠 Simple Memory MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/yourusername/simple-memory-mcp)

一个专为AI助手设计的记忆管理系统，实现了完整的 Model Context Protocol (MCP) 服务器，帮助AI助手存储、检索和管理用户的重要信息�?
## �?功能特�?
### 🎯 核心功能
- **🔒 安全存储**: AI助手必须先要求用户提供标题，然后输入内容
- **📋 智能检�?*: 先展示标题列表，用户选择后获取完整内�?- **✏️ 灵活管理**: 支持记忆的编辑、删除和搜索
- **🌐 Web界面**: 提供直观的可视化管理界面
- **🔍 全文搜索**: 支持标题和内容的关键词搜�?
### 🛠�?MCP工具
- `store_memory`: 存储新记忆（参数：title, content�?- `list_memory_titles`: 获取所有记忆标题列�?- `get_memory_by_title`: 根据标题获取记忆内容（参数：title�?- `delete_memory`: 删除指定记忆（参数：title�?
### 💡 使用场景
- **📚 学习笔记**: 存储和管理学习资�?- **📝 会议记录**: 保存重要会议内容
- **📖 文章收藏**: 收藏有价值的文章和资�?- **💭 想法记录**: 记录灵感和创意想�?
## 🚀 快速开�?
### 📋 系统要求
- **Node.js**: 16.0.0 或更高版�?- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)
- **内存**: 512MB RAM
- **存储**: 100MB 可用空间

### 📦 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/simple-memory-mcp.git
cd simple-memory-mcp
```

2. **安装依赖**
```bash
npm install
```

3. **初始化数据库**
```bash
npm run init-db
```

4. **启动服务**
```bash
# 启动MCP服务�?npm start

# 启动Web管理界面（新终端窗口�?npm run web
```

5. **访问Web界面**
打开浏览器访问：`http://localhost:5566`

## 🤖 AI助手配置

### 配置Cursor IDE

1. **打开Cursor设置**
   - �?`Ctrl/Cmd + ,` 打开设置
   - 搜索 "MCP" �?"Model Context Protocol"

2. **添加MCP服务器配�?*
   在Cursor的MCP配置中添加：
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "node",
         "args": ["src/server.js"],
         "cwd": "g:\\docker\\McpApi\\simple-memory-mcp"
       }
     }
   }
   ```

3. **重启Cursor**
   配置完成后重启Cursor以加载MCP服务�?
### 配置Claude Desktop

1. **找到配置文件**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **编辑配置文件**
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "node",
         "args": ["src/server.js"],
         "cwd": "/path/to/simple-memory-mcp"
       }
     }
   }
   ```

3. **重启Claude Desktop**

### 配置其他AI工具

对于支持MCP协议的其他AI工具，通常需要：

1. **找到MCP配置文件或设置页�?*
2. **添加服务器配�?*�?   - 命令：`node src/server.js`
   - 工作目录：项目根目录的完整路�?3. **重启AI工具**

### 验证配置

配置完成后，您可以对AI助手说：
```
请帮我存储一个记�?```

如果配置成功，AI助手会要求您提供标题和内容�?## 📖 使用指南

### 🤖 通过AI助手使用

#### 存储记忆
```
用户: 帮我存储一个记�?AI: 请提供这个记忆的标题�?用户: 学习笔记 - MCP协议
AI: 请输入记忆的具体内容�?用户: [输入详细内容]
AI: 记忆已成功存储！
```

#### 检索记�?```
用户: 帮我查看之前存储的内�?AI: 您有以下记忆�?    1. 学习笔记 - MCP协议 (今天)
    2. 会议记录 - 项目讨论 (昨天)
    请选择要查看的记忆�?用户: 学习笔记 - MCP协议
AI: [返回完整内容]
```

### 🌐 通过Web界面使用

1. **查看记忆**: 在主页面浏览所有记忆卡�?2. **添加记忆**: 点击"�?添加记忆"按钮
3. **编辑记忆**: 点击记忆卡片上的"✏️ 编辑"按钮
4. **删除记忆**: 点击"🗑�?删除"按钮并确�?5. **搜索记忆**: 使用顶部搜索框查找特定内�?
## 🏗�?项目结构

```
simple-memory-mcp/
├── 📁 src/                    # 源代码目�?�?  ├── 🔧 server.js          # MCP服务器主文件
�?  ├── 🗄�?database.js        # 数据库操作层
�?  ├── 🛠�?tools.js           # MCP工具定义
�?  └── 📁 web/               # Web界面
�?      ├── 🌐 app.js         # Express服务�?�?      ├── 📁 public/        # 静态资源文�?�?      �?  ├── 🎨 styles.css # 样式文件
�?      �?  └── �?script.js  # 前端脚本
�?      └── 📁 views/         # HTML模板
�?          └── 📄 index.html # 主页�?├── 📁 data/                  # 数据库文件目�?├── 📁 docs/                  # 项目文档
�?  ├── 📚 API.md            # API文档
�?  ├── 📖 USER_GUIDE.md     # 使用指南
�?  ├── 🚀 DEPLOYMENT.md     # 部署指南
�?  └── 🔧 DEVELOPMENT.md    # 开发文�?├── 📁 scripts/              # 工具脚本
�?  └── 🔨 init-database.js  # 数据库初始化脚本
├── 📄 package.json          # 项目配置文件
├── 📄 README.md             # 项目说明文档
└── 📄 LICENSE               # 开源许可证
```

## 🔧 技术栈

- **🔙 后端**: Node.js + Express.js
- **🗄�?数据�?*: SQLite3
- **🎨 前端**: 原生 HTML/CSS/JavaScript
- **📡 协议**: Model Context Protocol (MCP)
- **🔗 通信**: JSON-RPC 2.0, REST API

## 📚 文档

- [📖 使用指南](docs/USER_GUIDE.md) - 详细的使用说�?- [📚 API文档](docs/API.md) - MCP工具和REST API文档
- [🚀 部署指南](docs/DEPLOYMENT.md) - 生产环境部署说明
- [🔧 开发文档](docs/DEVELOPMENT.md) - 开发者指南和架构说明

## 🧪 测试

```bash
# 运行所有测�?npm test

# 运行特定测试
npm test -- --grep "数据�?

# 生成测试覆盖率报�?npm run test:coverage
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](docs/DEVELOPMENT.md#贡献指南) 了解详细信息�?
### 🐛 报告问题
如果您发现了bug或有功能建议，请 [创建Issue](https://github.com/yourusername/simple-memory-mcp/issues)�?
### 💻 提交代码
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可�?
本项目采�?MIT 许可�?- 查看 [LICENSE](LICENSE) 文件了解详细信息�?
## 🙏 致谢

- 感谢 [Model Context Protocol](https://modelcontextprotocol.io/) 提供的协议标�?- 感谢所有贡献者的支持和帮�?
## 📞 支持

如果您需要帮助或有任何问题：

- 📧 邮箱：support@example.com
- 💬 讨论：[GitHub Discussions](https://github.com/yourusername/simple-memory-mcp/discussions)
- 🐛 问题：[GitHub Issues](https://github.com/yourusername/simple-memory-mcp/issues)

---

�?如果这个项目对您有帮助，请给我们一个星标！
