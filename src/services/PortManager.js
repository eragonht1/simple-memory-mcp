/**
 * Simple Memory MCP - 端口管理服务
 * 统一管理端口分配、检测和冲突解决
 */

import net from 'net';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getServiceConfig, getEnvironmentConfig } from '../config/ports.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PortManager {
    constructor() {
        this.config = getEnvironmentConfig();
        this.allocatedPorts = new Map(); // serviceName -> portInfo
        this.persistenceFile = path.resolve(__dirname, '../../', this.config.global.persistence.file);
        this.initialized = false;
    }

    /**
     * 初始化端口管理器
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            // 确保数据目录存在
            const dataDir = path.dirname(this.persistenceFile);
            await fs.mkdir(dataDir, { recursive: true });
            
            // 加载持久化的端口信息
            if (this.config.global.persistence.enabled) {
                await this.loadPortInfo();
            }
            
            this.initialized = true;
            console.log('✅ 端口管理器初始化完成');
        } catch (error) {
            console.warn('⚠️ 端口管理器初始化警告:', error.message);
            this.initialized = true; // 即使出错也继续运行
        }
    }

    /**
     * 检查端口是否可用
     */
    async checkPortAvailable(port, host = '0.0.0.0') {
        return new Promise((resolve) => {
            const server = net.createServer();
            let resolved = false;

            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    try {
                        server.close();
                    } catch (error) {
                        // 忽略关闭错误
                    }
                }
            };

            const timeout = setTimeout(() => {
                cleanup();
                resolve(false);
            }, this.config.global.timeout);

            server.listen(port, host, () => {
                clearTimeout(timeout);
                cleanup();
                resolve(true);
            });

            server.on('error', (error) => {
                clearTimeout(timeout);
                cleanup();
                console.log(`🔍 端口 ${port} 检测结果: 被占用 (${error.code})`);
                resolve(false);
            });
        });
    }

    /**
     * 在指定范围内查找可用端口
     */
    async findAvailablePortInRange(start, end, exclude = []) {
        for (let port = start; port <= end; port++) {
            if (exclude.includes(port)) continue;
            if (this.config.ranges.reserved.includes(port)) continue;
            
            if (await this.checkPortAvailable(port)) {
                return port;
            }
        }
        return null;
    }

    /**
     * 为服务分配端口
     */
    async allocatePort(serviceName) {
        await this.initialize();

        const serviceConfig = getServiceConfig(serviceName);

        // 如果服务不需要端口（如MCP服务器）
        if (!serviceConfig.preferred && !serviceConfig.range) {
            console.log(`ℹ️ 服务 ${serviceName} 不需要网络端口`);
            return null;
        }

        console.log(`🔍 为服务 "${serviceName}" 分配端口...`);

        // 检查是否已经为该服务分配了端口
        const existingPort = this.getServicePort(serviceName);
        if (existingPort) {
            // 验证端口是否仍然可用
            if (await this.checkPortAvailable(existingPort)) {
                console.log(`✅ 服务 "${serviceName}" 继续使用端口: ${existingPort}`);
                return existingPort;
            } else {
                console.log(`⚠️ 服务 "${serviceName}" 的端口 ${existingPort} 已被占用，重新分配...`);
                this.allocatedPorts.delete(serviceName);
            }
        }

        const strategy = this.config.global.strategy.priority;
        let allocatedPort = null;
        const excludePorts = []; // 记录已尝试失败的端口

        for (const method of strategy) {
            allocatedPort = await this._tryAllocateByMethod(serviceName, serviceConfig, method, excludePorts);
            if (allocatedPort) break;
        }

        if (!allocatedPort) {
            throw new Error(`无法为服务 "${serviceName}" 分配端口：所有尝试都失败了`);
        }

        // 记录分配信息
        const portInfo = {
            port: allocatedPort,
            service: serviceName,
            allocatedAt: new Date().toISOString(),
            config: serviceConfig
        };

        this.allocatedPorts.set(serviceName, portInfo);

        // 持久化端口信息
        if (this.config.global.persistence.enabled) {
            await this.persistPortInfo();
        }

        console.log(`✅ 服务 "${serviceName}" 分配到端口: ${allocatedPort}`);
        return allocatedPort;
    }

    /**
     * 根据指定方法尝试分配端口
     */
    async _tryAllocateByMethod(serviceName, serviceConfig, method, excludePorts = []) {
        switch (method) {
            case 'last_used':
                return await this._tryLastUsedPort(serviceName);

            case 'preferred':
                if (serviceConfig.preferred &&
                    !excludePorts.includes(serviceConfig.preferred) &&
                    await this.checkPortAvailable(serviceConfig.preferred)) {
                    return serviceConfig.preferred;
                }
                break;

            case 'range':
                if (serviceConfig.range) {
                    const [start, end] = serviceConfig.range;
                    return await this.findAvailablePortInRange(start, end, excludePorts);
                }
                break;

            case 'fallback':
                if (serviceConfig.fallback) {
                    const [start, end] = serviceConfig.fallback;
                    return await this.findAvailablePortInRange(start, end, excludePorts);
                }
                break;

            case 'scan':
                const { start, end } = this.config.global.scanRange;
                return await this.findAvailablePortInRange(start, end, excludePorts);
        }

        return null;
    }

    /**
     * 尝试使用上次分配的端口
     */
    async _tryLastUsedPort(serviceName) {
        const lastUsed = this.allocatedPorts.get(serviceName);
        if (lastUsed) {
            // 检查端口是否仍然可用
            if (await this.checkPortAvailable(lastUsed.port)) {
                return lastUsed.port;
            } else {
                // 端口已被占用，清除过期记录
                console.log(`⚠️ 上次使用的端口 ${lastUsed.port} 已被占用，将重新分配`);
                this.allocatedPorts.delete(serviceName);
            }
        }
        return null;
    }

    /**
     * 释放服务端口
     */
    async releasePort(serviceName) {
        if (this.allocatedPorts.has(serviceName)) {
            const portInfo = this.allocatedPorts.get(serviceName);
            this.allocatedPorts.delete(serviceName);
            
            if (this.config.global.persistence.enabled) {
                await this.persistPortInfo();
            }
            
            console.log(`🔓 服务 "${serviceName}" 释放端口: ${portInfo.port}`);
            return portInfo.port;
        }
        return null;
    }

    /**
     * 获取服务当前分配的端口
     */
    getServicePort(serviceName) {
        const portInfo = this.allocatedPorts.get(serviceName);
        return portInfo ? portInfo.port : null;
    }

    /**
     * 获取所有分配的端口信息
     */
    getAllocatedPorts() {
        return new Map(this.allocatedPorts);
    }

    /**
     * 持久化端口信息
     */
    async persistPortInfo() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                ttl: this.config.global.persistence.ttl,
                ports: Object.fromEntries(this.allocatedPorts)
            };
            
            await fs.writeFile(this.persistenceFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.warn('⚠️ 端口信息持久化失败:', error.message);
        }
    }

    /**
     * 加载持久化的端口信息
     */
    async loadPortInfo() {
        try {
            const data = await fs.readFile(this.persistenceFile, 'utf8');
            const parsed = JSON.parse(data);
            
            // 检查是否过期
            const now = new Date().getTime();
            const savedTime = new Date(parsed.timestamp).getTime();
            
            if (now - savedTime > parsed.ttl) {
                console.log('📅 持久化的端口信息已过期，将重新分配');
                return;
            }
            
            // 恢复端口分配信息
            for (const [serviceName, portInfo] of Object.entries(parsed.ports)) {
                this.allocatedPorts.set(serviceName, portInfo);
            }
            
            console.log(`📂 已加载 ${this.allocatedPorts.size} 个服务的端口信息`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('⚠️ 加载端口信息失败:', error.message);
            }
        }
    }

    /**
     * 清理过期的端口分配
     */
    async cleanup() {
        const now = new Date().getTime();
        let cleaned = 0;
        
        for (const [serviceName, portInfo] of this.allocatedPorts.entries()) {
            const allocatedTime = new Date(portInfo.allocatedAt).getTime();
            if (now - allocatedTime > this.config.global.persistence.ttl) {
                this.allocatedPorts.delete(serviceName);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 清理了 ${cleaned} 个过期的端口分配`);
            if (this.config.global.persistence.enabled) {
                await this.persistPortInfo();
            }
        }
    }
}

// 单例实例
export const portManager = new PortManager();
export default portManager;
