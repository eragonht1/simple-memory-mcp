# ![Simple Memory MCP](./src/web/favicon/16.png) Simple Memory MCP

[![npm version](https://badge.fury.io/js/simple-memory-mcp.svg)](https://badge.fury.io/js/simple-memory-mcp)
[![npm downloads](https://img.shields.io/npm/dm/simple-memory-mcp.svg)](https://www.npmjs.com/package/simple-memory-mcp)
[![GitHub issues](https://img.shields.io/github/issues/eragonht1/simple-memory-mcp.svg)](https://github.com/eragonht1/simple-memory-mcp/issues)
[![GitHub license](https://img.shields.io/github/license/eragonht1/simple-memory-mcp.svg)](https://github.com/eragonht1/simple-memory-mcp/blob/main/LICENSE)
[![Node.js version](https://img.shields.io/node/v/simple-memory-mcp.svg)](https://nodejs.org/)
[![CI](https://github.com/eragonht1/simple-memory-mcp/workflows/CI/badge.svg)](https://github.com/eragonht1/simple-memory-mcp/actions)

[English](#english) | [中文](#中文)

---

## English

### Overview

Simple Memory MCP is a memory management system designed for AI assistants, implementing the Model Context Protocol (MCP) to provide persistent memory storage and retrieval capabilities.

![Simple Memory MCP](./src/web/favicon/32.png)
![image](./image/A1.png)
### Common Usage Methods-Features

#### 1. Open Web Management Interface
Tell your AI assistant: "Open memory" or "Open memory WEB", the AI will:
- Automatically start the web server
- Open the default browser
- Display the visual management interface

#### 2. Get Memory List
Tell your AI assistant: "Get all memories" or "Show memory list", the AI will execute the `list_memory_titles` tool to retrieve all memory titles.

#### 3. Get Specific Memory Content
Tell your AI assistant: "Get 'XXX' memory content and execute", the AI will execute the `get_memory_by_title` tool to retrieve the complete content of the specified memory.

#### 4. Store New Memory
Tell your AI assistant: "Help me store a memory", the AI will:
- First ask you to provide the memory title
- Then ask you to input the memory content
- Execute the `store_memory` tool to complete storage

### Features

- **![Feature Icon](./src/web/favicon/16.png) Smart Memory Storage**: AI assistants must first ask users for memory titles, then request content
- **📋 Efficient Retrieval**: Optimized MCP tools return only essential data (title + timestamp) for better performance
- **🌐 Web Management Interface**: Intuitive visual management with full CRUD operations
- **🔍 Full-text Search**: Search through both titles and content
- **🎯 Intelligent Port Management**: Automatic port detection and conflict resolution
- **📱 Responsive Design**: Optimized for both desktop and mobile devices
- **🔒 Single Instance Design**: Automatic detection prevents multiple server instances
- **🤝 Multi-AI Support**: Multiple AI assistants can safely share the same server instance

### Quick Start

#### Clone Repository

```bash
# Clone the repository
git clone https://github.com/eragonht1/simple-memory-mcp.git

# Navigate to project directory
cd simple-memory-mcp
```

#### Prerequisites
- Node.js 16.0.0 or higher
- 512MB RAM minimum
- 100MB available storage

#### Node.js Installation Guide

**For Windows Users:**
1. Visit [Node.js official website](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Run the installer (.msi file)
4. Follow the installation wizard with default settings
5. Restart your computer after installation

**For macOS Users:**
```bash
# Option 1: Download from official website
# Visit https://nodejs.org/ and download the LTS version

# Option 2: Using Homebrew (recommended)
brew install node
```

**For Linux Users:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL/Fedora
sudo dnf install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm
```

**Verify Installation:**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```
Both commands should return version numbers (e.g., v18.17.0 for Node.js).

#### Installation

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db
```

#### Start Services

```bash
# Start MCP Server
npm start

# Start Web Interface (recommended)
node start-web.js
# or
npm run web
```

#### Access Web Interface
- Default URL: http://localhost:8011
- The system will automatically detect and allocate available ports
- Browser will open automatically with the professional launcher

### AI Assistant Configuration

#### Universal Configuration Template

Use the following configuration template for any AI assistant that supports MCP:

```json
{
  "mcpServers": {
    "simple-memory": {
      "command": "node",
      "args": ["./start-mcp.js"],
      "cwd": "/path/to/your/simple-memory-mcp"
    }
  }
}
```

**Configuration Steps:**
1. Replace `/path/to/your/simple-memory-mcp` with your actual project path
2. Add this configuration to your AI assistant's MCP settings file
3. Restart your AI assistant to load the new configuration

**Note:** The `start-mcp.js` script provides better error handling and user-friendly output compared to directly calling `src/server.js`.

#### 🔒 Single Instance Design

Simple Memory MCP uses a **single instance design** to ensure optimal resource usage and data consistency:

- **Automatic Detection**: Before starting, the system checks if an MCP server is already running
- **Smart Sharing**: Multiple AI assistants (Claude, Augment, etc.) can safely share the same server instance
- **Resource Efficiency**: Prevents duplicate server processes and database conflicts
- **Seamless Experience**: If a server is already running, new AI connections will automatically use the existing instance

**Multi-AI Workflow:**
1. **First AI starts** → Detects no server → Starts new MCP server → Connects successfully
2. **Second AI starts** → Detects existing server → Shows friendly message → Connects to existing instance
3. **Both AIs can use memory functions simultaneously** without conflicts
4. **When all AIs close** → MCP server automatically shuts down to free resources

### Usage Examples

#### Through AI Assistant
```
User: Help me store a memory
AI: Please provide the title for this memory:
User: Study Notes - MCP Protocol
AI: Please enter the memory content:
User: [Enter content]
AI: Memory "Study Notes - MCP Protocol" has been successfully stored!
```

#### **NEW! Web Interface Auto-Launch**
Simply say any of these trigger phrases to your AI assistant:
- **"打开记忆MCP"** (Open Memory MCP)
- **"打开记忆"** (Open Memory)
- **"打开记忆WEB"** (Open Memory WEB)
- **"开启记忆"** (Start Memory)

The AI will automatically:
1. 🚀 Start the web server (if not running)
2. 🌐 Open your default browser
3. 📋 Display the memory management interface
4. ✨ Provide usage tips and access URLs

#### Through Web Interface
1. Click "➕ Add Memory" to create new memories
2. Click memory cards to view details
3. Use action buttons on each memory card:
   - **Edit** (🖊️) - Modify memory content
   - **Copy** (📋) - Copy title and content to clipboard in plain text
   - **Delete** (🗑️) - Remove memory permanently
4. Use the search box to find specific content
5. Drag and drop memory cards to reorder them

### MCP Tools

- `store_memory` - Store new memory (requires title and content)
- `list_memory_titles` - Get list of all memory titles
- `get_memory_by_title` - Retrieve memory content by title
- `delete_memory` - Delete specified memory
- `open_memory_web` - **NEW!** Open memory management web interface with auto browser launch

### Documentation

For detailed documentation, see [DOCS.md](DOCS.md) which includes:
- Complete API documentation
- Deployment guide
- Development documentation
- Port management system
- User guide

### Troubleshooting

**Port conflicts:**
```bash
# Windows
netstat -ano | findstr :8011
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8011
kill -9 <PID>
```

**Database issues:**
```bash
rm data/memories.db
npm run init-db
```

**Web interface auto-launch issues:**
```bash
# If browser doesn't open automatically
# Check if the web server is running
curl http://localhost:8011

# Manually open the URL shown in AI response
# Example: http://localhost:8011

# Check browser availability (Linux)
which xdg-open firefox google-chrome

# Check browser availability (Windows)
where start

# Check browser availability (macOS)
which open
```

---

## 中文

### 概述

Simple Memory MCP 是一个专为AI助手设计的记忆管理系统，实现了模型上下文协议（MCP），为AI助手提供持久化记忆存储和检索功能。

![Simple Memory MCP](./src/web/favicon/32.png)
![image](./image/A1.png)
### 常见使用方法-功能特性

#### 1. 开启Web管理界面
对AI助手说："开启记忆"或"打开记忆WEB"，AI会：
- 自动启动Web服务器
- 打开默认浏览器
- 显示可视化管理界面

#### 2. 获取记忆列表
对AI助手说："获取所有记忆"或"显示记忆列表"，AI会执行 `list_memory_titles` 工具获取所有记忆标题。

#### 3. 获取特定记忆内容
对AI助手说："获取'XXX'记忆内容并执行"，AI会执行 `get_memory_by_title` 工具获取指定记忆的完整内容。

#### 4. 存储新记忆
对AI助手说："帮我存储一个记忆"，AI会：
- 先要求您提供记忆标题
- 再要求您输入记忆内容
- 执行 `store_memory` 工具完成存储

### 功能特性

- **![功能图标](./src/web/favicon/16.png) 智能记忆存储**: AI助手必须先要求用户提供记忆标题，再要求输入内容
- **📋 高效检索**: 优化的MCP工具只返回必要数据（标题+时间戳），提升性能
- **🌐 Web管理界面**: 直观的可视化管理界面，支持完整的增删改查操作
- **🔍 全文搜索**: 支持标题和内容的关键词搜索
- **🎯 智能端口管理**: 自动端口检测和冲突解决
- **📱 响应式设计**: 针对桌面端和移动端进行优化
- **🔒 单实例设计**: 自动检测机制防止多个服务器实例冲突
- **🤝 多AI支持**: 多个AI助手可以安全地共享同一个服务器实例

### 快速开始

#### 克隆仓库

```bash
# 克隆仓库
git clone https://github.com/eragonht1/simple-memory-mcp.git

# 进入项目目录
cd simple-memory-mcp
```

#### 系统要求
- Node.js 16.0.0 或更高版本
- 最低512MB内存
- 100MB可用存储空间

#### Node.js安装指南

**Windows用户：**
1. 访问 [Node.js官方网站](https://nodejs.org/)
2. 下载LTS（长期支持）版本
3. 运行安装程序（.msi文件）
4. 按照安装向导的默认设置进行安装
5. 安装完成后重启计算机

**macOS用户：**
```bash
# 方法1：从官网下载
# 访问 https://nodejs.org/ 下载LTS版本

# 方法2：使用Homebrew（推荐）
brew install node
```

**Linux用户：**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL/Fedora
sudo dnf install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm
```

**验证安装：**
```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version
```
两个命令都应该返回版本号（例如：Node.js显示v18.17.0）。

#### 安装步骤

```bash
# 安装依赖
npm install

# 初始化数据库
npm run init-db
```

#### 启动服务

```bash
# 启动MCP服务器
npm start

# 启动Web管理界面（推荐）
node start-web.js
# 或者
npm run web
```

#### 访问Web界面
- 默认地址: http://localhost:8011
- 系统会自动检测并分配可用端口
- 使用专业启动器时会自动打开浏览器

### AI助手配置

#### 通用配置模板

以下配置模板适用于任何支持MCP的AI助手：

```json
{
  "mcpServers": {
    "simple-memory": {
      "command": "node",
      "args": ["/path/to/your/simple-memory-mcp/start-mcp.js"],
      "cwd": "/path/to/your/simple-memory-mcp"
    }
  }
}
```


**配置步骤：**
1. 将 `/path/to/your/simple-memory-mcp` 替换为你的实际项目路径
2. 将此配置添加到你的AI助手的MCP设置文件中
3. 重启你的AI助手以加载新配置

**注意：** `start-mcp.js` 脚本相比直接调用 `src/server.js` 提供了更好的错误处理和用户友好的输出信息。

#### 🔒 单实例设计

Simple Memory MCP 采用**单实例设计**，确保最佳的资源使用和数据一致性：

- **自动检测**: 启动前系统会检查是否已有MCP服务器在运行
- **智能共享**: 多个AI助手（Claude、Augment等）可以安全地共享同一个服务器实例
- **资源高效**: 防止重复的服务器进程和数据库冲突
- **无缝体验**: 如果服务器已在运行，新的AI连接会自动使用现有实例

**多AI工作流程：**
1. **第一个AI启动** → 检测无服务器 → 启动新MCP服务器 → 成功连接
2. **第二个AI启动** → 检测到现有服务器 → 显示友好提示 → 连接到现有实例
3. **两个AI可以同时使用记忆功能** 而不会产生冲突
4. **当所有AI关闭时** → MCP服务器自动关闭以释放资源

### 使用示例

#### 通过AI助手使用
```
用户: 帮我存储一个记忆
AI: 请提供这个记忆的标题：
用户: 学习笔记 - MCP协议
AI: 请输入记忆的具体内容：
用户: [输入内容]
AI: 记忆 "学习笔记 - MCP协议" 已成功存储！
```

#### **新功能！Web界面自动启动**
只需对AI助手说出以下任一触发词：
- **"打开记忆MCP"**
- **"打开记忆"**
- **"打开记忆WEB"**
- **"开启记忆"**

AI将自动：
1. 🚀 启动Web服务器（如果未运行）
2. 🌐 打开默认浏览器
3. 📋 显示记忆管理界面
4. ✨ 提供使用提示和访问地址

#### 通过Web界面使用
1. 点击"➕ 添加记忆"创建新记忆
2. 点击记忆卡片查看详情
3. 使用每个记忆卡片上的操作按钮：
   - **编辑** (🖊️) - 修改记忆内容
   - **复制** (📋) - 将标题和内容以纯文本格式复制到剪贴板
   - **删除** (🗑️) - 永久删除记忆
4. 使用搜索框查找特定内容
5. 拖拽记忆卡片可以重新排序

### MCP工具

- `store_memory` - 存储新记忆（需要标题和内容参数）
- `list_memory_titles` - 获取所有记忆标题列表
- `get_memory_by_title` - 根据标题检索记忆内容
- `delete_memory` - 删除指定记忆
- `open_memory_web` - **新功能！** 打开记忆管理Web界面并自动启动浏览器

### 文档

详细文档请参见 [DOCS.md](DOCS.md)，包含：
- 完整API文档
- 部署指南
- 开发文档
- 端口管理系统
- 用户指南

### 故障排除

**端口冲突:**
```bash
# Windows
netstat -ano | findstr :8011
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8011
kill -9 <PID>
```

**数据库问题:**
```bash
rm data/memories.db
npm run init-db
```

**Web界面自动启动问题:**
```bash
# 如果浏览器没有自动打开
# 检查Web服务器是否运行
curl http://localhost:8011

# 手动打开AI响应中显示的URL
# 例如: http://localhost:8011

# 检查浏览器可用性 (Linux)
which xdg-open firefox google-chrome

# 检查浏览器可用性 (Windows)
where start

# 检查浏览器可用性 (macOS)
which open
```

---

## License / 许可证

MIT License

**Simple Memory MCP** - 让AI助手拥有持久记忆的能力 💾✨
**Simple Memory MCP** - Giving AI assistants persistent memory capabilities 💾✨

---