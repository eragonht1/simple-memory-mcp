# 数据隐私保护说明

## 概述

本项目已配置完善的数据隐私保护措施，确保您的私人记忆数据不会被意外推送到GitHub或其他版本控制系统。

## 受保护的文件类型

### 数据库文件
- `data/*.db` - SQLite数据库文件
- `data/*.sqlite` - SQLite数据库文件
- `data/*.sqlite3` - SQLite3数据库文件
- `data/memories.db` - 主要的记忆数据库文件

### JSON数据文件
- `data/*.json` - 数据目录中的所有JSON文件
- `data/memories.json` - JSON格式的记忆数据
- `data/config.json` - 用户配置文件
- `data/user-data.json` - 用户数据文件

### 日志文件
- `logs/` - 日志目录
- `*.log` - 所有日志文件
- `app.log` - 应用程序日志
- `error.log` - 错误日志
- `combined.log` - 综合日志

### 环境配置文件
- `.env.local` - 本地环境配置
- `.env.development` - 开发环境配置
- `.env.staging` - 测试环境配置
- `.env.production.local` - 生产环境本地配置

### 备份文件
- `backups/` - 备份目录
- `backup/` - 备份目录
- `*.bak` - 备份文件
- `*.backup` - 备份文件

### 用户配置文件
- `config/user.json` - 用户特定配置
- `config/local.json` - 本地配置
- `user-config.json` - 用户配置文件

## 安全措施

### 1. Git忽略规则
所有敏感文件都已添加到`.gitignore`文件中，确保它们不会被Git跟踪。

### 2. 历史清理
已从Git历史中移除`data/memories.db`文件，但保留了本地文件，确保您的数据不会丢失。

### 3. 未来保护
新创建的数据文件、日志文件和配置文件都会自动被忽略，无需手动配置。

## 验证保护状态

您可以使用以下命令验证数据保护是否正常工作：

```bash
# 检查Git状态，确保没有敏感文件被跟踪
git status

# 检查忽略规则是否生效
git check-ignore data/memories.db
git check-ignore logs/app.log
```

如果文件被正确忽略，`git check-ignore`命令会返回文件路径。

## 注意事项

1. **本地文件安全**：虽然文件不会被推送到远程仓库，但请确保本地文件系统的安全性。

2. **备份策略**：建议定期备份您的数据文件到安全的位置。

3. **权限管理**：确保数据目录的文件权限设置正确，只有必要的用户可以访问。

4. **环境变量**：如果使用环境变量存储敏感信息，请确保不要将`.env`文件提交到版本控制。

## 恢复数据

如果您需要在新环境中恢复数据：

1. 将备份的数据库文件复制到`data/`目录
2. 确保文件权限正确
3. 重启MCP服务

## 联系支持

如果您对数据隐私保护有任何疑问或需要额外的安全措施，请查阅项目文档或联系技术支持。
