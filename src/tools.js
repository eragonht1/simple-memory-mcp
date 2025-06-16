import database from './database.js';

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
                    created_at: memory.created_at,
                    preview: memory.preview + (memory.preview.length >= 100 ? '...' : '')
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
    deleteMemoryTool
];
