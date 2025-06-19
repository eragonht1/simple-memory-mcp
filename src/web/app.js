import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import database from '../database.js';
import { portManager } from '../services/PortManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let PORT = null; // 将由PortManager动态分配

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// 初始化数据库
let dbInitialized = false;

async function initDatabase() {
    if (!dbInitialized) {
        try {
            await database.init();
            dbInitialized = true;
            console.log('Web服务器数据库初始化成功');
        } catch (error) {
            console.error('Web服务器数据库初始化失败:', error);
            throw error;
        }
    }
}

// 路由

// 首页 - 记忆列表
app.get('/', async (req, res) => {
    try {
        await initDatabase();
        const memories = await database.getMemoryTitles();
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    } catch (error) {
        console.error('获取记忆列表失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// API路由

// 获取所有记忆
app.get('/api/memories', async (req, res) => {
    try {
        await initDatabase();
        const memories = await database.getMemoryTitles();
        res.json({ success: true, memories });
    } catch (error) {
        console.error('获取记忆列表失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 根据标题获取记忆详情
app.get('/api/memories/:title', async (req, res) => {
    try {
        await initDatabase();
        const title = decodeURIComponent(req.params.title);
        const memory = await database.getMemoryByTitle(title);
        
        if (!memory) {
            return res.status(404).json({ success: false, error: '记忆未找到' });
        }
        
        res.json({ success: true, memory });
    } catch (error) {
        console.error('获取记忆详情失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 创建新记忆
app.post('/api/memories', async (req, res) => {
    try {
        await initDatabase();
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ success: false, error: '标题和内容都是必需的' });
        }
        
        const id = await database.storeMemory(title.trim(), content.trim());
        res.json({ success: true, message: '记忆创建成功', id });
    } catch (error) {
        console.error('创建记忆失败:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// 更新记忆
app.put('/api/memories/:title', async (req, res) => {
    try {
        await initDatabase();
        const oldTitle = decodeURIComponent(req.params.title);
        const { title: newTitle, content } = req.body;
        
        if (!newTitle || !content) {
            return res.status(400).json({ success: false, error: '标题和内容都是必需的' });
        }
        
        const updated = await database.updateMemory(oldTitle, newTitle.trim(), content.trim());
        
        if (!updated) {
            return res.status(404).json({ success: false, error: '记忆未找到' });
        }
        
        res.json({ success: true, message: '记忆更新成功' });
    } catch (error) {
        console.error('更新记忆失败:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// 删除记忆
app.delete('/api/memories/:title', async (req, res) => {
    try {
        await initDatabase();
        const title = decodeURIComponent(req.params.title);
        const deleted = await database.deleteMemory(title);
        
        if (!deleted) {
            return res.status(404).json({ success: false, error: '记忆未找到' });
        }
        
        res.json({ success: true, message: '记忆删除成功' });
    } catch (error) {
        console.error('删除记忆失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 搜索记忆
app.get('/api/search', async (req, res) => {
    try {
        await initDatabase();
        const { q: keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({ success: false, error: '搜索关键词是必需的' });
        }

        const memories = await database.searchMemories(keyword);
        res.json({ success: true, memories });
    } catch (error) {
        console.error('搜索记忆失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 更新记忆排序
app.post('/api/memories/reorder', async (req, res) => {
    try {
        await initDatabase();
        const { sortOrders } = req.body;

        if (!sortOrders || !Array.isArray(sortOrders)) {
            return res.status(400).json({ success: false, error: '排序数据格式错误' });
        }

        // 批量更新排序
        await database.updateMemoriesOrder(sortOrders);
        res.json({ success: true, message: '记忆排序已更新' });
    } catch (error) {
        console.error('更新记忆排序失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取本机局域网IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // 跳过内部地址、IPv6地址和虚拟网卡
            if (iface.family === 'IPv4' && !iface.internal) {
                const ip = iface.address;

                // 优先选择常见的局域网IP段
                if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
                    candidates.push({
                        ip: ip,
                        interface: name,
                        priority: ip.startsWith('192.168.') ? 1 : 2 // 192.168.x.x 优先级最高
                    });
                } else if (!ip.startsWith('169.254.')) {
                    // 其他非链路本地地址
                    candidates.push({
                        ip: ip,
                        interface: name,
                        priority: 3
                    });
                }
            }
        }
    }

    // 按优先级排序，选择最佳IP
    if (candidates.length > 0) {
        candidates.sort((a, b) => a.priority - b.priority);
        const selected = candidates[0];
        console.log(`🌐 检测到局域网IP: ${selected.ip} (接口: ${selected.interface})`);
        return selected.ip;
    }

    console.warn('⚠️ 未能检测到局域网IP，使用localhost');
    return 'localhost'; // 备用地址
}

// 获取系统信息（包括端口信息）
app.get('/api/system/info', async (req, res) => {
    try {
        const allocatedPorts = portManager.getAllocatedPorts();
        const localIP = getLocalIP();

        const systemInfo = {
            currentPort: PORT,
            localIP: localIP,
            lanUrl: `http://${localIP}:${PORT}`,
            allocatedPorts: Object.fromEntries(allocatedPorts),
            timestamp: new Date().toISOString(),
            version: '1.2.0'
        };

        res.json({ success: true, systemInfo });
    } catch (error) {
        console.error('获取系统信息失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('未处理的错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ success: false, error: '页面未找到' });
});

// 启动服务器函数
async function startServer(retryCount = 0) {
    const maxRetries = 5;

    try {
        // 使用端口管理器分配端口
        PORT = await portManager.allocatePort('web');

        if (!PORT) {
            throw new Error('无法分配端口给Web服务器');
        }

        const server = app.listen(PORT, () => {
            const localIP = getLocalIP();
            console.log(`🌐 Web管理界面已启动: http://localhost:${PORT}`);
            console.log(`🌐 局域网访问地址: http://${localIP}:${PORT}`);

            // 将端口信息暴露给前端
            app.locals.currentPort = PORT;
        });

        // 处理端口占用错误
        server.on('error', async (error) => {
            if (error.code === 'EADDRINUSE') {
                if (retryCount >= maxRetries) {
                    console.error(`❌ 已达到最大重试次数 (${maxRetries})，启动失败`);
                    process.exit(1);
                    return;
                }

                console.log(`⚠️ 端口 ${PORT} 被占用，尝试分配新端口... (重试 ${retryCount + 1}/${maxRetries})`);

                // 释放当前端口分配
                await portManager.releasePort('web');

                // 清理持久化文件，强制重新分配
                try {
                    const fs = await import('fs/promises');
                    await fs.unlink(portManager.persistenceFile);
                    console.log('🧹 已清理端口持久化文件');
                } catch (cleanupError) {
                    // 忽略清理错误
                }

                // 延迟后重试
                setTimeout(() => startServer(retryCount + 1), 2000);
            } else {
                throw error;
            }
        });

        // 优雅关闭处理
        const gracefulShutdown = async (signal) => {
            console.log(`\n📡 收到 ${signal} 信号，正在关闭Web服务器...`);

            server.close(async () => {
                try {
                    // 释放端口
                    await portManager.releasePort('web');
                    console.log('✅ Web服务器已关闭');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ 关闭时出错:', error.message);
                    process.exit(1);
                }
            });
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

        return server;

    } catch (error) {
        console.error('❌ Web服务器启动失败:', error.message);
        process.exit(1);
    }
}

// 启动服务器
startServer();

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('正在关闭Web服务器...');
    if (dbInitialized) {
        await database.close();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('正在关闭Web服务器...');
    if (dbInitialized) {
        await database.close();
    }
    process.exit(0);
});
