---
name: plugins
description: Pluginsの作成とインストール
---

# Claude Code Plugins 完全ガイド

## 目次

1. [Pluginsとは](#1-pluginsとは)
2. [ディレクトリ構造](#2-ディレクトリ構造)
3. [plugin.jsonの設定](#3-pluginjsonの設定)
4. [Pluginの作成](#4-pluginの作成)
5. [Pluginのインストールと管理](#5-pluginのインストールと管理)
6. [Marketplace](#6-marketplace)
7. [Enterprise設定](#7-enterprise設定)

---

## 1. Pluginsとは

### 概要

**Plugins**は、複数プロジェクトやチーム全体で配布可能な拡張機能パッケージです。以下の要素を含むことができます：

- Slash Commands
- Agents（Subagents）
- Skills
- Hooks
- MCPサーバー設定
- LSP設定

### 主な特徴

| 特徴 | 説明 |
|------|------|
| **パッケージ化** | 複数の拡張機能を1つにまとめて配布 |
| **バージョン管理** | セマンティックバージョニング対応 |
| **マーケットプレイス** | GitHub/NPM経由での配布 |
| **スコープ管理** | プロジェクト/ユーザーレベルで有効化 |

---

## 2. ディレクトリ構造

### 標準的なPlugin構造

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # 必須：メタデータ
├── commands/               # Slash Commands
│   ├── hello.md
│   └── review.md
├── agents/                 # Subagents
│   ├── code-reviewer.md
│   └── debugger.md
├── skills/                 # Agent Skills
│   └── code-review/
│       └── SKILL.md
├── hooks/
│   └── hooks.json          # イベントハンドラー
├── .mcp.json              # MCPサーバー設定
├── .lsp.json              # LSP設定
└── README.md
```

### 最小構成

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── commands/
    └── my-command.md
```

---

## 3. plugin.jsonの設定

### 基本スキーマ

```json
{
  "name": "my-plugin",
  "description": "Plugin description",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://github.com/user/my-plugin",
  "repository": "https://github.com/user/my-plugin",
  "license": "MIT",
  "keywords": ["claude", "code", "productivity"]
}
```

### フィールド説明

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | ○ | プラグイン識別子（小文字、ハイフン可） |
| `description` | ○ | プラグインの説明 |
| `version` | ○ | セマンティックバージョン |
| `author` | × | 作者情報 |
| `homepage` | × | ホームページURL |
| `repository` | × | リポジトリURL |
| `license` | × | ライセンス |
| `keywords` | × | 検索用キーワード |

---

## 4. Pluginの作成

### ステップ1: ディレクトリ作成

```bash
mkdir -p my-plugin/.claude-plugin
mkdir -p my-plugin/commands
mkdir -p my-plugin/agents
mkdir -p my-plugin/skills/my-skill
```

### ステップ2: plugin.json作成

```bash
cat > my-plugin/.claude-plugin/plugin.json << 'EOF'
{
  "name": "my-awesome-plugin",
  "description": "開発効率を向上させるツール集",
  "version": "1.0.0",
  "author": {"name": "Your Name"},
  "license": "MIT"
}
EOF
```

### ステップ3: コマンド追加

**my-plugin/commands/quick-review.md**:

```markdown
---
description: クイックコードレビューを実行
---

以下の観点でコードをレビューしてください：
- セキュリティ問題
- パフォーマンス問題
- コードスタイル
```

### ステップ4: エージェント追加

**my-plugin/agents/reviewer.md**:

```markdown
---
name: plugin-reviewer
description: プラグイン提供のコードレビューエージェント
tools: Read, Grep
model: sonnet
---

シニアエンジニアとしてコードレビューを実行します。
```

### ステップ5: Skill追加

**my-plugin/skills/review-checklist/SKILL.md**:

```yaml
---
name: review-checklist
description: コードレビューのチェックリスト。レビュー時に自動適用。
---

# レビューチェックリスト

## 必須チェック項目
- [ ] 入力検証
- [ ] エラーハンドリング
- [ ] テストカバレッジ
```

### ステップ6: テスト

```bash
claude --plugin-dir ./my-plugin
```

---

## 5. Pluginのインストールと管理

### ローカルテスト

```bash
# 単一プラグイン
claude --plugin-dir ./my-plugin

# 複数プラグイン
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

### Marketplaceからインストール

```bash
/plugin install my-plugin@marketplace-name
```

### 設定ファイルでの有効化

**settings.json**:

```json
{
  "enabledPlugins": {
    "my-plugin@acme-tools": true,
    "another-plugin@acme-tools": false
  }
}
```

### プラグイン管理コマンド

```bash
/plugins              # 一覧表示
/plugin install <name>  # インストール
/plugin remove <name>   # 削除
/plugin update <name>   # 更新
```

---

## 6. Marketplace

### Marketplace設定

**settings.json**:

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/claude-plugins"
      }
    },
    "company-plugins": {
      "source": {
        "source": "url",
        "url": "https://plugins.company.com/marketplace.json"
      }
    }
  }
}
```

### GitHub Marketplace構造

```
acme-corp/claude-plugins/
├── plugins/
│   ├── formatter/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── commands/
│   └── linter/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── commands/
└── marketplace.json
```

### marketplace.json

```json
{
  "plugins": [
    {
      "name": "formatter",
      "version": "1.0.0",
      "description": "コードフォーマッター",
      "path": "plugins/formatter"
    },
    {
      "name": "linter",
      "version": "2.1.0",
      "description": "コードリンター",
      "path": "plugins/linter"
    }
  ]
}
```

---

## 7. Enterprise設定

### 承認済みMarketplaceの制限

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "company/approved-plugins"
    },
    {
      "source": "url",
      "url": "https://plugins.company.com/marketplace.json"
    }
  ]
}
```

### プラグインの強制有効化

```json
{
  "enabledPlugins": {
    "security-plugin@company": true
  }
}
```

### プラグインの禁止

```json
{
  "disabledPlugins": [
    "dangerous-plugin@*"
  ]
}
```

---

## 完全なPluginサンプル

### プロジェクト構造

```
productivity-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── quick-test.md
│   ├── quick-lint.md
│   └── deploy-check.md
├── agents/
│   ├── tester.md
│   └── deployer.md
├── skills/
│   └── deployment/
│       ├── SKILL.md
│       └── checklist.md
├── hooks/
│   └── hooks.json
└── README.md
```

### plugin.json

```json
{
  "name": "productivity-plugin",
  "description": "開発生産性向上ツール集",
  "version": "1.0.0",
  "author": {"name": "Dev Team"},
  "keywords": ["productivity", "testing", "deployment"]
}
```

### commands/quick-test.md

```markdown
---
description: テストを素早く実行
allowed-tools: Bash(npm test:*), Bash(pytest:*)
---

現在のプロジェクトのテストを実行し、結果を報告してください。
```

### agents/tester.md

```markdown
---
name: test-agent
description: テスト作成と実行の専門エージェント
tools: Read, Write, Edit, Bash
model: sonnet
---

テストエンジニアとして、包括的なテストを作成・実行します。
```

### hooks/hooks.json

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "echo 'File modified by plugin'"
        }
      ]
    }
  ]
}
```

---

## 参考リンク

- [Plugins Documentation](https://docs.anthropic.com/en/docs/claude-code/plugins)
- [Marketplace Guide](https://docs.anthropic.com/en/docs/claude-code/marketplace)
