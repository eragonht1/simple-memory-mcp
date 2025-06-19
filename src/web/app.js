import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import database from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5566;

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

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('未处理的错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ success: false, error: '页面未找到' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Web管理界面已启动: http://localhost:${PORT}`);
});

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
