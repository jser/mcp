# @jser/mcp

A MCP Server for JSer.info

- [Introduction - Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk)

## Install

Install with [npm](https://www.npmjs.com/package/@jser/mcp):

    npx @jser/mcp

## Usage

### VSCode MCP 拡張機能との使い方

VSCodeでMCP拡張機能がインストールされている場合、以下の手順で@jser/mcpを利用できます：

1. ターミナルで@jser/mcpを起動する
   ```bash
   npx @jser/mcp
   ```

2. VSCodeのコマンドパレットを開き（`Cmd+Shift+P` または `Ctrl+Shift+P`）、「MCP: Add Server...」を実行

3. サーバーURLに `http://localhost:3000/mcp` を入力して接続

4. 接続後、以下のツールが利用可能になります：
   - `jser_search_items`: タイトル、説明、URL、タグでアイテムを検索（複数キーワードでOR検索可能）
   - `jser_search_posts`: タイトル、説明、URL、タグで投稿を検索
   - `jser_product_name`: URLから製品名を取得
   - `jser_week`: 番号からJSer週を取得
   - `jser_weeks`: 全てのJSer週を取得
   - `jser_weeks_between`: 二つの日付の間のJSer週を取得
   - `jser_week_with_item_url`: アイテムを含むJSer週を取得
   - `jser_item_with_url`: URLからJSerアイテムを取得

## Source

データの取得は`@jser/data-fetcher`を利用する

- データ取得の感覚は最後に実行してから1分経過したら再取得する
- つまり1分間はキャッシュのデータを利用する

検索には[DataSet](https://github.com/jser/dataset)を利用する

```markdown
Item: 紹介するサイトのこと
    1 Item = 1 サイト
    すべてのデータのoriginとなるものです
    サイトごとにタイトル、URL、登録した日付、タグなどが含まれています
    API: https://jser.info/source-data/items.json
Post: JSer.infoに投稿される記事のこと
    1 Post = 1 記事
    それぞれの記事のタイトル、URL、タグ、日付などが含まれます
    @jser/statを使うことでItemとPostを元に指定したサイトが紹介された記事を検索できます
    API: https://jser.info/posts.json
Post Item: JSer.infoに投稿された記事中のItem(サイト)のこと
    1 Post Item = 1 サイト
    基本的にはItemと同じだが、Post ItemはPost(記事)におけるカテゴリ（ヘッドラインなど）が含まれます
    カテゴリの種類は @jser/post-parser を参照してください
    Itemを元に投稿時に編集している場合などもあるため、ItemとPost Itemは必ずしも一致するわけではありません
    制限: カテゴリ区別が付けられたのは2014-08-03からであるため、それ以前のデータは含まれない
    Postにはすべての記事は含まれるがPost Itemのデータは含まれていない
    API: https://jser.info/public/data/post-details.json
```

プロダクト名の検索には[JSer.info Product Name API](https://github.com/jser/product-name)を利用する

```bash
$ curl "https://jser-product-name.deno.dev/?url=https://deno.com/blog/v1.19"
{"name":"Deno","url":"https://deno.com","releaseNoteProbability":0.7619047619047619,"releaseNoteVersion":"v1.19"}
$ curl "https://jser-product-name.deno.dev/?url=https://example.com"
null # status code is 400
```

データ抽出のロジックは [@jser/stat](https://github.com/jser/dataset/tree/master/packages/@jser/stat) を利用する。

```markdown
### findItemsBetween(beginDate, endDate): JSerItem[]

return JSerItems between two dates

### getJSerWeeks(): JSerWeek[]

return all JSerWeeks

### findJSerWeeksBetween(beginDate, endDate):  JSerWeek[]

return JSerWeeks between two dates

### findJSerWeek(number): JSerWeek

number start with 1.

return JSerWeek at the number.

### findWeekWithItem(itemObject): JSerWeek

return JSerWeek contain the itemObject.

### findItemWithURL(URL): JSerItem

return JSerItem match the `URL`.
```

## Features

- Tool Name: `jser_search_items`
  - Title: Search items by title, description, url, and tags
  - Description: Search items by title, description, url, and tags.スペースで区切られた複数のキーワードをOR検索します。
  - Parameters:
    - `query`: Search query
    - `limit`: Number of results to return (default: 10)
    - `offset`: Offset for pagination (default: 0)
    - `sort`: Sort order (default: "relevance")
    - `order`: Sort order (default: "desc")
- Tool Name: `jser_search_posts`
  - Title: Search posts by title, description, url, and tags
  - Description: Search posts by title, description, url, and tags
  - Parameters:
    - `query`: Search query
    - `limit`: Number of results to return (default: 10)
    - `offset`: Offset for pagination (default: 0)
    - `sort`: Sort order (default: "relevance")
    - `order`: Sort order (default: "desc")
- Tool Name: `jser_post_items`
  - Title: Search post items by title, description, url, and tags
  - Description: Search post items by title, description, url, and tags
  - Parameters:
    - `query`: Search query
    - `limit`: Number of results to return (default: 10)
    - `offset`: Offset for pagination (default: 0)
    - `sort`: Sort order (default: "relevance")
    - `order`: Sort order (default: "desc")
- Tool Name: `jser_product_name`
  - Title: Get product name by URL
  - Description: Get product name by URL
  - Parameters:
    - `url`: URL of the product
  - Returns:
    - `name`: Name of the product
    - `url`: URL of the product
    - `releaseNoteProbability`: Probability of the product being a release note
    - `releaseNoteVersion`: Version of the product
    - `releaseNoteURL`: URL of the release note
- Tool Name: `jser_week`
  - Title: Get JSer week by number
  - Description: Get JSer week by number
  - Parameters:
    - `number`: Number of the JSer week
  - Returns:
    - `number`: Number of the JSer week
    - `startDate`: Start date of the JSer week
    - `endDate`: End date of the JSer week
    - `items`: List of items in the JSer week
    - `posts`: List of posts in the JSer week
- Tool Name: `jser_weeks`
  - Title: Get all JSer weeks
  - Description: Get all JSer weeks
  - Returns:
    - `number`: Number of the JSer week
    - `startDate`: Start date of the JSer week
    - `endDate`: End date of the JSer week
    - `items`: List of items in the JSer week
    - `posts`: List of posts in the JSer week
- Tool Name: `jser_weeks_between`
  - Title: Get JSer weeks between two dates
  - Description: Get JSer weeks between two dates
  - Parameters:
    - `beginDate`: Start date of the range
    - `endDate`: End date of the range
  - Returns:
    - `number`: Number of the JSer week
    - `startDate`: Start date of the JSer week
    - `endDate`: End date of the JSer week
    - `items`: List of items in the JSer week
    - `posts`: List of posts in the JSer week
    - `itemsCount`: Number of items in the JSer week
    - `postsCount`: Number of posts in the JSer week
- Tool Name: `jser_week_with_item_url`
  - Title: Get JSer week with item
  - Description: Get JSer week with item
  - Parameters:
    - `item_url`: URL of the item
  - Returns:
    - `number`: Number of the JSer week
    - `startDate`: Start date of the JSer week
    - `endDate`: End date of the JSer week
    - `items`: List of items in the JSer week
    - `posts`: List of posts in the JSer week
- Tool Name: `jser_item_with_url`
  - Title: Get JSer item with URL
  - Description: Get JSer item with URL
  - Parameters:
    - `url`: URL of the item
  - Returns:
    - `title`: Title of the item
    - `url`: URL of the item
    - `description`: Description of the item
    - `tags`: Tags of the item
    - `date`: Date of the item
    - `relatedLinks`: Related links of the item

## Changelog

See [Releases page](https://github.com/jser/mcp/releases).

## Running tests

Install devDependencies and Run `pnpm test`:

    pnpm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/jser/mcp/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- azu: [GitHub](https://github.com/azu), [Twitter](https://twitter.com/azu_re)

## License

MIT © azu
