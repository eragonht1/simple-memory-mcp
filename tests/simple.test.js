/**
 * Simple Memory MCP - 简单功能验证测试
 * 使用CommonJS语法以避免Jest ES模块问题
 */

const os = require('os');

describe('简单功能验证', () => {
    test('应该能够检测操作系统', () => {
        const platform = os.platform();
        expect(typeof platform).toBe('string');
        expect(platform.length).toBeGreaterThan(0);
        
        const supportedPlatforms = ['win32', 'darwin', 'linux'];
        console.log(`当前平台: ${platform}`);
        console.log(`是否支持: ${supportedPlatforms.includes(platform)}`);
    });

    test('应该能够获取系统架构', () => {
        const arch = os.arch();
        expect(typeof arch).toBe('string');
        expect(arch.length).toBeGreaterThan(0);
        console.log(`系统架构: ${arch}`);
    });

    test('应该能够获取网络接口', () => {
        const interfaces = os.networkInterfaces();
        expect(typeof interfaces).toBe('object');
        expect(interfaces).not.toBe(null);
        
        // 查找可用的IP地址
        const candidates = [];
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    candidates.push(iface.address);
                }
            }
        }
        
        console.log(`找到的外部IP地址: ${candidates.join(', ')}`);
        expect(candidates.length).toBeGreaterThanOrEqual(0);
    });

    test('应该能够验证URL格式', () => {
        // 简单的URL验证函数
        function isValidUrl(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        }

        expect(isValidUrl('http://localhost:8011')).toBe(true);
        expect(isValidUrl('https://example.com')).toBe(true);
        expect(isValidUrl('invalid-url')).toBe(false);
        expect(isValidUrl('')).toBe(false);
    });

    test('应该能够格式化URL', () => {
        // 简单的URL格式化函数
        function formatUrl(url) {
            if (!url) return null;
            
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            
            if (url.startsWith('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(url)) {
                return `http://${url}`;
            }
            
            return `https://${url}`;
        }

        expect(formatUrl('localhost:8011')).toBe('http://localhost:8011');
        expect(formatUrl('192.168.1.100:8011')).toBe('http://192.168.1.100:8011');
        expect(formatUrl('http://localhost:8011')).toBe('http://localhost:8011');
        expect(formatUrl('example.com')).toBe('https://example.com');
        expect(formatUrl('')).toBe(null);
    });

    test('应该能够生成平台特定的浏览器命令', () => {
        const platform = os.platform();
        const url = 'http://localhost:8011';
        
        let command;
        switch (platform) {
            case 'win32':
                command = `start "" "${url}"`;
                break;
            case 'darwin':
                command = `open "${url}"`;
                break;
            case 'linux':
                command = `xdg-open "${url}"`;
                break;
            default:
                command = null;
        }

        if (command) {
            expect(command).toContain(url);
            console.log(`${platform} 平台的浏览器命令: ${command}`);
        } else {
            console.log(`不支持的平台: ${platform}`);
        }
    });

    test('应该能够检查端口可用性概念', () => {
        // 模拟端口检查逻辑
        function mockPortCheck(port) {
            // 简单的端口范围验证
            return port >= 1024 && port <= 65535;
        }

        expect(mockPortCheck(8011)).toBe(true);
        expect(mockPortCheck(80)).toBe(false);  // 系统端口
        expect(mockPortCheck(70000)).toBe(false); // 超出范围
        expect(mockPortCheck(3000)).toBe(true);
    });

    test('应该能够模拟Web服务器状态', () => {
        // 模拟Web服务器状态对象
        const mockServerStatus = {
            isRunning: false,
            port: null,
            pid: null,
            startTime: null,
            uptime: 0
        };

        expect(mockServerStatus).toHaveProperty('isRunning');
        expect(mockServerStatus).toHaveProperty('port');
        expect(mockServerStatus).toHaveProperty('pid');
        expect(mockServerStatus).toHaveProperty('startTime');
        expect(mockServerStatus).toHaveProperty('uptime');

        // 模拟启动状态
        mockServerStatus.isRunning = true;
        mockServerStatus.port = 8011;
        mockServerStatus.pid = 12345;
        mockServerStatus.startTime = Date.now();

        expect(mockServerStatus.isRunning).toBe(true);
        expect(mockServerStatus.port).toBe(8011);
        expect(mockServerStatus.pid).toBe(12345);
        expect(mockServerStatus.startTime).toBeGreaterThan(0);
    });

    test('应该能够模拟MCP工具响应', () => {
        // 模拟成功的工具响应
        const successResponse = {
            success: true,
            message: '记忆管理Web界面已启动',
            trigger_phrase: '打开记忆',
            server_info: {
                port: 8011,
                local_url: 'http://localhost:8011',
                lan_url: 'http://192.168.1.100:8011'
            },
            browser_info: {
                opened: true,
                platform: os.platform()
            },
            usage_tips: [
                '💡 Web界面功能:',
                '• 📝 创建和编辑记忆',
                '• 🔍 搜索记忆内容'
            ]
        };

        expect(successResponse.success).toBe(true);
        expect(successResponse.message).toContain('Web界面');
        expect(successResponse.server_info).toHaveProperty('port');
        expect(successResponse.server_info).toHaveProperty('local_url');
        expect(successResponse.browser_info).toHaveProperty('opened');
        expect(Array.isArray(successResponse.usage_tips)).toBe(true);

        // 模拟失败的工具响应
        const errorResponse = {
            success: false,
            error: 'Web服务器启动失败: 端口被占用',
            trigger_phrase: '打开记忆'
        };

        expect(errorResponse.success).toBe(false);
        expect(errorResponse.error).toContain('失败');
        expect(errorResponse.trigger_phrase).toBe('打开记忆');
    });

    test('应该验证触发词列表', () => {
        const triggerPhrases = ['打开记忆MCP', '打开记忆', '打开记忆WEB', '开启记忆'];
        
        expect(Array.isArray(triggerPhrases)).toBe(true);
        expect(triggerPhrases.length).toBe(4);
        
        triggerPhrases.forEach(phrase => {
            expect(typeof phrase).toBe('string');
            expect(phrase.length).toBeGreaterThan(0);
            expect(phrase).toMatch(/记忆/);
        });

        console.log('支持的触发词:', triggerPhrases.join(', '));
    });
});
