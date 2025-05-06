#!/usr/bin/env node

import { runServer } from "../lib/index.js";

// サーバー起動
const { cleanup } = await runServer().catch((err) => {
    console.error("Error setting up server:", err);
    process.exit(1);
});
process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    await cleanup();
    process.exit(0);
});
// Display startup message
console.log("🚀 @jser/mcp サーバーを起動しています...");
console.log("接続方法:");
console.log("1. VSCodeでMCP拡張機能がインストールされていることを確認してください");
console.log("2. VSCodeのコマンドパレットを開き（Cmd+Shift+P または Ctrl+Shift+P）、「MCP: Add Server...」を実行");
console.log("3. サーバーURLに「http://localhost:3000/mcp」を入力して接続");
console.log("4. JSer.infoのMCPツールを使用できるようになります");
