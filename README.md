# Simple Memory MCP

[English](#english) | [中文](#中文)

---

## English

### Overview

Simple Memory MCP is a memory management system designed for AI assistants, implementing the Model Context Protocol (MCP) to provide persistent memory storage and retrieval capabilities.

### Features

- **🧠 Smart Memory Storage**: AI assistants must first ask users for memory titles, then request content
- **📋 Efficient Retrieval**: Display title lists first, users select to get complete content
- **🌐 Web Management Interface**: Intuitive visual management with full CRUD operations
- **🔍 Full-text Search**: Search through both titles and content
- **🎯 Intelligent Port Management**: Automatic port detection and conflict resolution

### Quick Start

#### Prerequisites
- Node.js 16.0.0 or higher
- 512MB RAM minimum
- 100MB available storage

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

#### For Augment
```json
{
  "mcpServers": {
    "simple-memory": {
      "command": "node",
      "args": ["/absolute/path/to/simple-memory-mcp/src/server.js"],
      "cwd": "/absolute/path/to/simple-memory-mcp"
    }
  }
}
```

#### For Claude Desktop
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

#### Through Web Interface
1. Click "➕ Add Memory" to create new memories
2. Click memory cards to view details
3. Use the search box to find specific content
4. Edit or delete memories as needed

### MCP Tools

- `store_memory` - Store new memory (requires title and content)
- `list_memory_titles` - Get list of all memory titles
- `get_memory_by_title` - Retrieve memory content by title
- `delete_memory` - Delete specified memory

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

---

## 中文

### 概述

Simple Memory MCP 是一个专为AI助手设计的记忆管理系统，实现了模型上下文协议（MCP），为AI助手提供持久化记忆存储和检索功能。

### 功能特性

- **🧠 智能记忆存储**: AI助手必须先要求用户提供记忆标题，再要求输入内容
- **📋 高效检索**: 先展示标题列表，用户选择后获取完整内容
- **🌐 Web管理界面**: 直观的可视化管理界面，支持完整的增删改查操作
- **🔍 全文搜索**: 支持标题和内容的关键词搜索
- **🎯 智能端口管理**: 自动端口检测和冲突解决

### 快速开始

#### 系统要求
- Node.js 16.0.0 或更高版本
- 最低512MB内存
- 100MB可用存储空间

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

#### Augment配置
```json
{
  "mcpServers": {
    "simple-memory": {
      "command": "node",
      "args": ["/absolute/path/to/simple-memory-mcp/src/server.js"],
      "cwd": "/absolute/path/to/simple-memory-mcp"
    }
  }
}
```

#### Claude Desktop配置
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

#### 通过Web界面使用
1. 点击"➕ 添加记忆"创建新记忆
2. 点击记忆卡片查看详情
3. 使用搜索框查找特定内容
4. 根据需要编辑或删除记忆

### MCP工具

- `store_memory` - 存储新记忆（需要标题和内容参数）
- `list_memory_titles` - 获取所有记忆标题列表
- `get_memory_by_title` - 根据标题检索记忆内容
- `delete_memory` - 删除指定记忆

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

---

## License / 许可证

MIT License

---

**Simple Memory MCP** - 让AI助手拥有持久记忆的能力 🧠✨
**Simple Memory MCP** - Giving AI assistants persistent memory capabilities 🧠✨
