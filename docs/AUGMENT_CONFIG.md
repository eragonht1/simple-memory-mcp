# Augment MCP Configuration Guide

This guide provides detailed instructions for configuring Simple Memory MCP with Augment.

## Prerequisites

1. **Simple Memory MCP installed and working**
   ```bash
   cd G:\docker\McpApi\simple-memory-mcp
   npm install
   npm run init-db
   ```

2. **Node.js 16.0.0 or higher**
   ```bash
   node --version
   npm --version
   ```

3. **Augment installed and running**

## Configuration Methods

### Method 1: Using Startup Script (Recommended)

This method uses a batch file to ensure proper path resolution.

1. **Verify startup script exists**
   ```bash
   dir start-mcp.bat
   ```

2. **Test startup script**
   ```bash
   .\start-mcp.bat
   ```
   Press `Ctrl+C` to stop after verifying it starts correctly.

3. **Add to Augment MCP configuration**
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "G:\\docker\\McpApi\\simple-memory-mcp\\start-mcp.bat",
         "args": []
       }
     }
   }
   ```

### Method 2: Using Absolute Path

1. **Add to Augment MCP configuration**
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "node",
         "args": ["G:\\docker\\McpApi\\simple-memory-mcp\\src\\server.js"],
         "cwd": "G:\\docker\\McpApi\\simple-memory-mcp"
       }
     }
   }
   ```

### Method 3: Using npm Script

1. **Add to Augment MCP configuration**
   ```json
   {
     "mcpServers": {
       "simple-memory": {
         "command": "npm",
         "args": ["start"],
         "cwd": "G:\\docker\\McpApi\\simple-memory-mcp"
       }
     }
   }
   ```

## Configuration Steps

1. **Open Augment Settings**
   - Launch Augment
   - Navigate to Settings/Preferences
   - Find MCP or Model Context Protocol section

2. **Add Configuration**
   - Copy one of the configuration methods above
   - Paste into the MCP servers configuration
   - Save the configuration

3. **Restart Augment**
   - Close Augment completely
   - Restart Augment
   - Wait for MCP server to initialize

## Verification

### Test Basic Functionality

1. **Start a conversation with Augment**

2. **Test memory storage**
   ```
   User: Please help me store a memory
   Augment: Please provide the title for this memory:
   User: Test Memory
   Augment: Please enter the specific content of the memory:
   User: This is a test memory to verify MCP integration.
   Augment: Memory "Test Memory" has been successfully stored!
   ```

3. **Test memory retrieval**
   ```
   User: Please help me view my stored memories
   Augment: You have the following memories:
           1. Test Memory (Today)
           Please select the memory to view:
   User: Test Memory
   Augment: [Returns the complete content]
   ```

### Verify Web Interface

1. **Start web interface**
   ```bash
   npm run web
   ```

2. **Open browser**
   Navigate to: http://localhost:5566

3. **Check stored memory**
   You should see the "Test Memory" in the web interface.

## Troubleshooting

### Common Issues

#### 1. "MCP error -1: Connection closed"

**Cause**: Path or command issues

**Solutions**:
- Use Method 1 (startup script) for most reliable results
- Verify all paths are correct and use absolute paths
- Check that Node.js is in system PATH

#### 2. "Cannot find module"

**Cause**: Missing dependencies or wrong working directory

**Solutions**:
```bash
cd G:\docker\McpApi\simple-memory-mcp
npm install
```

#### 3. "Permission denied"

**Cause**: Augment doesn't have permission to access files

**Solutions**:
- Run Augment as administrator (temporarily for testing)
- Check file permissions on project directory
- Ensure antivirus isn't blocking access

#### 4. "Port already in use"

**Cause**: Another service using port 5566

**Solutions**:
```bash
# Check what's using the port
netstat -ano | findstr :5566

# Kill the process if needed
taskkill /PID <PID> /F
```

### Debug Steps

1. **Test manual startup**
   ```bash
   cd G:\docker\McpApi\simple-memory-mcp
   node src/server.js
   ```

2. **Check Node.js installation**
   ```bash
   where node
   node --version
   ```

3. **Verify project structure**
   ```bash
   dir src\server.js
   dir src\database.js
   dir src\tools.js
   ```

4. **Test with simple input**
   After starting manually, type:
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
   ```

### Log Analysis

If issues persist, check:

1. **Augment logs** - Look for MCP-related error messages
2. **Windows Event Viewer** - Check for application errors
3. **Console output** - When running manually, watch for error messages

## Advanced Configuration

### Custom Port Configuration

If you need to change the web interface port:

1. **Set environment variable**
   ```bash
   set PORT=8080
   npm run web
   ```

2. **Or modify src/web/app.js**
   ```javascript
   const PORT = process.env.PORT || 8080;
   ```

### Multiple Instances

To run multiple instances for different projects:

1. **Copy project to different directory**
2. **Change database path in configuration**
3. **Use different ports for web interface**
4. **Configure separate MCP servers in Augment**

## Support

If you continue to experience issues:

1. **Check project documentation**: [README.md](../README.md)
2. **Review deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Create an issue**: [GitHub Issues](https://github.com/eragonht1/simple-memory-mcp/issues)

Include the following information when reporting issues:
- Augment version
- Node.js version
- Complete error messages
- Configuration used
- Steps to reproduce the issue
