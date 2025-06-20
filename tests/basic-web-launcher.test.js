/**
 * Simple Memory MCP - Web界面启动功能基础测试
 */

import { describe, test, expect } from '@jest/globals';
import { browserLauncher } from '../src/services/BrowserLauncher.js';
import { webServerManager } from '../src/services/WebServerManager.js';
import os from 'os';

describe('Web界面启动基础功能测试', () => {
    describe('BrowserLauncher 基础测试', () => {
        test('应该能够检查平台支持', () => {
            const supported = browserLauncher.isPlatformSupported();
            expect(typeof supported).toBe('boolean');
        });

        test('应该能够获取平台信息', () => {
            const info = browserLauncher.getPlatformInfo();
            expect(info).toHaveProperty('platform');
            expect(info).toHaveProperty('arch');
            expect(info).toHaveProperty('release');
            expect(info).toHaveProperty('supported');
            expect(typeof info.platform).toBe('string');
            expect(typeof info.arch).toBe('string');
            expect(typeof info.supported).toBe('boolean');
        });

        test('应该能够验证URL格式', () => {
            expect(browserLauncher.isValidUrl('http://localhost:8011')).toBe(true);
            expect(browserLauncher.isValidUrl('https://example.com')).toBe(true);
            expect(browserLauncher.isValidUrl('ftp://example.com')).toBe(true);
            expect(browserLauncher.isValidUrl('invalid-url')).toBe(false);
            expect(browserLauncher.isValidUrl('')).toBe(false);
            expect(browserLauncher.isValidUrl(null)).toBe(false);
        });

        test('应该能够格式化URL', () => {
            expect(browserLauncher.formatUrl('localhost:8011')).toBe('http://localhost:8011');
            expect(browserLauncher.formatUrl('192.168.1.100:8011')).toBe('http://192.168.1.100:8011');
            expect(browserLauncher.formatUrl('http://localhost:8011')).toBe('http://localhost:8011');
            expect(browserLauncher.formatUrl('https://example.com')).toBe('https://example.com');
            expect(browserLauncher.formatUrl('example.com')).toBe('https://example.com');
            expect(browserLauncher.formatUrl('')).toBe(null);
            expect(browserLauncher.formatUrl(null)).toBe(null);
        });

        test('应该根据平台返回正确的命令格式', () => {
            if (!browserLauncher.isPlatformSupported()) {
                expect(() => browserLauncher.getBrowserCommand('http://test.com')).toThrow();
                return;
            }

            const url = 'http://localhost:8011';
            const command = browserLauncher.getBrowserCommand(url);
            const platform = os.platform();

            expect(typeof command).toBe('string');
            expect(command).toContain(url);

            if (platform === 'win32') {
                expect(command).toMatch(/start\s+/);
            } else if (platform === 'darwin') {
                expect(command).toMatch(/open\s+/);
            } else if (platform === 'linux') {
                expect(command).toMatch(/xdg-open\s+/);
            }
        });

        test('应该处理不支持的平台', () => {
            // 保存原始平台
            const originalPlatform = browserLauncher.platform;
            
            // 模拟不支持的平台
            browserLauncher.platform = 'unsupported-platform';
            
            expect(browserLauncher.isPlatformSupported()).toBe(false);
            expect(() => browserLauncher.getBrowserCommand('http://test.com')).toThrow('不支持的操作系统');
            
            // 恢复原始平台
            browserLauncher.platform = originalPlatform;
        });
    });

    describe('WebServerManager 基础测试', () => {
        test('应该能够检查服务器状态', () => {
            const status = webServerManager.getStatus();
            expect(status).toHaveProperty('isRunning');
            expect(status).toHaveProperty('port');
            expect(status).toHaveProperty('pid');
            expect(status).toHaveProperty('startTime');
            expect(status).toHaveProperty('uptime');
            
            expect(typeof status.isRunning).toBe('boolean');
            expect(typeof status.uptime).toBe('number');
        });

        test('应该能够获取本机IP地址', () => {
            const ip = webServerManager.getLocalIP();
            expect(typeof ip).toBe('string');
            expect(ip.length).toBeGreaterThan(0);
            
            // 应该是有效的IP地址或localhost
            const isValidIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || ip === 'localhost';
            expect(isValidIP).toBe(true);
        });

        test('应该在没有端口时返回null URL', () => {
            // 确保端口为null
            webServerManager.port = null;
            const urls = webServerManager.getWebUrl();
            expect(urls).toBe(null);
        });

        test('应该在有端口时返回正确的URL', () => {
            // 设置测试端口
            webServerManager.port = 8011;
            const urls = webServerManager.getWebUrl();
            
            expect(urls).toHaveProperty('local');
            expect(urls).toHaveProperty('lan');
            expect(urls.local).toBe('http://localhost:8011');
            expect(urls.lan).toMatch(/^http:\/\/[\d.]+:8011$/);
            
            // 清理
            webServerManager.port = null;
        });

        test('应该正确报告服务器运行状态', () => {
            // 初始状态应该是未运行
            expect(webServerManager.isWebServerRunning()).toBe(false);
            
            // 模拟运行状态
            webServerManager.isRunning = true;
            webServerManager.webProcess = { killed: false };
            expect(webServerManager.isWebServerRunning()).toBe(true);
            
            // 模拟进程被杀死
            webServerManager.webProcess.killed = true;
            expect(webServerManager.isWebServerRunning()).toBe(false);
            
            // 清理
            webServerManager.isRunning = false;
            webServerManager.webProcess = null;
        });
    });

    describe('跨平台兼容性测试', () => {
        test('应该识别当前平台', () => {
            const currentPlatform = os.platform();
            const supportedPlatforms = ['win32', 'darwin', 'linux'];
            
            expect(typeof currentPlatform).toBe('string');
            
            if (supportedPlatforms.includes(currentPlatform)) {
                expect(browserLauncher.isPlatformSupported()).toBe(true);
            }
        });

        test('应该提供平台特定的浏览器命令', () => {
            if (!browserLauncher.isPlatformSupported()) {
                return; // 跳过不支持的平台
            }

            const testUrl = 'http://localhost:8011';
            const command = browserLauncher.getBrowserCommand(testUrl);
            
            expect(command).toBeTruthy();
            expect(command).toContain(testUrl);
        });

        test('Linux平台应该提供备用命令', () => {
            if (os.platform() !== 'linux') {
                return; // 只在Linux上测试
            }

            const testUrl = 'http://localhost:8011';
            const fallbackCommands = browserLauncher.getLinuxFallbackCommands(testUrl);
            
            expect(Array.isArray(fallbackCommands)).toBe(true);
            expect(fallbackCommands.length).toBeGreaterThan(0);
            
            fallbackCommands.forEach(command => {
                expect(command).toContain(testUrl);
            });
        });
    });

    describe('工具定义验证', () => {
        test('应该导出正确的工具定义', async () => {
            const { tools } = await import('../src/tools.js');
            
            expect(Array.isArray(tools)).toBe(true);
            expect(tools.length).toBeGreaterThan(0);
            
            // 查找Web界面启动工具
            const webTool = tools.find(tool => tool.name === 'open_memory_web');
            expect(webTool).toBeDefined();
            expect(webTool.description).toContain('打开记忆管理Web界面');
            expect(webTool.inputSchema).toBeDefined();
            expect(webTool.inputSchema.properties).toBeDefined();
        });

        test('Web启动工具应该有正确的触发词枚举', async () => {
            const { openMemoryWebTool } = await import('../src/tools.js');
            
            expect(openMemoryWebTool.inputSchema.properties.trigger_phrase).toBeDefined();
            expect(openMemoryWebTool.inputSchema.properties.trigger_phrase.enum).toEqual([
                "打开记忆MCP", "打开记忆", "打开记忆WEB", "开启记忆"
            ]);
        });
    });
});
