import database from './database.js';
import { webServerManager } from './services/WebServerManager.js';
import { browserLauncher } from './services/BrowserLauncher.js';

/**
 * MCP工具定义
 */

/**
 * 存储记忆工具
 * 要求用户提供标题和内容
 */
export const storeMemoryTool = {
    name: "store_memory",
    description: "存储新的记忆。AI助手必须先要求用户提供记忆标题，然后要求用户输入记忆内容。",
    inputSchema: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "记忆的标题（必须由用户提供，不可自动生成）"
            },
            content: {
                type: "string",
                description: "记忆的具体内容（支持长文本）"
            }
        },
        required: ["title", "content"]
    }
};

/**
 * 获取记忆标题列表工具
 * 只返回标题，不返回完整内容
 */
export const listMemoryTitlesTool = {
    name: "list_memory_titles",
    description: "获取所有记忆的标题列表，用于在聊天窗口中展示供用户选择。只返回标题和基本信息，不返回完整内容。",
    inputSchema: {
        type: "object",
        properties: {},
        required: []
    }
};

/**
 * 根据标题获取记忆内容工具
 * 用户选择标题后获取完整内容
 */
export const getMemoryByTitleTool = {
    name: "get_memory_by_title",
    description: "根据用户选择的标题获取记忆的完整内容。",
    inputSchema: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "要获取的记忆标题"
            }
        },
        required: ["title"]
    }
};

/**
 * 删除记忆工具
 */
export const deleteMemoryTool = {
    name: "delete_memory",
    description: "删除指定标题的记忆。",
    inputSchema: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "要删除的记忆标题"
            }
        },
        required: ["title"]
    }
};

/**
 * 打开记忆Web管理界面工具
 * 支持多种触发词：打开记忆MCP、打开记忆、打开记忆WEB、开启记忆
 */
export const openMemoryWebTool = {
    name: "open_memory_web",
    description: "打开记忆管理Web界面。当用户说出以下任一触发词时自动调用：'打开记忆MCP'、'打开记忆'、'打开记忆WEB'、'开启记忆'。会自动启动Web服务器并在浏览器中打开管理界面。",
    inputSchema: {
        type: "object",
        properties: {
            trigger_phrase: {
                type: "string",
                description: "触发此工具的用户输入短语",
                enum: ["打开记忆MCP", "打开记忆", "打开记忆WEB", "开启记忆"]
            },
            auto_open_browser: {
                type: "boolean",
                description: "是否自动打开浏览器（默认为true）",
                default: true
            }
        },
        required: []
    }
};

/**
 * 停止记忆Web管理界面工具
 */
export const stopMemoryWebTool = {
    name: "stop_memory_web",
    description: "停止记忆管理Web界面服务器。用于强制停止所有相关进程和释放端口。",
    inputSchema: {
        type: "object",
        properties: {
            force: {
                type: "boolean",
                description: "是否强制停止（包括清理端口进程）",
                default: true
            }
        },
        required: []
    }
};

/**
 * 工具执行函数
 */
export class ToolExecutor {
    constructor() {
        this.database = database;
    }

    /**
     * 初始化数据库连接
     */
    async init() {
        await this.database.init();
    }

    /**
     * 执行存储记忆工具
     */
    async executeStoreMemory(args) {
        try {
            const { title, content } = args;
            
            if (!title || !content) {
                throw new Error("标题和内容都是必需的");
            }

            if (title.trim().length === 0) {
                throw new Error("标题不能为空");
            }

            if (content.trim().length === 0) {
                throw new Error("内容不能为空");
            }

            const id = await this.database.storeMemory(title.trim(), content.trim());
            
            return {
                success: true,
                message: `记忆 "${title}" 已成功存储`,
                id: id
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 执行获取记忆标题列表工具
     */
    async executeListMemoryTitles() {
        try {
            const memories = await this.database.getMemoryTitles();

            return {
                success: true,
                titles: memories.map(memory => ({
                    title: memory.title,
                    created_at: memory.created_at
                })),
                count: memories.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 执行根据标题获取记忆内容工具
     */
    async executeGetMemoryByTitle(args) {
        try {
            const { title } = args;
            
            if (!title) {
                throw new Error("标题是必需的");
            }

            const memory = await this.database.getMemoryByTitle(title);
            
            if (!memory) {
                return {
                    success: false,
                    error: `未找到标题为 "${title}" 的记忆`
                };
            }

            return {
                success: true,
                memory: {
                    title: memory.title,
                    content: memory.content,
                    created_at: memory.created_at,
                    updated_at: memory.updated_at
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 执行删除记忆工具
     */
    async executeDeleteMemory(args) {
        try {
            const { title } = args;

            if (!title) {
                throw new Error("标题是必需的");
            }

            const deleted = await this.database.deleteMemory(title);

            if (!deleted) {
                return {
                    success: false,
                    error: `未找到标题为 "${title}" 的记忆`
                };
            }

            return {
                success: true,
                message: `记忆 "${title}" 已成功删除`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 执行打开记忆Web管理界面工具
     */
    async executeOpenMemoryWeb(args = {}) {
        try {
            const {
                trigger_phrase = "打开记忆",
                auto_open_browser = true
            } = args;

            console.log(`🎯 触发词: "${trigger_phrase}"`);
            console.log('🚀 正在启动记忆管理Web界面...');

            // 启动Web服务器
            const serverResult = await webServerManager.startWebServer();

            if (!serverResult.success) {
                return {
                    success: false,
                    error: `Web服务器启动失败: ${serverResult.error}`,
                    trigger_phrase: trigger_phrase
                };
            }

            const webUrl = webServerManager.getWebUrl();
            const result = {
                success: true,
                message: '记忆管理Web界面已启动',
                trigger_phrase: trigger_phrase,
                server_info: {
                    port: serverResult.port,
                    pid: serverResult.pid,
                    local_url: webUrl.local,
                    lan_url: webUrl.lan
                }
            };

            // 自动打开浏览器
            if (auto_open_browser) {
                console.log('🌐 正在打开浏览器...');

                const browserResult = await browserLauncher.openBrowser(webUrl.local, {
                    timeout: 8000,
                    fallback: true
                });

                result.browser_info = {
                    opened: browserResult.success,
                    platform: browserResult.platform,
                    command: browserResult.command,
                    error: browserResult.error
                };

                if (browserResult.success) {
                    result.message += '，浏览器已自动打开';
                    console.log('✅ 浏览器启动成功');
                } else {
                    result.message += `，请手动访问: ${webUrl.local}`;
                    console.log(`⚠️ 浏览器启动失败: ${browserResult.error}`);
                    console.log(`💡 请手动访问: ${webUrl.local}`);
                }
            } else {
                result.message += `，请访问: ${webUrl.local}`;
            }

            // 添加使用提示
            result.usage_tips = [
                "Web界面功能:",
                "• 创建和编辑记忆",
                "• 搜索记忆内容",
                "• 管理记忆列表",
                "• 删除不需要的记忆",
                "",
                "访问地址:",
                `• 本地访问: ${webUrl.local}`,
                `• 局域网访问: ${webUrl.lan}`
            ];

            return result;

        } catch (error) {
            console.error('❌ 打开记忆Web界面失败:', error);
            return {
                success: false,
                error: error.message,
                trigger_phrase: args.trigger_phrase || "未知"
            };
        }
    }

    /**
     * 执行停止记忆Web管理界面工具
     */
    async executeStopMemoryWeb(args = {}) {
        try {
            const { force = true } = args;

            console.log('🛑 正在停止记忆管理Web界面...');

            let result;
            if (force) {
                result = await webServerManager.forceStopWebServer();
            } else {
                result = await webServerManager.stopWebServer();
            }

            if (result.success) {
                console.log('✅ 记忆管理Web界面已停止');
                return {
                    success: true,
                    message: '记忆管理Web界面已停止',
                    force_used: force
                };
            } else {
                return {
                    success: false,
                    error: `停止Web服务器失败: ${result.error}`,
                    force_used: force
                };
            }

        } catch (error) {
            console.error('❌ 停止记忆Web界面失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 关闭数据库连接
     */
    async close() {
        await this.database.close();
    }
}

// 导出所有工具定义
export const tools = [
    storeMemoryTool,
    listMemoryTitlesTool,
    getMemoryByTitleTool,
    deleteMemoryTool,
    openMemoryWebTool,
    stopMemoryWebTool
];
