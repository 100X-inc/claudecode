---
name: code-review
description: Codex CLIの/review機能によるコードレビュー自動化
---

# /review機能 完全ガイド

Codex CLIの`/review`コマンドを使用して、ローカルの変更を自動レビューできます。

## 目次

1. [概要](#概要)
2. [基本的な使用方法](#基本的な使用方法)
3. [レビューモード](#レビューモード)
4. [レビュー出力](#レビュー出力)
5. [カスタムレビュー](#カスタムレビュー)
6. [自動化](#自動化)
7. [ベストプラクティス](#ベストプラクティス)

---

## 概要

### /review とは

- ローカルの変更を自動レビュー
- 読み取り専用（ファイル変更なし）
- 優先度付きの指摘事項
- アクション可能な改善提案

### 特徴

| 特徴 | 説明 |
|------|------|
| **読み取り専用** | コードを変更しない |
| **複数モード** | ブランチ差分、未コミット、コミット単位 |
| **優先度付き** | Critical / High / Medium / Low |
| **自動化対応** | Exec Mode でCI統合可能 |

---

## 基本的な使用方法

### TUIでの使用

```
# Codex CLI 内で
/review
```

対話形式でレビューモードを選択:
1. ブランチに対してレビュー
2. 未コミット変更をレビュー
3. 特定コミットをレビュー

### Exec Mode での使用

```bash
# 未コミット変更をレビュー
codex exec --sandbox read-only "/review Review uncommitted changes"

# ブランチ差分をレビュー
codex exec --sandbox read-only "Review changes from main branch"
```

---

## レビューモード

### 1. ブランチに対してレビュー

ベースブランチからの全変更をレビュー:

```
/review
> Review against a base branch
> Select: main
```

**対象**:
- ベースブランチからの全コミット
- 追加・変更・削除されたファイル

**ユースケース**:
- PRを作成する前のセルフレビュー
- フィーチャーブランチ全体のチェック

### 2. 未コミット変更をレビュー

ステージ済み・未ステージの変更:

```
/review
> Review uncommitted changes
```

**対象**:
- `git diff` の出力
- `git diff --staged` の出力
- 追跡されていない新規ファイル

**ユースケース**:
- コミット前のクイックチェック
- WIP（作業中）のコードレビュー

### 3. 特定コミットをレビュー

特定のコミットのみ:

```
/review
> Review specific commits
> Select: abc1234
```

**対象**:
- 選択したコミットの変更のみ

**ユースケース**:
- 過去のコミットの品質チェック
- 特定の変更セットのレビュー

---

## レビュー出力

### 出力形式

```markdown
## Review Summary

### Critical Issues (Must Fix)
- **Security**: SQL injection vulnerability in `src/db.ts:45`
- **Bug**: Null pointer exception possible in `src/utils.ts:23`

### High Priority
- **Performance**: N+1 query in `src/api/users.ts:78`
- **Error Handling**: Missing error boundary in `src/components/Form.tsx`

### Medium Priority
- **Code Quality**: Duplicate code in `src/helpers.ts:12-30`
- **Testing**: Missing tests for `calculateTotal` function

### Low Priority
- **Style**: Inconsistent naming in `src/constants.ts`
- **Documentation**: Missing JSDoc for exported function

### Positive Notes
- Good separation of concerns in the API layer
- Comprehensive error messages
```

### 優先度レベル

| レベル | 説明 | アクション |
|--------|------|-----------|
| **Critical** | セキュリティ、バグ | マージ前に必ず修正 |
| **High** | パフォーマンス、エラー処理 | 修正推奨 |
| **Medium** | コード品質、テスト | 改善検討 |
| **Low** | スタイル、ドキュメント | 余裕があれば対応 |

---

## カスタムレビュー

### フォーカスエリアの指定

```
# セキュリティフォーカス
/review
> Focus on security vulnerabilities

# パフォーマンスフォーカス
/review
> Focus on performance issues

# 特定ファイル
/review
> Review only src/auth/*.ts files
```

### カスタム指示の追加

```
Review this code focusing on:
1. SQL injection vulnerabilities
2. Authentication bypass risks
3. Data validation issues

Ignore styling issues.
```

### Skillsとの組み合わせ

```
# code-review スキルがあれば自動発動
$code-review

# または明示的に指定
/review with $security-audit skill
```

---

## 自動化

### Pre-commit フック

```bash
#!/bin/bash
# .git/hooks/pre-commit

# 未コミット変更をレビュー
result=$(codex exec --sandbox read-only "Quick review of staged changes. Report only critical issues." 2>&1)

if echo "$result" | grep -qi "critical"; then
    echo "Critical issues found:"
    echo "$result"
    echo ""
    echo "Fix issues or commit with --no-verify to skip"
    exit 1
fi
```

### GitHub Actions

```yaml
name: PR Review
on: pull_request

jobs:
  review:
    runs-on: ubuntu-latest
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
            Review changes from ${{ github.base_ref }} branch.
            Focus on:
            - Security issues
            - Bugs
            - Performance problems
```

### スクリプト統合

```bash
#!/bin/bash
# review-branch.sh

BASE_BRANCH=${1:-main}

echo "Reviewing changes from $BASE_BRANCH..."

codex exec \
  --sandbox read-only \
  --output-last-message review-result.md \
  "Review all changes from $BASE_BRANCH branch. Provide prioritized findings."

cat review-result.md
```

---

## ベストプラクティス

### 1. read-only サンドボックス

```bash
# レビューは常に read-only で
codex exec --sandbox read-only "/review"
```

### 2. 定期的なセルフレビュー

```bash
# コミット前に毎回
git add .
codex exec --sandbox read-only "Review staged changes"
git commit -m "..."
```

### 3. フォーカスを絞る

```
# 効果的
/review Focus on security in authentication code

# 効果が薄い
/review Check everything
```

### 4. 結果の保存

```bash
# レビュー結果を保存
codex exec -o review-$(date +%Y%m%d).md --sandbox read-only "/review"
```

### 5. CI/CDパイプラインへの統合

```yaml
# 必須チェックとして設定
- uses: openai/codex-action@v1
  with:
    sandbox: read-only
    prompt: "Review for critical issues only"
```

---

## トラブルシューティング

### Git リポジトリでない

```bash
# Gitリポジトリ内で実行
cd /path/to/repo
codex
> /review
```

### 変更がない

```
> /review
No changes to review.

# 変更を確認
git status
git diff
```

### レビューが長すぎる

```
# フォーカスを絞る
/review Review only critical security issues

# または特定ファイルのみ
/review Review src/auth/ directory only
```

---

## Claude Codeとの比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| 組み込みレビュー | なし | `/review` |
| レビュースキル | 手動作成 | 組み込み |
| 差分分析 | 手動 | 自動 |
| 優先度付け | 手動 | 自動 |

---

## 関連ドキュメント

- [05_slash-commands.md](05_slash-commands.md) - Slash Commands一覧
- [09_exec-mode.md](09_exec-mode.md) - Exec Mode
- [10_github-action.md](10_github-action.md) - GitHub Action
- [03_skills.md](03_skills.md) - Agent Skills
