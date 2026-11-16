<p align="center">
  <img src="docs/logo.svg" alt="" width="88">
</p>

<h1 align="center">YXY DSH プラグイン集</h1>

<p align="center">
  <strong>DeepSeek Harness</strong>（DSH）向けの小さなプラグイン集です。パッケージ名だけでインストールでき、リポジトリのクローンは不要です。
</p>

<p align="center">
  <a href="README.md">English</a>
  &nbsp;·&nbsp;
  <a href="README.zh.md">中文</a>
  &nbsp;·&nbsp;
  <strong>日本語</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License: MIT"></a>
  <a href="https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/actions/workflows/test.yml"><img src="https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://www.npmjs.com/package/dsh-workspace-collapse-all"><img src="https://img.shields.io/badge/DSH-0.2.x-4D6BFE" alt="DSH 0.2.x"></a>
</p>

## プラグイン

| プラグイン | 機能 | バージョン |
| --- | --- | --- |
| **[workspace-collapse-all](plugins/workspace-collapse-all/README.md)** | サイドバーのアカウント行の上に常設ボタンを 1 つ追加し、すべてのワークスペースを折りたたむ／展開します。サイドバー自身の行を操作するため、標準のアニメーションと保存済みの表示状態はそのまま保たれます。 | [![npm](https://img.shields.io/npm/v/dsh-workspace-collapse-all?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-workspace-collapse-all) |
| **[skill-display-enrichment](plugins/skill-display-enrichment/README.md)** | 各スキルの `agents/openai.yaml` にある `display_name` と `short_description` を `/` スキルメニューに表示します。選択時に挿入されるのは実際のスキル名のままです。DSH 側が標準対応した場合は自動的に待機します。 | [![npm](https://img.shields.io/npm/v/dsh-skill-display-enrichment?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-skill-display-enrichment) |

どちらも MIT で `registry.npmjs.org` に公開しています。このリポジトリは単一の
パッケージではなくプラグイン集で、`plugins/` 下の各ディレクトリを個別にインストール
できます。

## インストール

**DSH Desktop** — **設定 → プラグイン → プラグインを追加**を開き、パッケージ名を貼り付けて
インストールし、再起動するかプラグイン一覧を再読み込みします。

| プラグイン | 入力する文字列 |
| --- | --- |
| workspace-collapse-all | `dsh-workspace-collapse-all` |
| skill-display-enrichment | `dsh-skill-display-enrichment` |

同じ入力欄は、バージョン付き（`dsh-workspace-collapse-all@0.1.0`）、tarball、パッケージの
ルートを指す Git アドレス、ローカルの絶対パスも受け付けます。通常はパッケージ名を使います。

**CLI**:

```sh
dsh plugin --profile desktop add dsh-workspace-collapse-all
dsh plugin --profile desktop add dsh-skill-display-enrichment
```

**開発時**はローカルディレクトリを指定するとチェックアウトがリンクされ、編集が即座に
反映されます:

```sh
git clone https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN.git
cd YXY_DSH_PLUGIN
dsh plugin --profile probe-topic add "$PWD/plugins/workspace-collapse-all"
```

## 各プラグインの動作

### workspace-collapse-all

`sidebar.footer.action`（アカウント行の上）に常設の項目を追加します。

- いずれかのワークスペースが開いていれば **Collapse all workspaces** と表示し、すべて閉じます。
- すべて閉じているときは **Expand all workspaces** と表示し、入れ子のフォルダも 1 階層ずつ開きます。
- フラットリスト表示中やセッション検索中は **No workspaces here** と表示して無効になります。
- サイドバーが 56px のレール表示のときは非表示です（その状態では一覧自体が描画されないため）。

サイドバーのワークスペース行の構造に依存します。DSH の更新でその構造が変わった場合は、
項目が無効になるか、失敗理由をスクリーンリーダー向けに通知します。無作為にクリックする
ことはなく、セッションの内容にも触れません。

### skill-display-enrichment

Codex 形式のスキルは `agents/openai.yaml` に表示用メタデータを持っていますが、DSH が読むのは
`name` と `description` だけです。このプラグインは `ui-skill` が登録する `/` メニューの
ソースを見つけ、絞り込みと挿入のロジックには手を加えず、YAML の `label` と `description` を
補います。メニューにはローカライズされた名前と短い説明が並び、挿入されるのは
`/skill-name` のままです。

- フェイルソフト: 将来の DSH が表示名を標準対応した場合、最初の非空カタログで検出して待機します。
- 診断: `window.__DSH_SKILL_DISPLAY_ENRICHMENT__.report()` がメニューのソース、DSH のバージョン、メタデータ件数、状態を返します。
- 背景: [機能提案](plugins/skill-display-enrichment/docs/dsh-feature-proposal.md)
  · [ディスカッション](https://github.com/deepseek-ai/deepseek-harness/discussions/10375)。

## リポジトリ構成

```text
YXY_DSH_PLUGIN/
├── README.md  README.zh.md  README.ja.md
├── docs/
│   ├── adding-a-plugin.md
│   └── logo.svg
└── plugins/
    ├── README.md
    ├── skill-display-enrichment/
    └── workspace-collapse-all/
```

`plugins/<name>/` はそれぞれ独立した DSH バンドルです。`package.json`
（`dsh.bundle.patch` と任意の `dsh.client`）、`cordis.patch.yml`、`lib/`、`locale/`、
`icon.svg`、`LICENSE`、独自のテストと README を持ちます。レイアウト・命名・公開手順は
[`plugins/README.md`](plugins/README.md)、手順の詳細は
[`docs/adding-a-plugin.md`](docs/adding-a-plugin.md) にあります。

## 開発

リポジトリのルートで全プラグインのテストを実行します:

```sh
npm test
```

各プラグインは独自のコマンドを持ちます。`skill-display-enrichment` の例:

```sh
cd plugins/skill-display-enrichment
node scripts/sync-metadata.mjs   # 埋め込みラベルを再生成
npm test
```

CI は push と pull request で `npm test` を実行します。結合テストには使い捨ての DSH
プロファイルを使い、プローブが通るまで `desktop` プロファイルは変更しません。

## 互換性

DSH は 0.2 のプレビュー段階で、プラグイン API も進化しています。本リポジトリの
プラグインは次の方針を取ります:

- `package.json` で peer 範囲を宣言し、ホストが内蔵するパッケージは任意扱いにします。
- 必要なホスト側の機能は feature detection で確認し、非公開フィールドの存在を仮定しません。
- 失敗時は警告を出して元の UI を保ったまま縮退します。
- 自身のバージョンを記録し、一貫した診断エントリを提供します。

状態モデルの詳細は各プラグインの README、`skill-display-enrichment` については
[`docs/compatibility-diagnostics.md`](plugins/skill-display-enrichment/docs/compatibility-diagnostics.md)
を参照してください。

## ライセンス

[MIT](LICENSE)。これはコミュニティプロジェクトであり、DeepSeek の公式製品ではありません。
DeepSeek および関連する名称・標識は各所有者に帰属します。
