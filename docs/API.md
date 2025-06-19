# Simple Memory MCP API 文档

## 概述

Simple Memory MCP 提供两套API：
1. **MCP协议API** - 用于AI助手调用的标准MCP工具
2. **REST API** - 用于Web界面的HTTP接口

## MCP协议API

### 工具列表

#### 1. store_memory
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

**错误响应**:
```json
{
  "success": false,
  "error": "标题 \"标题\" 已存在，请使用不同的标题"
}
```

#### 2. list_memory_titles
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

#### 3. get_memory_by_title
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

**错误响应**:
```json
{
  "success": false,
  "error": "未找到标题为 \"标题\" 的记忆"
}
```

#### 4. delete_memory
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

## REST API

### 基础URL
```
http://localhost:8011/api
```

### 端点列表

#### GET /memories
获取所有记忆列表

**响应**:
```json
{
  "success": true,
  "memories": [
    {
      "id": 1,
      "title": "记忆标题",
      "created_at": "2025-06-16 22:46:07",
      "preview": "内容预览（最多100字符）..."
    }
  ]
}
```

#### GET /memories/:title
根据标题获取记忆详情

**参数**:
- `title` (URL参数) - 记忆标题（需要URL编码）

**响应**:
```json
{
  "success": true,
  "memory": {
    "id": 1,
    "title": "记忆标题",
    "content": "完整内容",
    "created_at": "2025-06-16 22:46:07",
    "updated_at": "2025-06-16 22:46:07"
  }
}
```

#### POST /memories
创建新记忆

**请求体**:
```json
{
  "title": "记忆标题",
  "content": "记忆内容"
}
```

**响应**:
```json
{
  "success": true,
  "message": "记忆创建成功",
  "id": 1
}
```

#### PUT /memories/:title
更新记忆

**参数**:
- `title` (URL参数) - 原记忆标题（需要URL编码）

**请求体**:
```json
{
  "title": "新标题",
  "content": "新内容"
}
```

**响应**:
```json
{
  "success": true,
  "message": "记忆更新成功"
}
```

#### DELETE /memories/:title
删除记忆

**参数**:
- `title` (URL参数) - 记忆标题（需要URL编码）

**响应**:
```json
{
  "success": true,
  "message": "记忆删除成功"
}
```

#### GET /search
搜索记忆

**查询参数**:
- `q` - 搜索关键词

**响应**:
```json
{
  "success": true,
  "memories": [
    {
      "id": 1,
      "title": "匹配的记忆标题",
      "content": "匹配的记忆内容",
      "created_at": "2025-06-16 22:46:07",
      "updated_at": "2025-06-16 22:46:07"
    }
  ]
}
```

## 错误处理

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

## 数据库结构

### memories 表
```sql
CREATE TABLE memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 使用示例

### MCP工具调用示例
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "store_memory",
    "arguments": {
      "title": "学习笔记",
      "content": "今天学习了MCP协议的实现..."
    }
  }
}
```

### REST API调用示例
```bash
# 获取所有记忆
curl http://localhost:8011/api/memories

# 创建新记忆
curl -X POST http://localhost:8011/api/memories \
  -H "Content-Type: application/json" \
  -d '{"title":"新记忆","content":"记忆内容"}'

# 搜索记忆
curl "http://localhost:8011/api/search?q=学习"
```
