---
name: github-action
description: Codex GitHub Actionを使用したCI/CD統合ガイド
---

# GitHub Action 完全ガイド

`openai/codex-action@v1` を使用して、CodexをGitHub Actionsワークフローに統合できます。

## 目次

1. [概要](#概要)
2. [基本的な使用方法](#基本的な使用方法)
3. [入力パラメータ](#入力パラメータ)
4. [出力](#出力)
5. [セーフティ戦略](#セーフティ戦略)
6. [ユースケース](#ユースケース)
7. [セキュリティベストプラクティス](#セキュリティベストプラクティス)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### Codex GitHub Actionとは

- CodexをCI/CDパイプラインに統合
- PRレビュー、自動修正、品質チェックの自動化
- CLI管理不要でCodexを実行

### 特徴

| 特徴 | 説明 |
|------|------|
| **プロキシ内蔵** | Responses APIプロキシを自動起動 |
| **セーフティ制御** | 権限管理とサンドボックス |
| **アクセス制御** | トリガー元ユーザーの制限 |
| **出力キャプチャ** | 結果をファイルや変数に保存 |

---

## 基本的な使用方法

### 最小構成

```yaml
name: Codex Review
on: pull_request

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt: "Review this code for bugs and security issues"
```

### プロンプトファイル使用

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    prompt-file: .github/codex/prompts/review.md
```

```markdown
<!-- .github/codex/prompts/review.md -->
Review this PR for:
1. Security vulnerabilities
2. Performance issues
3. Code style violations

Provide actionable feedback.
```

---

## 入力パラメータ

### API設定

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `openai-api-key` | - | - | OpenAI APIキー（シークレット推奨） |
| `responses-api-endpoint` | - | - | カスタムAPIエンドポイント |

### プロンプト設定

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `prompt` | ※ | - | インラインプロンプト |
| `prompt-file` | ※ | - | プロンプトファイルパス |

※ `prompt` または `prompt-file` のどちらか一方が必要

### 実行設定

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `working-directory` | - | リポジトリルート | 作業ディレクトリ |
| `sandbox` | - | `workspace-write` | サンドボックスモード |
| `codex-version` | - | 最新 | Codex CLIバージョン |
| `codex-args` | - | - | 追加CLIフラグ |
| `codex-home` | - | - | Codexホームディレクトリ |

### モデル設定

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `model` | - | 自動 | 使用モデル |
| `effort` | - | - | 推論レベル |

### 出力設定

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `output-file` | - | - | 結果保存ファイル |
| `output-schema` | - | - | インラインJSONスキーマ |
| `output-schema-file` | - | - | スキーマファイルパス |

### セキュリティ設定

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `safety-strategy` | - | `drop-sudo` | 権限管理戦略 |
| `codex-user` | - | - | 実行ユーザー名 |
| `allow-users` | - | - | 許可ユーザーリスト |
| `allow-bots` | - | - | ボットアカウント許可 |

---

## 出力

### final-message

Codexの最終応答を取得:

```yaml
jobs:
  codex:
    runs-on: ubuntu-latest
    outputs:
      review: ${{ steps.review.outputs.final-message }}
    steps:
      - uses: actions/checkout@v4
      - id: review
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt: "Review this code"

  comment:
    needs: codex
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Review\n\n${{ needs.codex.outputs.review }}`
            });
```

### output-file

ファイルに保存してアーティファクトとしてアップロード:

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    prompt: "Generate report"
    output-file: report.md

- uses: actions/upload-artifact@v4
  with:
    name: codex-report
    path: report.md
```

---

## セーフティ戦略

### 利用可能な戦略

| 戦略 | 説明 | プラットフォーム |
|------|------|-----------------|
| `drop-sudo` | sudo権限を不可逆的に削除 | Linux/macOS |
| `unprivileged-user` | 特定ユーザーで実行 | Linux/macOS |
| `read-only` | ファイル変更・ネットワーク禁止 | 全て |
| `unsafe` | 権限制限なし | Windows必須 |

### 推奨設定

```yaml
# Linux/macOS（推奨）
- uses: openai/codex-action@v1
  with:
    safety-strategy: drop-sudo
    sandbox: workspace-write

# Windows
- uses: openai/codex-action@v1
  with:
    safety-strategy: unsafe
    sandbox: read-only  # サンドボックスで制限
```

### アクセス制御

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    prompt: "..."
    # 特定ユーザーのみ許可
    allow-users: "admin-user,trusted-user"
    # ボットからのトリガーを許可
    allow-bots: true
```

---

## ユースケース

### PRレビュー

```yaml
name: PR Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: openai/codex-action@v1
        id: review
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          sandbox: read-only
          prompt: |
            Review this PR focusing on:
            - Security vulnerabilities
            - Performance issues
            - Code quality

            Provide specific, actionable feedback.

      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Codex Review\n\n${{ steps.review.outputs.final-message }}`
            });
```

### CI失敗の自動修正

```yaml
name: Auto-Fix CI
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main, develop]

jobs:
  autofix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_branch }}
          fetch-depth: 0

      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          sandbox: workspace-write
          prompt: |
            The CI pipeline failed. Analyze the error logs and fix the issues.
            Focus on:
            - Type errors
            - Test failures
            - Linting errors

      - name: Check for changes
        id: changes
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi

      - uses: peter-evans/create-pull-request@v5
        if: steps.changes.outputs.has_changes == 'true'
        with:
          title: "fix: Auto-fix CI failures"
          body: "Automated fix generated by Codex"
          branch: codex-fix-${{ github.run_id }}
```

### コードベース分析

```yaml
name: Weekly Analysis
on:
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜
  workflow_dispatch:

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          sandbox: read-only
          output-file: analysis.md
          prompt: |
            Analyze this codebase and provide:
            1. Architecture overview
            2. Technical debt assessment
            3. Security recommendations
            4. Performance optimization opportunities

      - uses: actions/upload-artifact@v4
        with:
          name: weekly-analysis
          path: analysis.md
```

### テスト生成

```yaml
name: Generate Tests
on:
  pull_request:
    paths:
      - 'src/**/*.ts'

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          sandbox: workspace-write
          prompt: |
            Generate unit tests for new/modified files in this PR.
            Use Jest and follow existing test patterns.

      - uses: peter-evans/create-pull-request@v5
        with:
          title: "test: Add generated tests"
          body: "Tests generated by Codex"
          branch: codex-tests-${{ github.run_id }}
```

---

## セキュリティベストプラクティス

### 1. APIキーの管理

```yaml
# シークレットを使用
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}

# 環境シークレットも可
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### 2. トリガーの制限

```yaml
# フォークからのPRを制限
on:
  pull_request_target:
    types: [opened, synchronize]

jobs:
  review:
    # コラボレーターのみ
    if: github.event.pull_request.author_association == 'COLLABORATOR' ||
        github.event.pull_request.author_association == 'MEMBER'
```

### 3. プロンプトインジェクション対策

```yaml
# PRタイトル/本文を直接使用しない
# Bad ✗
prompt: "Review: ${{ github.event.pull_request.title }}"

# Good ✓
prompt-file: .github/codex/prompts/review.md
```

### 4. 最小権限の原則

```yaml
permissions:
  contents: read       # 読み取りのみ
  pull-requests: write # コメント用

# フルアクセスは避ける
# permissions: write-all  ✗
```

### 5. サンドボックス活用

```yaml
# レビュー: read-only
- uses: openai/codex-action@v1
  with:
    sandbox: read-only

# 修正: workspace-write
- uses: openai/codex-action@v1
  with:
    sandbox: workspace-write
    safety-strategy: drop-sudo
```

### 6. Codexを最終ステップに

```yaml
steps:
  # 他の処理を先に
  - uses: actions/checkout@v4
  - run: npm install
  - run: npm test

  # Codexは最後
  - uses: openai/codex-action@v1
```

---

## トラブルシューティング

### プロンプト重複エラー

```yaml
# prompt と prompt-file の両方を指定しない
# Bad ✗
- uses: openai/codex-action@v1
  with:
    prompt: "Review code"
    prompt-file: prompts/review.md

# Good ✓
- uses: openai/codex-action@v1
  with:
    prompt-file: prompts/review.md
```

### 権限エラー

```yaml
# drop-sudo 後のsudo使用は失敗する
# 必要なsudo操作は事前に実行

steps:
  - run: sudo apt-get update  # Codex前に実行
  - uses: openai/codex-action@v1
```

### Windowsでのエラー

```yaml
# Windowsでは unsafe が必要
- uses: openai/codex-action@v1
  if: runner.os == 'Windows'
  with:
    safety-strategy: unsafe
    sandbox: read-only  # サンドボックスで制限
```

### タイムアウト

```yaml
- uses: openai/codex-action@v1
  timeout-minutes: 30  # タイムアウト延長
  with:
    codex-args: '["--config", "tool_timeout_sec=300"]'
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [09_exec-mode.md](09_exec-mode.md) - Exec Mode
- [06_approval-sandbox.md](06_approval-sandbox.md) - セキュリティ設定
- [Codex GitHub Action](https://developers.openai.com/codex/github-action/) - 公式ドキュメント
- [openai/codex-action](https://github.com/openai/codex-action) - GitHubリポジトリ
- [OpenAI Cookbook: Auto-fix CI](https://cookbook.openai.com/examples/codex/autofix-github-actions) - 実装例
