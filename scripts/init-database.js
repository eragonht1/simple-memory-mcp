import database from '../src/database.js';

/**
 * 初始化数据库脚本
 */
async function initDatabase() {
    try {
        console.log('开始初始化数据库...');
        
        // 初始化数据库
        await database.init();
        
        // 插入一些示例数据（可选）
        try {
            await database.storeMemory(
                '欢迎使用Simple Memory MCP',
                '这是一个示例记忆。您可以使用MCP工具或Web界面来管理您的记忆。\n\n功能包括：\n- 存储记忆\n- 检索记忆\n- 删除记忆\n- 搜索记忆\n\n开始使用吧！'
            );
            console.log('已添加示例记忆');
        } catch (error) {
            // 如果示例记忆已存在，忽略错误
            if (!error.message.includes('已存在')) {
                console.warn('添加示例记忆失败:', error.message);
            }
        }
        
        console.log('数据库初始化完成！');
        
        // 显示当前记忆数量
        const titles = await database.getMemoryTitles();
        console.log(`当前共有 ${titles.length} 条记忆`);
        
    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    } finally {
        await database.close();
    }
}

// 运行初始化
initDatabase();
