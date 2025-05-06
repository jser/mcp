#!/usr/bin/env node

import { runServer } from "../lib/node.js";

// サーバー起動
const { cleanup } = await runServer().catch((err) => {
    console.error("Error setting up server:", err);
    process.exit(1);
});
process.on("SIGINT", async () => {
    console.log("Shutting down MCP server...");
    await cleanup();
    process.exit(0);
});
