#!/bin/bash

echo "启动 Simple Memory MCP Web 管理界面..."
echo ""
echo "正在启动Web服务器，请稍候..."
echo ""

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到 Node.js，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
fi

# 使用Node.js启动器（推荐方式）
echo "使用专业的Node.js启动器..."
if [ -f "start-web.js" ]; then
    echo "检测到start-web.js，使用智能端口管理..."
    node start-web.js
    exit $?
fi

echo "未找到start-web.js，使用传统启动方式..."

# 检查端口8011是否被占用
echo "检查端口8011..."
if lsof -Pi :8011 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "端口8011已被占用，正在清理..."
    # 获取占用端口的进程ID并终止
    PID=$(lsof -Pi :8011 -sTCP:LISTEN -t)
    if [ ! -z "$PID" ]; then
        echo "终止进程 $PID..."
        kill -9 $PID 2>/dev/null
        sleep 2
        echo "端口已清理"
    fi
else
    echo "端口8011可用"
fi

# 启动Web服务器
echo "启动Web管理界面..."
echo "服务器将在 http://localhost:8011 启动"
echo ""

# Start web server in background
npm run web &
WEB_PID=$!

# Wait a moment for server to start
sleep 3

# Open browser
echo "正在打开浏览器..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8011
elif command -v open &> /dev/null; then
    open http://localhost:8011
elif command -v start &> /dev/null; then
    start http://localhost:8011
else
    echo "无法自动打开浏览器，请手动访问: http://localhost:8011"
fi

echo ""
echo "Web界面正在运行: http://localhost:8011"
echo "按 Ctrl+C 停止服务器"

# Wait for user to stop the server
trap "echo ''; echo '正在停止服务器...'; kill $WEB_PID 2>/dev/null; exit 0" INT

# Keep script running
wait $WEB_PID
