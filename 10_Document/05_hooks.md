---
name: hooks
description: Hooksの設定方法とユースケース
---

# Claude Code Hooks 完全ガイド

## 目次

1. [Hooksとは何か](#1-hooksとは何か)
2. [利用可能なHookの種類](#2-利用可能なhookの種類)
3. [Hooksの設定方法](#3-hooksの設定方法)
4. [Matcherの書き方](#4-matcherの書き方)
5. [Hookの種類（command vs prompt）](#5-hookの種類command-vs-prompt)
6. [具体的な設定例](#6-具体的な設定例)
7. [Hook入出力の詳細](#7-hook入出力の詳細)
8. [ユースケース別ガイド](#8-ユースケース別ガイド)
9. [セキュリティベストプラクティス](#9-セキュリティベストプラクティス)
10. [トラブルシューティング](#10-トラブルシューティング)

---

## 1. Hooksとは何か

### 概要

**Claude Code Hooks**は、Claude Codeのライフサイクルの様々なポイントで自動的に実行されるユーザー定義シェルコマンドです。

### 主な特徴

| 特徴 | 説明 |
|------|------|
| **決定的制御** | LLMの判断に頼らず確実に処理を実行 |
| **自動実行** | ライフサイクルの特定イベントで自動トリガー |
| **柔軟な戻り値** | 終了コードまたはJSON出力で制御 |
| **マッチャー機能** | ツールパターンに基づくフィルタリング |

### 実用例

- **通知**: Claude Codeの入力待ち時にカスタム通知
- **自動フォーマット**: ファイル編集後にPrettierやgofmtを自動実行
- **ログ記録**: 実行されたコマンドを記録（監査・デバッグ用）
- **フィードバック**: コードベース規約違反の自動検出
- **カスタムパーミッション**: 本番ファイルや機密ディレクトリの保護

---

## 2. 利用可能なHookの種類

Claude Codeは10種類のHookイベントを提供します：

| Hook名 | タイミング | マッチャー | 用途 |
|--------|----------|----------|------|
| **PreToolUse** | ツール呼び出し前 | ○ | ツール実行の承認/ブロック |
| **PostToolUse** | ツール実行直後 | ○ | 実行後のチェック/フォーマット |
| **PermissionRequest** | パーミッション確認時 | ○ | 自動承認/拒否 |
| **Notification** | 通知送信時 | ○ | カスタム通知処理 |
| **UserPromptSubmit** | ユーザープロンプト送信時 | × | プロンプト検証/コンテキスト追加 |
| **Stop** | Claudeが応答完了時 | × | 継続判定/ログ記録 |
| **SubagentStop** | サブエージェント完了時 | × | サブエージェント完了判定 |
| **PreCompact** | コンパクト実行前 | ○ | コンパクト前処理 |
| **SessionStart** | セッション開始時 | ○ | 環境変数設定/初期化 |
| **SessionEnd** | セッション終了時 | × | クリーンアップ処理 |

### マッチャー列の意味

**○ = マッチャーが使える（特定のツールだけに絞り込める）**

```json
{
  "PreToolUse": [{
    "matcher": "Bash",  // ← Bashツールの時だけ実行
    "hooks": [...]
  }]
}
```

**× = マッチャーが使えない（常に全ケースで実行される）**

```json
{
  "Stop": [{
    // matcherは指定できない
    // Claudeが応答完了するたびに必ず実行される
    "hooks": [...]
  }]
}
```

つまり：
- **○のHook**: 「Writeツールの時だけ」「Bashの時だけ」のように条件を絞れる
- **×のHook**: 条件を絞れない。そのイベントが起きたら常に実行される

---

## 3. Hooksの設定方法

### 設定ファイルの場所

Hooksはsettings.jsonで設定（優先順位順）：

```
1. ~/.claude/settings.json             （ユーザー設定、全プロジェクト）
2. .claude/settings.json               （プロジェクト設定）
3. .claude/settings.local.json         （ローカル設定、gitで除外）
4. エンタープライズ管理ポリシー設定
```

### 基本的なJSON構造

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

### 設定フィールド

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `matcher` | マッチャー使用時○ | ツール名パターン（正規表現対応） |
| `type` | ○ | `"command"` または `"prompt"` |
| `command` | type=command時○ | 実行するbashコマンド |
| `prompt` | type=prompt時○ | LLMに送信するプロンプト |
| `timeout` | × | タイムアウト時間（秒） |

---

## 4. Matcherの書き方

### マッチャーが使用できるイベント

- PreToolUse
- PostToolUse
- PermissionRequest
- Notification
- PreCompact

### マッチャーの記法

#### 1. 完全一致

```json
{"matcher": "Write"}
```
対象: `Write`ツールのみ

#### 2. 複数ツール（OR条件）

```json
{"matcher": "Edit|Write"}
```
対象: `Edit`または`Write`ツール

#### 3. 正規表現パターン

```json
{"matcher": "Notebook.*"}
```
対象: `Notebook`で始まる全ツール

#### 4. 全ツール（ワイルドカード）

```json
{"matcher": "*"}
```
対象: 全てのツール

### 利用可能なツール名

| カテゴリ | ツール名 |
|---------|---------|
| **ファイル操作** | Read, Write, Edit, Glob, Delete, Create |
| **コマンド実行** | Bash, Task |
| **ウェブ操作** | WebFetch, WebSearch |
| **検索** | Grep |
| **通知** | permission_prompt, idle_prompt, auth_success |
| **MCP** | mcp__<server>__<tool> |

### 正規表現の例

```json
{"matcher": "^(Edit|Write)$"}      // Edit または Write のみ
{"matcher": "mcp__.*__write.*"}    // MCP write操作全て
{"matcher": "Bash"}                // Bashコマンドのみ
```

---

## 5. Hookの種類（command vs prompt）

### コマンドフック（type: "command"）

シェルコマンドを実行するフック：

```json
{
  "type": "command",
  "command": "jq -r '.tool_input.command' >> ~/.claude/log.txt",
  "timeout": 60
}
```

**特徴**:
- 高速（ローカル実行）
- 決定的なルール実装向け
- 環境変数 `$CLAUDE_PROJECT_DIR` 使用可

### プロンプトフック（type: "prompt"）

LLMに評価させるフック（Stop/SubagentStop向け）：

```json
{
  "type": "prompt",
  "prompt": "Check if Claude should continue working. $ARGUMENTS",
  "timeout": 30
}
```

**特徴**:
- コンテキスト認識的な判定
- 複雑な条件判定向け
- LLM（Haiku）を使用
- API呼び出しのため遅い

**応答形式**:

```json
{
  "decision": "approve" | "block",
  "reason": "説明文",
  "continue": false,
  "stopReason": "メッセージ",
  "systemMessage": "警告"
}
```

---

## 6. 具体的な設定例

### 例1: Bashコマンドログ

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '\"\\(.tool_input.command) - \\(.tool_input.description // \"No description\")\"' >> ~/.claude/bash-command-log.txt"
          }
        ]
      }
    ]
  }
}
```

### 例2: TypeScriptファイルの自動フォーマット

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read file_path; if echo \"$file_path\" | grep -q '\\.ts$'; then npx prettier --write \"$file_path\"; fi; }"
          }
        ]
      }
    ]
  }
}
```

### 例3: 機密ファイルの保護

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json, sys; data=json.load(sys.stdin); path=data.get('tool_input',{}).get('file_path',''); sys.exit(2 if any(p in path for p in ['.env', 'package-lock.json', '.git/']) else 0)\""
          }
        ]
      }
    ]
  }
}
```

### 例4: デスクトップ通知

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Awaiting your input'"
          }
        ]
      }
    ]
  }
}
```

### 例5: セッション開始時の環境変数設定

**.claude/hooks/setup-nvm.sh**:
```bash
#!/bin/bash

ENV_BEFORE=$(export -p | sort)

source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

**settings.json**:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/setup-nvm.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 7. Hook入出力の詳細

### Hook入力（stdin）

すべてのHookは以下の基本情報を含むJSONをstdinで受け取ります：

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../session.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse"
}
```

### Hook出力

#### 終了コード0（成功）
- stdout内容がJSON形式の場合、構造化制御として処理
- JSON形式でない場合、テキストはコンテキストに追加

#### 終了コード2（ブロック/エラー）
- stderrがClaudeまたはユーザーに表示
- アクションがブロックされる

### JSON出力フォーマット

#### 共通フィールド

```json
{
  "continue": true,
  "stopReason": "メッセージ",
  "suppressOutput": true,
  "systemMessage": "警告メッセージ"
}
```

#### PreToolUseの制御

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow" | "deny" | "ask",
    "permissionDecisionReason": "理由",
    "updatedInput": {"field": "new_value"}
  }
}
```

---

## 8. ユースケース別ガイド

### コード品質管理

ファイル編集後に自動でlintingを実行：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read path; npm run lint -- \"$path\" 2>&1 || true; }"
          }
        ]
      }
    ]
  }
}
```

### セキュリティ監視

本番環境ファイルへのアクセスをログ記録：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json, sys, datetime; data=json.load(sys.stdin); path=data.get('tool_input',{}).get('file_path',''); tool=data.get('tool_name',''); print(f'{datetime.datetime.now()} - {tool}: {path}') if 'prod' in path else None\" >> ~/.claude/security.log 2>&1 || true"
          }
        ]
      }
    ]
  }
}
```

---

## 9. セキュリティベストプラクティス

### 注意事項

Hooksは任意のシェルコマンドを実行するため：
- ファイル削除・変更、データ漏洩の可能性
- 権限昇格による被害
- 悪意あるhook設定の自動実行

### セキュリティ推奨事項

1. **入力検証**: JSON入力を信頼しない、パラメータを検証
2. **変数クォート**: `"$VAR"` を使用、`$VAR` は避ける
3. **パストラバーサル対策**: ファイルパスで `..` をチェック
4. **絶対パス使用**: `$CLAUDE_PROJECT_DIR` で完全パス指定
5. **機密ファイル除外**: `.env`, `.git/`, キーファイルなど

### 安全なファイルチェック例

```bash
if [[ "$file_path" == *".."* ]]; then
  echo "Path traversal detected" >&2
  exit 2
fi

if [[ "$file_path" =~ \.(env|key|secret)$ ]]; then
  echo "Sensitive file protection" >&2
  exit 2
fi
```

---

## 10. トラブルシューティング

### デバッグ方法

```bash
# debugモードで詳細ログを表示
claude --debug

# hooks設定を確認
cat ~/.claude/settings.json | jq '.hooks'
```

### 一般的な問題

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| Hookが実行されない | Matcherが一致しない | ツール名を正確に確認 |
| JSONパースエラー | クォートのエスケープ不足 | `\"` で適切にエスケープ |
| コマンド見つからない | フルパス未指定 | `$CLAUDE_PROJECT_DIR` を使用 |
| タイムアウト | 時間がかかりすぎ | `timeout` を増やす |

### コマンド実行詳細

| 項目 | 説明 |
|------|------|
| **タイムアウト** | デフォルト60秒 |
| **並列実行** | マッチしたすべてのhookが並列実行 |
| **重複排除** | 同じコマンドは1度だけ実行 |
| **実行環境** | Claudeのカレントディレクトリと環境 |
| **環境変数** | `$CLAUDE_PROJECT_DIR`, `$CLAUDE_ENV_FILE` |

---

## 参考リンク

- [Hooks Guide](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Hooks Reference](https://docs.anthropic.com/en/docs/claude-code/hooks-reference)
