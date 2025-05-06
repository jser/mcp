import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchItems, fetchPosts, fetchPostDetails } from "@jser/data-fetcher";
import { JSerStat } from "@jser/stat";

/**
 * JSer.info MCP Server
 * Model Context Protocol サーバー for JSer.info
 */
const jserInfoMcpServer = new McpServer({ name: "jser-info-server", version: "1.0.0" });

// データキャッシュ管理
// キャッシュの有効期限：1分
const CACHE_EXPIRE_TIME = 60 * 1000; // 1分間
interface CacheData<T> {
    data: T;
    timestamp: number;
}
const cache: {
    items?: CacheData<ReturnType<typeof fetchItems>>;
    posts?: CacheData<ReturnType<typeof fetchPosts>>;
    postDetails?: CacheData<ReturnType<typeof fetchPostDetails>>;
} = {};

/**
 * キャッシュからデータを取得する。キャッシュが存在しない場合または期限切れの場合は取得して更新する
 * @param cacheKey キャッシュのキー
 * @param fetchFn 取得関数
 * @returns データ
 */
async function getDataWithCache<T>(cacheKey: keyof typeof cache, fetchFn: () => Promise<T>): Promise<T> {
    const currentTime = Date.now();
    const cachedData = cache[cacheKey] as CacheData<T> | undefined;

    // キャッシュが存在しない、または期限切れの場合
    if (!cachedData || currentTime - cachedData.timestamp > CACHE_EXPIRE_TIME) {
        try {
            const data = await fetchFn();
            // @ts-expect-error
            cache[cacheKey] = { data, timestamp: currentTime };
            return data;
        } catch (error) {
            // エラーが発生した場合でキャッシュが存在する場合は期限切れでも返す
            if (cachedData) {
                console.warn(`データの取得に失敗しましたが、キャッシュを返します: ${String(error)}`);
                return cachedData.data;
            }
            throw error; // キャッシュがない場合はエラーを投げる
        }
    }

    return cachedData.data;
}

// ========= ツールの実装 =========

jserInfoMcpServer.tool(
    "search_items",
    "タイトル、説明、URL、タグでアイテムを検索します。スペースで区切られた複数のキーワードをOR検索します",
    {
        query: z.string().describe("検索クエリ。スペースで区切られた複数のキーワードをOR検索します"),
        limit: z.number().default(10).describe("返す結果の最大数 (デフォルト: 10)"),
        offset: z.number().default(0).describe("結果のオフセット (デフォルト: 0)"),
        sort: z.string().default("relevance").describe('ソート順 (デフォルト: "relevance")'),
        order: z.string().default("desc").describe('ソート順序 (デフォルト: "desc")')
    },
    async ({ query, limit, offset, sort, order }) => {
        try {
            // TODO: 実際の検索ロジックの実装
            // 現在は簡易的な実装としてキーワードマッチングのみを行う
            const items = await getDataWithCache("items", fetchItems);

            const queryWords = query.split(" ").map((word) => word.toLowerCase());
            // 単純なキーワードマッチング
            const filteredItems = items.filter((item) => {
                const searchText =
                    `${item.title} ${item.url} ${item.content || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
                return queryWords.some((word) => searchText.includes(word));
            });

            // ソート処理
            let sortedItems = [...filteredItems];
            if (sort === "date") {
                sortedItems.sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return order === "asc" ? dateA - dateB : dateB - dateA;
                });
            }

            // 結果の制限とオフセット
            const result = sortedItems.slice(offset, offset + limit);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("アイテム検索中にエラーが発生しました:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `アイテム検索中にエラーが発生しました: ${String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
);

jserInfoMcpServer.tool(
    "search_posts",
    "タイトル、説明、URL、タグで投稿を検索します",
    {
        query: z.string().describe("検索クエリ"),
        limit: z.number().default(10).describe("返す結果の最大数 (デフォルト: 10)"),
        offset: z.number().default(0).describe("結果のオフセット (デフォルト: 0)"),
        sort: z.string().default("relevance").describe('ソート順 (デフォルト: "relevance")'),
        order: z.string().default("desc").describe('ソート順序 (デフォルト: "desc")')
    },
    async ({ query, limit, offset, sort, order }) => {
        try {
            // 投稿データの取得
            const posts = await getDataWithCache("posts", fetchPosts);

            // 単純なキーワードマッチング
            const filteredPosts = posts.filter((post) => {
                const searchText =
                    `${post.title} ${post.url} ${post.content || ""} ${(post.tags || []).join(" ")}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });

            // ソート処理
            let sortedPosts = [...filteredPosts];
            if (sort === "date") {
                sortedPosts.sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return order === "asc" ? dateA - dateB : dateB - dateA;
                });
            }

            // 結果の制限とオフセット
            const result = sortedPosts.slice(offset, offset + limit);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("投稿検索中にエラーが発生しました:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `投稿検索中にエラーが発生しました: ${String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
);

jserInfoMcpServer.tool(
    "get_product_name",
    "URLから製品名を取得します",
    {
        url: z.string().url().describe("製品のURL")
    },
    async ({ url }) => {
        try {
            const response = await fetch(`https://jser-product-name.deno.dev/?url=${encodeURIComponent(url)}`);

            if (!response.ok) {
                if (response.status === 400) {
                    // APIが400を返す場合、製品名が見つからないことを示す
                    return {
                        content: [
                            {
                                type: "text",
                                text: "製品名が見つかりませんでした"
                            }
                        ]
                    };
                }
                throw new Error(`製品名APIエラー: ${response.statusText}`);
            }

            const result = await response.json();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("製品名取得中にエラーが発生しました:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `製品名取得中にエラーが発生しました: ${String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
);

jserInfoMcpServer.tool(
    "get_jser_week",
    "番号からJSer週を取得します",
    {
        number: z.number().describe("JSer週の番号")
    },
    async ({ number }) => {
        try {
            // データ取得
            const items = await getDataWithCache("items", fetchItems);
            const posts = await getDataWithCache("posts", fetchPosts);

            // JSer週データの取得
            const jserStats = new JSerStat(items, posts);
            const jserWeek = jserStats.findJSerWeek(number);

            if (!jserWeek) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `番号 ${number} のJSer週は見つかりませんでした`
                        }
                    ],
                    isError: true
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(jserWeek, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("JSer週取得中にエラーが発生しました:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `JSer週取得中にエラーが発生しました: ${String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
);

/**
 * get_jser_weeks: 全てのJSer週を取得するツール
 */
jserInfoMcpServer.tool("get_jser_weeks", "全てのJSer週を取得します", {}, async () => {
    try {
        // データ取得
        const items = await getDataWithCache("items", fetchItems);
        const posts = await getDataWithCache("posts", fetchPosts);

        // JSer週データの取得
        const jserStats = new JSerStat(items, posts);
        const jserWeeks = jserStats.getJSerWeeks();

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(jserWeeks, null, 2)
                }
            ]
        };
    } catch (error) {
        console.error("JSer週一覧取得中にエラーが発生しました:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `JSer週一覧取得中にエラーが発生しました: ${String(error)}`
                }
            ],
            isError: true
        };
    }
});

jserInfoMcpServer.tool(
    "get_jser_weeks_between",
    "二つの日付の間のJSer週を取得します",
    {
        beginDate: z.string().describe("期間の開始日"),
        endDate: z.string().describe("期間の終了日")
    },
    async ({ beginDate, endDate }) => {
        try {
            // データ取得
            const items = await getDataWithCache("items", fetchItems);
            const posts = await getDataWithCache("posts", fetchPosts);

            // 日付の検証と変換
            const beginDateObj = new Date(beginDate);
            const endDateObj = new Date(endDate);

            if (isNaN(beginDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "無効な日付形式です"
                        }
                    ],
                    isError: true
                };
            }

            // JSer週データの取得
            const jserStats = new JSerStat(items, posts);
            const jserWeeks = jserStats.findJSerWeeksBetween(beginDateObj, endDateObj);

            if (jserWeeks.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `指定された期間 (${beginDate} - ${endDate}) に一致するJSer週は見つかりませんでした`
                        }
                    ],
                    isError: true
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(jserWeeks, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("JSer週期間検索中にエラーが発生しました:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `JSer週期間検索中にエラーが発生しました: ${String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
);

jserInfoMcpServer.tool(
    "get_jser_week_with_item",
    "アイテムを含むJSer週を取得します",
    {
        item_url: z.string().url().describe("アイテムのURL")
    },
    async ({ item_url }) => {
        try {
            // データ取得
            const items = await getDataWithCache("items", fetchItems);
            const posts = await getDataWithCache("posts", fetchPosts);

            // まずURLからアイテムを探す
            const jserStats = new JSerStat(items, posts);
            const item = jserStats.findItemWithURL(item_url);
            if (!item) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `URL ${item_url} に一致するアイテムは見つかりませんでした`
                        }
                    ],
                    isError: true
                };
            }

            // アイテムを含むJSer週を取得
            const jserWeek = jserStats.findWeekWithItem(item);

            if (!jserWeek) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `アイテム ${item.title} を含むJSer週は見つかりませんでした`
                        }
                    ],
                    isError: true
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(jserWeek, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("アイテムを含むJSer週取得中にエラーが発生しました:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `アイテムを含むJSer週取得中にエラーが発生しました: ${String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
);

jserInfoMcpServer.tool(
    "get_jser_item_with_url",
    "URLからJSerアイテムを取得します",
    {
        url: z.string().url().describe("アイテムのURL")
    },
    async ({ url }) => {
        try {
            // データ取得
            const items = await getDataWithCache("items", fetchItems);
            const posts = await getDataWithCache("posts", fetchPosts);
            // URLからアイテムを探す
            const jserStats = new JSerStat(items, posts);
            const item = jserStats.findItemWithURL(url);

            if (!item) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `URL ${url} に一致するアイテムは見つかりませんでした`
                        }
                    ],
                    isError: true
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(item, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("アイテム取得中にエラーが発生しました:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `アイテム取得中にエラーが発生しました: ${String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
);

export { jserInfoMcpServer };
