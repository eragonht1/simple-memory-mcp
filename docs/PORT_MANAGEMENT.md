# 端口管理系统

Simple Memory MCP 采用智能端口管理系统，自动处理端口分配、冲突检测和持久化存储。

## 🎯 核心特性

### 🔍 智能端口检测
- 自动检测端口可用性
- 避免端口冲突，不强制终止其他进程
- 支持端口范围扫描

### 📋 端口分配策略
- **优先级顺序**: 上次使用 → 首选端口 → 配置范围 → 备用范围 → 全局扫描
- **持久化存储**: 记住上次分配的端口，重启时优先使用
- **智能避让**: 遇到冲突时自动寻找替代端口

### 🛠️ 统一配置管理
- 集中式端口配置文件
- 支持环境特定配置
- 可配置的端口范围和策略

## 📁 配置文件

### 端口配置 (`src/config/ports.config.js`)

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

### 持久化存储 (`data/ports.json`)

系统自动维护端口分配历史：

```json
{
    "timestamp": "2024-12-19T10:30:00.000Z",
    "ttl": 86400000,
    "ports": {
        "web": {
            "port": 8011,
            "service": "web",
            "allocatedAt": "2024-12-19T10:30:00.000Z",
            "config": { ... }
        }
    }
}
```

## 🚀 使用方式

### 1. 推荐启动方式

```bash
# 使用智能端口管理启动
node start-web.js
```

**特性**:
- ✅ 自动端口检测和分配
- ✅ 彩色输出和状态提示
- ✅ 自动打开浏览器到正确端口
- ✅ 优雅关闭和端口释放

### 2. 传统启动方式

```bash
# 直接启动（使用动态端口分配）
npm run web
```

### 3. Shell脚本启动

```bash
# Linux/macOS
./start-web.sh
```

## 🔧 端口管理API

### PortManager 类

```javascript
import { portManager } from './src/services/PortManager.js';

// 分配端口
const port = await portManager.allocatePort('web');

// 检查端口可用性
const available = await portManager.checkPortAvailable(8011);

// 释放端口
await portManager.releasePort('web');

// 获取已分配端口
const allocatedPorts = portManager.getAllocatedPorts();
```

### Web API

```bash
# 获取系统信息（包括端口信息）
GET /api/system/info
```

响应示例：
```json
{
    "success": true,
    "systemInfo": {
        "currentPort": 8011,
        "allocatedPorts": {
            "web": {
                "port": 8011,
                "service": "web",
                "allocatedAt": "2024-12-19T10:30:00.000Z"
            }
        },
        "timestamp": "2024-12-19T10:30:00.000Z",
        "version": "1.0.0"
    }
}
```

## 🎨 用户界面

### 端口信息显示
- Web界面右下角显示当前端口号
- 鼠标悬停显示详细信息
- 实时更新端口状态

### 启动日志
```
🧠 Simple Memory MCP Web管理界面
==================================================
✅ Node.js版本检查通过: v18.17.0
🔍 正在分配端口...
✅ 已分配端口: 8011
🚀 启动Web服务器...
📍 服务器地址: http://localhost:8011
🌐 正在打开浏览器...
✅ 浏览器已打开
```

## 🛠️ 高级配置

### 环境特定配置

```javascript
// 开发环境
NODE_ENV=development node start-web.js

// 生产环境
NODE_ENV=production node start-web.js
```

### 自定义端口范围

修改 `src/config/ports.config.js`:

```javascript
services: {
    web: {
        preferred: 9000,
        range: [9000, 9010],
        fallback: [8000, 8010]
    }
}
```

### 禁用端口持久化

```javascript
global: {
    persistence: {
        enabled: false
    }
}
```

## 🔍 故障排除

### 常见问题

**Q: 端口分配失败**
```
❌ 端口分配失败: 无法为服务 "web" 分配端口：所有尝试都失败了
```

**解决方案**:
1. 检查配置的端口范围是否合理
2. 确保有足够的可用端口
3. 检查防火墙设置

**Q: 持久化文件损坏**
```
⚠️ 加载端口信息失败: Unexpected token
```

**解决方案**:
```bash
# 删除损坏的持久化文件
rm data/ports.json
# 重新启动服务
node start-web.js
```

**Q: 端口冲突**

系统会自动处理端口冲突，无需手动干预。如果需要强制使用特定端口：

```javascript
// 临时修改配置
const port = await portManager.allocatePort('web');
```

### 调试模式

```bash
# 启用详细日志
DEBUG=port-manager node start-web.js
```

## 📊 性能优化

### 端口扫描优化
- 默认扫描范围: 8000-9000
- 可配置扫描超时: 3秒
- 智能跳过保留端口

### 内存使用
- 轻量级端口管理器
- 最小化持久化数据
- 自动清理过期记录

## 🔒 安全考虑

### 端口安全
- 避免使用系统保留端口
- 不暴露敏感端口信息
- 支持本地绑定限制

### 权限管理
- 无需管理员权限
- 用户级端口范围
- 安全的端口释放

---

更多技术细节请参考：
- [开发文档](DEVELOPMENT.md)
- [API文档](API.md)
- [用户指南](USER_GUIDE.md)
