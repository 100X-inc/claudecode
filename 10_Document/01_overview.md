---
name: overview
description: Claude Codeのカスタマイズ機能の全体概要と使い分けガイド
---

# Claude Code カスタマイズ機能 完全概要

このドキュメントは、Claude Codeの全カスタマイズ機能の概要と関連性を説明します。

## 目次

1. [機能一覧](#機能一覧)
   - [コア機能](#コア機能)
   - [拡張機能](#拡張機能)
   - [メモリ機能](#メモリ機能)
   - [設計原則](#設計原則)
2. [各機能の比較](#各機能の比較)
3. [ファイル構造](#ファイル構造)
4. [使い分けガイド](#使い分けガイド)
5. [関連ドキュメント](#関連ドキュメント)

---

## 機能一覧

### コア機能

| 機能 | 説明 | 詳細ドキュメント |
|------|------|-----------------|
| **Skills** | Claudeに専門能力を教える。自動検出で発動 | [03_skills.md](03_skills.md) |
| **Slash Commands** | `/command`形式で実行するプロンプトテンプレート | [04_slash-commands.md](04_slash-commands.md) |
| **Hooks** | ツール実行前後に自動実行されるシェルコマンド | [05_hooks.md](05_hooks.md) |
| **Agents** | 専門分野に特化したサブエージェント | [06_agents.md](06_agents.md) |

### 拡張機能

| 機能 | 説明 | 詳細ドキュメント |
|------|------|-----------------|
| **Plugins** | 複数機能をパッケージ化して配布 | [07_plugins.md](07_plugins.md) |
| **MCP Servers** | 外部サービス・APIとの連携 | [08_mcp.md](08_mcp.md) |
| **Settings** | 動作・権限・環境の設定 | [09_settings.md](09_settings.md) |

### メモリ機能

| 機能 | 説明 | 詳細ドキュメント |
|------|------|-----------------|
| **CLAUDE.md** | プロジェクトの知識をClaudeに伝える | [02_claude-md.md](02_claude-md.md) |
| **.claude/rules/** | ファイルパターン別のルール分離 | [08_settings.md](08_settings.md) |

### 設計原則

| 原則 | 説明 | 詳細ドキュメント |
|------|------|-----------------|
| **Progressive Disclosure** | 情報を段階的に開示し、コンテキストを効率化 | [10_progressive-disclosure.md](10_progressive-disclosure.md) |
| **Agent Best Practices** | Anthropic公式のエージェント開発ベストプラクティス | [11_agent-best-practices.md](11_agent-best-practices.md) |

---

## 各機能の比較

### 呼び出し方法

| 機能 | 呼び出し方法 | ユーザーアクション |
|------|-------------|------------------|
| **Skills** | 自動検出 | 不要（Claudeが判断） |
| **Slash Commands** | `/command`入力 | 必要 |
| **Hooks** | イベントトリガー | 不要（自動実行） |
| **Agents** | 自動選択 or `/agents` | 状況による |
| **CLAUDE.md** | 常時読み込み | 不要 |
| **MCP** | ツール呼び出し | 不要 |

### 目的と役割

| 機能 | 主な目的 |
|------|---------|
| **Skills** | 複雑なワークフロー、専門知識の提供 |
| **Slash Commands** | 頻繁に使うプロンプトのテンプレート化 |
| **Hooks** | 決定的な処理の自動実行（フォーマット、検証等） |
| **Agents** | 専門タスクの独立実行 |
| **Plugins** | 機能のパッケージ化と配布 |
| **MCP Servers** | 外部機能（DB、API等）の追加 |
| **CLAUDE.md** | プロジェクトのオンボーディング情報 |
| **Settings** | 動作・権限・セキュリティの制御 |

### ファイル構成

| 機能 | ファイル形式 | 複数ファイル |
|------|------------|------------|
| **Skills** | Markdown + スクリプト | ○ |
| **Slash Commands** | Markdown | × |
| **Hooks** | JSON（settings.json内） | - |
| **Agents** | Markdown | × |
| **Plugins** | ディレクトリ構造 | ○ |
| **MCP** | JSON（.mcp.json） | - |
| **Settings** | JSON | × |
| **CLAUDE.md** | Markdown | × |

### Skills vs Slash Commands 詳細比較

この2つは混同しやすいため、詳細に比較します。

#### 基本的な違い

| 側面 | Slash Commands | Skills |
|------|----------------|--------|
| **呼び出し** | 明示的（`/command`と入力） | 自動（Claudeが判断して発動） |
| **ファイル構造** | 単一の`.md`ファイル | ディレクトリ＋複数ファイル |
| **複雑度** | シンプルなプロンプト | 複数ファイル、スクリプト対応 |
| **検出方法** | ユーザーがコマンド名を知っている必要あり | descriptionから意味的にマッチ |
| **主な用途** | 頻繁に使うテンプレート | 専門的な能力・ワークフロー |

#### 詳細比較表

| 項目 | Slash Commands | Skills |
|------|----------------|--------|
| **保存場所（個人）** | `~/.claude/commands/*.md` | `~/.claude/skills/*/SKILL.md` |
| **保存場所（プロジェクト）** | `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` |
| **必須ファイル** | `command-name.md` | `SKILL.md` |
| **サポートファイル** | なし | 複数可（*.md, scripts/等） |
| **メタデータ（必須）** | `description` | `name`, `description` |
| **メタデータ（任意）** | `argument-hint`, `allowed-tools`, `model` | `allowed-tools`, `model` |
| **引数サポート** | あり（`$ARGUMENTS`, `$1`, `$2`...） | なし |
| **動的コンテンツ** | あり（`!`バッククォート実行`!`） | なし |
| **ファイル参照** | あり（`@path/to/file`） | あり（相対リンク） |
| **読み込みタイミング** | `/command`実行時 | description常時 → 発動時に全体 |
| **ユーザー確認** | なし（即実行） | あり（使用許可を確認） |
| **サブディレクトリ** | 可（ネームスペース） | 不可（1階層のみ） |
| **推奨サイズ** | 制限なし | SKILL.md 500行以下 |
| **Progressive Disclosure** | 非対応 | 対応（参照ファイル分割） |
| **Skill連携** | Skillをトリガー可能 | 他Skillを参照可能 |

#### 機能マトリクス

| 機能 | Slash Commands | Skills |
|:-----|:-------------:|:------:|
| プロンプトテンプレート | ✅ | ✅ |
| 自動検出・発動 | ❌ | ✅ |
| 複数ファイル構成 | ❌ | ✅ |
| スクリプト同梱 | ❌ | ✅ |
| 引数受け取り | ✅ | ❌ |
| シェルコマンド埋め込み | ✅ | ❌ |
| ツール制限 | ✅ | ✅ |
| モデル指定 | ✅ | ✅ |
| チーム共有（Git） | ✅ | ✅ |
| Plugin配布 | ✅ | ✅ |

#### ファイル構造の違い

```
# Slash Command（1ファイル）
.claude/commands/review.md

# Skill（ディレクトリ）
.claude/skills/code-review/
├── SKILL.md           # 必須：メタデータと指示
├── SECURITY.md        # オプション：詳細資料
├── PERFORMANCE.md     # オプション：詳細資料
└── scripts/
    └── run-linters.sh # オプション：スクリプト
```

#### 使い分けの判断基準

**Slash Commands を選ぶ場合:**
- 同じプロンプトを頻繁に入力している
- 短い定型コマンド（`/review`, `/test`, `/deploy`）
- 単一ファイルで完結する処理
- ユーザーが明示的に実行タイミングを決めたい

**Skills を選ぶ場合:**
- 複数手順を含む複雑なワークフロー
- 参考資料やスクリプトが必要
- チーム標準を自動適用したい
- 「○○して」と言うだけで発動させたい（自動検出）

#### 実例比較

**同じ「コードレビュー」を実現する場合:**

```markdown
# Slash Command版: .claude/commands/review.md
---
description: コードをレビュー
---

このコードを以下の観点からレビュー：
- セキュリティ問題
- パフォーマンス問題
- コードスタイル違反
```
→ 使用方法: `/review` と入力

```markdown
# Skill版: .claude/skills/code-review/SKILL.md
---
name: code-review
description: コード品質と潜在的問題をチェック。PRレビュー、コード分析が必要なときに使用。
---

# コードレビュースキル

詳細は以下を参照:
- [セキュリティチェックリスト](SECURITY.md)
- [パフォーマンスパターン](PERFORMANCE.md)
```
→ 使用方法: 「このコードをレビューして」と言うだけ

#### 併用パターン

両方を組み合わせることも可能：

1. **Skill**: 詳細なレビューロジックと参照資料を定義
2. **Slash Command**: `/review` でSkillを明示的にトリガー

```markdown
# .claude/commands/review.md
---
description: code-review Skillを使ってレビューを実行
---

code-review Skillを使って、現在のファイルをレビューしてください。
```

---

## ファイル構造

### 個人用設定（全プロジェクト共通）

```
~/.claude/
├── settings.json           # ユーザー設定（Hooks, Permissions等）
├── CLAUDE.md              # 個人用メモリ
├── skills/                # 個人用Skills
│   └── my-skill/
│       └── SKILL.md
├── commands/              # 個人用Slash Commands
│   └── my-command.md
├── agents/                # 個人用Agents
│   └── my-agent.md
└── output-styles/         # カスタム出力スタイル
    └── my-style.md
```

### プロジェクト設定

```
project-root/
├── .claude/
│   ├── settings.json       # プロジェクト設定
│   ├── settings.local.json # ローカル設定（gitignore推奨）
│   ├── skills/             # プロジェクト用Skills
│   │   └── project-skill/
│   │       ├── SKILL.md
│   │       └── reference.md
│   ├── commands/           # プロジェクト用Slash Commands
│   │   └── deploy.md
│   ├── agents/             # プロジェクト用Agents
│   │   └── reviewer.md
│   ├── rules/              # モジュール化されたルール
│   │   ├── typescript.md
│   │   └── security.md
│   └── hooks/              # Hookスクリプト
│       └── validate.sh
├── .mcp.json              # MCPサーバー設定
├── CLAUDE.md              # プロジェクトメモリ
├── CLAUDE.local.md        # ローカルメモリ（gitignore）
└── src/
```

### Plugin構造

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # 必須：メタデータ
├── commands/               # Slash Commands
├── agents/                 # Subagents
├── skills/                 # Agent Skills
├── hooks/
│   └── hooks.json
├── .mcp.json              # MCPサーバー設定
└── README.md
```

### 優先順位

同名の設定がある場合の優先順位：

```
Enterprise（最優先）
    ↓
Personal（~/.claude/）
    ↓
Project（.claude/）
    ↓
Plugin（最低優先）
```

---

## 使い分けガイド

### どの機能を使うべきか？

```
┌─ 頻繁に同じプロンプトを入力している？
│   └─ YES → Slash Commands
│
├─ ツール実行時に自動で処理を行いたい？
│   └─ YES → Hooks
│
├─ Claudeに専門的な知識・手順を教えたい？
│   └─ YES → Skills
│
├─ 独立したコンテキストで専門タスクを実行したい？
│   └─ YES → Agents
│
├─ 複数の機能をパッケージ化して共有したい？
│   └─ YES → Plugins
│
├─ 外部サービス（DB、API等）と連携したい？
│   └─ YES → MCP Servers
│
├─ プロジェクト全体の情報をClaudeに伝えたい？
│   └─ YES → CLAUDE.md
│
└─ 権限やセキュリティを制御したい？
    └─ YES → Settings
```

### 具体例

| シナリオ | 推奨機能 |
|---------|---------|
| コードレビューのチェックリストを使いたい | Skills |
| `/review`で簡単にレビューを開始したい | Slash Commands |
| ファイル保存後に自動でフォーマットしたい | Hooks |
| セキュリティ専門のAIに監査させたい | Agents |
| チーム全体で同じツールを使いたい | Plugins |
| PostgreSQLデータベースに接続したい | MCP Servers |
| プロジェクトのアーキテクチャを説明したい | CLAUDE.md |
| 特定ファイルへのアクセスを禁止したい | Settings (Permissions) |

### 組み合わせ例

**コードレビューワークフロー**:
1. **CLAUDE.md**: プロジェクトのコーディング規約を記載
2. **Skills**: 詳細なレビューチェックリストと手順
3. **Slash Commands**: `/review`で簡単に開始
4. **Hooks**: レビュー完了後に自動でESLintを実行
5. **Agents**: security-auditorエージェントでセキュリティ監査

**CI/CD統合**:
1. **MCP Servers**: GitHubと連携
2. **Hooks**: PRマージ時に自動テスト
3. **Agents**: テストエージェントで包括的テスト
4. **Settings**: 本番ファイルへのアクセスを制限

---

## 関連ドキュメント

### 本リポジトリ内

| # | ドキュメント | 内容 |
|---|-------------|------|
| 01 | [01_overview.md](01_overview.md) | 全機能の概要（このファイル） |
| 02 | [02_claude-md.md](02_claude-md.md) | CLAUDE.mdの書き方 |
| 03 | [03_skills.md](03_skills.md) | Agent Skillsの詳細 |
| 04 | [04_slash-commands.md](04_slash-commands.md) | カスタムコマンド |
| 05 | [05_hooks.md](05_hooks.md) | Hooksの設定と活用 |
| 06 | [06_agents.md](06_agents.md) | Subagentsの作成と管理 |
| 07 | [07_plugins.md](07_plugins.md) | Pluginシステム |
| 08 | [08_settings.md](08_settings.md) | Settings & Permissions |
| 09 | [09_windows-tips.md](09_windows-tips.md) | Windows環境でのClaude Code利用 |
| 10 | [10_progressive-disclosure.md](10_progressive-disclosure.md) | Progressive Disclosure（段階的開示） |
| 11 | [11_agent-best-practices.md](11_agent-best-practices.md) | Anthropic公式エージェントベストプラクティス |
| 12 | [12_mcp-development.md](12_mcp-development.md) | MCP Server開発ガイド |
| 13 | [13_headless-cicd.md](13_headless-cicd.md) | Headless Mode & CI/CD統合 |
| 14 | [14_extended-thinking.md](14_extended-thinking.md) | Extended Thinking（拡張思考） |
| 15 | [15_agent-sdk.md](15_agent-sdk.md) | Claude Agent SDK |

### MCP関連（mcp/）

| # | ドキュメント | 内容 |
|---|-------------|------|
| 01 | [mcp/01_overview.md](mcp/01_overview.md) | MCPサーバー設定の基礎 |
| 02 | [mcp/02_o3-search.md](mcp/02_o3-search.md) | OpenAI o3モデル（Web検索付き推論） |
| 03 | [mcp/03_nano-banana.md](mcp/03_nano-banana.md) | nano banana pro（AI画像生成） |

### 公式ドキュメント

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Agent Skills](https://docs.anthropic.com/en/docs/claude-code/agent-skills)
- [Slash Commands](https://docs.anthropic.com/en/docs/claude-code/slash-commands)
- [Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Subagents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- [Plugins](https://docs.anthropic.com/en/docs/claude-code/plugins)
- [MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Settings](https://docs.anthropic.com/en/docs/claude-code/settings)

---

## クイックリファレンス

### Skill作成

```bash
mkdir -p .claude/skills/my-skill
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: スキルの説明。トリガーキーワードを含める。
---

# スキルのタイトル

指示内容をここに記述
EOF
```

### Slash Command作成

```bash
mkdir -p .claude/commands
cat > .claude/commands/my-command.md << 'EOF'
---
description: コマンドの説明
argument-hint: [arg1] [arg2]
---

実行内容: $ARGUMENTS
EOF
```

### Agent作成

```bash
mkdir -p .claude/agents
cat > .claude/agents/my-agent.md << 'EOF'
---
name: my-agent
description: エージェントの説明
tools: Read, Grep, Edit
model: sonnet
---

エージェントの指示内容
EOF
```

### Hook設定

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'File modified'"
          }
        ]
      }
    ]
  }
}
```

### MCP設定

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.github.com/mcp",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Permission設定

```json
{
  "permissions": {
    "allow": ["Bash(npm:*)", "Bash(git:*)"],
    "deny": ["Read(.env)", "Bash(rm -rf:*)"]
  }
}
```
