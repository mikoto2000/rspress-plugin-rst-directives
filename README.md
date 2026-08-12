# rspress-plugin-rst-directives

Rspress の Markdown / MDX で、reStructuredText に似た `list-table` と `figure` 記法を使うためのプラグインです。reStructuredText 全体を解析するものではなく、対応 directive を限定して Markdown/MDX の処理パイプラインへ追加します。

## Requirements

- Node.js 20 以上
- Rspress 2.x

## Installation

```bash
npm install rspress-plugin-rst-directives
```

## Configuration

```ts
import { defineConfig } from '@rspress/core';
import { pluginRstDirectives } from 'rspress-plugin-rst-directives';

export default defineConfig({
  plugins: [pluginRstDirectives()],
});
```

将来の directive ごとの設定に備え、`list-table` を明示的に無効化するオプションもあります。

```ts
pluginRstDirectives({
  directives: {
    listTable: false,
    figure: false,
  },
});
```

## list-table

```rst
.. list-table:: Frozen Delights!
   :widths: 15 10 30
   :header-rows: 1

   * - Treat
     - Quantity
     - Description
   * - Albatross
     - 2.99
     - **On a stick!**
   * - Crunchy Frog
     - `1.49`
     - If we took the bones out...

       It would not be crunchy, now would it?
```

一番外側の `*` が行、その内側の `-` がセルです。タイトルは `<caption>`、`header-rows` で指定した先頭行は `<thead>`、残りは `<tbody>` になります。

セルは通常の Markdown として再解析されます。太字、インラインコード、複数段落、リストなどの CommonMark block/inline content を利用できます。

### Header rows

```rst
.. list-table:: API 一覧
   :header-rows: 1

   * - Method
     - Path
   * - GET
     - /users
```

`header-rows` には 0 以上の整数を指定します。未指定時は `0` です。指定した先頭 N 行の全セルが `<th>` として扱われ、残りの行は `<td>` になります。実際の行数より大きな値はエラーです。個別のセルだけをヘッダーにする指定には対応していません。

### Options

| Option | Default | Behavior |
|---|---:|---|
| `:header-rows:` | `0` | 先頭の何行を header とするかを 0 以上の整数で指定します。 |
| `:widths:` | none | 正の数を空白区切りで指定します。列数と一致する必要があり、合計値に対する比率を `<colgroup>` に反映します。 |

不正な整数、負の `header-rows`、実際の行数を超える header、列数の不一致、不正な widths、空の table/row はビルドエラーになります。Rspress 経由のエラーにはファイル名と directive の開始行が含まれます。

## figure

```rst
.. figure:: ./images/architecture.png
   :alt: Architecture
   :width: 640px
   :align: center

   **System architecture** overview.
```

`figure` は semantic な `<figure>`、`<img>`、caption がある場合は `<figcaption>` を生成します。caption は CommonMark として再解析されるため、強調、インラインコード、リンク、複数段落などを利用できます。

相対画像パスは現在の Markdown / MDX ファイルを基準とする ESM import に変換され、Rspress の基盤である Rsbuild の asset pipeline で処理されます。`../assets/image.png` のような相対パス、`/image.png` のような public asset、外部の `https://` URL を利用できます。

### Figure options

| Option | Default | Behavior |
|---|---|---|
| `:alt:` | `""` | `<img>` の代替テキストです。未指定時も空の `alt` 属性を生成します。装飾目的でない画像には指定してください。 |
| `:width:` | none | `640px`、`80%`、`32rem` など、検証済みの CSS length / percentage を画像 style に設定します。 |
| `:height:` | none | `320px` など、`width` と同じ形式の値を画像 style に設定します。 |
| `:align:` | none | `left`、`center`、`right` のいずれかです。プラグインの alignment class を `<figure>` に追加します。 |
| `:class:` | none | 空白区切りの class 名を `<figure>` に追加します。複数指定できます。 |

危険または未対応の size、`left` / `center` / `right` 以外の alignment、markup を含む不正な class、未知 option はエラーになります。現在、Docutils の `figwidth`、`figclass`、`target`、`scale`、`name` には対応していません。完全な Docutils `figure` 互換ではありません。

## Scope and limitations

- 対応する reStructuredText directive は現在 `list-table` と `figure` です。
- Docutils / Sphinx との完全互換は目的としていません。
- `list-table` の `:align:`、`:class:`、`:stub-columns:`、セル結合などは未対応です。
- セル内は CommonMark として解析し、reStructuredText や MDX expression としては解析しません。
- `.. note::` や `.. image::` など未知の directive、コードフェンス内の記述、通常の Markdown table / image、既存の HTML / MDX は変更しません。

単純な表には標準 Markdown table が簡潔です。複数段落やリストをセル内に含めたい場合や、既存の reStructuredText `list-table` を移植する場合にこの記法を利用してください。

## Architecture

Rspress 2 の公式 `markdown.remarkPlugins` 拡張点を使用します。remark plugin が mdast の source position とインデントから対象範囲を特定し、parser が型付き中間表現へ変換・検証した後、transformer が HTML 文字列ではなく semantic な MDX JSX AST を生成します。セルと caption の内容は個別に Markdown AST へ変換されます。

新しい directive は、directive scanner を共有しつつ、専用 parser・validator・transformer を追加して `src/remark.ts` の dispatch に接続できます。将来の `image` directive は、`ImageOptions` と `src` / size / align / class parser、および local asset import 生成を `figure` と共有できます。
