#!/usr/bin/env node

/**
 * Simple Memory MCP服务器启动脚本
 * 跨平台启动脚本，支持Windows、Linux、macOS
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

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

// 检查必要文件
function checkRequiredFiles() {
    log('🔍 检查必要文件...', 'cyan');
    
    const requiredFiles = [
        'src/server.js',
        'src/tools.js',
        'src/database.js',
        'package.json'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            log(`❌ 缺少必要文件: ${file}`, 'red');
            process.exit(1);
        }
    }
    
    log('✅ 必要文件检查通过', 'green');
}

// 检查数据库
function checkDatabase() {
    log('🔍 检查数据库...', 'cyan');
    
    const dataDir = path.join(__dirname, 'data');
    const dbFile = path.join(dataDir, 'memories.db');
    
    if (!fs.existsSync(dataDir)) {
        log('📁 创建数据目录...', 'yellow');
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(dbFile)) {
        log('⚠️ 数据库文件不存在，请先运行: npm run init-db', 'yellow');
        log('💡 或者运行: node scripts/init-database.js', 'cyan');
    } else {
        log('✅ 数据库检查通过', 'green');
    }
}

// 检测并清理已有的MCP服务器进程
async function checkAndCleanExistingProcesses() {
    log('🔍 检测现有MCP服务器进程...', 'cyan');

    try {
        let command;
        if (process.platform === 'win32') {
            // Windows: 查找node进程中包含server.js的
            command = 'wmic process where "name=\'node.exe\'" get commandline,processid /format:csv';
        } else {
            // Linux/macOS: 查找包含server.js的node进程
            command = 'ps aux | grep "[n]ode.*server.js"';
        }

        const { stdout } = await execAsync(command);

        if (stdout.trim()) {
            const lines = stdout.trim().split('\n');
            let foundProcess = false;
            
            for (const line of lines) {
                if (line.includes('server.js') && line.includes('simple-memory-mcp')) {
                    foundProcess = true;
                    log('⚠️ 发现已运行的MCP服务器进程，正在清理...', 'yellow');
                    
                    if (process.platform === 'win32') {
                        // Windows处理
                        const parts = line.split(',');
                        if (parts.length >= 3) {
                            const pid = parts[2].trim();
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
                        // Linux/macOS处理
                        const parts = line.trim().split(/\s+/);
                        const pid = parts[1];
                        if (pid && !isNaN(pid)) {
                            try {
                                await execAsync(`kill -9 ${pid}`);
                                log(`✅ 已终止进程 ${pid}`, 'green');
                            } catch (error) {
                                log(`⚠️ 无法终止进程 ${pid}`, 'yellow');
                            }
                        }
                    }
                    break;
                }
            }
            
            if (foundProcess) {
                // 等待进程完全终止
                await new Promise(resolve => setTimeout(resolve, 2000));
                log('✅ 进程清理完成', 'green');
            } else {
                log('✅ 未发现冲突的MCP服务器进程', 'green');
            }
        } else {
            log('✅ 未发现冲突的MCP服务器进程', 'green');
        }
    } catch (error) {
        log('ℹ️ 进程检测完成（未发现冲突进程）', 'cyan');
    }
}

// 启动MCP服务器
function startMCPServer() {
    log('🚀 启动MCP服务器...', 'cyan');
    log('📡 MCP服务器正在监听标准输入/输出', 'bright');
    log('💡 按 Ctrl+C 停止服务器', 'yellow');
    log('🔗 配置AI助手时请使用此脚本的完整路径', 'cyan');
    console.log('');
    
    const serverPath = path.join(__dirname, 'src', 'server.js');
    const child = spawn('node', [serverPath], {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    // 处理进程退出
    child.on('close', (code) => {
        if (code !== 0) {
            log(`❌ MCP服务器异常退出，代码: ${code}`, 'red');
        } else {
            log('✅ MCP服务器已正常关闭', 'green');
        }
    });
    
    child.on('error', (error) => {
        log(`❌ MCP服务器启动失败: ${error.message}`, 'red');
        process.exit(1);
    });
    
    // 处理Ctrl+C
    process.on('SIGINT', () => {
        log('\n🛑 正在关闭MCP服务器...', 'yellow');
        child.kill('SIGINT');
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
    
    process.on('SIGTERM', () => {
        log('\n🛑 正在关闭MCP服务器...', 'yellow');
        child.kill('SIGTERM');
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
}

// 显示配置信息
function showConfigurationInfo() {
    log('', 'reset');
    log('📋 AI助手配置信息:', 'bright');
    log('=' .repeat(50), 'cyan');
    log('配置文件路径（根据你的AI助手选择）:', 'yellow');
    log('', 'reset');
    log('通用配置模板:', 'cyan');
    log('```json', 'reset');
    log('{', 'reset');
    log('  "mcpServers": {', 'reset');
    log('    "simple-memory": {', 'reset');
    log('      "command": "node",', 'reset');
    log(`      "args": ["${path.join(__dirname, 'start-mcp.js')}"],`, 'reset');
    log(`      "cwd": "${__dirname}"`, 'reset');
    log('    }', 'reset');
    log('  }', 'reset');
    log('}', 'reset');
    log('```', 'reset');
    log('', 'reset');
    log('💡 提示: 请将上述路径替换为你的实际项目路径', 'yellow');
    log('=' .repeat(50), 'cyan');
    log('', 'reset');
}

// 主函数
async function main() {
    log('🧠 Simple Memory MCP服务器', 'bright');
    log('=' .repeat(50), 'cyan');

    try {
        checkNodeVersion();
        checkRequiredFiles();
        checkDatabase();
        await checkAndCleanExistingProcesses();
        showConfigurationInfo();
        startMCPServer();
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