---
name: settings
description: Settings・Permissionsの設定方法
---

# Claude Code Settings & Permissions 完全ガイド

## 目次

1. [Settings概要](#1-settings概要)
2. [設定ファイルの場所と優先順位](#2-設定ファイルの場所と優先順位)
3. [主要な設定項目](#3-主要な設定項目)
4. [Permissions（権限設定）](#4-permissions権限設定)
5. [Sandbox設定](#5-sandbox設定)
6. [Memory設定](#6-memory設定)
7. [Output Styles](#7-output-styles)

---

## 1. Settings概要

### 設定可能な項目

- 認証・API設定
- UI・表示設定
- 権限（Permissions）
- Sandbox（セキュリティ隔離）
- Hooks
- MCP Servers
- Plugins
- Output Styles

---

## 2. 設定ファイルの場所と優先順位

### 優先順位（上ほど高い）

```
1. Enterprise (Managed Settings)
2. File-based Managed Settings
3. CLIフラグ
4. Local Project (.claude/settings.local.json)
5. Shared Project (.claude/settings.json)
6. User (~/.claude/settings.json)
```

### ファイルの役割

| ファイル | 用途 | Git管理 |
|---------|------|--------|
| `~/.claude/settings.json` | ユーザー個人設定 | × |
| `.claude/settings.json` | プロジェクト共有設定 | ○ |
| `.claude/settings.local.json` | ローカル設定 | × |

---

## 3. 主要な設定項目

### 認証・API設定

```json
{
  "apiKeyHelper": "/bin/generate_temp_api_key.sh",
  "otelHeadersHelper": "/bin/generate_otel_headers.sh",
  "forceLoginMethod": "claudeai",
  "forceLoginOrgUUID": "org-uuid-here"
}
```

| 項目 | 説明 |
|------|------|
| `apiKeyHelper` | カスタムAPIキー生成スクリプト |
| `forceLoginMethod` | ログイン方式制限（`claudeai` or `console`） |

### UI・表示設定

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  },
  "outputStyle": "Explanatory",
  "fileSuggestion": {
    "type": "command",
    "command": "~/.claude/file-suggestion.sh"
  }
}
```

| 項目 | 説明 |
|------|------|
| `statusLine` | カスタムステータスライン |
| `outputStyle` | 出力スタイル |
| `fileSuggestion` | ファイルオートコンプリート |

### 動作制御

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "alwaysThinkingEnabled": true,
  "disableAllHooks": false,
  "cleanupPeriodDays": 30
}
```

| 項目 | 説明 | デフォルト |
|------|------|----------|
| `model` | デフォルトモデル | sonnet |
| `alwaysThinkingEnabled` | 拡張思考を常時有効 | false |
| `disableAllHooks` | 全Hooks無効化 | false |
| `cleanupPeriodDays` | セッション削除期間 | 30日 |

### 環境変数

```json
{
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "true"
  }
}
```

---

## 4. Permissions（権限設定）

### 基本構造

```json
{
  "permissions": {
    "allow": [],
    "ask": [],
    "deny": [],
    "additionalDirectories": [],
    "defaultMode": "default"
  }
}
```

### 権限ルールの書き方

```json
{
  "permissions": {
    "allow": [
      "Bash",                           // 全Bash許可
      "Bash(npm run:*)",                // プレフィックスマッチ
      "Bash(npm run test:*)",           // 特定コマンド
      "Read(~/.zshrc)",                 // ホームディレクトリ
      "Read(//absolute/path)",          // 絶対パス
      "Edit(/src/**/*.ts)",             // Globパターン
      "WebFetch(domain:example.com)",   // ドメイン制限
      "mcp__puppeteer__navigate"        // MCP特定ツール
    ],
    "ask": [
      "Bash(git push:*)"                // 確認を要求
    ],
    "deny": [
      "Bash(curl:*)",                   // 明示的に拒否
      "Bash(rm -rf /*)",                // 危険なコマンド
      "Read(.env)",                     // 環境変数ファイル
      "Read(./secrets/**)"              // secretsディレクトリ
    ]
  }
}
```

### パスパターン

| パターン | 相対基準 | 例 |
|---------|---------|-----|
| `//path` | ファイルシステムルート | `//Users/alice/secrets/**` |
| `~/path` | ホームディレクトリ | `~/Documents/*.pdf` |
| `/path` | 設定ファイル相対 | `/src/**/*.ts` |
| `path` | 現在のディレクトリ | `*.env` |

### Permission Mode

```json
{
  "permissions": {
    "defaultMode": "default"
  }
}
```

| モード | 説明 |
|--------|------|
| `default` | 通常：初回使用時に許可プロンプト |
| `acceptEdits` | ファイル編集を自動承認 |
| `plan` | 読み取り専用（分析のみ） |
| `bypassPermissions` | 全許可（注意が必要） |

### 追加ディレクトリ

```json
{
  "permissions": {
    "additionalDirectories": [
      "../docs/",
      "../../shared/"
    ]
  }
}
```

### Bashパーミッションの注意点

Bashはプレフィックスマッチングのみ対応：

```json
// これは以下をバイパス可能:
"Bash(curl http://github.com/:*)"

// バイパス例:
// - curl -X GET http://github.com/...  (オプション前置)
// - curl https://github.com/...        (プロトコル変更)
// - URL=http://github.com && curl $URL (変数使用)
```

**より安全な代替案:**
- `WebFetch(domain:github.com)` を使用
- CLAUDE.mdで詳細指示
- Hooksでカスタム検証

---

## 5. Sandbox設定

### 基本設定

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker", "git"],
    "allowUnsandboxedCommands": false
  }
}
```

| 項目 | 説明 |
|------|------|
| `enabled` | サンドボックス有効化 |
| `autoAllowBashIfSandboxed` | サンドボックス内のBashを自動許可 |
| `excludedCommands` | サンドボックス対象外コマンド |

### ネットワーク設定

```json
{
  "sandbox": {
    "network": {
      "allowUnixSockets": ["~/.ssh/agent-socket"],
      "allowLocalBinding": true,
      "httpProxyPort": 8080
    }
  }
}
```

---

## 6. Memory設定

### メモリ階層

```
優先度順（上ほど高い）:
1. Enterprise Policy    /Library/.../CLAUDE.md
2. Project Memory       ./CLAUDE.md or ./.claude/CLAUDE.md
3. Project Rules        ./.claude/rules/*.md
4. User Memory          ~/.claude/CLAUDE.md
5. Project Local        ./CLAUDE.local.md
```

### .claude/rules/ によるモジュール化

**.claude/rules/typescript.md**:

```markdown
---
paths: src/**/*.ts
---

# TypeScript固有ルール

- strict modeを使用
- any型を避ける
- 型定義を明示する
```

**.claude/rules/security.md**:

```markdown
---
paths: src/auth/**/*
---

# セキュリティルール

- 入力を常に検証
- SQLインジェクション対策
- XSS対策
```

### インポート機能

```markdown
# CLAUDE.md

@README.md
@docs/architecture.md
@~/.claude/my-instructions.md

最大5段階の深さまで再帰インポート可能
```

---

## 7. Output Styles

### 組み込みスタイル

| スタイル | 説明 |
|---------|------|
| **Default** | ソフトウェアエンジニアリング向け |
| **Explanatory** | 実装選択肢とパターンを説明 |
| **Learning** | 学習モード、`TODO(human)`マーカー挿入 |

### カスタムスタイル作成

**~/.claude/output-styles/custom.md**:

```markdown
---
name: My Custom Style
description: カスタムスタイルの説明
keep-coding-instructions: false
---

# カスタムスタイル指示

あなたはシニアエンジニアとして...

## 回答スタイル
- 簡潔に
- コード例を含める
- 理由を説明する
```

### スタイル切り替え

```bash
/output-style                   # メニューで選択
/output-style explanatory       # 直接指定
```

---

## 完全なsettings.json例

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "alwaysThinkingEnabled": false,
  "cleanupPeriodDays": 30,

  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(git:*)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Read(.env)"
    ],
    "additionalDirectories": ["../docs/"],
    "defaultMode": "default"
  },

  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker"]
  },

  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$FILE_PATH\""
          }
        ]
      }
    ]
  },

  "env": {
    "NODE_ENV": "development"
  },

  "enabledPlugins": {
    "my-plugin@marketplace": true
  }
}
```

---

## 参考リンク

- [Settings Documentation](https://docs.anthropic.com/en/docs/claude-code/settings)
- [IAM/Permissions Guide](https://docs.anthropic.com/en/docs/claude-code/iam)
- [Output Styles Guide](https://docs.anthropic.com/en/docs/claude-code/output-styles)
