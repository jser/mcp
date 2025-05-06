# @jser/mcp

A MCP Server for JSer.info

- [Introduction - Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk)

## Usage

### VSCode MCP 拡張機能との使い方

VSCodeでMCP拡張機能がインストールされている場合、以下のいずれかの方法でJSer.info MCPを利用できます：

#### リモートサーバーを利用する場合（推奨）

以下のいずれかの方法でリモートサーバーを追加できます：

##### 方法1: コマンドラインから追加

```bash
code --add-mcp '{"name":"jser-info-mcp","url":"https://mcp.jser.info/mcp"}'
```

##### 方法2: settings.jsonに追加

VSCodeのsettings.jsonに以下の設定を追加します：
```json
"mcp": {
  "servers": {
    "jser-info-mcp": {
      "url": "https://mcp.jser.info/mcp"
    }
  }
}
```

これで自動的にJSer.info MCPが利用可能になります。

#### ローカルサーバーを利用する場合

1. ターミナルで@jser/mcpを起動する
   ```bash
   npx @jser/mcp
   ```

2. VSCodeのコマンドパレットを開き（`Cmd+Shift+P` または `Ctrl+Shift+P`）、「MCP: Add Server...」を実行

3. サーバーURLに `http://localhost:3000/mcp` を入力して接続

### 利用できる機能

接続後、以下のツールが利用可能になります：
   - `jser_search_items`: タイトル、説明、URL、タグでアイテムを検索（複数キーワードでOR検索可能）
   - `jser_search_posts`: タイトル、説明、URL、タグで投稿を検索
   - `jser_product_name`: URLからプロダクト名を取得
   - `jser_week`: 番号からJSer週を取得
   - `jser_weeks`: 全てのJSer週を取得
   - `jser_weeks_between`: 二つの日付の間のJSer週を取得
   - `jser_week_with_item_url`: アイテムを含むJSer週を取得
   - `jser_item_with_item_url`: URLからJSerアイテムを取得

### 利用できるtool

JSer.info MCPでは、次の tool が利用できます。

#### jser_search_items

タイトル、説明、URL、タグでアイテムを検索します。スペースで区切られた複数のキーワードをOR検索します。

パラメータ:
- `query`: 検索クエリ（1-100文字）。スペースで区切られた複数のキーワードをOR検索
- `limit`: 返す結果の最大数（1-100、デフォルト: 10）
- `offset`: 結果のオフセット（0以上、デフォルト: 0）
- `order`: ソート順序
  - `desc`: 新しい順（デフォルト）
  - `asc`: 古い順

返り値:
- アイテムの配列
  - `title`: アイテムのタイトル
  - `url`: アイテムのURL
  - `content`: アイテムの説明文
  - `tags`: タグの配列
  - `date`: 登録日時
  - `relatedLinks`: 関連リンクの配列

#### jser_search_posts

タイトル、説明、URL、タグで投稿を検索します。

パラメータ:
- `query`: 検索クエリ（1-100文字）
- `limit`: 返す結果の最大数（1-100、デフォルト: 10）
- `offset`: 結果のオフセット（0以上、デフォルト: 0）
- `sort`: ソート順
  - `relevance`: 関連度順（デフォルト）
  - `date`: 日付順
- `order`: ソート順序
  - `desc`: 新しい順/関連度高順（デフォルト）
  - `asc`: 古い順/関連度低順

返り値:
- 投稿の配列
  - `title`: 投稿のタイトル
  - `url`: 投稿のURL
  - `content`: 投稿の内容
  - `tags`: タグの配列
  - `date`: 投稿日時


#### jser_product_name

URLからプロダクト名を取得します。

パラメータ:
- `url`: 製品のURL（必須）

返り値:
- 製品情報のオブジェクト
  - `name`: プロダクト名
  - `url`: 製品のURL
  - `releaseNoteProbability`: リリースノートである確率
  - `releaseNoteVersion`: リリースノートのバージョン情報（該当する場合）
  - `releaseNoteURL`: リリースノートのURL（該当する場合）

#### jser_week

番号からJSer週を取得します。

パラメータ:
- `number`: JSer週の番号（必須）

返り値:
- JSer週のオブジェクト
  - `number`: JSer週の番号
  - `startDate`: 開始日
  - `endDate`: 終了日
  - `items`: その週のアイテムリスト
  - `posts`: その週の投稿リスト

#### jser_weeks

全てのJSer週を取得します。

返り値:
- JSer週オブジェクトの配列
  - `number`: JSer週の番号
  - `startDate`: 開始日
  - `endDate`: 終了日
  - `items`: その週のアイテムリスト
  - `posts`: その週の投稿リスト

#### jser_weeks_between

指定した期間のJSer週を取得します。

パラメータ:
- `beginDate`: 期間の開始日（必須）
- `endDate`: 期間の終了日（必須）

返り値:
- JSer週オブジェクトの配列
  - `number`: JSer週の番号
  - `startDate`: 開始日
  - `endDate`: 終了日
  - `items`: その週のアイテムリスト
  - `posts`: その週の投稿リスト
  - `itemsCount`: アイテム数
  - `postsCount`: 投稿数

#### jser_week_with_item_url

指定したURLのアイテムを含むJSer週を取得します。

パラメータ:
- `item_url`: アイテムのURL（必須）

返り値:
- JSer週のオブジェクト
  - `number`: JSer週の番号
  - `startDate`: 開始日
  - `endDate`: 終了日
  - `items`: その週のアイテムリスト
  - `posts`: その週の投稿リスト

#### jser_item_with_item_url

指定したURLのアイテムを取得します。

パラメータ:
- `url`: アイテムのURL（必須）

返り値:
- アイテムのオブジェクト
  - `title`: タイトル
  - `url`: URL
  - `description`: 説明
  - `tags`: タグの配列
  - `date`: 日付
  - `relatedLinks`: 関連リンクの配列

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
