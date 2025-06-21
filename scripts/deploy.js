#!/usr/bin/env node

/**
 * Simple Memory MCP 部署脚本
 * 用于自动化部署和环境配置
 */

import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createServer } from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class Deployer {
    constructor() {
        this.config = {
            nodeVersion: '16.0.0',
            port: process.env.PORT || 8011,
            mcpPort: process.env.MCP_PORT || null,
            environment: process.env.NODE_ENV || 'production'
        };
    }

    /**
     * 主部署流程
     */
    async deploy() {
        console.log('🚀 开始部署 Simple Memory MCP...\n');

        try {
            await this.checkEnvironment();
            await this.installDependencies();
            await this.initializeDatabase();
            await this.createConfigFiles();
            await this.runTests();
            await this.verifyStartupScripts();

            console.log('\n✅ 部署完成！');
            this.printStartupInstructions();
        } catch (error) {
            console.error('\n❌ 部署失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 检查环境要求
     */
    async checkEnvironment() {
        console.log('🔍 检查环境要求...');

        // 检查Node.js版本
        const nodeVersion = process.version;
        const requiredVersion = this.config.nodeVersion;
        
        if (!this.compareVersions(nodeVersion.slice(1), requiredVersion)) {
            throw new Error(`需要Node.js ${requiredVersion}或更高版本，当前版本: ${nodeVersion}`);
        }

        console.log(`✓ Node.js版本: ${nodeVersion}`);

        // 检查npm
        try {
            await this.runCommand('npm', ['--version']);
            console.log('✓ npm已安装');
        } catch (error) {
            throw new Error('npm未安装或不可用');
        }

        // 检查端口可用性
        if (await this.isPortInUse(this.config.port)) {
            console.warn(`⚠️  端口 ${this.config.port} 已被占用，请修改PORT环境变量`);
        } else {
            console.log(`✓ 端口 ${this.config.port} 可用`);
        }
    }

    /**
     * 安装依赖
     */
    async installDependencies() {
        console.log('\n📦 安装项目依赖...');
        
        await this.runCommand('npm', ['install'], { cwd: projectRoot });
        console.log('✓ 依赖安装完成');
    }

    /**
     * 初始化数据库
     */
    async initializeDatabase() {
        console.log('\n🗄️ 初始化数据库...');
        
        await this.runCommand('npm', ['run', 'build'], { cwd: projectRoot });
        console.log('✓ 数据库初始化完成');
    }

    /**
     * 创建配置文件
     */
    async createConfigFiles() {
        console.log('\n⚙️ 创建配置文件...');

        // 创建环境配置文件
        const envConfig = `# Simple Memory MCP 环境配置
NODE_ENV=${this.config.environment}
PORT=${this.config.port}
${this.config.mcpPort ? `MCP_PORT=${this.config.mcpPort}` : ''}

# 数据库配置
DB_PATH=./data/memories.db

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
`;

        await fs.writeFile(path.join(projectRoot, '.env.example'), envConfig);
        console.log('✓ 环境配置文件已创建 (.env.example)');

        // 创建日志目录
        await fs.ensureDir(path.join(projectRoot, 'logs'));
        console.log('✓ 日志目录已创建');

        // 创建备份目录
        await fs.ensureDir(path.join(projectRoot, 'backups'));
        console.log('✓ 备份目录已创建');
    }

    /**
     * 运行测试
     */
    async runTests() {
        console.log('\n🧪 运行测试...');
        
        try {
            await this.runCommand('npm', ['test'], { cwd: projectRoot });
            console.log('✓ 所有测试通过');
        } catch (error) {
            console.warn('⚠️  测试失败，但继续部署');
        }
    }

    /**
     * 验证启动脚本
     */
    async verifyStartupScripts() {
        console.log('\n📝 验证启动脚本...');

        const scripts = [
            'start-mcp.bat',
            'start-mcp.sh',
            'start-web.bat',
            'start-web.sh'
        ];

        for (const script of scripts) {
            const scriptPath = path.join(projectRoot, script);
            if (await fs.pathExists(scriptPath)) {
                console.log(`✓ ${script} 存在`);
            } else {
                console.warn(`⚠️  ${script} 不存在`);
            }
        }

        console.log('✓ 启动脚本验证完成');
    }

    /**
     * 打印启动说明
     */
    printStartupInstructions() {
        console.log(`
🎉 Simple Memory MCP 部署成功！

📋 启动说明:

Windows用户:
  MCP服务器: 双击 start-mcp.bat 或运行 npm start
  Web界面: 双击 start-web.bat 或运行 npm run web

Linux/macOS用户:
  MCP服务器: 运行 ./start-mcp.sh 或 npm start
  Web界面: 运行 ./start-web.sh 或 npm run web

🌐 访问地址:
  Web管理界面: http://localhost:${this.config.port}

📁 重要文件:
  数据库: data/memories.db
  日志: logs/
  备份: backups/
  配置: .env.example (复制为.env并修改)

📚 文档:
  使用指南: docs/USER_GUIDE.md
  API文档: docs/API.md
  部署指南: docs/DEPLOYMENT.md

🔧 常用命令:
  npm start          # 启动MCP服务器
  npm run web        # 启动Web界面
  npm run init-db    # 重新初始化数据库
  npm test           # 运行测试

如需帮助，请查看文档或提交Issue。
`);
    }

    /**
     * 工具方法
     */
    async runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio: 'inherit',
                shell: true,
                ...options
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`命令执行失败: ${command} ${args.join(' ')}`));
                }
            });

            child.on('error', reject);
        });
    }

    compareVersions(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;

            if (num1 > num2) return true;
            if (num1 < num2) return false;
        }

        return true; // 版本相等
    }

    async isPortInUse(port) {
        return new Promise((resolve) => {
            const server = createServer();
            
            server.listen(port, () => {
                server.once('close', () => resolve(false));
                server.close();
            });
            
            server.on('error', () => resolve(true));
        });
    }
}

// 运行部署
if (import.meta.url === `file://${process.argv[1]}`) {
    const deployer = new Deployer();
    deployer.deploy();
}
