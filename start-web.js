#!/usr/bin/env node

/**
 * Simple Memory MCP Web服务器启动脚本
 * 跨平台启动脚本，支持Windows、Linux、macOS
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { portManager } from './src/services/PortManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// 动态配置
let PORT = null;
let WEB_URL = null;

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查Node.js版本
function checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion < 14) {
        log('❌ 错误: 需要Node.js 14或更高版本', 'red');
        log(`当前版本: ${version}`, 'yellow');
        log('请访问 https://nodejs.org/ 下载最新版本', 'cyan');
        process.exit(1);
    }
    
    log(`✅ Node.js版本检查通过: ${version}`, 'green');
}

// 检测并清理已有的Web服务器进程
async function checkAndCleanExistingProcesses() {
    log('🔍 检测现有Web服务器进程...', 'cyan');

    try {
        let command;
        if (process.platform === 'win32') {
            // Windows: 查找占用8011端口的进程
            command = 'netstat -ano | findstr :8011';
        } else {
            // Linux/macOS: 查找占用8011端口的进程
            command = 'lsof -Pi :8011 -sTCP:LISTEN -t';
        }

        const { stdout } = await execAsync(command);

        if (stdout.trim()) {
            log('⚠️ 发现端口8011被占用，正在清理...', 'yellow');

            if (process.platform === 'win32') {
                // Windows: 从netstat输出中提取PID
                const lines = stdout.trim().split('\n');
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && !isNaN(pid)) {
                        try {
                            await execAsync(`taskkill /PID ${pid} /F`);
                            log(`✅ 已终止进程 ${pid}`, 'green');
                        } catch (error) {
                            log(`⚠️ 无法终止进程 ${pid}`, 'yellow');
                        }
                    }
                }
            } else {
                // Linux/macOS: lsof直接返回PID
                const pids = stdout.trim().split('\n');
                for (const pid of pids) {
                    if (pid && !isNaN(pid)) {
                        try {
                            await execAsync(`kill -9 ${pid}`);
                            log(`✅ 已终止进程 ${pid}`, 'green');
                        } catch (error) {
                            log(`⚠️ 无法终止进程 ${pid}`, 'yellow');
                        }
                    }
                }
            }

            // 等待端口释放
            await new Promise(resolve => setTimeout(resolve, 3000));
            log('✅ 端口清理完成', 'green');
        } else {
            log('✅ 端口8011可用', 'green');
        }
    } catch (error) {
        log('ℹ️ 进程检测完成（未发现冲突进程）', 'cyan');
    }
}

// 分配端口
async function allocatePort() {
    log('🔍 正在分配端口...', 'cyan');

    try {
        // 使用端口管理器分配端口
        PORT = await portManager.allocatePort('web');

        if (!PORT) {
            throw new Error('无法分配端口给Web服务器');
        }

        WEB_URL = `http://localhost:${PORT}`;
        log(`✅ 已分配端口: ${PORT}`, 'green');

    } catch (error) {
        log(`❌ 端口分配失败: ${error.message}`, 'red');
        throw error;
    }
}

// 启动Web服务器
function startWebServer() {
    log('🚀 启动Web服务器...', 'cyan');
    log(`📍 服务器地址: ${WEB_URL}`, 'bright');
    log('💡 按 Ctrl+C 停止服务器', 'yellow');
    console.log('');
    
    const webServerPath = path.join(__dirname, 'src', 'web', 'app.js');
    const child = spawn('node', [webServerPath], {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    // 等待服务器启动后打开浏览器
    setTimeout(() => {
        openBrowser();
    }, 3000);
    
    // 处理进程退出
    child.on('close', (code) => {
        if (code !== 0) {
            log(`❌ Web服务器异常退出，代码: ${code}`, 'red');
        } else {
            log('✅ Web服务器已正常关闭', 'green');
        }
    });
    
    // 处理Ctrl+C
    process.on('SIGINT', () => {
        log('\n🛑 正在关闭Web服务器...', 'yellow');
        child.kill('SIGINT');
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
    
    process.on('SIGTERM', () => {
        log('\n🛑 正在关闭Web服务器...', 'yellow');
        child.kill('SIGTERM');
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
}

// 打开浏览器
async function openBrowser() {
    log('🌐 正在打开浏览器...', 'cyan');
    
    try {
        let command;
        if (process.platform === 'win32') {
            command = `start ${WEB_URL}`;
        } else if (process.platform === 'darwin') {
            command = `open ${WEB_URL}`;
        } else {
            command = `xdg-open ${WEB_URL}`;
        }
        
        await execAsync(command);
        log('✅ 浏览器已打开', 'green');
    } catch (error) {
        log('❌ 无法自动打开浏览器', 'yellow');
        log(`请手动访问: ${WEB_URL}`, 'cyan');
    }
}

// 主函数
async function main() {
    log('🧠 Simple Memory MCP Web管理界面', 'bright');
    log('=' .repeat(50), 'cyan');

    try {
        checkNodeVersion();
        await checkAndCleanExistingProcesses();
        await allocatePort();
        startWebServer();
    } catch (error) {
        log(`❌ 启动失败: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 运行主函数
main().catch(error => {
    log(`❌ 未处理的错误: ${error.message}`, 'red');
    process.exit(1);
});
