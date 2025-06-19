# Simple Memory MCP 部署指南

## 系统要求

### 最低要求
- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Node.js**: 16.0.0 或更高版本
- **内存**: 512MB RAM
- **存储**: 100MB 可用空间
- **网络**: 局域网访问（用于Web界面）

### 推荐配置
- **Node.js**: 18.0.0 或更高版本
- **内存**: 1GB RAM
- **存储**: 1GB 可用空间

## 安装步骤

### 1. 环境准备

#### 安装Node.js
**Windows**:
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载LTS版本安装包
3. 运行安装程序，按默认设置安装

**macOS**:
```bash
# 使用Homebrew安装
brew install node

# 或下载官方安装包
# https://nodejs.org/
```

**Linux (Ubuntu/Debian)**:
```bash
# 更新包管理器
sudo apt update

# 安装Node.js
sudo apt install nodejs npm

# 验证安装
node --version
npm --version
```

#### 验证Node.js安装
```bash
node --version  # 应显示 v16.0.0 或更高
npm --version   # 应显示对应的npm版本
```

### 2. 项目部署

#### 下载项目
```bash
# 克隆项目（如果使用Git）
git clone https://github.com/yourusername/simple-memory-mcp.git
cd simple-memory-mcp

# 或解压项目文件到目标目录
```

#### 安装依赖
```bash
# 安装项目依赖
npm install

# 验证安装
npm list --depth=0
```

#### 初始化数据库
```bash
# 创建数据库和表结构
npm run init-db
```

### 3. 配置设置

#### 环境变量配置（可选）
创建 `.env` 文件：
```bash
# Web服务器端口（默认5566）
PORT=5566

# 数据库文件路径（默认data/memories.db）
DB_PATH=./data/memories.db

# 日志级别（默认info）
LOG_LEVEL=info
```

#### 防火墙配置
**Windows**:
1. 打开Windows Defender防火墙
2. 点击"允许应用或功能通过Windows Defender防火墙"
3. 添加Node.js应用程序
4. 允许专用网络和公用网络访问

**Linux**:
```bash
# 允许5566端口访问
sudo ufw allow 5566

# 或允许特定IP访问
sudo ufw allow from 192.168.1.0/24 to any port 5566
```

### 4. 启动服务

#### 开发模式启动
```bash
# 启动MCP服务器（开发模式）
npm run dev

# 启动Web服务器（开发模式）
npm run dev:web
```

#### 生产模式启动
```bash
# 启动MCP服务器
npm start

# 启动Web服务器
npm run web
```

#### 后台运行（Linux/macOS）
```bash
# 使用nohup后台运行MCP服务器
nohup npm start > mcp.log 2>&1 &

# 使用nohup后台运行Web服务器
nohup npm run web > web.log 2>&1 &

# 查看进程
ps aux | grep node
```

#### Windows服务运行
使用PM2进程管理器：
```bash
# 安装PM2
npm install -g pm2

# 启动MCP服务器
pm2 start src/server.js --name "memory-mcp"

# 启动Web服务器
pm2 start src/web/app.js --name "memory-web"

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

### 5. 验证部署

#### 测试MCP服务器
```bash
# 测试MCP服务器是否启动
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node src/server.js
```

#### 测试Web服务器
```bash
# 测试Web API
curl http://localhost:5566/api/memories

# 或在浏览器中访问
# http://localhost:5566
```

#### 功能测试
1. **Web界面测试**:
   - 访问 `http://localhost:5566`
   - 创建新记忆
   - 搜索记忆
   - 编辑和删除记忆

2. **MCP工具测试**:
   - 配置AI助手连接MCP服务器
   - 测试存储记忆功能
   - 测试检索记忆功能

## 生产环境部署

### 1. 反向代理配置

#### 使用Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5566;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 使用Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:5566/
    ProxyPassReverse / http://localhost:5566/
</VirtualHost>
```

### 2. SSL/HTTPS配置
```bash
# 使用Let's Encrypt获取SSL证书
sudo certbot --nginx -d your-domain.com

# 或使用自签名证书（仅用于测试）
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 3. 数据库备份策略
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp data/memories.db backups/memories_$DATE.db

# 保留最近30天的备份
find backups/ -name "memories_*.db" -mtime +30 -delete
```

### 4. 监控和日志

#### 日志配置
```javascript
// 在src/web/app.js中添加日志中间件
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

#### 健康检查
```bash
# 创建健康检查脚本
#!/bin/bash
curl -f http://localhost:5566/api/memories > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Web服务器异常，正在重启..."
    pm2 restart memory-web
fi
```

## 故障排除

### 常见问题

#### 端口占用
```bash
# 查看端口占用
netstat -ano | findstr :5566  # Windows
lsof -i :5566                 # Linux/macOS

# 终止占用进程
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/macOS
```

#### 权限问题
```bash
# Linux/macOS权限设置
chmod +x scripts/*.js
chown -R $USER:$USER data/

# Windows权限设置
# 右键项目文件夹 -> 属性 -> 安全 -> 编辑权限
```

#### 数据库问题
```bash
# 重新初始化数据库
rm data/memories.db
npm run init-db

# 检查数据库完整性
sqlite3 data/memories.db "PRAGMA integrity_check;"
```

### 性能优化

#### 数据库优化
```sql
-- 创建索引提高查询性能
CREATE INDEX idx_memories_title ON memories(title);
CREATE INDEX idx_memories_created_at ON memories(created_at);
```

#### 内存优化
```javascript
// 在package.json中设置Node.js内存限制
{
  "scripts": {
    "start": "node --max-old-space-size=512 src/server.js"
  }
}
```

## 安全建议

### 1. 网络安全
- 仅在受信任的网络中运行
- 使用防火墙限制访问
- 定期更新Node.js和依赖包

### 2. 数据安全
- 定期备份数据库文件
- 设置适当的文件权限
- 考虑加密敏感数据

### 3. 访问控制
- 在生产环境中添加身份验证
- 使用HTTPS加密传输
- 限制API访问频率

## AI工具配置

### 配置Augment

Simple Memory MCP 可以与Augment等AI工具集成，提供记忆管理功能。

#### 前提条件

1. **确保项目已正确安装**
   ```bash
   cd /path/to/simple-memory-mcp
   npm install
   npm run init-db
   ```

2. **验证Node.js环境**
   ```bash
   node --version  # 需要16.0.0或更高版本
   npm --version
   ```

3. **测试MCP服务器**
   ```bash
   # 手动测试启动
   node src/server.js
   # 按Ctrl+C停止
   ```

#### 配置方法

**方法1：使用启动脚本（推荐）**

这种方法使用批处理文件确保正确的路径解析。

1. 验证启动脚本存在：
   ```bash
   # Windows
   dir start-mcp.bat

   # Linux/macOS
   ls start-mcp.sh
   ```

2. 在Augment中添加配置：
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "/absolute/path/to/simple-memory-mcp/start-mcp.bat",
         "args": []
       }
     }
   }
   ```

**方法2：使用绝对路径**

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

**方法3：使用npm脚本**

```json
{
  "mcpServers": {
    "simple-memory": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/absolute/path/to/simple-memory-mcp"
    }
  }
}
```

#### 配置步骤

1. **打开Augment设置**
   - 启动Augment
   - 导航到设置/首选项
   - 找到MCP或Model Context Protocol部分

2. **添加服务器配置**
   - 复制上述配置方法之一
   - 将路径替换为您的实际项目路径
   - 保存配置

3. **重启Augment**
   - 完全关闭Augment
   - 重新启动Augment
   - 等待MCP服务器初始化

#### 功能验证

1. **测试记忆存储**
   ```
   用户: 请帮我存储一个记忆
   Augment: 请提供这个记忆的标题：
   用户: 测试记忆
   Augment: 请输入记忆的具体内容：
   用户: 这是一个测试记忆，用于验证MCP集成。
   Augment: 记忆 "测试记忆" 已成功存储！
   ```

2. **测试记忆检索**
   ```
   用户: 请帮我查看存储的记忆
   Augment: 您有以下记忆：
           1. 测试记忆 (今天)
           请选择要查看的记忆：
   用户: 测试记忆
   Augment: [返回完整内容]
   ```

3. **验证Web界面**
   ```bash
   npm run web
   # 打开浏览器访问 http://localhost:5566
   # 检查是否能看到通过Augment存储的记忆
   ```

### MCP配置故障排除

#### 常见错误及解决方案

**1. "MCP error -1: Connection closed"**
- **原因**: 路径或命令问题
- **解决**: 使用方法1（启动脚本）获得最可靠的结果
- **检查**: 确保所有路径正确且使用绝对路径
- **验证**: 检查Node.js是否在系统PATH中

**2. "Cannot find module"**
- **原因**: 缺少依赖或工作目录错误
- **解决**:
  ```bash
  cd /path/to/simple-memory-mcp
  npm install
  ```

**3. "Permission denied"**
- **原因**: Augment没有访问文件的权限
- **解决**:
  - 临时以管理员身份运行Augment（仅用于测试）
  - 检查项目目录的文件权限
  - 确保防病毒软件没有阻止访问

**4. "Port already in use" / 端口被占用**
- **原因**: 另一个服务正在使用端口5566
- **解决方法**:

  **Windows系统**:
  ```bash
  # 1. 查找占用端口的进程
  netstat -ano | findstr :5566

  # 2. 记录PID（进程ID），然后终止进程
  taskkill /PID <PID> /F

  # 3. 如果上述方法无效，使用PowerShell强制终止
  powershell -Command "Stop-Process -Id <PID> -Force"

  # 4. 批量终止所有Node.js进程（谨慎使用）
  taskkill /F /IM node.exe

  # 5. 验证端口已释放（无输出表示端口已释放）
  netstat -ano | findstr :5566
  ```

  **Linux/macOS系统**:
  ```bash
  # 1. 查找占用端口的进程
  lsof -i :5566

  # 2. 终止进程
  kill -9 <PID>

  # 3. 如果需要强制终止所有Node.js进程
  pkill -f node

  # 4. 验证端口已释放
  lsof -i :5566
  ```

  **通用解决步骤**:
  1. 首先尝试正常关闭相关应用程序（如浏览器、其他Node.js应用）
  2. 使用系统命令查找并终止占用端口的进程
  3. 如果问题持续存在，考虑重启系统
  4. 验证端口释放后重新启动Web服务器

  **预防措施**:
  - 使用`start-web.bat`脚本时，按任意键正常关闭服务器
  - 避免直接关闭命令行窗口，这可能导致进程残留
  - 定期检查并清理僵尸进程

#### 调试步骤

1. **手动启动测试**
   ```bash
   cd /path/to/simple-memory-mcp
   node src/server.js
   ```

2. **检查项目结构**
   ```bash
   ls src/server.js src/database.js src/tools.js
   ```

3. **测试简单输入**
   启动后输入：
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
   ```

4. **查看日志**
   - 检查Augment日志中的MCP相关错误消息
   - 查看控制台输出中的错误信息
   - 检查Windows事件查看器（如适用）

## 维护指南

### 定期维护任务
1. **每日**: 检查服务状态和日志
2. **每周**: 备份数据库文件
3. **每月**: 更新依赖包和安全补丁
4. **每季度**: 清理旧日志和备份文件

### 更新升级
```bash
# 更新项目依赖
npm update

# 检查安全漏洞
npm audit
npm audit fix

# 更新Node.js版本
# 下载新版本并重新安装
```

### 监控指标
- CPU和内存使用率
- 磁盘空间使用情况
- 网络连接数
- 响应时间和错误率
