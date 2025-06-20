/**
 * Simple Memory MCP - Web界面启动功能测试
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { webServerManager } from '../src/services/WebServerManager.js';
import { browserLauncher } from '../src/services/BrowserLauncher.js';
import { ToolExecutor } from '../src/tools.js';
import os from 'os';

// Mock dependencies
jest.mock('../src/services/PortManager.js', () => ({
    portManager: {
        allocatePort: jest.fn().mockResolvedValue(8011),
        releasePort: jest.fn().mockResolvedValue(true),
        getAllocatedPorts: jest.fn().mockReturnValue(new Map())
    }
}));

jest.mock('child_process', () => ({
    spawn: jest.fn().mockReturnValue({
        pid: 12345,
        killed: false,
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn()
    }),
    exec: jest.fn()
}));

describe('Web界面启动功能测试', () => {
    let toolExecutor;

    beforeEach(() => {
        toolExecutor = new ToolExecutor();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        // 清理资源
        if (webServerManager.isWebServerRunning()) {
            await webServerManager.stopWebServer();
        }
    });

    describe('WebServerManager 测试', () => {
        test('应该能够检查服务器状态', () => {
            const status = webServerManager.getStatus();
            expect(status).toHaveProperty('isRunning');
            expect(status).toHaveProperty('port');
            expect(status).toHaveProperty('pid');
            expect(status).toHaveProperty('startTime');
            expect(status).toHaveProperty('uptime');
        });

        test('应该能够获取Web URL', () => {
            webServerManager.port = 8011;
            const urls = webServerManager.getWebUrl();
            expect(urls).toHaveProperty('local');
            expect(urls).toHaveProperty('lan');
            expect(urls.local).toBe('http://localhost:8011');
        });

        test('应该能够获取本机IP地址', () => {
            const ip = webServerManager.getLocalIP();
            expect(typeof ip).toBe('string');
            expect(ip.length).toBeGreaterThan(0);
        });
    });

    describe('BrowserLauncher 测试', () => {
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
        });

        test('应该能够验证URL格式', () => {
            expect(browserLauncher.isValidUrl('http://localhost:8011')).toBe(true);
            expect(browserLauncher.isValidUrl('https://example.com')).toBe(true);
            expect(browserLauncher.isValidUrl('invalid-url')).toBe(false);
            expect(browserLauncher.isValidUrl('')).toBe(false);
        });

        test('应该能够格式化URL', () => {
            expect(browserLauncher.formatUrl('localhost:8011')).toBe('http://localhost:8011');
            expect(browserLauncher.formatUrl('192.168.1.100:8011')).toBe('http://192.168.1.100:8011');
            expect(browserLauncher.formatUrl('http://localhost:8011')).toBe('http://localhost:8011');
            expect(browserLauncher.formatUrl('example.com')).toBe('https://example.com');
        });

        test('应该能够获取浏览器命令', () => {
            const url = 'http://localhost:8011';
            const command = browserLauncher.getBrowserCommand(url);
            expect(typeof command).toBe('string');
            expect(command).toContain(url);
        });

        test('应该根据平台返回正确的命令', () => {
            const url = 'http://localhost:8011';
            const platform = os.platform();
            const command = browserLauncher.getBrowserCommand(url);

            if (platform === 'win32') {
                expect(command).toContain('start');
            } else if (platform === 'darwin') {
                expect(command).toContain('open');
            } else if (platform === 'linux') {
                expect(command).toContain('xdg-open');
            }
        });
    });

    describe('MCP工具函数测试', () => {
        test('应该能够执行打开记忆Web界面工具', async () => {
            // Mock Web服务器启动成功
            jest.spyOn(webServerManager, 'startWebServer').mockResolvedValue({
                success: true,
                port: 8011,
                pid: 12345,
                url: 'http://localhost:8011'
            });

            jest.spyOn(webServerManager, 'getWebUrl').mockReturnValue({
                local: 'http://localhost:8011',
                lan: 'http://192.168.1.100:8011'
            });

            // Mock浏览器启动成功
            jest.spyOn(browserLauncher, 'openBrowser').mockResolvedValue({
                success: true,
                platform: os.platform(),
                command: 'mock-command'
            });

            const result = await toolExecutor.executeOpenMemoryWeb({
                trigger_phrase: '打开记忆',
                auto_open_browser: true
            });

            expect(result.success).toBe(true);
            expect(result.message).toContain('记忆管理Web界面已启动');
            expect(result.trigger_phrase).toBe('打开记忆');
            expect(result.server_info).toHaveProperty('port');
            expect(result.server_info).toHaveProperty('local_url');
            expect(result.server_info).toHaveProperty('lan_url');
            expect(result.browser_info).toHaveProperty('opened');
            expect(result.usage_tips).toBeInstanceOf(Array);
        });

        test('应该处理Web服务器启动失败', async () => {
            // Mock Web服务器启动失败
            jest.spyOn(webServerManager, 'startWebServer').mockResolvedValue({
                success: false,
                error: '端口被占用'
            });

            const result = await toolExecutor.executeOpenMemoryWeb({
                trigger_phrase: '打开记忆'
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Web服务器启动失败');
            expect(result.trigger_phrase).toBe('打开记忆');
        });

        test('应该处理浏览器启动失败', async () => {
            // Mock Web服务器启动成功
            jest.spyOn(webServerManager, 'startWebServer').mockResolvedValue({
                success: true,
                port: 8011,
                pid: 12345,
                url: 'http://localhost:8011'
            });

            jest.spyOn(webServerManager, 'getWebUrl').mockReturnValue({
                local: 'http://localhost:8011',
                lan: 'http://192.168.1.100:8011'
            });

            // Mock浏览器启动失败
            jest.spyOn(browserLauncher, 'openBrowser').mockResolvedValue({
                success: false,
                error: '无法找到浏览器',
                platform: os.platform()
            });

            const result = await toolExecutor.executeOpenMemoryWeb({
                trigger_phrase: '打开记忆',
                auto_open_browser: true
            });

            expect(result.success).toBe(true); // Web服务器启动成功
            expect(result.message).toContain('请手动访问');
            expect(result.browser_info.opened).toBe(false);
            expect(result.browser_info.error).toBe('无法找到浏览器');
        });

        test('应该支持不自动打开浏览器', async () => {
            // Mock Web服务器启动成功
            jest.spyOn(webServerManager, 'startWebServer').mockResolvedValue({
                success: true,
                port: 8011,
                pid: 12345,
                url: 'http://localhost:8011'
            });

            jest.spyOn(webServerManager, 'getWebUrl').mockReturnValue({
                local: 'http://localhost:8011',
                lan: 'http://192.168.1.100:8011'
            });

            const result = await toolExecutor.executeOpenMemoryWeb({
                trigger_phrase: '打开记忆',
                auto_open_browser: false
            });

            expect(result.success).toBe(true);
            expect(result.message).toContain('请访问');
            expect(result.browser_info).toBeUndefined();
        });

        test('应该支持所有触发词', async () => {
            const triggerPhrases = ['打开记忆MCP', '打开记忆', '打开记忆WEB', '开启记忆'];

            // Mock Web服务器启动成功
            jest.spyOn(webServerManager, 'startWebServer').mockResolvedValue({
                success: true,
                port: 8011,
                pid: 12345,
                url: 'http://localhost:8011'
            });

            jest.spyOn(webServerManager, 'getWebUrl').mockReturnValue({
                local: 'http://localhost:8011',
                lan: 'http://192.168.1.100:8011'
            });

            jest.spyOn(browserLauncher, 'openBrowser').mockResolvedValue({
                success: true,
                platform: os.platform(),
                command: 'mock-command'
            });

            for (const phrase of triggerPhrases) {
                const result = await toolExecutor.executeOpenMemoryWeb({
                    trigger_phrase: phrase,
                    auto_open_browser: false
                });

                expect(result.success).toBe(true);
                expect(result.trigger_phrase).toBe(phrase);
            }
        });
    });

    describe('跨平台兼容性测试', () => {
        test('应该在所有支持的平台上工作', () => {
            const supportedPlatforms = ['win32', 'darwin', 'linux'];
            const currentPlatform = os.platform();

            if (supportedPlatforms.includes(currentPlatform)) {
                expect(browserLauncher.isPlatformSupported()).toBe(true);
                expect(() => browserLauncher.getBrowserCommand('http://test.com')).not.toThrow();
            }
        });

        test('应该处理不支持的平台', () => {
            // 临时修改平台检测
            const originalPlatform = browserLauncher.platform;
            browserLauncher.platform = 'unsupported';

            expect(browserLauncher.isPlatformSupported()).toBe(false);
            expect(() => browserLauncher.getBrowserCommand('http://test.com')).toThrow();

            // 恢复原始平台
            browserLauncher.platform = originalPlatform;
        });
    });
});
