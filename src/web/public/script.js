// Simple Memory MCP - Material Design 版本

class MemoryManager {
    constructor() {
        this.memories = [];
        this.currentEditingMemory = null;
        this.currentViewingMemory = null;
        this.currentDeletingMemory = null;
        this.draggedElement = null;
        this.draggedIndex = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMemories();
        this.loadSystemInfo();
    }

    bindEvents() {
        // 添加记忆按钮
        document.getElementById('addMemoryBtn').addEventListener('click', () => {
            this.showAddMemoryModal();
        });

        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const clearBtn = document.getElementById('clearSearchBtn');

        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
            clearBtn.style.display = e.target.value ? 'block' : 'none';
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch(searchInput.value);
        });

        clearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        // 模态框事件
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideMemoryModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideMemoryModal();
        });

        document.getElementById('memoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMemory();
        });

        // 删除确认模态框
        document.getElementById('closeDeleteModalBtn').addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });

        // 查看模态框
        document.getElementById('closeViewModalBtn').addEventListener('click', () => {
            this.hideViewModal();
        });

        document.getElementById('editFromViewBtn').addEventListener('click', () => {
            this.editFromView();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    async loadMemories() {
        try {
            this.showLoading();
            const response = await fetch('/api/memories');
            const data = await response.json();

            if (data.success) {
                this.memories = data.memories;
                this.renderMemories();
                this.updateStats();
            } else {
                this.showMessage('加载记忆失败: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('加载记忆失败:', error);
            this.showMessage('网络错误，请检查连接', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderMemories(memoriesToRender = null) {
        const memoriesList = document.getElementById('memoriesList');
        const memories = memoriesToRender || this.memories;

        if (memories.length === 0) {
            memoriesList.innerHTML = '';
            document.getElementById('emptyState').style.display = 'block';
            return;
        }

        document.getElementById('emptyState').style.display = 'none';

        memoriesList.innerHTML = memories.map((memory, index) => `
            <div class="memory-card"
                 draggable="true"
                 data-memory-title="${this.escapeHtml(memory.title)}"
                 data-memory-sort-order="${memory.sort_order || index}"
                 data-array-index="${index}"
                 onclick="memoryManager.viewMemory('${this.escapeHtml(memory.title)}')"
                 ondragstart="memoryManager.handleDragStart(event)"
                 ondragover="memoryManager.handleDragOver(event)"
                 ondrop="memoryManager.handleDrop(event)"
                 ondragend="memoryManager.handleDragEnd(event)">
                <div class="memory-meta">
                    ${this.formatDate(memory.created_at)}
                </div>
                <div class="memory-title">${this.escapeHtml(memory.title)}</div>
                <div class="memory-preview">${this.escapeHtml(memory.preview)}</div>
                <div class="memory-actions" onclick="event.stopPropagation()">
                    <button class="action-btn edit" onclick="memoryManager.editMemory('${this.escapeHtml(memory.title)}')">
                        <span class="material-icons" style="font-size: 16px;">edit</span>
                        编辑
                    </button>
                    <button class="action-btn copy" onclick="memoryManager.copyMemory('${this.escapeHtml(memory.title)}')">
                        <span class="material-icons" style="font-size: 16px;">content_copy</span>
                        复制
                    </button>
                    <button class="action-btn delete" onclick="memoryManager.deleteMemory('${this.escapeHtml(memory.title)}')">
                        <span class="material-icons" style="font-size: 16px;">delete</span>
                        删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    async viewMemory(title) {
        try {
            const response = await fetch(`/api/memories/${encodeURIComponent(title)}`);
            const data = await response.json();

            if (data.success) {
                document.getElementById('viewModalTitle').textContent = data.memory.title;
                document.getElementById('viewMemoryDate').textContent =
                    `创建于: ${this.formatDate(data.memory.created_at)} | 更新于: ${this.formatDate(data.memory.updated_at)}`;
                document.getElementById('viewMemoryContent').textContent = data.memory.content;

                this.currentViewingMemory = data.memory;
                this.showViewModal();
            } else {
                this.showMessage('获取记忆详情失败: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('获取记忆详情失败:', error);
            this.showMessage('网络错误，请检查连接', 'error');
        }
    }

    showAddMemoryModal() {
        document.getElementById('modalTitle').textContent = '添加记忆';
        document.getElementById('memoryTitleInput').value = '';
        document.getElementById('memoryContentInput').value = '';
        this.currentEditingMemory = null;
        this.showMemoryModal();
    }

    async copyMemory(title) {
        try {
            const response = await fetch(`/api/memories/${encodeURIComponent(title)}`);
            const data = await response.json();

            if (data.success) {
                // 格式化为纯文本格式：标题 + 换行 + 内容
                const textToCopy = `${data.memory.title}\n\n${data.memory.content}`;

                // 使用现代剪贴板API复制文本
                await navigator.clipboard.writeText(textToCopy);
                this.showMessage('记忆内容已复制到剪贴板', 'success');
            } else {
                this.showMessage('获取记忆内容失败: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('复制记忆失败:', error);
            // 如果剪贴板API失败，尝试使用传统方法
            try {
                const response = await fetch(`/api/memories/${encodeURIComponent(title)}`);
                const data = await response.json();
                if (data.success) {
                    const textToCopy = `${data.memory.title}\n\n${data.memory.content}`;
                    this.fallbackCopyToClipboard(textToCopy);
                    this.showMessage('记忆内容已复制到剪贴板', 'success');
                }
            } catch (fallbackError) {
                this.showMessage('复制失败，请手动复制内容', 'error');
            }
        }
    }

    // 备用复制方法（兼容旧浏览器）
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    async editMemory(title) {
        try {
            const response = await fetch(`/api/memories/${encodeURIComponent(title)}`);
            const data = await response.json();

            if (data.success) {
                document.getElementById('modalTitle').textContent = '编辑记忆';
                document.getElementById('memoryTitleInput').value = data.memory.title;
                document.getElementById('memoryContentInput').value = data.memory.content;
                this.currentEditingMemory = data.memory;
                this.showMemoryModal();
            } else {
                this.showMessage('获取记忆详情失败: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('获取记忆详情失败:', error);
            this.showMessage('网络错误，请检查连接', 'error');
        }
    }

    editFromView() {
        if (this.currentViewingMemory) {
            // 先保存当前查看的记忆，避免hideViewModal()将其设为null
            const memoryToEdit = this.currentViewingMemory;
            this.hideViewModal();
            document.getElementById('modalTitle').textContent = '编辑记忆';
            document.getElementById('memoryTitleInput').value = memoryToEdit.title;
            document.getElementById('memoryContentInput').value = memoryToEdit.content;
            this.currentEditingMemory = memoryToEdit;
            this.showMemoryModal();
        }
    }

    async saveMemory() {
        const title = document.getElementById('memoryTitleInput').value.trim();
        const content = document.getElementById('memoryContentInput').value.trim();

        if (!title || !content) {
            this.showMessage('标题和内容都是必需的', 'warning');
            return;
        }

        try {
            let response;
            if (this.currentEditingMemory) {
                response = await fetch(`/api/memories/${encodeURIComponent(this.currentEditingMemory.title)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content }),
                });
            } else {
                response = await fetch('/api/memories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content }),
                });
            }

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                this.hideMemoryModal();
                this.loadMemories();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('保存记忆失败:', error);
            this.showMessage('网络错误，请检查连接', 'error');
        }
    }

    deleteMemory(title) {
        document.getElementById('deleteMemoryTitle').textContent = title;
        this.currentDeletingMemory = title;
        this.showDeleteModal();
    }

    async confirmDelete() {
        if (!this.currentDeletingMemory) return;

        try {
            const response = await fetch(`/api/memories/${encodeURIComponent(this.currentDeletingMemory)}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                this.hideDeleteModal();
                this.loadMemories();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('删除记忆失败:', error);
            this.showMessage('网络错误，请检查连接', 'error');
        }
    }

    performSearch(keyword = '') {
        const searchResults = document.getElementById('searchResults');

        if (!keyword.trim()) {
            this.renderMemories();
            searchResults.style.display = 'none';
            document.getElementById('emptyMessage').textContent = '点击右下角的按钮创建您的第一个记忆';
            return;
        }

        const filteredMemories = this.memories.filter(memory =>
            memory.title.toLowerCase().includes(keyword.toLowerCase()) ||
            memory.content.toLowerCase().includes(keyword.toLowerCase())
        );

        this.renderMemories(filteredMemories);
        searchResults.textContent = `搜索结果: ${filteredMemories.length}`;
        searchResults.style.display = 'block';

        if (filteredMemories.length === 0) {
            document.getElementById('emptyMessage').textContent = '没有找到匹配的记忆，尝试使用不同的关键词搜索';
        }
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchBtn').style.display = 'none';
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('emptyMessage').textContent = '点击右下角的按钮创建您的第一个记忆';
        this.renderMemories();
    }

    // 模态框显示/隐藏方法
    showMemoryModal() {
        document.getElementById('memoryModal').style.display = 'block';
        document.getElementById('memoryTitleInput').focus();
    }

    hideMemoryModal() {
        document.getElementById('memoryModal').style.display = 'none';
        this.currentEditingMemory = null;
    }

    showDeleteModal() {
        document.getElementById('deleteModal').style.display = 'block';
    }

    hideDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.currentDeletingMemory = null;
    }

    showViewModal() {
        document.getElementById('viewModal').style.display = 'block';
    }

    hideViewModal() {
        document.getElementById('viewModal').style.display = 'none';
        this.currentViewingMemory = null;
    }

    // 加载状态管理
    showLoading() {
        document.getElementById('loadingIndicator').style.display = 'flex';
        document.getElementById('memoriesList').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('memoriesList').style.display = 'grid';
    }

    // 更新统计信息
    updateStats() {
        const count = this.memories.length;
        document.getElementById('memoryCount').textContent = count;
    }

    // 加载系统信息
    async loadSystemInfo() {
        try {
            const response = await fetch('/api/system/info');
            const data = await response.json();

            if (data.success) {
                this.displaySystemInfo(data.systemInfo);
            }
        } catch (error) {
            console.warn('获取系统信息失败:', error);
        }
    }

    // 显示系统信息
    displaySystemInfo(systemInfo) {
        // 在页面底部显示端口信息
        const footer = document.querySelector('.app-bar') || document.body;

        // 检查是否已存在端口信息显示
        let portInfo = document.getElementById('portInfo');
        if (!portInfo) {
            portInfo = document.createElement('div');
            portInfo.id = 'portInfo';
            portInfo.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                color: #90caf9;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
                backdrop-filter: blur(4px);
                cursor: pointer;
                max-width: 200px;
                text-align: center;
            `;
            document.body.appendChild(portInfo);
        }

        // 显示局域网访问信息
        const localIP = systemInfo.localIP || 'localhost';
        const lanUrl = systemInfo.lanUrl || `http://${localIP}:${systemInfo.currentPort}`;

        portInfo.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">局域网访问</div>
            <div style="font-size: 11px;">${localIP}:${systemInfo.currentPort}</div>
        `;
        portInfo.title = `局域网地址: ${lanUrl}\n点击复制地址`;

        // 点击复制地址
        portInfo.onclick = () => {
            navigator.clipboard.writeText(lanUrl).then(() => {
                this.showMessage('局域网地址已复制到剪贴板', 'success');
            }).catch(() => {
                this.showMessage('复制失败，请手动复制地址', 'error');
            });
        };
    }



    // 显示消息提示
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;

        messageContainer.appendChild(messageElement);

        // 4秒后自动移除消息
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 300);
            }
        }, 4000);
    }

    // 工具方法
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);

        // 格式化为 "2025年6月21日 18:24" 的格式（24小时制）
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // 24小时制，小时和分钟都补零
        const displayHours = hours.toString().padStart(2, '0');
        const displayMinutes = minutes.toString().padStart(2, '0');

        return `${year}年${month}月${day}日 ${displayHours}:${displayMinutes}`;
    }

    // 拖拽处理方法
    handleDragStart(event) {
        this.draggedElement = event.target;
        this.draggedSortOrder = parseInt(event.target.dataset.memorySortOrder);
        this.draggedArrayIndex = parseInt(event.target.dataset.arrayIndex);
        this.draggedTitle = event.target.dataset.memoryTitle;
        event.target.classList.add('dragging');

        // 设置拖拽数据
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', event.target.outerHTML);

        // 添加拖拽样式
        setTimeout(() => {
            event.target.style.opacity = '0.5';
        }, 0);

        console.log('拖拽开始:', {
            title: this.draggedTitle,
            sortOrder: this.draggedSortOrder,
            arrayIndex: this.draggedArrayIndex
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        // 简化拖拽预览，不实时移动元素位置
        // 只在最终drop时进行位置计算和移动
        const targetCard = event.target.closest('.memory-card');
        if (targetCard && !targetCard.classList.contains('dragging')) {
            // 添加视觉指示
            document.querySelectorAll('.memory-card').forEach(card => {
                card.classList.remove('drag-over');
            });
            targetCard.classList.add('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();

        if (this.draggedElement) {
            const dropTarget = event.target.closest('.memory-card');
            if (dropTarget && dropTarget !== this.draggedElement) {
                const dropSortOrder = parseInt(dropTarget.dataset.memorySortOrder);
                const dropArrayIndex = parseInt(dropTarget.dataset.arrayIndex);
                const dropTitle = dropTarget.dataset.memoryTitle;

                console.log('拖拽目标:', {
                    title: dropTitle,
                    sortOrder: dropSortOrder,
                    arrayIndex: dropArrayIndex
                });

                this.reorderMemories(this.draggedArrayIndex, dropArrayIndex);
            }
        }
    }

    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        event.target.style.opacity = '';

        // 清理拖拽状态
        this.draggedElement = null;
        this.draggedSortOrder = null;
        this.draggedArrayIndex = null;
        this.draggedTitle = null;

        // 移除所有拖拽相关的样式
        document.querySelectorAll('.memory-card').forEach(card => {
            card.classList.remove('drag-over');
        });

        console.log('拖拽结束');
    }

    // 为网格布局优化的位置计算方法
    getDropPosition(clientX, clientY) {
        const memoriesList = document.getElementById('memoriesList');
        const cards = [...document.querySelectorAll('.memory-card:not(.dragging)')];

        if (cards.length === 0) return 0;

        let closestCard = null;
        let minDistance = Infinity;
        let insertBefore = false;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            // 计算鼠标到卡片中心的距离
            const distance = Math.sqrt(
                Math.pow(clientX - cardCenterX, 2) +
                Math.pow(clientY - cardCenterY, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;

                // 判断是插入到卡片前面还是后面
                // 如果鼠标在卡片左半部分或上半部分，插入到前面
                insertBefore = (clientX < cardCenterX) ||
                              (Math.abs(clientX - cardCenterX) < 50 && clientY < cardCenterY);
            }
        });

        if (closestCard) {
            const targetIndex = parseInt(closestCard.dataset.arrayIndex);
            return insertBefore ? targetIndex : targetIndex + 1;
        }

        return cards.length;
    }

    async reorderMemories(fromIndex, toIndex, retryCount = 0) {
        if (fromIndex === toIndex) return;

        console.log('位置交换:', { fromIndex, toIndex, retryCount });

        // 保存原始状态用于回滚
        const originalMemories = [...this.memories];
        const maxRetries = 3;

        try {
            // 实现简单的位置交换而不是插入排序
            const reorderedMemories = [...this.memories];
            
            // 交换两个记忆的位置
            const temp = reorderedMemories[fromIndex];
            reorderedMemories[fromIndex] = reorderedMemories[toIndex];
            reorderedMemories[toIndex] = temp;

            // 只更新被交换的两个记忆的排序值
            const sortOrders = [
                {
                    title: reorderedMemories[fromIndex].title,
                    sortOrder: fromIndex
                },
                {
                    title: reorderedMemories[toIndex].title,
                    sortOrder: toIndex
                }
            ];

            console.log('位置交换数据:', sortOrders);

            // 先更新本地状态以提供即时反馈
            this.memories = reorderedMemories;
            // 只更新被交换的两个记忆的sort_order属性
            this.memories[fromIndex].sort_order = fromIndex;
            this.memories[toIndex].sort_order = toIndex;
            this.renderMemories();

            // 不显示处理中状态，保持界面简洁

            // 发送排序更新到服务器
            const response = await fetch('/api/memories/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sortOrders }),
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showMessage('记忆位置已保存', 'success');
                console.log('位置交换成功');

                // 添加成功动画效果
                const movedCard = document.querySelector(`[data-memory-title="${this.escapeHtml(this.memories[toIndex].title)}"]`);
                if (movedCard) {
                    movedCard.classList.add('drag-success');
                    setTimeout(() => {
                        movedCard.classList.remove('drag-success');
                    }, 300);
                }
            } else {
                throw new Error(data.error || '排序更新失败');
            }
        } catch (error) {
            console.error('排序更新失败:', error);

            // 网络错误时自动重试
            if (retryCount < maxRetries && (
                error.message.includes('网络') ||
                error.message.includes('HTTP错误') ||
                error.message.includes('fetch')
            )) {
                console.log(`第${retryCount + 1}次重试...`);
                this.showMessage(`网络错误，正在重试... (${retryCount + 1}/${maxRetries})`, 'warning');

                // 延迟重试
                setTimeout(() => {
                    this.reorderMemories(fromIndex, toIndex, retryCount + 1);
                }, 1000 * (retryCount + 1)); // 递增延迟

                return;
            }

            // 最终失败，显示错误并回滚
            const errorMsg = retryCount >= maxRetries ?
                '位置交换失败，已达到最大重试次数' :
                '位置交换失败: ' + error.message;

            this.showMessage(errorMsg, 'error');

            // 回滚到原始状态
            this.memories = originalMemories;
            this.renderMemories();

            // 记录详细错误日志
            console.error('拖拽交换详细错误信息:', {
                error: error.message,
                stack: error.stack,
                fromIndex,
                toIndex,
                retryCount,
                originalMemoriesCount: originalMemories.length,
                timestamp: new Date().toISOString()
            });
        }
    }
}

// 初始化应用
let memoryManager;
document.addEventListener('DOMContentLoaded', () => {
    memoryManager = new MemoryManager();
    console.log('Simple Memory MCP - Material Design 版本已加载');
});
