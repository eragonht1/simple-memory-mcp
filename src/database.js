import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件路径
const DB_PATH = path.join(__dirname, '..', 'data', 'memories.db');

class Database {
    constructor() {
        this.db = null;
    }

    /**
     * 初始化数据库连接
     */
    async init() {
        try {
            // 确保data目录存在
            await fs.ensureDir(path.dirname(DB_PATH));
            
            // 创建数据库连接
            this.db = new sqlite3.Database(DB_PATH);
            
            // 创建表结构
            await this.createTables();
            
            console.log('数据库初始化成功');
        } catch (error) {
            console.error('数据库初始化失败:', error);
            throw error;
        }
    }

    /**
     * 创建数据库表
     */
    async createTables() {
        const createMemoriesTable = `
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL UNIQUE,
                content TEXT NOT NULL,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        return new Promise((resolve, reject) => {
            this.db.run(createMemoriesTable, async (err) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        // 检查是否需要添加sort_order字段（用于现有数据库的迁移）
                        await this.addSortOrderColumn();
                        resolve();
                    } catch (migrationError) {
                        reject(migrationError);
                    }
                }
            });
        });
    }

    /**
     * 添加排序字段（数据库迁移）
     */
    async addSortOrderColumn() {
        return new Promise((resolve, reject) => {
            // 检查sort_order字段是否存在
            this.db.all("PRAGMA table_info(memories)", [], (err, columns) => {
                if (err) {
                    reject(err);
                    return;
                }

                const hasSortOrder = columns.some(col => col.name === 'sort_order');

                if (!hasSortOrder) {
                    // 添加sort_order字段
                    this.db.run("ALTER TABLE memories ADD COLUMN sort_order INTEGER DEFAULT 0", (alterErr) => {
                        if (alterErr) {
                            reject(alterErr);
                        } else {
                            // 为现有记忆设置排序值（按创建时间）
                            this.db.run(`
                                UPDATE memories
                                SET sort_order = (
                                    SELECT COUNT(*)
                                    FROM memories m2
                                    WHERE m2.created_at <= memories.created_at
                                ) - 1
                            `, (updateErr) => {
                                if (updateErr) {
                                    reject(updateErr);
                                } else {
                                    console.log('已为现有记忆添加排序字段');
                                    resolve();
                                }
                            });
                        }
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * 存储新记忆
     * @param {string} title - 记忆标题
     * @param {string} content - 记忆内容
     * @returns {Promise<number>} 新记忆的ID
     */
    async storeMemory(title, content) {
        // 获取当前最大排序值
        const maxSortOrderSql = `SELECT COALESCE(MAX(sort_order), -1) as max_order FROM memories`;

        return new Promise((resolve, reject) => {
            this.db.get(maxSortOrderSql, [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                const nextSortOrder = (row.max_order || -1) + 1;
                const sql = `
                    INSERT INTO memories (title, content, sort_order, created_at, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `;

                this.db.run(sql, [title, content, nextSortOrder], function(insertErr) {
                    if (insertErr) {
                        if (insertErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                            reject(new Error(`标题 "${title}" 已存在，请使用不同的标题`));
                        } else {
                            reject(insertErr);
                        }
                    } else {
                        resolve(this.lastID);
                    }
                });
            });
        });
    }

    /**
     * 获取所有记忆标题
     * @returns {Promise<Array>} 标题列表
     */
    async getMemoryTitles() {
        const sql = `
            SELECT id, title, created_at, sort_order,
                   SUBSTR(content, 1, 100) as preview
            FROM memories
            ORDER BY sort_order ASC, created_at DESC
        `;

        return new Promise((resolve, reject) => {
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 根据标题获取记忆内容
     * @param {string} title - 记忆标题
     * @returns {Promise<Object|null>} 记忆对象或null
     */
    async getMemoryByTitle(title) {
        const sql = `
            SELECT * FROM memories 
            WHERE title = ?
        `;

        return new Promise((resolve, reject) => {
            this.db.get(sql, [title], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    /**
     * 删除记忆
     * @param {string} title - 记忆标题
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteMemory(title) {
        const sql = `DELETE FROM memories WHERE title = ?`;

        return new Promise((resolve, reject) => {
            this.db.run(sql, [title], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * 更新记忆
     * @param {string} title - 原标题
     * @param {string} newTitle - 新标题
     * @param {string} content - 新内容
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateMemory(title, newTitle, content) {
        const sql = `
            UPDATE memories 
            SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE title = ?
        `;

        return new Promise((resolve, reject) => {
            this.db.run(sql, [newTitle, content, title], function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                        reject(new Error(`标题 "${newTitle}" 已存在，请使用不同的标题`));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * 搜索记忆
     * @param {string} keyword - 搜索关键词
     * @returns {Promise<Array>} 匹配的记忆列表
     */
    async searchMemories(keyword) {
        const sql = `
            SELECT * FROM memories
            WHERE title LIKE ? OR content LIKE ?
            ORDER BY sort_order ASC, created_at DESC
        `;
        const searchTerm = `%${keyword}%`;

        return new Promise((resolve, reject) => {
            this.db.all(sql, [searchTerm, searchTerm], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 批量更新记忆排序
     * @param {Array} sortOrders - 排序数据数组 [{title, sortOrder}, ...]
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateMemoriesOrder(sortOrders) {
        const db = this.db; // 保存数据库引用

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                let completed = 0;
                let hasError = false;

                for (const { title, sortOrder } of sortOrders) {
                    db.run(
                        "UPDATE memories SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE title = ?",
                        [sortOrder, title],
                        function(err) {
                            if (err && !hasError) {
                                hasError = true;
                                db.run("ROLLBACK");
                                reject(err);
                                return;
                            }

                            completed++;
                            if (completed === sortOrders.length && !hasError) {
                                db.run("COMMIT", (commitErr) => {
                                    if (commitErr) {
                                        reject(commitErr);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            }
                        }
                    );
                }

                if (sortOrders.length === 0) {
                    db.run("COMMIT");
                    resolve(true);
                }
            });
        });
    }

    /**
     * 关闭数据库连接
     */
    async close() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
}

// 创建数据库实例
const database = new Database();

export default database;
