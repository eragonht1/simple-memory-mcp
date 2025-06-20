/**
 * Simple Memory MCP - 跨平台浏览器启动器
 * 支持Windows、Linux、macOS系统的浏览器自动启动
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export class BrowserLauncher {
    constructor() {
        this.platform = os.platform();
        this.supportedPlatforms = ['win32', 'darwin', 'linux'];
    }

    /**
     * 检查当前平台是否支持
     */
    isPlatformSupported() {
        return this.supportedPlatforms.includes(this.platform);
    }

    /**
     * 获取平台信息
     */
    getPlatformInfo() {
        return {
            platform: this.platform,
            arch: os.arch(),
            release: os.release(),
            supported: this.isPlatformSupported()
        };
    }

    /**
     * 获取默认浏览器启动命令
     */
    getBrowserCommand(url) {
        switch (this.platform) {
            case 'win32':
                // Windows: 使用start命令
                return `start "" "${url}"`;
            
            case 'darwin':
                // macOS: 使用open命令
                return `open "${url}"`;
            
            case 'linux':
                // Linux: 尝试多个命令
                return `xdg-open "${url}"`;
            
            default:
                throw new Error(`不支持的操作系统: ${this.platform}`);
        }
    }

    /**
     * 获取备用浏览器启动命令（Linux专用）
     */
    getLinuxFallbackCommands(url) {
        return [
            `xdg-open "${url}"`,
            `gnome-open "${url}"`,
            `kde-open "${url}"`,
            `firefox "${url}"`,
            `google-chrome "${url}"`,
            `chromium-browser "${url}"`,
            `sensible-browser "${url}"`
        ];
    }

    /**
     * 启动浏览器打开指定URL
     */
    async openBrowser(url, options = {}) {
        const {
            timeout = 10000,
            retryCount = 2,
            fallback = true
        } = options;

        if (!this.isPlatformSupported()) {
            return {
                success: false,
                error: `不支持的操作系统: ${this.platform}`,
                platform: this.platform
            };
        }

        if (!url) {
            return {
                success: false,
                error: 'URL参数不能为空'
            };
        }

        console.log(`🌐 正在打开浏览器: ${url}`);
        console.log(`📱 操作系统: ${this.platform}`);

        try {
            // 尝试主要命令
            const command = this.getBrowserCommand(url);
            const result = await this.executeCommand(command, timeout);
            
            if (result.success) {
                console.log('✅ 浏览器启动成功');
                return {
                    success: true,
                    message: '浏览器启动成功',
                    command: command,
                    platform: this.platform,
                    url: url
                };
            }

            // 如果主要命令失败且启用了fallback
            if (fallback && this.platform === 'linux') {
                console.log('⚠️ 主要命令失败，尝试备用命令...');
                return await this.tryLinuxFallback(url, timeout);
            }

            return {
                success: false,
                error: result.error,
                command: command,
                platform: this.platform
            };

        } catch (error) {
            console.error('❌ 浏览器启动失败:', error.message);
            
            return {
                success: false,
                error: error.message,
                platform: this.platform
            };
        }
    }

    /**
     * 尝试Linux备用命令
     */
    async tryLinuxFallback(url, timeout) {
        const fallbackCommands = this.getLinuxFallbackCommands(url);
        
        for (let i = 0; i < fallbackCommands.length; i++) {
            const command = fallbackCommands[i];
            console.log(`🔄 尝试备用命令 ${i + 1}/${fallbackCommands.length}: ${command.split(' ')[0]}`);
            
            const result = await this.executeCommand(command, timeout);
            
            if (result.success) {
                console.log(`✅ 备用命令成功: ${command.split(' ')[0]}`);
                return {
                    success: true,
                    message: '浏览器启动成功（使用备用命令）',
                    command: command,
                    platform: this.platform,
                    url: url,
                    fallback: true
                };
            }
        }

        return {
            success: false,
            error: '所有浏览器启动命令都失败了',
            platform: this.platform,
            triedCommands: fallbackCommands.length
        };
    }

    /**
     * 执行系统命令
     */
    async executeCommand(command, timeout = 10000) {
        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: timeout,
                windowsHide: true // Windows下隐藏命令行窗口
            });

            return {
                success: true,
                stdout: stdout,
                stderr: stderr
            };

        } catch (error) {
            // 对于浏览器启动命令，某些"错误"实际上是正常的
            // 例如，命令可能会在浏览器启动后立即返回非零退出码
            if (error.code === 'ENOENT') {
                return {
                    success: false,
                    error: '命令不存在或无法执行'
                };
            }

            // 超时错误
            if (error.signal === 'SIGTERM') {
                return {
                    success: false,
                    error: '命令执行超时'
                };
            }

            // 对于浏览器启动，非零退出码不一定表示失败
            // 很多浏览器在启动后会立即返回，导致非零退出码
            if (this.platform === 'win32' || this.platform === 'darwin') {
                // Windows和macOS通常可以忽略退出码
                return {
                    success: true,
                    stdout: error.stdout || '',
                    stderr: error.stderr || '',
                    exitCode: error.code
                };
            }

            return {
                success: false,
                error: error.message,
                exitCode: error.code
            };
        }
    }

    /**
     * 检查浏览器是否可用
     */
    async checkBrowserAvailability() {
        const results = {
            platform: this.platform,
            supported: this.isPlatformSupported(),
            browsers: []
        };

        if (!this.isPlatformSupported()) {
            return results;
        }

        try {
            if (this.platform === 'linux') {
                // Linux: 检查多个浏览器
                const browsers = ['xdg-open', 'firefox', 'google-chrome', 'chromium-browser'];
                
                for (const browser of browsers) {
                    try {
                        await execAsync(`which ${browser}`, { timeout: 3000 });
                        results.browsers.push({ name: browser, available: true });
                    } catch (error) {
                        results.browsers.push({ name: browser, available: false });
                    }
                }
            } else {
                // Windows和macOS使用系统默认命令
                const testCommand = this.platform === 'win32' ? 'where start' : 'which open';
                
                try {
                    await execAsync(testCommand, { timeout: 3000 });
                    results.browsers.push({ 
                        name: this.platform === 'win32' ? 'start' : 'open', 
                        available: true 
                    });
                } catch (error) {
                    results.browsers.push({ 
                        name: this.platform === 'win32' ? 'start' : 'open', 
                        available: false 
                    });
                }
            }
        } catch (error) {
            console.warn('检查浏览器可用性时出错:', error.message);
        }

        return results;
    }

    /**
     * 验证URL格式
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 格式化URL（确保包含协议）
     */
    formatUrl(url) {
        if (!url) return null;
        
        // 如果已经包含协议，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // 如果是localhost或IP地址，添加http://
        if (url.startsWith('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(url)) {
            return `http://${url}`;
        }
        
        // 其他情况默认添加https://
        return `https://${url}`;
    }
}

// 创建单例实例
export const browserLauncher = new BrowserLauncher();
export default browserLauncher;
