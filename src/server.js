#!/usr/bin/env node

import { tools, ToolExecutor } from './tools.js';

/**
 * Simple Memory MCP Server
 * 实现Model Context Protocol服务器，用于管理用户记忆
 */

class MCPServer {
    constructor() {
        this.toolExecutor = new ToolExecutor();
        this.initialized = false;
    }

    /**
     * 初始化服务器
     */
    async init() {
        try {
            await this.toolExecutor.init();
            this.initialized = true;
            console.error('MCP服务器初始化成功');
        } catch (error) {
            console.error('MCP服务器初始化失败:', error);
            process.exit(1);
        }
    }

    /**
     * 处理JSON-RPC请求
     */
    async handleRequest(request) {
        try {
            const { method, params, id } = request;

            switch (method) {
                case 'initialize':
                    return this.handleInitialize(id, params);
                
                case 'tools/list':
                    return this.handleToolsList(id);
                
                case 'tools/call':
                    return await this.handleToolCall(id, params);
                
                default:
                    return this.createErrorResponse(id, -32601, `未知方法: ${method}`);
            }
        } catch (error) {
            console.error('处理请求时出错:', error);
            return this.createErrorResponse(request.id, -32603, '内部服务器错误');
        }
    }

    /**
     * 处理初始化请求
     */
    handleInitialize(id, params) {
        return {
            jsonrpc: "2.0",
            id: id,
            result: {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: {}
                },
                serverInfo: {
                    name: "simple-memory-mcp",
                    version: "1.0.0"
                }
            }
        };
    }

    /**
     * 处理工具列表请求
     */
    handleToolsList(id) {
        return {
            jsonrpc: "2.0",
            id: id,
            result: {
                tools: tools
            }
        };
    }

    /**
     * 处理工具调用请求
     */
    async handleToolCall(id, params) {
        if (!this.initialized) {
            return this.createErrorResponse(id, -32002, '服务器未初始化');
        }

        const { name, arguments: args } = params;

        try {
            let result;
            
            switch (name) {
                case 'store_memory':
                    result = await this.toolExecutor.executeStoreMemory(args);
                    break;
                
                case 'list_memory_titles':
                    result = await this.toolExecutor.executeListMemoryTitles();
                    break;
                
                case 'get_memory_by_title':
                    result = await this.toolExecutor.executeGetMemoryByTitle(args);
                    break;
                
                case 'delete_memory':
                    result = await this.toolExecutor.executeDeleteMemory(args);
                    break;
                
                default:
                    return this.createErrorResponse(id, -32601, `未知工具: ${name}`);
            }

            return {
                jsonrpc: "2.0",
                id: id,
                result: {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                }
            };
        } catch (error) {
            console.error(`执行工具 ${name} 时出错:`, error);
            return this.createErrorResponse(id, -32603, `工具执行失败: ${error.message}`);
        }
    }

    /**
     * 创建错误响应
     */
    createErrorResponse(id, code, message) {
        return {
            jsonrpc: "2.0",
            id: id,
            error: {
                code: code,
                message: message
            }
        };
    }

    /**
     * 启动服务器
     */
    async start() {
        await this.init();

        // 处理stdin输入
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', async (data) => {
            const lines = data.trim().split('\n');
            
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const request = JSON.parse(line);
                        const response = await this.handleRequest(request);
                        console.log(JSON.stringify(response));
                    } catch (error) {
                        console.error('解析JSON请求失败:', error);
                        const errorResponse = this.createErrorResponse(null, -32700, '解析错误');
                        console.log(JSON.stringify(errorResponse));
                    }
                }
            }
        });

        // 处理进程退出
        process.on('SIGINT', async () => {
            console.error('收到SIGINT信号，正在关闭服务器...');
            await this.toolExecutor.close();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.error('收到SIGTERM信号，正在关闭服务器...');
            await this.toolExecutor.close();
            process.exit(0);
        });

        console.error('Simple Memory MCP服务器已启动，等待请求...');
    }
}

// 启动服务器
const server = new MCPServer();
server.start().catch(error => {
    console.error('启动服务器失败:', error);
    process.exit(1);
});
