/**
 * Simple Memory MCP 基础测试
 */

// 简单的测试，验证项目结构
const fs = require('fs');
const path = require('path');

describe('Simple Memory MCP 项目结构测试', () => {
    test('应该存在必要的项目文件', () => {
        // 检查主要文件是否存在
        expect(fs.existsSync('package.json')).toBe(true);
        expect(fs.existsSync('src/server.js')).toBe(true);
        expect(fs.existsSync('src/database.js')).toBe(true);
        expect(fs.existsSync('src/tools.js')).toBe(true);
        expect(fs.existsSync('src/web/app.js')).toBe(true);
    });

    test('应该存在文档文件', () => {
        expect(fs.existsSync('README.md')).toBe(true);
        expect(fs.existsSync('LICENSE')).toBe(true);
        expect(fs.existsSync('docs/API.md')).toBe(true);
        expect(fs.existsSync('docs/USER_GUIDE.md')).toBe(true);
        expect(fs.existsSync('docs/DEPLOYMENT.md')).toBe(true);
        expect(fs.existsSync('docs/DEVELOPMENT.md')).toBe(true);
    });

    test('应该存在脚本文件', () => {
        expect(fs.existsSync('scripts/init-database.js')).toBe(true);
        expect(fs.existsSync('scripts/deploy.js')).toBe(true);
    });

    test('package.json应该包含正确的配置', () => {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        expect(packageJson.name).toBe('simple-memory-mcp');
        expect(packageJson.type).toBe('module');
        expect(packageJson.main).toBe('src/server.js');
        expect(packageJson.scripts.start).toBe('node src/server.js');
        expect(packageJson.scripts.web).toBe('node src/web/app.js');
    });
});

describe('基础功能验证', () => {
    test('Node.js版本应该符合要求', () => {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        expect(majorVersion).toBeGreaterThanOrEqual(16);
    });

    test('项目应该是ES模块类型', () => {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        expect(packageJson.type).toBe('module');
    });

    test('应该包含所有必要的依赖', () => {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = packageJson.dependencies;

        expect(dependencies).toHaveProperty('express');
        expect(dependencies).toHaveProperty('sqlite3');
        expect(dependencies).toHaveProperty('cors');
        expect(dependencies).toHaveProperty('body-parser');
    });
});
