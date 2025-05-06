import { McpAgent } from "agents/mcp";
import { createJSerInfoMcpServer } from "./mcp.js";

// Define our MCP agent with tools
export class JSerInfoMCP extends McpAgent {
    server = createJSerInfoMcpServer();

    async init() {}
}

export default {
    // @ts-ignore
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);

        if (url.pathname === "/sse" || url.pathname === "/sse/message") {
            // @ts-ignore
            return JSerInfoMCP.serveSSE("/sse").fetch(request, env, ctx);
        }

        if (url.pathname === "/mcp") {
            // @ts-ignore
            return JSerInfoMCP.serve("/mcp").fetch(request, env, ctx);
        }

        return new Response("Not found", { status: 404 });
    }
};
