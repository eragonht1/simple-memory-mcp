/**
 * Simple Memory MCP - 端口管理配置
 * 统一管理所有服务的端口配置和分配策略
 */

export const PortConfig = {
    // 服务端口配置
    services: {
        // Web管理界面服务
        web: {
            name: 'Web管理界面',
            preferred: 8011,           // 首选端口
            range: [8010, 8020],       // 可用端口范围
            fallback: [3000, 3010],    // 备用端口范围
            protocol: 'http',
            autoOpen: true             // 是否自动打开浏览器
        },
        
        // MCP服务器（通过stdin/stdout通信，不需要网络端口）
        mcp: {
            name: 'MCP服务器',
            preferred: null,
            range: null,
            fallback: null,
            protocol: 'stdio',
            autoOpen: false
        }
    },

    // 全局配置
    global: {
        // 端口扫描范围
        scanRange: {
            start: 8000,
            end: 9000
        },
        
        // 重试配置
        retryCount: 10,
        retryDelay: 100,  // 毫秒
        
        // 端口检测超时
        timeout: 3000,    // 毫秒
        
        // 持久化配置
        persistence: {
            enabled: true,
            file: 'data/ports.json',
            ttl: 24 * 60 * 60 * 1000  // 24小时过期
        },
        
        // 端口分配策略
        strategy: {
            // 优先级：last_used > preferred > range > fallback > scan
            priority: ['last_used', 'preferred', 'range', 'fallback', 'scan'],
            
            // 是否避免终止其他进程
            avoidKilling: true,
            
            // 端口冲突时的行为
            onConflict: 'find_alternative'  // 'find_alternative' | 'kill_process' | 'fail'
        }
    },

    // 端口范围定义
    ranges: {
        // 开发环境常用端口
        development: [3000, 3010],
        
        // 生产环境端口
        production: [8000, 8100],
        
        // 测试环境端口
        testing: [9000, 9100],
        
        // 系统保留端口（避免使用）
        reserved: [
            22,    // SSH
            80,    // HTTP
            443,   // HTTPS
            3306,  // MySQL
            5432,  // PostgreSQL
            6379,  // Redis
            27017  // MongoDB
        ]
    },

    // 环境特定配置
    environments: {
        development: {
            logLevel: 'debug',
            autoRestart: true,
            portRange: 'development'
        },
        
        production: {
            logLevel: 'info',
            autoRestart: false,
            portRange: 'production'
        },
        
        testing: {
            logLevel: 'warn',
            autoRestart: true,
            portRange: 'testing'
        }
    }
};

// 获取当前环境配置
export function getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return {
        ...PortConfig,
        environment: env,
        current: PortConfig.environments[env] || PortConfig.environments.development
    };
}

// 验证端口配置
export function validatePortConfig(config = PortConfig) {
    const errors = [];
    
    // 检查服务配置
    for (const [serviceName, serviceConfig] of Object.entries(config.services)) {
        if (serviceConfig.preferred && serviceConfig.range) {
            const [start, end] = serviceConfig.range;
            if (serviceConfig.preferred < start || serviceConfig.preferred > end) {
                errors.push(`服务 ${serviceName} 的首选端口 ${serviceConfig.preferred} 不在范围 [${start}, ${end}] 内`);
            }
        }
    }
    
    // 检查全局配置
    if (config.global.scanRange.start >= config.global.scanRange.end) {
        errors.push('全局扫描范围配置错误：起始端口必须小于结束端口');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// 获取服务配置
export function getServiceConfig(serviceName) {
    const config = getEnvironmentConfig();
    const serviceConfig = config.services[serviceName];
    
    if (!serviceConfig) {
        throw new Error(`未找到服务 "${serviceName}" 的配置`);
    }
    
    return {
        ...serviceConfig,
        environment: config.environment,
        global: config.global
    };
}

export default PortConfig;
