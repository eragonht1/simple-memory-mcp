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

# 启动Web服务器
echo "启动Web管理界面..."
echo "服务器将在 http://localhost:5566 启动"
echo ""

# Start web server in background
npm run web &
WEB_PID=$!

# Wait a moment for server to start
sleep 3

# Open browser
echo "正在打开浏览器..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5566
elif command -v open &> /dev/null; then
    open http://localhost:5566
elif command -v start &> /dev/null; then
    start http://localhost:5566
else
    echo "无法自动打开浏览器，请手动访问: http://localhost:5566"
fi

echo ""
echo "Web界面正在运行: http://localhost:5566"
echo "按 Ctrl+C 停止服务器"

# Wait for user to stop the server
trap "echo ''; echo '正在停止服务器...'; kill $WEB_PID 2>/dev/null; exit 0" INT

# Keep script running
wait $WEB_PID
