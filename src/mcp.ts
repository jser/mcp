import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchItems, fetchPosts, fetchPostDetails } from "@jser/data-fetcher";
import { JSerStat } from "@jser/stat";
import type { JserItem, JserPost } from "@jser/data-fetcher";

// MCPサーバーの型を定義してエクスポート
export type JSerInfoMcpServer = ReturnType<typeof createJSerInfoMcpServer>;

/**
 * JSer.info MCPサーバを作成する
 * @param options テストデータなどの設定オプション
 */
export const createJSerInfoMcpServer = (options?: { items?: JserItem[]; posts?: JserPost[] }) => {
    /**
     * JSer.info MCP Server
     * Model Context Protocol サーバー for JSer.info
     */
    const mcpServer = new McpServer({ name: "jser-info-mcp", version: "1.0.0" });

    // データキャッシュ管理
    // キャッシュの有効期限：1分
    const CACHE_EXPIRE_TIME = 60 * 1000; // 1分間
    interface CacheData<T> {
        data: T;
        timestamp: number;
    }

    const cache: {
        items?: CacheData<JserItem[]>;
        posts?: CacheData<JserPost[]>;
        postDetails?: CacheData<ReturnType<typeof fetchPostDetails>>;
    } = {};

    /**
     * キャッシュからデータを取得する。キャッシュが存在しない場合または期限切れの場合は取得して更新する
     * @param cacheKey キャッシュのキー
     * @param fetchFn 取得関数
     * @returns データ
     */
    async function getDataWithCache<T extends JserItem[] | JserPost[] | ReturnType<typeof fetchPostDetails>>(
        cacheKey: keyof typeof cache,
        fetchFn: () => Promise<T>
    ): Promise<T> {
        const currentTime = Date.now();
        const cachedData = cache[cacheKey] as CacheData<T> | undefined;

        // テストデータが提供されている場合は、それを使用する
        if (cacheKey === "items" && options?.items) {
            return options.items as T;
        }
        if (cacheKey === "posts" && options?.posts) {
            return options.posts as T;
        }

        // キャッシュが存在しない、または期限切れの場合
        if (!cachedData || currentTime - cachedData.timestamp > CACHE_EXPIRE_TIME) {
            try {
                const data = await fetchFn();
                cache[cacheKey] = { data: data as any, timestamp: currentTime };
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

    mcpServer.tool(
        "jser_search_items",
        "タイトル、説明、URL、タグでアイテムを検索します。スペースで区切られた複数のキーワードをOR検索します",
        {
            query: z
                .string()
                .min(1, "検索クエリは1文字以上である必要があります")
                .max(100, "検索クエリは100文字以下である必要があります")
                .describe("検索クエリ。スペースで区切られた複数のキーワードをOR検索します"),
            limit: z
                .number()
                .int("limitは整数である必要があります")
                .min(1, "limitは1以上である必要があります")
                .max(100, "limitは100以下である必要があります")
                .default(10)
                .describe("返す結果の最大数 (デフォルト: 10, 最大: 100)"),
            offset: z
                .number()
                .int("offsetは整数である必要があります")
                .min(0, "offsetは0以上である必要があります")
                .default(0)
                .describe("結果のオフセット (デフォルト: 0)"),
            order: z
                .enum(["desc", "asc"])
                .default("desc")
                .describe("ソート順序：desc - 新しい順（デフォルト）、asc - 古い順")
        },
        async ({ query, limit, offset, order }) => {
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

                // 常に日付でソートする
                const sortedItems = [...filteredItems].sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return order === "asc" ? dateA - dateB : dateB - dateA;
                });

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

    mcpServer.tool(
        "jser_search_posts",
        "タイトル、説明、URL、タグで投稿を検索します",
        {
            query: z
                .string()
                .min(1, "検索クエリは1文字以上である必要があります")
                .max(100, "検索クエリは100文字以下である必要があります")
                .describe("検索クエリ"),
            limit: z
                .number()
                .int("limitは整数である必要があります")
                .min(1, "limitは1以上である必要があります")
                .max(100, "limitは100以下である必要があります")
                .default(10)
                .describe("返す結果の最大数 (デフォルト: 10, 最大: 100)"),
            offset: z
                .number()
                .int("offsetは整数である必要があります")
                .min(0, "offsetは0以上である必要があります")
                .default(0)
                .describe("結果のオフセット (デフォルト: 0)"),
            sort: z
                .enum(["relevance", "date"])
                .default("relevance")
                .describe("ソート順：relevance - 関連度順（デフォルト）、date - 日付順"),
            order: z
                .enum(["desc", "asc"])
                .default("desc")
                .describe("ソート順序：desc - 新しい順/関連度高順（デフォルト）、asc - 古い順/関連度低順")
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
                // relevanceの場合は検索クエリとの一致度でソート（将来的な実装）
                // 現在は検索結果の順序をそのまま使用

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

    mcpServer.tool(
        "jser_product_name",
        "URLからプロダクト名を取得します",
        {
            url: z.string().url().describe("製品のURL")
        },
        async ({ url }) => {
            try {
                const response = await fetch(`https://jser-product-name.deno.dev/?url=${encodeURIComponent(url)}`);

                if (!response.ok) {
                    if (response.status === 400) {
                        // APIが400を返す場合、プロダクト名が見つからないことを示す
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "プロダクト名が見つかりませんでした"
                                }
                            ]
                        };
                    }
                    throw new Error(`プロダクト名APIエラー: ${response.statusText}`);
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
                console.error("プロダクト名取得中にエラーが発生しました:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `プロダクト名取得中にエラーが発生しました: ${String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );

    mcpServer.tool(
        "jser_week",
        "番号からJSerWeekを取得します",
        {
            number: z.number().describe("JSerWeekの番号")
        },
        async ({ number }) => {
            try {
                // データ取得
                const items = await getDataWithCache("items", fetchItems);
                const posts = await getDataWithCache("posts", fetchPosts);

                // JSerWeekデータの取得
                const jserStats = new JSerStat(items, posts);
                const jserWeek = jserStats.findJSerWeek(number);

                if (!jserWeek) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `番号 ${number} のJSerWeekは見つかりませんでした`
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
                console.error("JSerWeek取得中にエラーが発生しました:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `JSerWeek取得中にエラーが発生しました: ${String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );

    mcpServer.tool(
        "jser_weeks_between",
        "二つの日付の間のJSerWeekを取得します",
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

                // JSerWeekデータの取得
                const jserStats = new JSerStat(items, posts);
                const jserWeeks = jserStats.findJSerWeeksBetween(beginDateObj, endDateObj);

                if (jserWeeks.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `指定された期間 (${beginDate} - ${endDate}) に一致するJSerWeekは見つかりませんでした`
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
                console.error("JSerWeek期間検索中にエラーが発生しました:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `JSerWeek期間検索中にエラーが発生しました: ${String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );

    mcpServer.tool(
        "jser_week_with_item_url",
        "アイテムを含むJSerWeekを取得します",
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

                // アイテムを含むJSerWeekを取得
                const jserWeek = jserStats.findWeekWithItem(item);

                if (!jserWeek) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `アイテム ${item.title} を含むJSerWeekは見つかりませんでした`
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
                console.error("アイテムを含むJSerWeek取得中にエラーが発生しました:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `アイテムを含むJSerWeek取得中にエラーが発生しました: ${String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );

    mcpServer.tool(
        "jser_item_with_item_url",
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

    mcpServer.tool("jser_weeks", "全てのJSer週を取得します", {}, async () => {
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

    return mcpServer;
};
