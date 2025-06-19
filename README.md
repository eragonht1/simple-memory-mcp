# 🧠 Simple Memory MCP v1.2.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/eragonht1/simple-memory-mcp)
[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/eragonht1/simple-memory-mcp/releases)

A memory management system designed for AI assistants, implementing a complete Model Context Protocol (MCP) server with intelligent port management, drag-and-drop sorting, and LAN access support.
![sdg](https://github.com/user-attachments/assets/188a5179-4e9d-4975-9669-9be79a1059e4)

## ✨ Features

### 🎉 New in v1.2.0
- 🎯 **Fixed Drag & Drop Sorting**: Completely rebuilt drag-and-drop functionality with accurate position calculation
- 🌐 **Intelligent Port Management**: Automatic port detection, conflict resolution, and persistent allocation
- 🚀 **Professional Launcher**: Cross-platform Node.js launcher with colorful output and auto-cleanup
- 🏠 **LAN Access Support**: Automatic local IP detection and easy sharing across network devices
- 🔧 **Auto Process Cleanup**: Automatically detects and cleans up conflicting processes before startup

### 🎯 Core Functions
- **🔒 Secure Storage**: AI assistants must first ask users to provide titles, then input content
- **📋 Smart Retrieval**: First display title list, users select to get complete content
- **✏️ Flexible Management**: Support editing, deleting and searching memories
- **🌐 Web Interface**: Provide intuitive visual management interface
- **🔍 Full-text Search**: Support keyword search for titles and content

### 🛠️ MCP Tools
- `store_memory`: Store new memory (parameters: title, content)
- `list_memory_titles`: Get all memory title list
- `get_memory_by_title`: Get memory content by title (parameter: title)
- `delete_memory`: Delete specified memory (parameter: title)

### 💡 Use Cases
- **📚 Study Notes**: Store and manage learning materials
- **📝 Meeting Records**: Save important meeting content
- **📖 Article Collection**: Collect valuable articles and materials
- **💭 Idea Recording**: Record inspiration and creative ideas

## 🚀 Quick Start

### 📋 System Requirements
- **Node.js**: 16.0.0 or higher
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Memory**: 512MB RAM
- **Storage**: 100MB available space

### 📦 Installation Steps

1. **Clone Project**
```bash
git clone https://github.com/eragonht1/simple-memory-mcp.git
cd simple-memory-mcp
```

2. **Install Dependencies**
```bash
npm install
```

3. **Initialize Database**
```bash
npm run init-db
```

4. **Start Services**

**Option 1: Smart Port Management (Recommended)**
```bash
# Start Web Interface with intelligent port allocation
node start-web.js
# or
npm run web:start
```
*Features: Automatic port detection, conflict resolution, persistent port allocation*

**Option 2: Cross-platform Shell Scripts**
```bash
# Linux/macOS (with smart port management)
./start-web.sh
```

**Option 3: Traditional Commands**
```bash
# Start MCP Server
npm start

# Start Web Interface (new terminal window)
npm run web
```

5. **Access Web Interface**
- The browser will open automatically to the allocated port
- Port information is displayed in the bottom-right corner of the web interface
- Default port preference: 8011, but will auto-allocate if occupied

## 🤖 AI Assistant Configuration

### Configure Cursor IDE

1. **Open Cursor Settings**
   - Press `Ctrl/Cmd + ,` to open settings
   - Search for "MCP" or "Model Context Protocol"

2. **Add MCP Server Configuration**
   In Cursor MCP configuration:
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "node",
         "args": ["src/server.js"],
         "cwd": "g:\\docker\\McpApi\\simple-memory-mcp"
       }
     }
   }
   ```

3. **Restart Cursor**

### Configure Claude Desktop

1. **Find Configuration File**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Edit Configuration File**
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

3. **Restart Claude Desktop**

### Configure Augment

1. **Find Augment MCP Configuration**
   - Open Augment settings
   - Navigate to MCP configuration section

2. **Add MCP Server Configuration**

   **Option 1: Using startup script (Recommended)**
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "G:\\docker\\McpApi\\simple-memory-mcp\\start-mcp.sh",
         "args": []
       }
     }
   }
   ```

   **Option 2: Using absolute path**
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "node",
         "args": ["G:\\docker\\McpApi\\simple-memory-mcp\\src\\server.js"],
         "cwd": "G:\\docker\\McpApi\\simple-memory-mcp"
       }
     }
   }
   ```

   **Option 3: Using npm script**
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "npm",
         "args": ["start"],
         "cwd": "G:\\docker\\McpApi\\simple-memory-mcp"
       }
     }
   }
   ```

3. **Restart Augment**

### Troubleshooting

If you encounter issues with MCP configuration:

1. **Verify Node.js Installation**
   ```bash
   node --version
   npm --version
   ```

2. **Check Project Path**
   ```bash
   cd G:\docker\McpApi\simple-memory-mcp
   dir src\server.js
   ```

3. **Test Manual Startup**
   ```bash
   cd G:\docker\McpApi\simple-memory-mcp
   node src/server.js
   ```

4. **Common Issues**
   - **Path not found**: Use absolute paths in configuration
   - **Permission denied**: Ensure AI tool has access to project directory
   - **Module not found**: Run `npm install` in project directory
   - **Port conflicts**: Check if port 8011 is available for web interface

### Verify Configuration

After configuration, you can say to AI assistant:
```
Please help me store a memory
```

If configured successfully, AI assistant will ask you to provide title and content.

## 📖 Usage Guide

### 🤖 Through AI Assistant

#### Store Memory
```
User: Help me store a memory
AI: Please provide the title for this memory:
User: Study Notes - MCP Protocol
AI: Please enter the specific content of the memory:
User: [Enter detailed content]
AI: Memory successfully stored!
```

#### Retrieve Memory
```
User: Help me view previously stored content
AI: You have the following memories:
    1. Study Notes - MCP Protocol (Today)
    2. Meeting Record - Project Discussion (Yesterday)
    Please select the memory to view:
User: Study Notes - MCP Protocol
AI: [Return complete content]
```

### 🌐 Through Web Interface

1. **View Memories**: Browse all memory cards on main page
2. **Add Memory**: Click "➕ Add Memory" button
3. **Edit Memory**: Click "✏️ Edit" button on memory card
4. **Delete Memory**: Click "🗑️ Delete" button and confirm
5. **Search Memory**: Use top search box to find specific content

## 🏗️ Project Structure

```
simple-memory-mcp/
├── 📁 src/                    # Source code directory
│   ├── 🔧 server.js          # MCP server main file
│   ├── 🗄️ database.js        # Database operations
│   ├── 🛠️ tools.js           # MCP tool definitions
│   └── 📁 web/               # Web interface
│       ├── 🌐 app.js         # Express server
│       ├── 📁 public/        # Static files
│       │   ├── 🎨 styles.css # Stylesheet
│       │   └── ⚡ script.js  # Frontend script
│       └── 📁 views/         # HTML templates
│           └── 📄 index.html # Main page
├── 📁 data/                  # Database files
├── 📁 docs/                  # Documentation
│   ├── 📚 API.md            # API documentation
│   ├── 📖 USER_GUIDE.md     # User guide
│   ├── 🚀 DEPLOYMENT.md     # Deployment guide
│   └── 🔧 DEVELOPMENT.md    # Development docs
├── 📁 scripts/              # Utility scripts
│   ├── 🔨 init-database.js  # Database initialization
│   └── 🚀 deploy.js         # Deployment script
├── 📄 start-mcp.sh          # Unix MCP startup script
├── 📄 start-web.js          # Professional Web launcher (Node.js)
├── 📄 start-web.sh          # Unix Web startup script
├── 📄 package.json          # Project configuration
├── 📄 README.md             # Project documentation
└── 📄 LICENSE               # Open source license
```

## 🔧 Tech Stack

- **🔙 Backend**: Node.js + Express.js
- **🗄️ Database**: SQLite3
- **🎨 Frontend**: Material Design with HTML/CSS/JavaScript
- **📡 Protocol**: Model Context Protocol (MCP)
- **🔗 Communication**: JSON-RPC 2.0, REST API

## 📚 Documentation

- [📖 User Guide](docs/USER_GUIDE.md) - Detailed usage instructions
- [📚 API Documentation](docs/API.md) - MCP tools and REST API docs
- [🚀 Deployment Guide](docs/DEPLOYMENT.md) - Production deployment and AI tool configuration
- [🔧 Development Docs](docs/DEVELOPMENT.md) - Developer guide and architecture
- [🛡️ Data Privacy Protection](DATA_PRIVACY.md) - Privacy protection measures and security guidelines

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep "database"

# Generate test coverage report
npm run test:coverage
```

## 🤝 Contributing

We welcome all forms of contributions! Please check [Contributing Guide](docs/DEVELOPMENT.md#contributing) for detailed information.

### 🐛 Report Issues
If you find bugs or have feature suggestions, please [Create Issue](https://github.com/eragonht1/simple-memory-mcp/issues).

### 💻 Submit Code
1. Fork project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## 📄 License

This project uses MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to [Model Context Protocol](https://modelcontextprotocol.io/) for providing protocol standards
- Thanks to all contributors for support and help

## 📞 Support

If you need help or have any questions:

- 📧 Email: support@example.com
- 💬 Discussions: [GitHub Discussions](https://github.com/eragonht1/simple-memory-mcp/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/eragonht1/simple-memory-mcp/issues)

---

## 📋 工作登记

### 2024-12-19 修复Web应用启动错误
**时间**: 2024-12-19  
**操作1**: 修复了src/web/app.js文件中缺少express导入语句的问题，并将默认端口从5566改为8011以避免权限错误。Web服务器成功启动在http://localhost:8011。  
**操作2**: 应用户要求将端口修改为8011，Web服务器现已重新启动在http://localhost:8011。  
**操作3**: 全面检查并统一修改项目中所有文件的端口配置，将5566和3000全部替换为8011，确保配置一致性。涉及文件包括：API.md、DEPLOYMENT.md、.env.example、DEVELOPMENT.md、USER_GUIDE.md、start-web.bat、start-web.sh、deploy.js等。

### 项目目录结构
```
simple-memory-mcp/
├── src/
│   ├── database.js          # 数据库操作
│   ├── server.js            # MCP服务器
│   ├── tools.js             # MCP工具实现
│   └── web/
│       ├── app.js           # Web应用主文件
│       └── views/           # 视图模板
├── data/                    # 数据存储目录
├── docs/                    # 文档目录
├── scripts/                 # 脚本目录
├── tests/                   # 测试目录
├── package.json             # 项目配置
└── README.md               # 项目说明
```

---

⭐ If this project helps you, please give us a star!
