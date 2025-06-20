# Simple Memory MCP 完整文档

## 目录
- [API文档](#api文档)
- [部署指南](#部署指南)
- [开发文档](#开发文档)
- [端口管理系统](#端口管理系统)
- [用户指南](#用户指南)

---

## API文档

### 概述

Simple Memory MCP 提供两套API：
1. **MCP协议API** - 用于AI助手调用的标准MCP工具
2. **REST API** - 用于Web界面的HTTP接口

### MCP协议API

#### 工具列表

##### 1. store_memory
存储新的记忆

**描述**: AI助手必须先要求用户提供记忆标题，然后要求用户输入记忆内容。

**参数**:
```json
{
  "title": "string (必需) - 记忆的标题，必须由用户提供",
  "content": "string (必需) - 记忆的具体内容，支持长文本"
}
```

**返回值**:
```json
{
  "success": true,
  "message": "记忆 \"标题\" 已成功存储",
  "id": 1
}
```

##### 2. list_memory_titles
获取所有记忆的标题列表

**描述**: 只返回标题和基本信息，不返回完整内容，用于在聊天窗口中展示供用户选择。

**参数**: 无

**返回值**:
```json
{
  "success": true,
  "titles": [
    {
      "title": "记忆标题",
      "created_at": "2025-06-16 22:46:07",
      "preview": "内容预览..."
    }
  ],
  "count": 1
}
```

##### 3. get_memory_by_title
根据用户选择的标题获取记忆的完整内容

**参数**:
```json
{
  "title": "string (必需) - 要获取的记忆标题"
}
```

**返回值**:
```json
{
  "success": true,
  "memory": {
    "title": "记忆标题",
    "content": "完整的记忆内容",
    "created_at": "2025-06-16 22:46:07",
    "updated_at": "2025-06-16 22:46:07"
  }
}
```

##### 4. delete_memory
删除指定标题的记忆

**参数**:
```json
{
  "title": "string (必需) - 要删除的记忆标题"
}
```

**返回值**:
```json
{
  "success": true,
  "message": "记忆 \"标题\" 已成功删除"
}
```

### REST API

#### 基础URL
```
http://localhost:8011/api
```

#### 端点列表

- `GET /memories` - 获取所有记忆列表
- `POST /memories` - 创建新记忆
- `GET /memories/:title` - 根据标题获取记忆详情
- `PUT /memories/:title` - 更新记忆
- `DELETE /memories/:title` - 删除记忆
- `GET /search?q=关键词` - 搜索记忆

#### 错误处理

所有API都遵循统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

常见HTTP状态码：
- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源未找到
- `500` - 服务器内部错误

#### 数据库结构

```sql
CREATE TABLE memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 部署指南

### 系统要求

#### 最低要求
- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Node.js**: 16.0.0 或更高版本
- **内存**: 512MB RAM
- **存储**: 100MB 可用空间
- **网络**: 局域网访问（用于Web界面）

#### 推荐配置
- **Node.js**: 18.0.0 或更高版本
- **内存**: 1GB RAM
- **存储**: 1GB 可用空间

### 安装步骤

#### 1. 环境准备

**安装Node.js**

Windows:
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载LTS版本安装包
3. 运行安装程序，按默认设置安装

macOS:
```bash
# 使用Homebrew安装
brew install node
```

Linux (Ubuntu/Debian):
```bash
# 更新包管理器
sudo apt update

# 安装Node.js
sudo apt install nodejs npm

# 验证安装
node --version
npm --version
```

#### 2. 项目部署

```bash
# 安装项目依赖
npm install

# 初始化数据库
npm run init-db
```

#### 3. 启动服务

**开发模式启动**:
```bash
# 启动MCP服务器（开发模式）
npm run dev

# 启动Web服务器（开发模式）
npm run dev:web
```

**生产模式启动**:
```bash
# 启动MCP服务器
npm start

# 启动Web服务器
npm run web
```

### AI工具配置

#### 配置Augment

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

#### 配置Claude Desktop

配置文件位置：
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

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

### 故障排除

#### 常见问题

**端口占用**:
```bash
# Windows
netstat -ano | findstr :8011
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8011
kill -9 <PID>
```

**数据库问题**:
```bash
# 重新初始化数据库
rm data/memories.db
npm run init-db
```

**MCP连接问题**:
- 确保使用绝对路径配置
- 检查Node.js版本（需要16.0.0+）
- 验证项目依赖已安装

---

## 开发文档

### 项目架构

#### 整体架构
```
Simple Memory MCP
├── MCP服务器 (src/server.js)
│   ├── JSON-RPC 2.0协议处理
│   ├── MCP工具定义和执行
│   └── 标准输入/输出通信
├── Web服务器 (src/web/app.js)
│   ├── Express REST API
│   ├── 静态文件服务
│   └── CORS支持
├── 数据库层 (src/database.js)
│   ├── SQLite数据库操作
│   ├── CRUD操作封装
│   └── 错误处理
└── 前端界面 (src/web/public/)
    ├── HTML页面结构
    ├── CSS样式设计
    └── JavaScript交互逻辑
```

#### 技术栈
- **后端**: Node.js + Express.js
- **数据库**: SQLite3
- **前端**: 原生HTML/CSS/JavaScript
- **协议**: Model Context Protocol (MCP)
- **通信**: JSON-RPC 2.0, REST API

### 核心模块详解

#### 1. MCP服务器 (src/server.js)

主要功能：
- 实现MCP协议标准
- 处理JSON-RPC 2.0请求
- 管理工具调用和响应
- 处理标准输入/输出通信

关键方法：
```javascript
class MCPServer {
    async handleRequest(request)     // 处理MCP请求
    handleInitialize(id, params)     // 处理初始化
    handleToolsList(id)              // 返回工具列表
    async handleToolCall(id, params) // 执行工具调用
    createErrorResponse(id, code, message) // 创建错误响应
}
```

#### 2. 工具执行器 (src/tools.js)

工具实现：
```javascript
class ToolExecutor {
    async executeStoreMemory(args)        // 存储记忆
    async executeListMemoryTitles()       // 获取标题列表
    async executeGetMemoryByTitle(args)   // 获取记忆内容
    async executeDeleteMemory(args)       // 删除记忆
}
```

#### 3. 数据库层 (src/database.js)

核心方法：
```javascript
class Database {
    async init()                          // 初始化数据库
    async storeMemory(title, content)     // 存储记忆
    async getMemoryTitles()               // 获取标题列表
    async getMemoryByTitle(title)         // 获取记忆详情
    async deleteMemory(title)             // 删除记忆
    async updateMemory(title, newTitle, content) // 更新记忆
    async searchMemories(keyword)         // 搜索记忆
}
```

### 开发环境搭建

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/simple-memory-mcp.git
cd simple-memory-mcp

# 2. 安装依赖
npm install

# 3. 初始化数据库
npm run init-db

# 4. 启动开发服务器
npm run dev        # MCP服务器开发模式
npm run dev:web    # Web服务器开发模式
```

### 测试指南

#### 单元测试
```bash
npm install --save-dev jest supertest
npm test
```

#### 集成测试
```javascript
// 测试MCP服务器
const server = spawn('node', ['src/server.js']);
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {}
};
server.stdin.write(JSON.stringify(initRequest) + '\n');
```

### 扩展开发

#### 添加新的MCP工具
```javascript
// 1. 在src/tools.js中定义工具
export const newTool = {
  name: "new_tool",
  description: "新工具的描述",
  inputSchema: {
    type: "object",
    properties: {
      param: { type: "string", description: "参数描述" }
    },
    required: ["param"]
  }
};

// 2. 实现工具执行方法
async executeNewTool(args) {
  // 工具逻辑实现
}
```

---

## 端口管理系统

### 核心特性

#### 智能端口检测
- 自动检测端口可用性
- 避免端口冲突，不强制终止其他进程
- 支持端口范围扫描

#### 端口分配策略
- **优先级顺序**: 上次使用 → 首选端口 → 配置范围 → 备用范围 → 全局扫描
- **持久化存储**: 记住上次分配的端口，重启时优先使用
- **智能避让**: 遇到冲突时自动寻找替代端口

### 配置文件

#### 端口配置 (`src/config/ports.config.js`)
```javascript
export const PortConfig = {
    services: {
        web: {
            name: 'Web管理界面',
            preferred: 8011,           // 首选端口
            range: [8010, 8020],       // 可用端口范围
            fallback: [3000, 3010],    // 备用端口范围
            protocol: 'http',
            autoOpen: true             // 是否自动打开浏览器
        }
    },
    
    global: {
        scanRange: { start: 8000, end: 9000 },
        strategy: {
            priority: ['last_used', 'preferred', 'range', 'fallback', 'scan'],
            avoidKilling: true,
            onConflict: 'find_alternative'
        }
    }
};
```

### 使用方式

#### 推荐启动方式
```bash
# 使用智能端口管理启动
node start-web.js
```

特性：
- ✅ 自动端口检测和分配
- ✅ 彩色输出和状态提示
- ✅ 自动打开浏览器到正确端口
- ✅ 优雅关闭和端口释放

#### 端口管理API
```javascript
import { portManager } from './src/services/PortManager.js';

// 分配端口
const port = await portManager.allocatePort('web');

// 检查端口可用性
const available = await portManager.checkPortAvailable(8011);

// 释放端口
await portManager.releasePort('web');
```

### 故障排除

#### 常见问题

**端口分配失败**:
```
❌ 端口分配失败: 无法为服务 "web" 分配端口：所有尝试都失败了
```

解决方案：
1. 检查配置的端口范围是否合理
2. 确保有足够的可用端口
3. 检查防火墙设置

**持久化文件损坏**:
```bash
# 删除损坏的持久化文件
rm data/ports.json
# 重新启动服务
node start-web.js
```

---

## 用户指南

### 概述

Simple Memory MCP 是一个专为AI助手设计的记忆管理系统，允许AI助手帮助用户存储、检索和管理重要信息。

### 核心特性

#### 智能记忆存储
- AI助手必须先要求用户提供记忆标题
- 支持长文本内容存储
- 自动时间戳记录

#### 高效记忆检索
- 先展示标题列表供用户选择
- 按需获取完整内容
- 支持关键词搜索

#### Web管理界面
- 直观的记忆管理界面
- 完整的CRUD操作
- 实时搜索和过滤

### 使用方式

#### 1. 通过AI助手使用（推荐）

**存储记忆**:
```
用户: 帮我存储一篇文章
AI: 请提供这个记忆的标题：
用户: 学习笔记 - MCP协议
AI: 请输入记忆的具体内容：
用户: [输入长文本内容]
AI: 记忆 "学习笔记 - MCP协议" 已成功存储！
```

**检索记忆**:
```
用户: 帮我查看之前存储的内容
AI: 您有以下记忆：
    1. 学习笔记 - MCP协议 (创建于: 今天)
    2. 会议记录 - 项目讨论 (创建于: 昨天)
    请选择要查看的记忆标题：
用户: 学习笔记 - MCP协议
AI: [返回完整的学习笔记内容]
```

#### 2. 通过Web界面使用

**访问Web界面**:

方式一：专业启动器（推荐）
```bash
# 使用Node.js专业启动器
node start-web.js

# 或使用npm脚本
npm run web:start
```

方式二：手动启动
```bash
# 启动Web服务器
npm run web
# 打开浏览器访问：http://localhost:8011
```

专业启动器会自动：
- 检查Node.js版本和环境
- 自动检测并清理端口占用
- 启动Web管理界面
- 在浏览器中打开管理页面
- 提供彩色输出和状态提示

#### Web界面功能

**记忆列表页面**:
- 查看所有记忆的标题和预览
- 显示创建时间
- 快速搜索功能

**添加记忆**:
1. 点击"➕ 添加记忆"按钮
2. 填写标题和内容
3. 点击"保存"

**查看记忆详情**:
1. 点击记忆卡片
2. 在弹出窗口中查看完整内容
3. 可以直接编辑或删除

**编辑记忆**:
1. 在记忆卡片上点击"✏️ 编辑"
2. 修改标题或内容
3. 点击"保存"

**删除记忆**:
1. 在记忆卡片上点击"🗑️ 删除"
2. 确认删除操作

**搜索记忆**:
1. 在搜索框中输入关键词
2. 点击搜索按钮或按回车
3. 查看匹配结果

### 最佳实践

#### 标题命名建议
- 使用描述性标题：`学习笔记 - React Hooks`
- 包含日期信息：`会议记录 - 2025-06-16`
- 使用分类前缀：`工作 - 项目计划`、`个人 - 读书笔记`

#### 内容组织建议
- 使用清晰的结构和段落
- 重要信息使用标记或符号突出
- 长文本使用小标题分段
- 包含相关链接和参考资料

#### 搜索技巧
- 使用关键词搜索：搜索会匹配标题和内容
- 尝试不同的关键词组合
- 使用Web界面的实时搜索功能

### 工作流程示例

#### 学习笔记管理
1. **存储**: "帮我存储今天的学习笔记"
2. **标题**: "JavaScript异步编程 - 2025-06-16"
3. **内容**: 详细的学习内容、代码示例、心得体会
4. **检索**: 需要时通过关键词"JavaScript"或"异步"搜索

#### 会议记录管理
1. **存储**: "帮我存储会议记录"
2. **标题**: "项目讨论会议 - 2025-06-16"
3. **内容**: 会议要点、决策事项、行动计划
4. **检索**: 通过项目名称或日期快速找到

#### 文章收藏管理
1. **存储**: "帮我保存这篇文章"
2. **标题**: "技术文章 - MCP协议详解"
3. **内容**: 文章全文或重要摘录
4. **检索**: 通过技术关键词搜索相关文章

### 故障排除

#### 常见问题

**Q: AI助手无法连接到MCP服务器**
A: 确保MCP服务器正在运行：`npm start`

**Q: Web界面无法访问**
A: 确保Web服务器正在运行：`npm run web`

**Q: 记忆保存失败**
A: 检查标题是否已存在，每个标题必须唯一

**Q: 搜索结果为空**
A: 尝试使用不同的关键词，搜索会匹配标题和内容

#### 数据备份
- 数据库文件位置：`data/memories.db`
- 建议定期备份此文件
- 可以复制到其他位置作为备份

#### 性能优化
- 定期清理不需要的记忆
- 避免存储过大的文件内容
- 使用描述性标题提高搜索效率

### 技术支持

如果遇到问题，请：
1. 查看控制台错误信息
2. 检查数据库文件是否存在
3. 确认网络连接正常
4. 重启服务器进程

---

*Simple Memory MCP - 让AI助手拥有持久记忆的能力 🧠✨*
