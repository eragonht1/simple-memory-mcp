#!/usr/bin/env node

/**
 * Simple Memory MCP服务器启动脚本
 * 跨平台启动脚本，支持Windows、Linux、macOS
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 注意：已移除进程清理逻辑以支持多个AI助手同时使用
// MCP协议天然支持多实例，每个AI助手可以独立启动自己的MCP服务器进程

// 启动MCP服务器
function startMCPServer() {
    log('🚀 启动MCP服务器...', 'cyan');
    log('📡 MCP服务器正在监听标准输入/输出', 'bright');
    log('💡 按 Ctrl+C 停止服务器', 'yellow');
    log('🔗 配置AI助手时请使用此脚本的完整路径', 'cyan');
    log('✨ 支持多个AI助手同时使用（Claude、Augment等）', 'green');
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
    log('🎯 多助手支持: 可在Claude、Augment等多个AI助手中同时配置', 'green');
    log('📝 建议: 为不同助手使用不同的服务器名称以便区分', 'cyan');
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
        // 移除进程清理逻辑，允许多个AI助手同时使用
        // await checkAndCleanExistingProcesses();
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