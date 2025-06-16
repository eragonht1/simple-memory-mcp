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
