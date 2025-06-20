/**
 * Simple Memory MCP - Web服务器管理模块
 * 管理Web服务器的启动、停止和状态检查
 */

import { spawn, exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { portManager } from './PortManager.js';
import os from 'os';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

export class WebServerManager {
    constructor() {
        this.webProcess = null;
        this.isRunning = false;
        this.port = null;
        this.startTime = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.shouldStop = false; // 添加停止标志
        this.retryTimeout = null; // 添加重试定时器引用
    }

    /**
     * 检查指定端口是否被占用
     */
    async checkPortInUse(port) {
        try {
            const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
            return stdout.trim().length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * 检查Web服务器是否正在运行
     */
    isWebServerRunning() {
        return this.isRunning && this.webProcess && !this.webProcess.killed;
    }

    /**
     * 增强的Web服务器状态检测
     */
    async isWebServerActuallyRunning() {
        const processRunning = this.isWebServerRunning();
        if (!this.port) {
            return processRunning;
        }

        const portInUse = await this.checkPortInUse(this.port);

        // 如果端口被占用但进程状态显示未运行，可能是状态不同步
        if (portInUse && !processRunning) {
            console.warn(`⚠️ 端口${this.port}被占用，但进程状态显示未运行，可能存在状态不同步`);
        }

        return processRunning && portInUse;
    }

    /**
     * 获取Web服务器状态信息
     */
    getStatus() {
        return {
            isRunning: this.isWebServerRunning(),
            port: this.port,
            pid: this.webProcess ? this.webProcess.pid : null,
            startTime: this.startTime,
            uptime: this.startTime ? Date.now() - this.startTime : 0
        };
    }

    /**
     * 启动Web服务器
     */
    async startWebServer() {
        // 使用增强的状态检测
        if (await this.isWebServerActuallyRunning()) {
            console.log('🌐 Web服务器已在运行中');
            return {
                success: true,
                message: 'Web服务器已在运行',
                port: this.port,
                url: `http://localhost:${this.port}`
            };
        }

        // 检查端口是否被其他进程占用
        if (this.port && await this.checkPortInUse(this.port)) {
            console.warn(`⚠️ 端口${this.port}已被其他进程占用，尝试分配新端口`);
            this.port = null; // 重置端口，强制重新分配
        }

        // 重置停止标志
        this.shouldStop = false;

        try {
            // 分配端口
            this.port = await portManager.allocatePort('web');
            if (!this.port) {
                throw new Error('无法分配端口给Web服务器');
            }

            // 启动Web服务器进程
            const webServerPath = path.resolve(__dirname, '..', 'web', 'app.js');
            
            console.log('🚀 正在启动Web服务器...');
            
            this.webProcess = spawn('node', [webServerPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: path.resolve(__dirname, '..', '..'),
                env: {
                    ...process.env,
                    WEB_PORT: this.port.toString()
                },
                detached: false
            });

            // 设置进程状态
            this.isRunning = true;
            this.startTime = Date.now();
            this.retryCount = 0;

            // 处理进程输出
            this.webProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`[Web服务器] ${output}`);
                }
            });

            this.webProcess.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output && !output.includes('ExperimentalWarning')) {
                    console.error(`[Web服务器错误] ${output}`);
                }
            });

            // 处理进程退出
            this.webProcess.on('close', (code) => {
                this.isRunning = false;
                this.webProcess = null;

                if (code !== 0 && !this.shouldStop) {
                    console.error(`❌ Web服务器异常退出，代码: ${code}`);

                    // 自动重试（只有在未被要求停止时才重试）
                    if (this.retryCount < this.maxRetries && !this.shouldStop) {
                        this.retryCount++;
                        console.log(`🔄 正在重试启动Web服务器 (${this.retryCount}/${this.maxRetries})...`);
                        this.retryTimeout = setTimeout(() => {
                            if (!this.shouldStop) {
                                this.startWebServer();
                            }
                        }, 2000);
                    } else if (this.retryCount >= this.maxRetries) {
                        console.error(`❌ Web服务器重试次数已达上限 (${this.maxRetries})，停止重试`);
                    }
                } else {
                    console.log('✅ Web服务器已正常关闭');
                }
            });

            this.webProcess.on('error', (error) => {
                console.error('❌ Web服务器启动失败:', error.message);
                this.isRunning = false;
                this.webProcess = null;
            });

            // 等待服务器启动
            await this.waitForServerReady();

            const url = `http://localhost:${this.port}`;
            console.log(`✅ Web服务器启动成功: ${url}`);

            return {
                success: true,
                message: 'Web服务器启动成功',
                port: this.port,
                url: url,
                pid: this.webProcess.pid
            };

        } catch (error) {
            console.error('❌ Web服务器启动失败:', error.message);
            this.isRunning = false;
            this.webProcess = null;
            
            // 释放端口
            if (this.port) {
                await portManager.releasePort('web');
                this.port = null;
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 等待服务器准备就绪
     */
    async waitForServerReady(timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (this.webProcess && !this.webProcess.killed) {
                // 简单等待，让服务器有时间启动
                await new Promise(resolve => setTimeout(resolve, 1000));
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('Web服务器启动超时');
    }

    /**
     * 停止重试机制
     */
    stopRetrying() {
        this.shouldStop = true;
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
        console.log('🛑 已停止Web服务器重试机制');
    }

    /**
     * 强制停止所有占用指定端口的进程
     */
    async forceStopPortProcesses(port) {
        try {
            console.log(`🔍 检查端口${port}的占用情况...`);
            const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);

            if (stdout.trim()) {
                const lines = stdout.trim().split('\n');
                const pids = new Set();

                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 5 && parts[1].includes(`${port}`)) {
                        const pid = parts[4];
                        if (pid && pid !== '0') {
                            pids.add(pid);
                        }
                    }
                }

                if (pids.size > 0) {
                    console.log(`🛑 发现${pids.size}个进程占用端口${port}，正在停止...`);
                    for (const pid of pids) {
                        try {
                            await execAsync(`taskkill /PID ${pid} /F`);
                            console.log(`✅ 已停止进程 PID: ${pid}`);
                        } catch (error) {
                            console.warn(`⚠️ 停止进程 PID ${pid} 失败: ${error.message}`);
                        }
                    }

                    // 等待一段时间让进程完全停止
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return true;
                }
            }

            console.log(`✅ 端口${port}未被占用`);
            return true;

        } catch (error) {
            console.error(`❌ 检查/停止端口${port}进程失败:`, error.message);
            return false;
        }
    }

    /**
     * 停止Web服务器
     */
    async stopWebServer() {
        // 首先停止重试机制
        this.stopRetrying();

        if (!this.isWebServerRunning()) {
            return {
                success: true,
                message: 'Web服务器未在运行'
            };
        }

        try {
            console.log('🛑 正在停止Web服务器...');

            // 发送终止信号
            this.webProcess.kill('SIGTERM');
            
            // 等待进程结束
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    // 强制终止
                    if (this.webProcess && !this.webProcess.killed) {
                        this.webProcess.kill('SIGKILL');
                    }
                    resolve();
                }, 5000);
                
                this.webProcess.on('close', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });

            // 释放端口
            if (this.port) {
                await portManager.releasePort('web');
                this.port = null;
            }

            this.isRunning = false;
            this.webProcess = null;
            this.startTime = null;
            this.retryCount = 0; // 重置重试计数器
            this.shouldStop = false; // 重置停止标志

            console.log('✅ Web服务器已停止');
            
            return {
                success: true,
                message: 'Web服务器已停止'
            };

        } catch (error) {
            console.error('❌ 停止Web服务器失败:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 重启Web服务器
     */
    async restartWebServer() {
        console.log('🔄 正在重启Web服务器...');
        
        const stopResult = await this.stopWebServer();
        if (!stopResult.success) {
            return stopResult;
        }

        // 等待一段时间确保端口释放
        await new Promise(resolve => setTimeout(resolve, 2000));

        return await this.startWebServer();
    }

    /**
     * 获取本机局域网IP地址
     */
    getLocalIP() {
        const interfaces = os.networkInterfaces();
        const candidates = [];

        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    const ip = iface.address;
                    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
                        candidates.push({
                            ip: ip,
                            interface: name,
                            priority: ip.startsWith('192.168.') ? 1 : 2
                        });
                    }
                }
            }
        }

        if (candidates.length > 0) {
            candidates.sort((a, b) => a.priority - b.priority);
            return candidates[0].ip;
        }

        return 'localhost';
    }

    /**
     * 获取Web服务器访问URL
     */
    getWebUrl() {
        if (!this.port) {
            return null;
        }

        const localIP = this.getLocalIP();
        return {
            local: `http://localhost:${this.port}`,
            lan: `http://${localIP}:${this.port}`
        };
    }

    /**
     * 完全停止Web服务器（包括强制停止端口进程）
     */
    async forceStopWebServer() {
        console.log('🛑 正在强制停止Web服务器...');

        // 停止重试机制
        this.stopRetrying();

        // 先尝试优雅停止
        if (this.isWebServerRunning()) {
            await this.stopWebServer();
        }

        // 强制停止端口进程
        if (this.port) {
            await this.forceStopPortProcesses(this.port);
        }

        // 重置所有状态
        this.isRunning = false;
        this.webProcess = null;
        this.startTime = null;
        this.retryCount = 0;
        this.shouldStop = false;

        console.log('✅ Web服务器已完全停止');

        return {
            success: true,
            message: 'Web服务器已完全停止'
        };
    }

    /**
     * 清理资源
     */
    async cleanup() {
        // 停止重试机制
        this.stopRetrying();

        if (this.isWebServerRunning()) {
            await this.stopWebServer();
        }
    }
}

// 创建单例实例
export const webServerManager = new WebServerManager();
export default webServerManager;
