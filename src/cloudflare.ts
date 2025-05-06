import { McpAgent } from "agents/mcp";
import { createJSerInfoMcpServer } from "./mcp.js";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
    server = createJSerInfoMcpServer();

    async init() {}
}

export default {
    // @ts-ignore
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);

        if (url.pathname === "/sse" || url.pathname === "/sse/message") {
            // @ts-ignore
            return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
        }

        if (url.pathname === "/mcp") {
            // @ts-ignore
            return MyMCP.serve("/mcp").fetch(request, env, ctx);
        }

        return new Response("Not found", { status: 404 });
    }
};
