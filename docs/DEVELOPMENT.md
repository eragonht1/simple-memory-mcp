# Simple Memory MCP 开发文档

## 项目架构

### 整体架构
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

### 技术栈
- **后端**: Node.js + Express.js
- **数据库**: SQLite3
- **前端**: 原生HTML/CSS/JavaScript
- **协议**: Model Context Protocol (MCP)
- **通信**: JSON-RPC 2.0, REST API

## 核心模块详解

### 1. MCP服务器 (src/server.js)

#### 主要功能
- 实现MCP协议标准
- 处理JSON-RPC 2.0请求
- 管理工具调用和响应
- 处理标准输入/输出通信

#### 关键方法
```javascript
class MCPServer {
    async handleRequest(request)     // 处理MCP请求
    handleInitialize(id, params)     // 处理初始化
    handleToolsList(id)              // 返回工具列表
    async handleToolCall(id, params) // 执行工具调用
    createErrorResponse(id, code, message) // 创建错误响应
}
```

#### 协议实现
- 支持MCP协议版本: 2024-11-05
- 实现标准的初始化握手
- 提供工具发现和调用机制
- 错误处理符合JSON-RPC 2.0规范

### 2. 工具执行器 (src/tools.js)

#### 工具定义
每个MCP工具包含：
- `name`: 工具名称
- `description`: 工具描述
- `inputSchema`: 输入参数模式

#### 工具实现
```javascript
class ToolExecutor {
    async executeStoreMemory(args)        // 存储记忆
    async executeListMemoryTitles()       // 获取标题列表
    async executeGetMemoryByTitle(args)   // 获取记忆内容
    async executeDeleteMemory(args)       // 删除记忆
}
```

#### 设计原则
- 每个工具都有明确的职责
- 统一的错误处理机制
- 参数验证和类型检查
- 异步操作支持

### 3. 数据库层 (src/database.js)

#### 数据模型
```sql
CREATE TABLE memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 核心方法
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

#### 设计特点
- 单例模式确保数据库连接唯一性
- Promise-based异步操作
- 自动时间戳管理
- 唯一性约束处理

### 4. Web服务器 (src/web/app.js)

#### REST API设计
遵循RESTful设计原则：
- `GET /api/memories` - 获取记忆列表
- `POST /api/memories` - 创建记忆
- `GET /api/memories/:title` - 获取记忆详情
- `PUT /api/memories/:title` - 更新记忆
- `DELETE /api/memories/:title` - 删除记忆
- `GET /api/search` - 搜索记忆

#### 中间件配置
```javascript
app.use(cors());                    // 跨域支持
app.use(bodyParser.json());         // JSON解析
app.use(express.static('public'));  // 静态文件服务
```

### 5. 前端界面

#### 组件架构
```javascript
class MemoryManager {
    // 数据管理
    memories[]                    // 记忆数据
    currentEditingMemory         // 当前编辑的记忆
    
    // 核心方法
    loadMemories()               // 加载记忆列表
    renderMemories()             // 渲染记忆卡片
    viewMemory(title)            // 查看记忆详情
    editMemory(title)            // 编辑记忆
    saveMemory()                 // 保存记忆
    deleteMemory(title)          // 删除记忆
    performSearch()              // 执行搜索
}
```

#### 用户体验设计
- 响应式布局适配不同屏幕
- 模态框交互提升用户体验
- 实时搜索和过滤功能
- 加载状态和错误提示
- 优雅的动画效果

## 开发环境搭建

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/simple-memory-mcp.git
cd simple-memory-mcp
```

### 2. 安装依赖
```bash
npm install
```

### 3. 初始化数据库
```bash
npm run init-db
```

### 4. 启动开发服务器
```bash
# 启动MCP服务器（开发模式）
npm run dev

# 启动Web服务器（开发模式）
npm run dev:web
```

### 5. 开发工具配置

#### VS Code配置
创建 `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.js": "javascript"
  }
}
```

#### ESLint配置
创建 `.eslintrc.js`:
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
    browser: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

## 测试指南

### 1. 单元测试

#### 测试框架配置
```bash
npm install --save-dev jest supertest
```

#### 数据库测试示例
```javascript
// tests/database.test.js
import database from '../src/database.js';

describe('Database Operations', () => {
  beforeAll(async () => {
    await database.init();
  });

  test('should store memory', async () => {
    const id = await database.storeMemory('Test Title', 'Test Content');
    expect(id).toBeGreaterThan(0);
  });

  test('should retrieve memory by title', async () => {
    const memory = await database.getMemoryByTitle('Test Title');
    expect(memory.title).toBe('Test Title');
    expect(memory.content).toBe('Test Content');
  });

  afterAll(async () => {
    await database.close();
  });
});
```

#### API测试示例
```javascript
// tests/api.test.js
import request from 'supertest';
import app from '../src/web/app.js';

describe('REST API', () => {
  test('GET /api/memories', async () => {
    const response = await request(app)
      .get('/api/memories')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.memories)).toBe(true);
  });

  test('POST /api/memories', async () => {
    const newMemory = {
      title: 'API Test Memory',
      content: 'This is a test memory'
    };

    const response = await request(app)
      .post('/api/memories')
      .send(newMemory)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

### 2. 集成测试

#### MCP协议测试
```javascript
// tests/mcp.test.js
import { spawn } from 'child_process';

describe('MCP Server', () => {
  test('should handle initialize request', (done) => {
    const server = spawn('node', ['src/server.js']);
    
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {}
    };

    server.stdin.write(JSON.stringify(initRequest) + '\n');

    server.stdout.on('data', (data) => {
      const response = JSON.parse(data.toString());
      expect(response.result.protocolVersion).toBe('2024-11-05');
      server.kill();
      done();
    });
  });
});
```

### 3. 端到端测试

使用Playwright或Cypress进行Web界面测试：
```javascript
// tests/e2e.test.js
import { test, expect } from '@playwright/test';

test('should create and view memory', async ({ page }) => {
  await page.goto('http://localhost:8011');
  
  // 点击添加记忆按钮
  await page.click('#addMemoryBtn');
  
  // 填写表单
  await page.fill('#memoryTitleInput', 'E2E Test Memory');
  await page.fill('#memoryContentInput', 'This is an E2E test');
  
  // 提交表单
  await page.click('#saveBtn');
  
  // 验证记忆已创建
  await expect(page.locator('.memory-title')).toContainText('E2E Test Memory');
});
```

## 贡献指南

### 1. 代码规范

#### 命名约定
- 变量和函数：camelCase
- 类名：PascalCase
- 常量：UPPER_SNAKE_CASE
- 文件名：kebab-case

#### 代码风格
- 使用2空格缩进
- 行末不留空格
- 文件末尾保留一个空行
- 使用单引号字符串

### 2. 提交规范

#### Commit消息格式
```
type(scope): description

[optional body]

[optional footer]
```

#### 类型说明
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 3. Pull Request流程

1. Fork项目到个人仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'feat: add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建Pull Request

### 4. 问题报告

使用GitHub Issues报告问题，包含：
- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息

## 扩展开发

### 1. 添加新的MCP工具

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

// 3. 在handleToolCall中添加调用分支
case 'new_tool':
  result = await this.toolExecutor.executeNewTool(args);
  break;
```

### 2. 扩展数据库模型

```javascript
// 1. 修改数据库结构
async createTables() {
  const createNewTable = `
    CREATE TABLE IF NOT EXISTS new_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field1 TEXT NOT NULL,
      field2 INTEGER DEFAULT 0
    )
  `;
  // 执行SQL
}

// 2. 添加相应的CRUD方法
async createNewRecord(field1, field2) {
  // 实现逻辑
}
```

### 3. 添加新的API端点

```javascript
// 在src/web/app.js中添加路由
app.get('/api/new-endpoint', async (req, res) => {
  try {
    // 处理逻辑
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 性能优化

### 1. 数据库优化
- 添加适当的索引
- 使用连接池
- 实现查询缓存
- 定期清理过期数据

### 2. 内存管理
- 避免内存泄漏
- 合理使用缓存
- 及时释放资源
- 监控内存使用

### 3. 网络优化
- 启用gzip压缩
- 使用CDN加速静态资源
- 实现请求缓存
- 优化API响应大小

## 安全考虑

### 1. 输入验证
- 验证所有用户输入
- 防止SQL注入
- 限制输入长度
- 过滤特殊字符

### 2. 访问控制
- 实现身份验证
- 添加权限检查
- 限制API访问频率
- 记录操作日志

### 3. 数据保护
- 加密敏感数据
- 安全存储密码
- 定期备份数据
- 实现数据恢复机制
