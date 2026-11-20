<p align="center">
  <img src="docs/logo.svg" alt="" width="88">
</p>

<h1 align="center">YXY DSH プラグイン集</h1>

<p align="center">
  <strong>DeepSeek Harness</strong> 向けのプラグイン集です。アプリ内でパッケージ名を指定してインストールでき、ダウンロードやビルドは不要です。
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
</p>

## プラグイン

| プラグイン | 追加される機能 |
| --- | --- |
| **[workspace-collapse-all](plugins/workspace-collapse-all/README.md)** | サイドバーの下部にボタンを 1 つ追加し、すべてのワークスペースをまとめて折りたたむ／展開します。 |
| **[skill-display-enrichment](plugins/skill-display-enrichment/README.md)** | `/` スキルメニューにローカライズされた名前と短い説明を表示します。 |

## インストール

1. **設定 → プラグイン → プラグインを追加**を開きます。
2. パッケージ名を貼り付けて**インストール**をクリックします。
3. DSH を再起動するか、プラグイン一覧を再読み込みします。

| プラグイン | 入力する文字列 | 最新バージョン |
| --- | --- | --- |
| workspace-collapse-all | `dsh-workspace-collapse-all` | [![npm](https://img.shields.io/npm/v/dsh-workspace-collapse-all?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-workspace-collapse-all) |
| skill-display-enrichment | `dsh-skill-display-enrichment` | [![npm](https://img.shields.io/npm/v/dsh-skill-display-enrichment?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-skill-display-enrichment) |

どちらも npm 上の MIT ライセンスのパッケージです。特定のリリースに固定したい場合は、
`dsh-workspace-collapse-all@0.1.4` のようにバージョンを付けます。

**中国大陸のミラーを使う場合:** ミラーは npm より数分から数時間遅れることがあり、
「最新」が古いリリースを指したままの場合もあります。最新版が必要なときはインストール元を
公式レジストリに切り替えるか、バージョンを明示してください。

**ターミナルを使う場合**は `dsh` コマンドでも同じパッケージをインストールできます:

```sh
dsh plugin --profile desktop add dsh-workspace-collapse-all
dsh plugin --profile desktop add dsh-skill-display-enrichment
```

## 使い方

### workspace-collapse-all

ボタンはサイドバーの下部、アカウント行の上、Remote の項目の隣にあります。

- **二重シェブロンが上向き** — いずれかのワークスペースが開いています。クリックするとすべて折りたたみます。
- **二重シェブロンが下向き** — すべて閉じています。クリックするとすべて展開し、入れ子の
  フォルダも 1 階層ずつ開きます。
- 可視テキストはありません。マウスを重ねると操作名が表示され、スクリーンリーダーでも読み上げられます。
- サイドバーがフラットリスト表示中、またはセッション検索中は、操作対象のグループがないため
  ボタンが暗くなります。
- サイドバーが細いレール表示のときはボタンは表示されません。

### skill-display-enrichment

入力欄で `/` を押してスキルメニューを開くと、このリリースが対応しているスキルについて
ローカライズされた名前と短い説明が表示されます（文言は各スキルの `agents/openai.yaml` に
由来します）。裸の id ではなく「名前 + 短い説明」として読めます。

- 行を選んだときに挿入されるのは実際のコマンド（`/skill-name` など）です。
- DSH が表示名を標準サポートするようになった場合、このプラグインは自動的に待機し、
  標準のメニューがそのまま使われます。

## 互換性

本プラグインは **DSH 0.2.x** 向けです。将来の DSH 更新でプラグインが依存している画面構造が
変わることがありますが、その場合も UI を壊さず静かに縮退します:

- `workspace-collapse-all` はボタンを無効化するか、切り替えに失敗したことを通知します。
- `skill-display-enrichment` は DSH 標準のメニュー表示を保ち、コンソールに警告を残します。

どちらのプラグインもセッションを変更せず、外部に何も送信しません。

## ライセンス

[MIT](LICENSE)。コミュニティプロジェクトであり、DeepSeek の公式製品ではありません。
DeepSeek および関連する名称・標識は各所有者に帰属します。
