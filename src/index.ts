import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { createJSerInfoMcpServer, type JSerInfoMcpServer } from "./mcp.js";

/**
 * サーバーを起動する関数
 * @param options サーバーの設定オプション
 * @returns サーバーインスタンスとクリーンアップ関数
 */
export const runServer = async ({
    port = 3000,
    mcpServer = createJSerInfoMcpServer()
}: {
    port?: number;
    mcpServer?: JSerInfoMcpServer;
} = {}) => {
    const app = express();
    app.use(express.json());

    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
        // ステートレスなサーバーの場合、undefined を指定する
        sessionIdGenerator: undefined
    });

    // MCPサーバーとトランスポートを接続
    await mcpServer.connect(transport);

    // POST リクエストで受け付ける
    app.post("/mcp", async (req, res) => {
        console.log("Received MCP request:", req.body);
        try {
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error("Error handling MCP request:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32603,
                        message: "Internal server error"
                    },
                    id: null
                });
            }
        }
    });

    // GET リクエストは SSE エンドポイントとの互換性のために実装する必要がある
    // SSE エンドポイントを実装しない場合は、405 Method Not Allowed を返す
    app.get("/mcp", async (_req, res) => {
        console.log("Received GET MCP request");
        res.writeHead(405).end(
            JSON.stringify({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Method not allowed."
                },
                id: null
            })
        );
    });

    // DELETE リクエストはステートフルなサーバーの場合に実装する必要がある
    app.delete("/mcp", async (_req, res) => {
        console.log("Received DELETE MCP request");
        res.writeHead(405).end(
            JSON.stringify({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Method not allowed."
                },
                id: null
            })
        );
    });

    // サーバーを起動
    const server = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}/mcp`);
    });

    // クリーンアップ関数を返す
    const cleanup = async () => {
        try {
            console.log(`Closing transport`);
            await transport.close();
        } catch (error) {
            console.error(`Error closing transport:`, error);
        }

        await mcpServer.close();
        await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log("Server shutdown complete");
    };

    return {
        server,
        cleanup
    };
};
