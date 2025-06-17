@echo off
chcp 65001 >nul
echo Starting Simple Memory MCP Web Interface...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start web server
echo Starting Web Interface...
echo Server will start at http://localhost:5566
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start web server in background and open browser
start /B npm run web

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Open browser
echo Opening browser...
start http://localhost:5566

REM Keep the window open
echo.
echo Web interface is running at http://localhost:5566
echo Press any key to stop the server...
pause >nul

REM Kill the npm process when user presses a key
taskkill /f /im node.exe >nul 2>&1
