import { describe, it, expect } from "vitest";
import { createJSerInfoMcpServer } from "../src/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { runServer } from "../src/index.js";
import mockItems from "./fixtures/items.json" with { type: "json" };
import mockPosts from "./fixtures/posts.json" with { type: "json" };
import type { JserItem, JserPost } from "@jser/data-fetcher";

const createConnection = async (url: string) => {
    const client = new Client({
        name: "example-client",
        version: "1.0.0"
    });
    const transport = new StreamableHTTPClientTransport(new URL(url));
    await client.connect(transport);
    return client;
};

describe("JSer.info MCP Server", () => {
    // MCPサーバーを作成してポートを取得する共通関数
    async function createTestServer() {
        // モックデータを使用してMCPサーバーを作成
        const mcpServer = createJSerInfoMcpServer({
            items: mockItems as JserItem[],
            posts: mockPosts as JserPost[]
        });
        // 動的にポートを取得
        const port = Math.floor(Math.random() * (65535 - 1024) + 1024);
        // サーバーを起動
        const { cleanup } = await runServer({
            port,
            mcpServer
        });
        return {
            cleanup,
            url: `http://localhost:${port}/mcp`
        };
    }

    it("should search items with query", async () => {
        const { cleanup, url } = await createTestServer();
        try {
            // MCP Clientを作成
            const client = await createConnection(url);
            // search_itemsを呼び出す
            const response = await client.callTool({
                name: "search_items",
                arguments: {
                    query: "Test",
                    limit: 2,
                    offset: 0
                }
            });
            // レスポンスをスナップショットテスト
            expect(response).toMatchInlineSnapshot(`
              {
                "content": [
                  {
                    "text": "[
                {
                  "title": "Integrating JavaScript Unit Tests with Visual Studio",
                  "url": "http://stephenwalther.com/blog/archive/2010/12/20/integrating-javascript-unit-tests-with-visual-studio.aspx",
                  "content": "Visual StudioでJavaScriptのUnit Testを行う方法",
                  "date": "2011-01-08T04:20:00.000Z"
                },
                {
                  "title": "jsのオレオレ演算子 - latest log",
                  "url": "http://d.hatena.ne.jp/uupaa/20110123/1295721414",
                  "content": "JavaScriptで演算子の組み合わせやビット演算などで短く書く方法。\\n\`-~n\`とかゴルフでよく見かける。\\n-[forked from: forked from: jsのオレオレ演算子 - jsdo.it - Share JavaScript, HTML5 and CSS](http://jsdo.it/monjudoh/rC57 \\"forked from: forked from: jsのオレオレ演算子 - jsdo.it - Share JavaScript, HTML5 and CSS\\")",
                  "date": "2011-01-09T07:32:00.000Z"
                }
              ]",
                    "type": "text",
                  },
                ],
              }
            `);
        } finally {
            await cleanup();
        }
    });

    it("should search posts with query", async () => {
        const { cleanup, url } = await createTestServer();
        try {
            const client = await createConnection(url);
            const response = await client.callTool({
                name: "search_posts",
                arguments: {
                    query: "Test",
                    limit: 10,
                    offset: 0,
                    sort: "date",
                    order: "desc"
                }
            });
            expect(response).toMatchInlineSnapshot(`
              {
                "content": [
                  {
                    "text": "[
                {
                  "title": "2025-04-17のJS: Zod 4 beta、Next.js 15.3とRspack、LLMを使ったテストのマイグレーション",
                  "url": "https://jser.info/2025/04/17/zod-4-beta-next.js-15.3rspack-llm/",
                  "date": "2025-04-17T23:41:52+09:00",
                  "content": "JSer.info #732 - Zod 4 betaがリリースされました。Introduci...",
                  "category": "JSer",
                  "tags": [
                    "Next.js",
                    "React",
                    "TypeScript",
                    "test",
                    "css"
                  ]
                },
                {
                  "title": "2025-01-23のJS: Vitest 3.0、Rspack 1.2(永続キャッシュ)、react-server",
                  "url": "https://jser.info/2025/01/23/vitest-3.0-rspack-1.2-react-server/",
                  "date": "2025-01-23T10:14:18+09:00",
                  "content": "JSer.info #723 - Vitest 3.0がリリースされました。Vitest 3....",
                  "category": "JSer",
                  "tags": [
                    "React",
                    "vite",
                    "test",
                    "Native",
                    "nodejs"
                  ]
                },
                {
                  "title": "2024-07-18のJS: #700 - Vitest 2.0.0、Node.js 22.5.0(sqlite)、Private Browsing Mode",
                  "url": "https://jser.info/2024/07/18/700-vitest-2.0.0-node.js-22.5.0sqlite-private-browsing-mode/",
                  "date": "2024-07-18T10:03:45+09:00",
                  "content": "JSer.info #700 - Vitest 2.0.0がリリースされました。Release...",
                  "category": "JSer",
                  "tags": [
                    "nodejs",
                    "deno",
                    "Tools",
                    "Bun",
                    "test"
                  ]
                },
                {
                  "title": "2024-06-13のJS: Storybook 8.1、Turborepo 2.0、Node v22.3.0(Snapshot Testing)",
                  "url": "https://jser.info/2024/06/13/storybook-8.1-turborepo-2.0-node-v22.3.0snapshot-testing/",
                  "date": "2024-06-13T13:55:14+09:00",
                  "content": "JSer.info #696 - Storybook 8.1がリリースされました。Storyb...",
                  "category": "JSer",
                  "tags": [
                    "nodejs",
                    "TypeScript",
                    "Tools",
                    "test",
                    "RegExp"
                  ]
                },
                {
                  "title": "2024-06-03のJS: vitest v2.0.0-beta.5(browser mode)、Rspack v0.7、ESLint Migrator",
                  "url": "https://jser.info/2024/06/03/vitest-v2.0.0-beta.5browser-mode-rspack-v0.7-eslint-migrator/",
                  "date": "2024-06-03T22:18:59+09:00",
                  "content": "JSer.info #695 - Vitest v2.0.0-beta.5がリリースされました...",
                  "category": "JSer",
                  "tags": [
                    "test",
                    "book",
                    "TypeScript",
                    "ESLint",
                    "Design"
                  ]
                },
                {
                  "title": "2024-05-12のJS: Headless UI v2.0 for React、Astro v4.8、外部パッケージに依存せずにNode.jsで使えるようになった機能",
                  "url": "https://jser.info/2024/05/12/headless-ui-v2.0-for-react-astro-v4.8-node.js/",
                  "date": "2024-05-12T15:47:28+09:00",
                  "content": "JSer.info #692 - Headless UI v2.0 for Reactがリリー...",
                  "category": "JSer",
                  "tags": [
                    "test",
                    "nodejs",
                    "bundler",
                    "vite",
                    "Hono"
                  ]
                },
                {
                  "title": "2024-03-19のJS: Storybook 8、Nuxt 3.11、Cloudflare Workers + Vitest",
                  "url": "https://jser.info/2024/03/19/storybook-8-nuxt-3.11-cloudflare-workers-vitest/",
                  "date": "2024-03-19T12:24:43+09:00",
                  "content": "JSer.info #685 - Storybook 8.0がリリースされました。Storyb...",
                  "category": "JSer",
                  "tags": [
                    "React",
                    "test",
                    "CSS",
                    "vite",
                    "Tools"
                  ]
                },
                {
                  "title": "2024-02-05のJS: TypeScript 5.4 Beta、Learn Testing/Performance、Interop 2024",
                  "url": "https://jser.info/2024/02/05/typescript-5.4-beta-learn-testingperformance-interop-2024/",
                  "date": "2024-02-05T16:09:35+09:00",
                  "content": "JSer.info #679 - TypeScript 5.4 Betaがリリースされました。...",
                  "category": "JSer",
                  "tags": [
                    "browser",
                    "tutorial",
                    "WebPlatformAPI",
                    "nodejs",
                    "Tools"
                  ]
                },
                {
                  "title": "2023-12-08のJS: Redux 5.0.0、Vitest 1.0.0、Astro 4.0",
                  "url": "https://jser.info/2023/12/08/redux-5.0.0-vitest-1.0.0-astro-4.0/",
                  "date": "2023-12-08T22:05:55+09:00",
                  "content": "JSer.info #672 - Redux Toolkit v2.0.0に関連してRedux...",
                  "category": "JSer",
                  "tags": [
                    "nodejs",
                    "redux",
                    "CSS",
                    "Electron",
                    "deno"
                  ]
                },
                {
                  "title": "2023-10-03のJS: Node v20.8.0、Vitest v1.0.0-beta.0、instant.dev(Rails-inspired ORM/Migrations)",
                  "url": "https://jser.info/2023/10/03/node-v20.8.0-vitest-v1.0.0-beta.0-instant.devrails-inspired-ormmigrations/",
                  "date": "2023-10-03T22:10:21+09:00",
                  "content": "JSer.info #663 - Node.js 20.8.0がリリースされました。Node ...",
                  "category": "JSer",
                  "tags": [
                    "nodejs",
                    "UI",
                    "npm",
                    "cloudflare",
                    "API"
                  ]
                }
              ]",
                    "type": "text",
                  },
                ],
              }
            `);
        } finally {
            await cleanup();
        }
    });

    it("should get jser weeks between dates", async () => {
        const { cleanup, url } = await createTestServer();
        try {
            const client = await createConnection(url);
            const response = await client.callTool({
                name: "get_jser_weeks_between",
                arguments: {
                    beginDate: "2014-01-01",
                    endDate: "2014-01-08"
                }
            });
            expect(response).toMatchInlineSnapshot(`
              {
                "content": [
                  {
                    "text": "[
                {
                  "weekNumber": 156,
                  "beginDate": "2013-12-31T08:38:51.000Z",
                  "endDate": "2014-01-06T14:57:02.000Z",
                  "post": {
                    "postNumber": 156,
                    "title": "2014-01-06のJS:Koa 0.2.0、jQuery Mobile 1.4.0、Functional JavaScript",
                    "url": "https://jser.info/post/72442862507/2014-01-06-js-koa-0-2-0-jquery-mobile-1-4-0-functional",
                    "content": "JSer.info #156 - NodeのWebフレームワークであるKoa 0.2.0(0....",
                    "category": "JSer",
                    "date": "2014-01-06T14:57:02.000Z",
                    "tags": [
                      "node.js",
                      "jQuery",
                      "mobile",
                      "FP"
                    ]
                  }
                },
                {
                  "weekNumber": 157,
                  "beginDate": "2014-01-06T14:57:02.000Z",
                  "endDate": "2014-01-13T14:41:46.000Z",
                  "post": {
                    "postNumber": 157,
                    "title": "2014-01-13のJS: sweet.js 0.4.0、Generatorチュートリアル、同期的に書ける結合テストフレームワークTestium",
                    "url": "https://jser.info/post/73206411885/2014-01-13-js-sweet-js",
                    "content": "JSer.info #157 - JavaScriptをマクロを使って展開出来るSweet.j...",
                    "category": "JSer",
                    "date": "2014-01-13T14:41:46.000Z",
                    "tags": [
                      "macro",
                      "generator",
                      "debug",
                      "testing",
                      "node.js"
                    ]
                  }
                }
              ]",
                    "type": "text",
                  },
                ],
              }
            `);
        } finally {
            await cleanup();
        }
    });

    it("should get jser week with item", async () => {
        const { cleanup, url } = await createTestServer();
        try {
            const client = await createConnection(url);
            const response = await client.callTool({
                name: "get_jser_week_with_item",
                arguments: {
                    // @ts-expect-error -- ある
                    item_url: mockItems[50].url
                }
            });
            expect(response).toMatchInlineSnapshot(`
              {
                "content": [
                  {
                    "text": "{
                "weekNumber": 3,
                "beginDate": "2011-01-18T11:53:04.000Z",
                "endDate": "2011-01-20T13:20:00.000Z",
                "post": {
                  "postNumber": 3,
                  "title": "2011-01-20のJS : IDEの変化、miのWindows版、Node.js製CMSの登場",
                  "url": "https://jser.info/post/2841621230",
                  "content": "今回は直接JavaScriptについてではなく、ブラウザやエディタと言った少し回りの事に関して...",
                  "category": "JSer",
                  "date": "2011-01-20T13:20:00.000Z",
                  "tags": [
                    "javascript",
                    "module",
                    "Css",
                    "IDE",
                    "Editor",
                    "books"
                  ]
                }
              }",
                    "type": "text",
                  },
                ],
              }
            `);
        } finally {
            await cleanup();
        }
    });

    it("should get jser item with url", async () => {
        const { cleanup, url } = await createTestServer();
        try {
            const client = await createConnection(url);
            const response = await client.callTool({
                name: "get_jser_item_with_url",
                arguments: {
                    url: "https://efendibooks.com/minibooks/testing-with-coffeescript"
                }
            });
            expect(response).toMatchInlineSnapshot(`
              {
                "content": [
                  {
                    "text": "{
                "title": "Efendi Books - Testing with CoffeeScript",
                "url": "https://efendibooks.com/minibooks/testing-with-coffeescript",
                "content": "JasmineとCoffeeScriptを使ったテストについての50ページほどの電子書籍(Free)\\n1\\\\. 導入 2\\\\. テストを書いてコードを書く 3.リファクタリング 4\\\\. stubなどを使ったテスト\\n著者は javascriptplayground.com の方",
                "tags": [],
                "date": "2012-08-27T21:08:00.000Z",
                "relatedLinks": []
              }",
                    "type": "text",
                  },
                ],
              }
            `);
        } finally {
            await cleanup();
        }
    });

    it.skip("should get product name", async () => {
        const { cleanup, url } = await createTestServer();
        try {
            const client = await createConnection(url);
            const response = await client.callTool({
                name: "get_product_name",
                arguments: {
                    url: "https://deno.com/blog/add-jsr-with-pnpm-yarn"
                }
            });
            expect(response).toMatchInlineSnapshot();
        } finally {
            await cleanup();
        }
    });
});
