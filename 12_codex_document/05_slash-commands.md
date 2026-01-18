---
name: slash-commands
description: Codex CLI組み込みSlash Commandsの一覧と使用方法
---

# 組み込みSlash Commands 完全ガイド

Codex CLIには、セッション制御や設定変更のための組み込みスラッシュコマンドが用意されています。

## 目次

1. [概要](#概要)
2. [コマンド一覧](#コマンド一覧)
3. [セッション管理](#セッション管理)
4. [設定・制御](#設定制御)
5. [コードレビュー](#コードレビュー)
6. [ファイル操作](#ファイル操作)
7. [その他](#その他)
8. [Custom Promptsとの関係](#custom-promptsとの関係)

---

## 概要

### スラッシュコマンドとは

- `/` で始まる組み込みコマンド
- セッション制御、設定変更、ユーティリティ機能
- 対話モード（TUI）でのみ使用可能

### 使用方法

```
# コマンド入力
/command

# 引数付き
/command argument

# 一覧表示
/
```

---

## コマンド一覧

### クイックリファレンス

| コマンド | 説明 | カテゴリ |
|---------|------|---------|
| `/approvals` | 承認設定を変更 | 設定 |
| `/compact` | 会話を要約してトークン節約 | セッション |
| `/diff` | Git diffを表示 | ファイル |
| `/exit` | CLIを終了 | セッション |
| `/feedback` | ログをメンテナに送信 | その他 |
| `/fork` | 保存した会話を新スレッドに分岐 | セッション |
| `/init` | AGENTS.mdスキャフォールド生成 | ファイル |
| `/logout` | Codexからサインアウト | 認証 |
| `/mcp` | 設定済みMCPツールを一覧表示 | 設定 |
| `/mention` | ファイルを会話に添付 | ファイル |
| `/model` | アクティブモデルを選択 | 設定 |
| `/new` | 新しい会話を開始 | セッション |
| `/quit` | CLIを終了（/exitと同じ） | セッション |
| `/resume` | 保存した会話を再開 | セッション |
| `/review` | ワーキングツリーをレビュー | レビュー |
| `/skills` | 利用可能なスキルを表示 | 設定 |
| `/status` | セッション設定とトークン使用量 | 設定 |

---

## セッション管理

### /new

現在のCLIセッション内で新しい会話を開始。

```
/new
```

- 現在のコンテキストをリセット
- ターミナルを離れずに新規開始
- 以前のセッションは保存される

### /fork

保存した会話を新しいスレッドに分岐。

```
/fork
```

- 以前のセッションを選択
- 新しいブランチとして継続
- 元のセッションは変更されない

**ユースケース**: 別のアプローチを試す場合

### /resume

保存した会話を再開。

```
/resume           # セッションリストを表示
/resume --last    # 最後のセッションを即座に再開
/resume <ID>      # 特定のセッションを再開
```

**オプション**:
| オプション | 説明 |
|-----------|------|
| `--last` | ピッカーをスキップして最新を再開 |
| `--all` | 現在のディレクトリ以外も表示 |
| `<SESSION_ID>` | 特定のセッションを指定 |

### /compact

会話を要約してトークンを節約。

```
/compact
```

- 長い会話を圧縮
- コンテキストウィンドウを確保
- 重要な情報は保持

### /exit, /quit

CLIを終了。

```
/exit
/quit
```

- どちらも同じ動作
- `Ctrl+C` × 2 でも終了可能

---

## 設定・制御

### /approvals

Codexが事前承認なしで実行できる操作を設定。

```
/approvals
```

対話的に承認レベルを選択:
- コマンド実行の承認
- ファイル変更の承認
- ネットワークアクセスの承認

詳細は [06_approval-sandbox.md](06_approval-sandbox.md) 参照。

### /model

アクティブなモデルと推論レベルを選択。

```
/model
```

選択可能なモデル:
- `gpt-5.2-codex` - 最新のコーディング特化モデル
- `gpt-5-codex` - デフォルト（macOS/Linux）
- `gpt-5` - 汎用モデル（Windowsデフォルト）
- `o3` - 推論強化モデル
- `o3-mini` - 軽量推論モデル

**推論レベル**（o3系モデル）:
```
/model
# → o3 を選択
# → 推論レベル: low / medium / high
```

### /status

現在のセッション設定とトークン使用量を表示。

```
/status
```

表示内容:
- アクティブなモデル
- 承認ポリシー
- サンドボックスモード
- トークン使用量
- 読み込まれたAGENTS.md

### /mcp

設定済みのMCPツールを一覧表示。

```
/mcp
```

表示内容:
- 登録されたMCPサーバー
- 利用可能なツール
- 接続状態

詳細は [08_mcp.md](08_mcp.md) 参照。

### /skills

利用可能なスキルを表示・選択。

```
/skills
```

- インストール済みスキル一覧
- スキルの説明
- 選択して発動可能

詳細は [03_skills.md](03_skills.md) 参照。

---

## コードレビュー

### /review

ワーキングツリーの変更をレビュー。

```
/review
```

レビューオプション:
1. **ブランチに対してレビュー** - ベースブランチからの差分
2. **未コミット変更をレビュー** - ステージ済み/未ステージの変更
3. **特定コミットをレビュー** - コミット単位の分析

**特徴**:
- 読み取り専用（ファイル変更なし）
- 優先度付きの指摘事項
- アクション可能な改善提案

詳細は [11_code-review.md](11_code-review.md) 参照。

---

## ファイル操作

### /diff

Git diffを表示（追跡されていないファイルも含む）。

```
/diff
```

表示内容:
- ステージ済みの変更
- 未ステージの変更
- 追跡されていない新規ファイル

### /mention

ファイルまたはフォルダを会話に添付。

```
/mention
/mention src/utils.ts
/mention src/components/
```

- 特定ファイルをコンテキストに追加
- フォルダを指定して複数ファイルを追加
- Codexがファイル内容を参照可能に

### /init

現在のディレクトリにAGENTS.mdスキャフォールドを生成。

```
/init
```

- プロジェクト情報を自動検出
- テンプレートを生成
- コミット用にカスタマイズ可能

生成される内容:
```markdown
# Project Name

## Build & Test
...

## Code Style
...
```

詳細は [02_agents-md.md](02_agents-md.md) 参照。

---

## その他

### /logout

Codexからサインアウト。

```
/logout
```

- 保存された認証情報を削除
- 共有マシンで使用時に推奨
- 再度ログインが必要

### /feedback

ログをCodexメンテナに送信。

```
/feedback
```

- 問題報告
- 診断情報の共有
- 匿名化されたログ

---

## Custom Promptsとの関係

### 組み込み vs カスタム

| 種類 | 呼び出し | 定義場所 |
|------|---------|---------|
| 組み込み | `/command` | Codex内蔵 |
| Custom Prompts | `/prompts:name` | `~/.codex/prompts/` |

### 使い分け

```
# 組み込みコマンド（セッション制御）
/model
/review
/status

# Custom Prompts（プロンプトテンプレート）
/prompts:draftpr
/prompts:generate-tests
```

### 名前空間

- 組み込み: `/command`
- カスタム: `/prompts:command`

衝突を避けるため、Custom Promptsは `prompts:` プレフィックスが必要。

---

## キーボードショートカット

### TUI操作

| ショートカット | 動作 |
|--------------|------|
| `Ctrl+C` × 2 | 終了 |
| `Ctrl+D` × 2 | 終了 |
| `Ctrl+G` | 外部エディタでプロンプト編集 |
| `Tab` | 補完 |
| `↑` / `↓` | 履歴ナビゲーション |

### エディタ設定

`Ctrl+G` で起動するエディタは環境変数で設定:

```bash
# ~/.bashrc or ~/.zshrc
export VISUAL=code    # VS Code
export EDITOR=vim     # Vim
```

---

## トラブルシューティング

### コマンドが認識されない

```
# 正しい形式を確認
/model     ✓
/ model    ✗
model      ✗
```

### /resume でセッションが見つからない

```
# 全ディレクトリのセッションを表示
/resume --all

# 履歴ファイル確認
ls ~/.codex/history.jsonl
```

### /review が動作しない

```
# Git リポジトリ内であることを確認
git status

# 変更があることを確認
git diff
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [04_custom-prompts.md](04_custom-prompts.md) - Custom Prompts
- [06_approval-sandbox.md](06_approval-sandbox.md) - Approval Policy
- [11_code-review.md](11_code-review.md) - /review 詳細
- [Slash Commands Documentation](https://developers.openai.com/codex/cli/slash-commands/) - 公式ドキュメント
