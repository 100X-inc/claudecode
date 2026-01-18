---
name: exec-mode
description: Codex CLI Exec Modeによる非対話実行とCI/CD統合
---

# Exec Mode 完全ガイド

Exec Modeは、Codex CLIを非対話的に実行し、スクリプトやCI/CDパイプラインに統合するための機能です。

## 目次

1. [概要](#概要)
2. [基本的な使用方法](#基本的な使用方法)
3. [オプション](#オプション)
4. [出力形式](#出力形式)
5. [セッション再開](#セッション再開)
6. [スクリプト統合](#スクリプト統合)
7. [CI/CD統合](#cicd統合)
8. [ベストプラクティス](#ベストプラクティス)
9. [Claude Codeとの比較](#claude-codeとの比較)

---

## 概要

### Exec Modeとは

- 非対話モードでCodexを実行
- TUI（Terminal UI）なしで動作
- スクリプト・自動化向け
- JSON出力サポート

### 対話モードとの違い

| 項目 | 対話モード | Exec Mode |
|------|-----------|-----------|
| 起動コマンド | `codex` | `codex exec` |
| UI | TUI（フルスクリーン） | 標準出力 |
| 人間の介入 | 可能 | 不要 |
| 用途 | インタラクティブ作業 | 自動化・CI |

---

## 基本的な使用方法

### コマンド構文

```bash
codex exec [OPTIONS] "PROMPT"
codex e [OPTIONS] "PROMPT"   # 短縮形
```

### 基本例

```bash
# 単純なタスク
codex exec "List all TypeScript files in src/"

# コード修正
codex exec "Fix the type error in src/utils.ts"

# テスト実行
codex exec "Run the test suite and report failures"
```

### パイプとの組み合わせ

```bash
# 出力をファイルに保存
codex exec "Summarize this codebase" > summary.md

# 他のコマンドと組み合わせ
codex exec "Generate a commit message" | git commit -F -
```

---

## オプション

### 主要オプション

| オプション | 説明 |
|-----------|------|
| `--sandbox, -s` | サンドボックスモード |
| `--ask-for-approval, -a` | 承認ポリシー |
| `--model, -m` | 使用モデル |
| `--output-last-message, -o` | 最終メッセージをファイルに保存 |
| `--json` | JSON形式で出力 |
| `--skip-git-repo-check` | Gitリポジトリ外でも実行 |
| `--color` | カラー出力（`always`/`never`/`auto`） |

### 出力オプション

```bash
# 最終メッセージをファイルに保存
codex exec -o result.txt "Analyze this code"

# JSON出力
codex exec --json "List files"

# JSON + ファイル保存
codex exec --json -o result.json "Analyze code"
```

### セキュリティオプション

```bash
# 読み取り専用
codex exec --sandbox read-only "Review this code"

# 承認なし（自動実行）
codex exec --ask-for-approval never "Run tests"

# フルアクセス（注意）
codex exec --full-auto "Fix and commit changes"
```

### 完全な例

```bash
codex exec \
  --sandbox workspace-write \
  --ask-for-approval never \
  --model gpt-5-codex \
  --output-last-message result.md \
  "Run tests, fix any failures, and summarize the results"
```

---

## 出力形式

### テキスト出力（デフォルト）

```bash
$ codex exec "What files are in src/"
src/
├── index.ts
├── utils.ts
└── components/
    └── Button.tsx
```

### JSON出力

```bash
$ codex exec --json "List TypeScript files"
```

出力形式（改行区切りJSON）:
```json
{"type":"message","content":"Found 3 TypeScript files..."}
{"type":"tool_use","tool":"shell","input":"find src -name '*.ts'"}
{"type":"tool_result","output":"src/index.ts\nsrc/utils.ts"}
{"type":"message","content":"Here are the files:..."}
```

### JSON スキーマ検証

```bash
# スキーマファイルで出力を検証
codex exec --output-schema schema.json "Generate config"
```

---

## セッション再開

### resume サブコマンド

```bash
# 最後のセッションを再開
codex exec resume --last "Continue with the next step"

# 特定のセッションを再開
codex exec resume <SESSION_ID> "Add more tests"
```

### セッションID取得

```bash
# 対話モードでセッション確認
codex
> /status  # セッションIDを表示
```

---

## スクリプト統合

### Bashスクリプト

```bash
#!/bin/bash

# エラーハンドリング
set -e

# Codexでコード分析
result=$(codex exec --sandbox read-only "Analyze src/main.ts for security issues")

# 結果をチェック
if echo "$result" | grep -q "vulnerability"; then
    echo "Security issues found!"
    exit 1
fi

echo "No security issues found."
```

### Python スクリプト

```python
import subprocess
import json

def run_codex(prompt: str) -> str:
    result = subprocess.run(
        ["codex", "exec", "--json", prompt],
        capture_output=True,
        text=True
    )

    # JSON行をパース
    messages = []
    for line in result.stdout.strip().split('\n'):
        if line:
            data = json.loads(line)
            if data.get('type') == 'message':
                messages.append(data['content'])

    return '\n'.join(messages)

# 使用例
analysis = run_codex("Analyze the codebase structure")
print(analysis)
```

### Node.js スクリプト

```javascript
const { execSync } = require('child_process');

function runCodex(prompt) {
    const result = execSync(`codex exec "${prompt}"`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024  // 10MB
    });
    return result;
}

// 使用例
const summary = runCodex('Summarize the README.md');
console.log(summary);
```

---

## CI/CD統合

### GitHub Actions

```yaml
# .github/workflows/codex-review.yml
name: Codex Code Review

on:
  pull_request:
    branches: [main]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Codex
        run: npm install -g @openai/codex

      - name: Run Code Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          codex exec \
            --sandbox read-only \
            --ask-for-approval never \
            --output-last-message review.md \
            "Review the changes in this PR for security and code quality issues"

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Codex Review\n\n${review}`
            });
```

### 自動修正ワークフロー

```yaml
# .github/workflows/codex-autofix.yml
name: Codex Auto-Fix

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]

jobs:
  autofix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_branch }}

      - name: Install Codex
        run: npm install -g @openai/codex

      - name: Auto-fix Failures
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          codex exec \
            --sandbox workspace-write \
            --ask-for-approval never \
            "Analyze the CI failure and fix the issues"

      - name: Create Fix PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: "fix: Auto-fix CI failures"
          body: "Automated fix by Codex"
          branch: codex-autofix-${{ github.run_id }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
codex-review:
  stage: review
  image: node:20
  before_script:
    - npm install -g @openai/codex
  script:
    - codex exec --sandbox read-only --ask-for-approval never "Review this MR"
  only:
    - merge_requests
```

詳細は [10_github-action.md](10_github-action.md) 参照。

---

## ベストプラクティス

### 1. 適切なサンドボックス設定

```bash
# レビュー・分析: read-only
codex exec --sandbox read-only "Review code"

# コード修正: workspace-write
codex exec --sandbox workspace-write "Fix bugs"

# フルアクセスは避ける
# codex exec --sandbox danger-full-access  # ✗
```

### 2. 明確なプロンプト

```bash
# Good ✓
codex exec "Fix the TypeScript error in src/utils.ts line 42"

# Bad ✗
codex exec "Fix errors"
```

### 3. 出力の保存

```bash
# 結果を保存して検証
codex exec -o result.md "Generate report"
cat result.md  # 確認
```

### 4. タイムアウト設定

```bash
# 長時間タスクにはタイムアウト設定
timeout 300 codex exec "Run comprehensive tests"
```

### 5. エラーハンドリング

```bash
#!/bin/bash
set -e

if ! codex exec "Run tests"; then
    echo "Codex task failed"
    exit 1
fi
```

### 6. 段階的権限エスカレーション

```bash
# まず read-only で分析
codex exec --sandbox read-only "Analyze issues"

# 問題がなければ workspace-write で修正
codex exec --sandbox workspace-write "Apply fixes"
```

---

## トラブルシューティング

### Git リポジトリ外でのエラー

```bash
# --skip-git-repo-check を使用
codex exec --skip-git-repo-check "Analyze this directory"
```

### 出力が途切れる

```bash
# バッファサイズを増やす（スクリプト内）
# または --output-last-message でファイルに保存
codex exec -o full-output.md "Long task"
```

### タイムアウト

```bash
# シェルのタイムアウト設定
timeout 600 codex exec "Long running task"

# または config.toml で設定
```

### 認証エラー

```bash
# 環境変数確認
echo $OPENAI_API_KEY

# または事前にログイン
codex login
```

---

## Claude Codeとの比較

### コマンド対応

| Claude Code | Codex |
|-------------|-------|
| `claude --print "prompt"` | `codex exec "prompt"` |
| `claude -p "prompt"` | `codex e "prompt"` |

### 機能比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| 非対話実行 | `--print` | `exec` サブコマンド |
| JSON出力 | `--output-format json` | `--json` |
| セッション再開 | `--resume` | `exec resume` |
| 出力保存 | リダイレクト | `-o` オプション |
| スキーマ検証 | なし | `--output-schema` |

### 移行例

```bash
# Claude Code
claude --print "Analyze code" > result.txt

# Codex
codex exec -o result.txt "Analyze code"
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [06_approval-sandbox.md](06_approval-sandbox.md) - セキュリティ設定
- [10_github-action.md](10_github-action.md) - GitHub Action詳細
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/) - 公式ドキュメント
