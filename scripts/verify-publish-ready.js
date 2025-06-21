#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * 验证npm发布准备情况
 */
async function verifyPublishReady() {
    console.log('🔍 验证npm发布准备情况...\n');
    
    let allChecksPass = true;
    const results = [];

    // 检查必需文件
    const requiredFiles = [
        'package.json',
        'README.md',
        'LICENSE',
        '.npmignore',
        'src/server.js',
        'start-mcp.js'
    ];

    console.log('📁 检查必需文件:');
    for (const file of requiredFiles) {
        const exists = await fs.pathExists(path.join(projectRoot, file));
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${file}`);
        if (!exists) {
            allChecksPass = false;
            results.push(`缺少必需文件: ${file}`);
        }
    }

    // 检查package.json配置
    console.log('\n📦 检查package.json配置:');
    try {
        const packageJson = await fs.readJson(path.join(projectRoot, 'package.json'));
        
        const requiredFields = [
            'name',
            'version',
            'description',
            'main',
            'license',
            'author',
            'repository',
            'files'
        ];

        for (const field of requiredFields) {
            const exists = packageJson[field] !== undefined;
            const status = exists ? '✅' : '❌';
            console.log(`  ${status} ${field}: ${exists ? JSON.stringify(packageJson[field]).substring(0, 50) + '...' : '缺失'}`);
            if (!exists) {
                allChecksPass = false;
                results.push(`package.json缺少字段: ${field}`);
            }
        }

        // 检查作者信息是否为占位符
        if (typeof packageJson.author === 'string' && packageJson.author === 'Your Name') {
            console.log('  ⚠️  作者信息仍为占位符');
            results.push('需要更新作者信息');
        }

        // 检查发布脚本
        const hasPublishScripts = packageJson.scripts?.prepublishOnly || packageJson.scripts?.prepack;
        const status = hasPublishScripts ? '✅' : '❌';
        console.log(`  ${status} 发布前脚本: ${hasPublishScripts ? '已配置' : '未配置'}`);
        if (!hasPublishScripts) {
            results.push('建议添加发布前脚本');
        }

    } catch (error) {
        console.log('  ❌ 无法读取package.json');
        allChecksPass = false;
        results.push('package.json格式错误');
    }

    // 检查GitHub Actions
    console.log('\n🚀 检查GitHub Actions:');
    const githubActionsFiles = [
        '.github/workflows/publish.yml',
        '.github/workflows/ci.yml'
    ];

    for (const file of githubActionsFiles) {
        const exists = await fs.pathExists(path.join(projectRoot, file));
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${file}`);
        if (!exists) {
            results.push(`缺少GitHub Actions文件: ${file}`);
        }
    }

    // 检查GitHub社区文件
    console.log('\n👥 检查GitHub社区文件:');
    const communityFiles = [
        '.github/ISSUE_TEMPLATE/bug_report.md',
        '.github/ISSUE_TEMPLATE/feature_request.md',
        '.github/PULL_REQUEST_TEMPLATE.md',
        '.github/CONTRIBUTING.md'
    ];

    for (const file of communityFiles) {
        const exists = await fs.pathExists(path.join(projectRoot, file));
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${file}`);
        if (!exists) {
            results.push(`缺少GitHub社区文件: ${file}`);
        }
    }

    // 检查README徽章
    console.log('\n🏷️  检查README徽章:');
    try {
        const readmeContent = await fs.readFile(path.join(projectRoot, 'README.md'), 'utf8');
        const hasBadges = readmeContent.includes('badge.fury.io') || readmeContent.includes('shields.io');
        const status = hasBadges ? '✅' : '❌';
        console.log(`  ${status} 状态徽章: ${hasBadges ? '已添加' : '未添加'}`);
        if (!hasBadges) {
            results.push('建议在README中添加状态徽章');
        }
    } catch (error) {
        console.log('  ❌ 无法读取README.md');
        results.push('README.md读取失败');
    }

    // 总结
    console.log('\n📊 验证结果:');
    if (allChecksPass && results.length === 0) {
        console.log('🎉 所有检查通过！项目已准备好发布到npm。');
        console.log('\n📋 发布步骤:');
        console.log('1. 确保代码已推送到GitHub');
        console.log('2. 创建GitHub Release');
        console.log('3. GitHub Actions将自动发布到npm');
        console.log('\n或手动发布:');
        console.log('1. npm version patch/minor/major');
        console.log('2. git push --follow-tags');
        console.log('3. npm publish');
    } else {
        console.log('⚠️  发现以下问题需要解决:');
        results.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
        });
        console.log('\n请修复这些问题后再次运行验证。');
    }

    return allChecksPass && results.length === 0;
}

// 运行验证
verifyPublishReady().catch(error => {
    console.error('❌ 验证过程中出现错误:', error);
    process.exit(1);
});
