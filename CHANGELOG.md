# 更新日志

## [1.3.0] - 2025-06-21

### 🎯 MCP工具优化

#### 📋 list_memory_titles 功能优化
- **移除冗余数据**：`list_memory_titles` 工具不再返回 `preview` 字段，只保留 `title` 和 `created_at`
- **性能提升**：减少数据传输量，提高MCP工具响应速度
- **数据库查询优化**：为MCP工具创建专用的轻量级查询方法
- **架构分离**：MCP工具和Web界面使用不同的数据查询方法，各自优化

### 🎨 Web界面重大改进

#### 📋 一键复制功能
- **新增复制按钮**：每个记忆卡片添加复制按钮（绿色图标）
- **纯文本格式**：复制内容格式为"标题\n\n内容"，便于粘贴使用
- **兼容性支持**：支持现代浏览器的 `navigator.clipboard` API 和传统的 `document.execCommand`
- **用户反馈**：复制成功/失败时显示相应提示信息

#### 🔄 按钮布局优化
- **新的按钮顺序**：编辑 → 复制 → 删除（从左到右）
- **视觉区分**：编辑（橙色）、复制（绿色）、删除（红色）
- **Material Icons**：使用 `content_copy` 图标表示复制功能

#### 🕒 时间显示改进
- **24小时制格式**：时间显示改为"2025年6月21日 18:24"格式
- **中文本地化**：使用中文的"年月日"表示法
- **自动补零**：小时和分钟自动补零显示（如：08:05）

#### 📱 模态框尺寸优化
- **modal-header 高度**：调整为55px，提供更舒适的视觉体验
- **form-actions 高度**：桌面端70px，移动端自适应高度
- **响应式设计**：修复手机端按钮居中问题，确保按钮正常垂直排列

### 🐛 重要Bug修复

#### 🔧 预览编辑功能修复
- **修复空指针错误**：解决从记忆预览窗口点击编辑按钮时的 `Cannot read properties of null (reading 'title')` 错误
- **状态管理优化**：改进 `editFromView()` 方法的状态处理逻辑
- **用户体验提升**：确保预览→编辑的流程顺畅无阻

#### 📱 移动端适配修复
- **按钮布局修复**：解决手机端 `form-actions` 按钮挤压居中的问题
- **高度自适应**：手机端使用 `height: auto` 让按钮区域自适应内容
- **内边距优化**：统一桌面端和移动端的内边距设置

### 🛠️ 技术架构改进

#### 🗄️ 数据库层优化
- **方法分离**：创建 `getMemoryTitles()` 和 `getMemoryTitlesWithPreview()` 两个方法
- **性能优化**：MCP工具使用轻量级查询，Web界面保持完整功能
- **代码清晰度**：明确区分不同使用场景的数据需求

#### 🎨 前端代码重构
- **错误处理增强**：改进复制功能的错误处理和降级机制
- **代码模块化**：优化JavaScript代码结构，提高可维护性
- **CSS响应式**：完善移动端样式适配

### 📚 文档更新
- **API文档更新**：更新 `list_memory_titles` 工具的返回值示例
- **功能说明完善**：添加复制功能和时间格式的详细说明
- **版本历史记录**：完整记录所有改进和修复内容

---

## [1.2.0] - 2024-12-19

### 🎉 重大功能更新

#### 🔧 拖拽排序功能修复
- **修复拖拽索引计算错误**：解决了从第4个卡片拖动到第3个位置却移动到第1个位置的问题
- **优化位置计算算法**：重新设计了适配网格布局的拖拽位置计算
- **修复数据持久化逻辑**：确保拖拽后的排序正确保存到数据库
- **改进用户体验**：添加拖拽动画效果、视觉反馈和成功提示
- **增强错误处理**：添加自动重试机制和状态回滚功能

#### 🌐 智能端口管理系统
- **统一端口配置管理**：新增 `src/config/ports.config.js` 配置文件
- **自动端口检测和分配**：智能避让端口冲突，不再强制终止其他进程
- **端口持久化存储**：记住上次分配的端口，重启时优先使用
- **跨平台端口管理**：支持Windows、Linux、macOS的端口检测
- **智能冲突解决**：端口被占用时自动寻找可用端口

#### 🚀 专业启动器
- **Node.js专业启动器**：新增 `start-web.js` 跨平台启动脚本
- **自动进程清理**：启动前自动检测并清理占用端口的进程
- **彩色输出和状态提示**：美观的启动日志和状态显示
- **自动浏览器打开**：启动后自动打开浏览器到正确端口
- **优雅关闭处理**：支持Ctrl+C正确关闭服务器

#### 🌍 局域网访问支持
- **自动IP检测**：服务器端自动检测本机局域网IP地址
- **局域网地址显示**：Web界面右下角显示局域网访问地址
- **一键复制功能**：点击局域网地址可复制到剪贴板
- **多设备访问**：局域网内其他设备可直接访问Web界面

### 🛠️ 技术改进

#### 架构优化
- **PortManager服务**：新增统一的端口管理服务类
- **配置系统重构**：支持环境特定配置和优先级策略
- **错误处理增强**：完善的错误处理和用户友好提示
- **日志系统改进**：结构化日志输出和调试信息

#### 用户体验提升
- **启动方式多样化**：
  - `node start-web.js` - 推荐的专业启动器
  - `npm run web:start` - npm脚本方式
  - `./start-web.sh` - Linux/macOS脚本
- **智能端口分配策略**：上次使用 → 首选端口 → 配置范围 → 备用范围 → 全局扫描
- **实时状态显示**：端口信息、IP地址、服务状态实时更新

### 📚 文档更新
- **新增端口管理文档**：`docs/PORT_MANAGEMENT.md` 详细说明端口管理系统
- **更新用户指南**：`docs/USER_GUIDE.md` 包含新的启动方式
- **更新README**：添加智能端口管理和局域网访问说明
- **API文档更新**：新增系统信息API接口文档

### 🗂️ 项目结构优化
- **配置文件整理**：删除冗余的.bat文件，保持项目整洁
- **跨平台支持**：统一的Node.js启动器替代平台特定脚本
- **模块化设计**：端口管理、配置系统等模块化实现

### 🔧 Bug修复
- 修复拖拽排序中的索引计算错误
- 修复端口占用检测的竞态条件问题
- 修复网格布局中的拖拽位置计算
- 修复数据库排序值更新不一致的问题
- 修复多次启动时的端口冲突问题

### ⚡ 性能优化
- 优化端口扫描算法，减少检测时间
- 改进拖拽响应性能
- 优化数据库查询和排序逻辑
- 减少不必要的网络请求

---

## [1.1.0] - 2024-12-18

### 新增功能
- Web管理界面拖拽排序功能
- 记忆卡片网格布局
- 基础的端口管理

### 改进
- 用户界面优化
- 数据库性能提升

---

## [1.0.0] - 2024-12-17

### 初始版本
- MCP服务器基础功能
- 记忆存储和检索
- Web管理界面
- SQLite数据库支持
- 基础的CRUD操作

---

## 版本说明

### 版本号规则
- **主版本号**：重大架构变更或不兼容更新
- **次版本号**：新功能添加或重要改进
- **修订版本号**：Bug修复和小幅改进

### 升级建议
- **从1.2.x升级到1.3.0**：
  1. 备份现有数据（推荐）
  2. 更新代码到最新版本
  3. 重启MCP服务器以应用MCP工具优化
  4. 重启Web界面以体验新的复制功能和界面改进
  5. 享受更高效的记忆管理体验

- **从1.1.x升级到1.2.0**：
  1. 备份现有数据
  2. 更新代码
  3. 使用新的启动方式：`node start-web.js`
  4. 享受智能端口管理和局域网访问功能

### 兼容性
- **向后兼容**：1.3.0完全兼容1.2.x和1.1.x的数据和配置
- **API兼容**：所有现有API接口保持兼容，仅优化返回数据结构
- **配置兼容**：现有配置文件无需修改
- **数据兼容**：现有数据库结构无变化，无需迁移
