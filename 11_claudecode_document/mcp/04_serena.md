# Serena MCP セットアップガイド

## 目次
1. [概要](#概要)
2. [前提条件](#前提条件)
3. [セットアップ手順](#セットアップ手順)
4. [ブラウザ自動起動の無効化](#ブラウザ自動起動の無効化)
5. [設定ファイル](#設定ファイル)
6. [使用方法](#使用方法)
7. [トラブルシューティング](#トラブルシューティング)

## 概要

### Serena MCPとは

**Serena MCP**は、AIにプロジェクトコードを深く理解させるための「賢い通訳者」として機能するMCPサーバーです。セマンティック解析によりプロジェクト構造を意味的に理解し、効率的なコーディング支援を実現します。

| 項目 | 詳細 |
|------|------|
| 正式名称 | Serena |
| 開発元 | Oraios |
| ライセンス | オープンソース（無料） |
| リポジトリ | https://github.com/oraios/serena |
| 対応言語 | Python, TypeScript, Go 等 |

### 主な特徴

- **セマンティック解析**: コードの構造を意味的に理解
- **トークン削減**: 約60〜80%のトークン消費を削減
- **多言語対応**: 複数のプログラミング言語をサポート
- **完全無料**: オープンソースで無料利用可能
- **IDE統合**: Claude Code、Cursor等から利用可能

## 前提条件

### 必須要件

| 要件 | 説明 |
|------|------|
| Python | 3.8以上 |
| uv | Pythonパッケージ管理ツール |
| Claude Code | MCP対応のClaude Code環境 |

### uvのインストール

**miseを使用する場合（推奨）**:
```bash
mise use uv@latest
```

**Windowsの場合**:
```powershell
# PowerShellで実行
irm https://astral.sh/uv/install.ps1 | iex
```

**macOS/Linuxの場合**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## セットアップ手順

### Step 1: MCPサーバーの登録

プロジェクトディレクトリで以下のコマンドを実行します。

**macOS/Linux**:
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
```

**Windows（PowerShell）**:
```powershell
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $PWD
```

**Windows（Git Bash）**:
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
```

### Step 2: 初期化の実行

Claude Code起動後、以下のコマンドを実行してSerenaを初期化します。

```
/mcp__serena__initial_instructions
```

これによりSerenaがプロジェクトを解析し、セマンティックインデックスを構築します。

## ブラウザ自動起動の無効化

Serenaはデフォルトで起動時にWebダッシュボードをブラウザで開きます。Claude Codeを使用するたびにブラウザが開くのは煩わしいため、以下の方法で無効化できます。

### 方法1: 設定ファイルで無効化（推奨）

`~/.serena/serena_config.yml` を作成または編集します。

**設定ファイルの場所**:
- Windows: `%USERPROFILE%\.serena\serena_config.yml`
- macOS/Linux: `~/.serena/serena_config.yml`

**設定内容**:
```yaml
# ブラウザ自動起動を無効化（ダッシュボード機能は維持）
web_dashboard_open_on_launch: false
```

この設定により、ダッシュボード機能自体は有効のまま、ブラウザの自動起動のみを無効化できます。必要な場合は手動で `http://localhost:24282/dashboard/index.html` にアクセスできます。

**ダッシュボード機能自体を完全に無効化する場合**:
```yaml
# ダッシュボード機能を完全に無効化
web_dashboard: false
```

### 方法2: コマンドラインオプションで無効化

MCP登録時にオプションを追加する方法です。

**macOS/Linux**:
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd) --enable-web-dashboard false
```

**Windows（PowerShell）**:
```powershell
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $PWD --enable-web-dashboard false
```

### 方法3: 既存のMCP設定を編集

既にSerenaを登録済みの場合、`.mcp.json` を直接編集してオプションを追加できます。

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        "/path/to/your/project",
        "--enable-web-dashboard",
        "false"
      ]
    }
  }
}
```

### 注意事項

- **Dev Container環境**: Dev Containerを使用している場合、Serenaは別途 `serena_config.docker.yml` を作成します。この場合はDocker用の設定ファイルも編集が必要です
- **設定の優先順位**: コマンドラインオプションは設定ファイルより優先されます
- **開発者の意図**: Serena開発チームは「ユーザーにダッシュボード機能を認識してもらうため」デフォルトで有効にしています

## 設定ファイル

### グローバル設定

Serenaのグローバル設定は `~/.serena/serena_config.yml` で管理します。

**設定ファイルの場所**:
- Windows: `%USERPROFILE%\.serena\serena_config.yml`
- macOS/Linux: `~/.serena/serena_config.yml`

**設定例**:
```yaml
# ブラウザ自動起動を無効化（推奨）
web_dashboard_open_on_launch: false

# ダッシュボード機能を完全に無効化する場合
# web_dashboard: false
```

**設定の編集方法**:
- 直接ファイルを編集
- ダッシュボードの「Edit Global Serena Config」ボタンから編集
- `serena config edit` コマンドを使用

### Claude Code MCP設定

`claude mcp add` コマンドを実行すると、以下のいずれかに設定が追加されます：

**プロジェクト設定**（推奨）:
- `.mcp.json`（プロジェクトルート）

**グローバル設定**:
- Windows: `%APPDATA%\Claude\settings.json`
- macOS: `~/Library/Application Support/Claude/settings.json`
- Linux: `~/.config/Claude/settings.json`

**設定例（.mcp.json）**:
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        "/path/to/your/project"
      ]
    }
  }
}
```

## 使用方法

### 初期化コマンド

Claude Codeで新しいセッションを開始するたびに、以下を実行してSerenaを初期化します：

```
/mcp__serena__initial_instructions
```

### 利用可能な機能

Serenaは以下のようなコード理解機能を提供します：

| 機能 | 説明 |
|------|------|
| コード構造解析 | プロジェクトの構造を意味的に理解 |
| シンボル検索 | 関数・クラス・変数の定義と参照を検索 |
| 依存関係分析 | モジュール間の依存関係を把握 |
| コンテキスト提供 | 必要な情報のみを効率的に提供 |

### 効率的な運用

**Custom Slash Command化**:

頻繁に使用する場合は、Slash Commandとして登録すると便利です。

`~/.claude/commands/serena-init.md`:
```markdown
/mcp__serena__initial_instructions を実行してSerenaを初期化してください。
```

**Sub Agentでの活用**:

Serenaの解析結果を活用するSub Agentを作成することで、より高度なコード理解を実現できます。

## トラブルシューティング

### よくある問題と解決方法

#### 1. ブラウザが自動で開く

**症状**: Claude Code起動時に毎回ブラウザでダッシュボードが開く

**解決方法**: [ブラウザ自動起動の無効化](#ブラウザ自動起動の無効化) セクションを参照してください。

**クイックフィックス**:
```yaml
# ~/.serena/serena_config.yml
web_dashboard_open_on_launch: false
```

#### 2. uvx が見つからない

**症状**: `command not found: uvx`

**解決方法**:
```bash
# uvをインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# シェルを再起動または
source ~/.bashrc  # または ~/.zshrc
```

#### 3. MCPサーバーが起動しない

**症状**: Claude Codeで接続エラー

**解決方法**:
1. uvxのバージョン確認
   ```bash
   uvx --version
   ```

2. 手動でMCPサーバーを起動してテスト
   ```bash
   uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project .
   ```

3. エラーメッセージを確認して対処

#### 4. プロジェクトが認識されない

**症状**: Serenaがプロジェクトを正しく解析しない

**解決方法**:
1. プロジェクトパスが正しいか確認
2. 対応言語のソースファイルが存在するか確認
3. 初期化コマンドを再実行
   ```
   /mcp__serena__initial_instructions
   ```

### デバッグ方法

**MCPサーバーのログ確認**:
```bash
# 詳細ログを有効にして起動
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project . --verbose
```

**MCP設定の確認**:
```bash
# 登録されているMCPサーバー一覧
claude mcp list

# 特定のMCPサーバーを削除
claude mcp remove serena
```

## まとめ

### 主な利点

1. **トークン効率化**: 60〜80%のトークン削減でコスト最適化
2. **高精度な理解**: セマンティック解析による深いコード理解
3. **簡単導入**: uvxによるワンコマンドセットアップ
4. **完全無料**: オープンソースで商用利用も可能

### 推奨される使用シナリオ

- ✅ 大規模プロジェクトでのコード理解支援
- ✅ 複雑な依存関係を持つプロジェクトの分析
- ✅ リファクタリング時の影響範囲把握
- ✅ 新規参加者のオンボーディング支援

### 次のステップ

1. uvをインストール
2. `claude mcp add` でSerenaを登録
3. Claude Codeで `/mcp__serena__initial_instructions` を実行
4. プロジェクトの解析結果を活用してコーディング

---

**更新履歴**:
- 2025-01-14: 初版作成、ブラウザ自動起動の無効化方法を追記

**参考資料**:
- [Zenn記事: Serena MCP導入ガイド](https://zenn.dev/sc30gsw/articles/ff81891959aaef)
- [GitHub: oraios/serena](https://github.com/oraios/serena)
- [Serena公式ドキュメント: Configuration](https://oraios.github.io/serena/02-usage/050_configuration.html)
- [Serena公式ドキュメント: Dashboard](https://oraios.github.io/serena/02-usage/060_dashboard.html)
- [GitHub Issue #613: Don't open the dashboard by default](https://github.com/oraios/serena/issues/613)
