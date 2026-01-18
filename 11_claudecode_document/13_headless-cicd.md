# Headless Mode & CI/CD統合

Claude Codeをスクリプトやパイプラインから非対話的に実行する方法

---

## 目次

1. [概要](#1-概要)
2. [基本コマンドオプション](#2-基本コマンドオプション)
3. [使用例](#3-使用例)
4. [GitHub Actions統合](#4-github-actions統合)
5. [GitLab CI統合](#5-gitlab-ci統合)
6. [セキュリティと注意事項](#6-セキュリティと注意事項)
7. [トラブルシューティング](#7-トラブルシューティング)
8. [参照リソース](#8-参照リソース)

---

## 1. 概要

Headless Modeは、Claude Codeを対話なしで実行するモード。CI/CDパイプライン、スクリプト、自動化ワークフローに最適。

### ユースケース

| ユースケース | 説明 |
|-------------|------|
| コードレビュー | PRの自動レビュー |
| テスト生成 | 新機能のテスト自動生成 |
| ドキュメント生成 | コードからドキュメント自動生成 |
| コード品質チェック | セキュリティ・品質の自動検査 |
| リファクタリング | 定型的なコード修正の自動化 |

---

## 2. 基本コマンドオプション

### 2.1 主要オプション

| オプション | 短縮形 | 説明 |
|-----------|-------|------|
| `--print` | `-p` | 対話なしで実行、結果をstdoutに出力 |
| `--output-format` | - | 出力形式（`text`, `json`, `stream-json`） |
| `--max-turns` | - | 最大実行ターン数を制限 |
| `--append-system-prompt` | - | システムプロンプトに指示を追加 |
| `--dangerously-skip-permissions` | - | 権限チェックをバイパス（隔離環境専用） |

### 2.2 出力形式

```bash
# テキスト出力（デフォルト）
claude -p "Analyze this code"

# JSON出力（パース可能）
claude -p "Analyze this code" --output-format json

# ストリーミングJSON（リアルタイム処理）
claude -p "Analyze this code" --output-format stream-json
```

### 2.3 JSON出力形式

```json
{
  "type": "result",
  "subtype": "success",
  "cost_usd": 0.003,
  "is_error": false,
  "duration_ms": 1500,
  "duration_api_ms": 1200,
  "num_turns": 1,
  "result": "分析結果のテキスト...",
  "session_id": "abc123"
}
```

---

## 3. 使用例

### 3.1 基本的な実行

```bash
# シンプルな実行
claude -p "Fix the type errors in src/utils.ts"

# ターン数制限
claude -p "Add a simple feature" --max-turns 5

# システムプロンプト追加
claude -p "Review this code" --append-system-prompt "Focus on security issues"
```

### 3.2 パイプ入力

```bash
# ファイル内容をパイプ
cat src/utils.ts | claude -p "Review this code for security issues"

# git diffをパイプ
git diff | claude -p "Summarize these changes"

# 複数ファイル
find . -name "*.ts" -exec cat {} \; | claude -p "Find potential bugs"
```

### 3.3 セッション継続

```bash
# セッションIDを取得
RESULT=$(claude -p "Start refactoring" --output-format json)
SESSION_ID=$(echo $RESULT | jq -r '.session_id')

# セッション継続
claude -p "Continue with the next step" --resume $SESSION_ID
```

---

## 4. GitHub Actions統合

### 4.1 基本的なワークフロー

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          git diff origin/main...HEAD | claude -p \
            "Review these changes for:
             1. Security vulnerabilities
             2. Performance issues
             3. Code quality
             Output as markdown." \
            --output-format json > review.json

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = JSON.parse(fs.readFileSync('review.json'));
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: review.result
            });
```

### 4.2 テスト生成ワークフロー

```yaml
name: Generate Tests

on:
  push:
    paths:
      - 'src/**/*.ts'

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Generate Tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          for file in $(git diff --name-only HEAD~1 -- 'src/**/*.ts'); do
            claude -p "Generate unit tests for $file" --max-turns 3
          done

      - name: Commit Tests
        run: |
          git config user.name "Claude Code Bot"
          git config user.email "bot@example.com"
          git add -A
          git diff --staged --quiet || git commit -m "Add generated tests"
          git push
```

---

## 5. GitLab CI統合

### 5.1 基本設定

```yaml
# .gitlab-ci.yml
stages:
  - review
  - test

variables:
  ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY

code-review:
  stage: review
  image: node:20
  before_script:
    - npm install -g @anthropic-ai/claude-code
  script:
    - git diff origin/main...HEAD | claude -p "Review for security issues" --max-turns 3
  only:
    - merge_requests

generate-tests:
  stage: test
  image: node:20
  before_script:
    - npm install -g @anthropic-ai/claude-code
  script:
    - claude -p "Generate tests for changed files" --max-turns 5
  artifacts:
    paths:
      - tests/
  only:
    - merge_requests
```

### 5.2 マージリクエストコメント

```yaml
review-with-comment:
  stage: review
  script:
    - |
      REVIEW=$(claude -p "Review this MR" --output-format json)
      curl --request POST \
        --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
        --data-urlencode "body=$(echo $REVIEW | jq -r '.result')" \
        "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes"
```

---

## 6. セキュリティと注意事項

### 6.1 権限スキップの使用条件

`--dangerously-skip-permissions` は以下の条件でのみ使用:

| 条件 | 説明 |
|-----|------|
| 隔離環境 | Docker、VM、サンドボックス内 |
| 一時的環境 | CI/CDの使い捨て環境 |
| 信頼されたコード | 自分が管理するリポジトリ |

```bash
# Docker内での安全な使用例
docker run --rm -v $(pwd):/workspace node:20 sh -c \
  "npm install -g @anthropic-ai/claude-code && \
   cd /workspace && \
   claude -p 'Run all tests' --dangerously-skip-permissions"
```

### 6.2 APIキーの管理

```yaml
# GitHub Actions
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

# GitLab CI
variables:
  ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY  # CI/CD変数として設定
```

### 6.3 レート制限対策

```bash
# 指数バックオフ付きリトライ
retry_claude() {
  local max_attempts=3
  local delay=1
  for ((i=1; i<=max_attempts; i++)); do
    if claude -p "$1" --output-format json; then
      return 0
    fi
    sleep $delay
    delay=$((delay * 2))
  done
  return 1
}
```

---

## 7. トラブルシューティング

### 7.1 よくある問題

| 問題 | 原因 | 解決策 |
|-----|------|--------|
| 認証エラー | APIキー未設定 | `ANTHROPIC_API_KEY`を確認 |
| タイムアウト | 処理が長い | `--max-turns`で制限 |
| 出力が空 | パイプ入力なし | stdinを確認 |
| 権限エラー | ファイル操作 | `--dangerously-skip-permissions`（隔離環境のみ） |

### 7.2 デバッグ

```bash
# 詳細ログ
CLAUDE_DEBUG=1 claude -p "Test" --output-format json

# ドライラン（実行せず確認）
claude -p "What would you do?" --max-turns 1
```

---

## 8. 参照リソース

### 公式ドキュメント

- Headless Mode: https://code.claude.com/docs/en/headless
- CLI リファレンス: https://code.claude.com/docs/en/cli

### 実践ガイド

- CI/CD統合ガイド: https://angelo-lima.fr/en/claude-code-cicd-headless-en/

### 関連ドキュメント

- [Hooks](05_hooks.md) - 自動化とイベント処理
- [Settings](08_settings.md) - 権限とセキュリティ設定
