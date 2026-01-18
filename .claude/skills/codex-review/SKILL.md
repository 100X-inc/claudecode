---
name: codex-review
description: Codex CLI（read-only）を用いて、レビュー→Claude Code修正→再レビュー（ok: true まで）を反復し収束させるレビューゲート。仕様書/SPEC/PRD/要件定義/設計、実装計画（PLANS.md等）の作成・更新直後、major step（>=5 files / 新規モジュール / 公開API / infra・config変更）完了後、および git commit / PR / merge / release 前に使用する。キーワード: Codexレビュー, codex review, レビューゲート.
---

# Codex反復レビュー v3

## 概要

v3では**6専門エージェントによる並列レビュー**と**インラインコメント形式**を導入。
各専門家が分野別に深いレビューを行い、統合結果をインラインコメントで出力。

**v3.1追加**: Consistency Reviewer（クロスドキュメント整合性チェック）

## アーキテクチャ

```
[規模判定] → [静的解析] → [Codex並列レビュー（専門家）] → [統合] → [修正ループ]
                              ↓
              ┌───────┬───────┼───────┬───────┬─────────────┐
              ▼       ▼       ▼       ▼       ▼             ▼
          [Security] [Perf] [Quality] [Test] [Docs] [Consistency]
              │       │       │       │       │             │
              └───────┴───────┴───────┴───────┴─────────────┘
                              ↓
                      インラインコメント形式
                      (file:line + suggestion)
```

**Consistency Reviewer**: 仕様書↔実装のマルチファイル整合性チェック（条件付き起動）

## フロー（規模別）

```
[規模判定] → small:  lint → quality + test ────────────────────→ [修正ループ]
          → medium: lint → sec + perf + quality + test ────────→ [修正ループ]
          → large:  lint → 6並列(全専門家) → cross-check ───────→ [修正ループ]
```

- Codex: read-onlyでレビュー（監査役、6専門家）
- Claude Code: 統合・修正担当

### Consistency Reviewer 起動条件

| 条件 | 起動 |
|------|------|
| 仕様書（`docs/*.md`, `**/spec*.md`）の変更 | 常時起動（規模に関わらず） |
| `.claude/agents/*.md` の変更 | 常時起動（規模に関わらず） |
| large規模（>10ファイル または >500行） | 常時起動 |
| その他 | 起動しない |

## 規模判定

```bash
git diff <diff_range> --stat
git diff <diff_range> --name-status --find-renames
```

| 規模 | 基準 | 起動エージェント |
|-----|------|-----------------|
| small | ≤3ファイル かつ ≤100行 | quality, test（2並列）+ consistency（条件付き） |
| medium | 4-10ファイル または 101-500行 | security, perf, quality, test（4並列）+ consistency（条件付き） |
| large | >10ファイル または >500行 | 全6専門家（security, perf, quality, test, docs, consistency） |

**判定ルール**: ファイル数と行数で異なる規模になる場合、より大きい規模を採用。

`diff_range` 省略時: HEAD を使用。

## 専門レビュアー

各専門家の詳細定義は `reviewers/` ディレクトリを参照:

| # | レビュアー | ファイル | 専門分野 |
|---|-----------|---------|---------|
| 1 | Security | [security-reviewer.md](reviewers/security-reviewer.md) | OWASP Top 10, CWE, 認証/認可, 入力検証 |
| 2 | Performance | [performance-reviewer.md](reviewers/performance-reviewer.md) | N+1, メモリリーク, アルゴリズム複雑性 |
| 3 | Quality | [quality-reviewer.md](reviewers/quality-reviewer.md) | DRY, 命名, エラーハンドリング, 可読性 |
| 4 | Test | [test-reviewer.md](reviewers/test-reviewer.md) | カバレッジ, テスト品質, エッジケース |
| 5 | Docs | [docs-reviewer.md](reviewers/docs-reviewer.md) | ドキュメント正確性, API仕様整合 |
| 6 | Consistency | [consistency-reviewer.md](reviewers/consistency-reviewer.md) | 仕様書↔実装整合, コンポーネント存在, 入出力コントラクト |

## 静的解析ゲート

Codexレビュー前に静的解析を実行（存在する場合）:

```bash
# JavaScript/TypeScript
npm run lint 2>/dev/null || npx eslint . --ext .js,.ts,.tsx 2>/dev/null

# Python
ruff check . 2>/dev/null || flake8 . 2>/dev/null

# 型チェック
npx tsc --noEmit 2>/dev/null || mypy . 2>/dev/null
```

- 静的解析エラー: 修正してからCodexレビューへ
- 静的解析ツールなし: スキップしてCodexレビューへ

## Codex並列実行

### 実行パターン

```bash
# 一時ファイルディレクトリ
REVIEW_DIR=$(mktemp -d)

# 規模に応じて並列実行
# small: 2並列
codex exec -s read-only "$QUALITY_PROMPT" > "$REVIEW_DIR/quality.json" &
codex exec -s read-only "$TEST_PROMPT" > "$REVIEW_DIR/test.json" &
wait

# medium: 4並列
codex exec -s read-only "$SECURITY_PROMPT" > "$REVIEW_DIR/security.json" &
codex exec -s read-only "$PERF_PROMPT" > "$REVIEW_DIR/perf.json" &
codex exec -s read-only "$QUALITY_PROMPT" > "$REVIEW_DIR/quality.json" &
codex exec -s read-only "$TEST_PROMPT" > "$REVIEW_DIR/test.json" &
wait

# large: 6並列
codex exec -s read-only "$SECURITY_PROMPT" > "$REVIEW_DIR/security.json" &
codex exec -s read-only "$PERF_PROMPT" > "$REVIEW_DIR/perf.json" &
codex exec -s read-only "$QUALITY_PROMPT" > "$REVIEW_DIR/quality.json" &
codex exec -s read-only "$TEST_PROMPT" > "$REVIEW_DIR/test.json" &
codex exec -s read-only "$DOCS_PROMPT" > "$REVIEW_DIR/docs.json" &
codex exec -s read-only "$CONSISTENCY_PROMPT" > "$REVIEW_DIR/consistency.json" &
wait
```

### ポーリング

- レビュー完了待ち（必須）: 60秒ごとに最大20回ポーリング
- 全プロセス完了後に統合処理へ

## 統合ロジック（Cross-check）

Claude Codeが各専門家の結果を統合:

1. **結果収集**: 各専門家のJSON出力を読み込み
2. **重複検出**: 同一 file:lines への複数指摘をグルーピング（異なる分野は併記、同一分野は深刻度の高い方を優先）
3. **優先度ソート**: critical > high > medium > low
4. **ok判定**: critical/highが1件でもあれば `ok: false`
5. **インラインコメント生成**: INLINE_FORMAT.md に従って出力

### 重複マージルール

**JSONスキーマ**: 異なる分野からの同一箇所指摘は**別エントリとして保持**（`domain`は単一値）。
インラインコメント出力時のみ視覚的にグルーピング。

```markdown
# 異なる分野からの同一箇所指摘 → 別エントリとして両方保持
# JSON: 2つの別オブジェクト（domain: "security" と domain: "quality"）
# 表示: 同一file:linesを視覚的にグルーピング
### 🔴 [Security] 🟠 [Quality] src/auth.py:42-45

**問題 (Security)**: SQLインジェクション脆弱性
**問題 (Quality)**: エラーハンドリング不足

# 同一分野での重複 → より深刻な方を優先（1エントリのみ）
```

### Consistency Reviewer の統合ルール

- **欠落ファイル（type: missing）**: `file` が存在しないため、`lines` は空文字。インラインコメント表示で「ファイルなし」を明示
- **正規ソース参照**: `sourceOfTruth` で参照元を明示（例: `docs/architecture.md:45-60`）
- **比較情報**: `comparison.expected` と `comparison.actual` で仕様と実装の差異を明示
- 他のレビュアーの指摘と同一 file:lines でも、Consistency の指摘は別エントリとして保持

## インラインコメント出力形式

詳細は [INLINE_FORMAT.md](INLINE_FORMAT.md) を参照。

### 基本構造

```markdown
### {深刻度アイコン} [{分野}] {ファイル}:{行}

**問題**: {問題の説明}
**{分類}**: {分類情報}

{詳細説明}

**修正提案:**
```suggestion
{修正コード}
```
```

### 深刻度アイコン

| アイコン | レベル | 説明 | ok判定 |
|---------|-------|------|--------|
| 🔴 | Critical | セキュリティ脆弱性、データ損失リスク | `ok: false` |
| 🟠 | High | 機能バグ、重大なパフォーマンス問題 | `ok: false` |
| 🟡 | Medium | 保守性問題、テスト不足 | `ok: true`（警告） |
| 🟢 | Low | スタイル、ドキュメント | `ok: true`（参考） |

## 修正ループ

### 自動修正の原則

**Critical/High問題（`ok: false`）の場合:**
- **ユーザー確認なしで自動的に修正を開始**
- 修正完了後、自動的に再レビューを実行
- `ok: true` になるまで `max_iters` 回まで反復

**Medium/Low問題のみ（`ok: true`）の場合:**
- 修正は任意（ユーザーに確認可）
- レビュー結果をレポートして終了

### 修正ループフロー

`ok: false`の場合、以下を自動反復:

1. インラインコメント解析 → 修正計画
2. Claude Codeが修正（最小差分のみ、仕様変更は未解決issueに）
3. **テスト/リンタ実行**（`require_tests`パラメータで制御）
   - `require_tests: true`（既定）: テスト必須、失敗時は修正継続
   - `require_tests: false`: テストスキップ可、警告のみ記録
4. Codexに再レビュー依頼（該当専門家のみ再実行）
5. → 1に戻る（`ok: true` になるまで）

**停止条件:**
- `ok: true` かつ テスト条件クリア
- `max_iters`到達（未解決issue記録、ユーザーに報告）

## 専門家プロンプト構造

各専門家プロンプトは以下の構造:

```
あなたは{専門分野}の専門家です。{経験年数}年以上の経験を持ちます。

すべてのフィードバックは**日本語**で提供してください。

## レビュー観点
{専門分野固有のチェック項目}

## 出力形式
以下のJSON形式で出力:
{スキーマ}

## インラインコメント
{INLINE_FORMAT.mdの形式に従う}
```

## 各専門家の出力スキーマ

共通フィールドに加え、分野固有フィールドを含む:

```json
{
  "domain": "security|performance|quality|test|docs|consistency",
  "issues": [
    {
      // 共通フィールド（全分野必須）
      "severity": "critical|high|medium|low",
      "file": "path/to/file.ts",
      "lines": "42-45",
      "problem": "問題の説明",
      "recommendation": "修正案",
      "suggestion": "修正コード（オプション）",

      // 分野別フィールド（該当分野のみ）
      "cwe": "CWE-89",                       // security: CWE番号
      "owasp": "A03:2021-Injection",         // security: OWASP Top 10
      "impact": "影響の説明",                 // performance: パフォーマンス影響
      "reason": "理由",                       // quality: 問題の理由
      "targetCode": "対象コード",             // test: テスト対象
      "testFile": "テストファイル",           // test: 対応テストファイル（任意）
      "type": "inaccurate|outdated|missing",  // docs: 問題種別（docs専用）
      // または
      "type": "missing|mismatch|duplicate|naming",  // consistency: 問題種別（consistency専用）
      "current": "現状の内容",                // docs: 現在のドキュメント
      "sourceOfTruth": "参照した正規ソース",  // consistency: 正規ソースの参照
      "comparison": { "expected": "...", "actual": "..." }  // consistency: 期待値と実際値
    }
  ],
  "summary": "レビューの要約"
}
```

**注**: 各専門家は該当分野の追加フィールドのみを出力。詳細は`reviewers/*.md`参照。

## 統合結果スキーマ

Claude Codeが各専門家の結果を統合した最終出力。`inlineComments`には統合元を示す`domain`を含む。
**注**: 同一file:linesへの複数分野からの指摘は別エントリとして保持（下記例の2件目参照）。

```json
{
  "ok": false,
  "summary": "統合レビューの要約",
  "inlineComments": [
    {
      "severity": "critical",
      "domain": "security",           // 統合後は出所を示すためdomain必須（単一値）
      "file": "src/auth.py",
      "lines": "42-45",
      "problem": "SQLインジェクション脆弱性",
      "recommendation": "パラメータ化クエリを使用",
      "suggestion": "cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
      // 分野別フィールド（該当分野のみ）
      "cwe": "CWE-89",
      "owasp": "A03:2021-Injection"
    },
    {
      "severity": "high",
      "domain": "quality",            // 同一file:linesでも別分野は別エントリ
      "file": "src/auth.py",
      "lines": "42-45",
      "problem": "エラーハンドリング不足",
      "recommendation": "例外処理を追加",
      "reason": "DB接続失敗時の処理が未定義"
    }
  ],
  "stats": {
    "security": { "critical": 1, "high": 0, "medium": 0, "low": 0 },
    "performance": { "critical": 0, "high": 1, "medium": 0, "low": 0 },
    "quality": { "critical": 0, "high": 0, "medium": 2, "low": 1 },
    "test": { "critical": 0, "high": 0, "medium": 1, "low": 0 },
    "docs": { "critical": 0, "high": 0, "medium": 0, "low": 2 },
    "consistency": { "critical": 0, "high": 0, "medium": 0, "low": 0 }
  },
  "notes_for_next_review": "メモ"
}
```

## エラー時の共通ルール

Codex exec失敗時（タイムアウト・API障害・その他）:

1. 該当専門家のみ1回リトライ
2. 再失敗 → 該当専門家をスキップし、理由をレポートに記録
3. 他の専門家の結果で統合を継続
4. スキップした専門家分は「未レビュー」として記録

## パラメータ

| 引数 | 既定 | 説明 |
|-----|-----|-----|
| max_iters | 5 | 最大反復（上限5） |
| review_focus | - | 重点観点 |
| diff_range | HEAD | 比較範囲 |
| require_tests | true | テスト必須フラグ |

## 終了レポート例

```markdown
## Codexレビュー結果 v3

- 規模: medium（6ファイル、280行）
- レビュアー: security, performance, quality, test
- 反復: 2/5 / ステータス: ⚠️ 要修正
- 静的解析: ✅ パス
- テスト: ✅ 全パス

### インラインフィードバック

#### 🔴 Critical (1件)

### 🔴 [Security] src/auth.py:42-45

**問題**: SQLインジェクション脆弱性
**CWE**: CWE-89 | **OWASP**: A03:2021-Injection

ユーザー入力が直接SQLクエリに挿入されています。

**修正提案:**
```suggestion
cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
```

#### 🟠 High (1件)

### 🟠 [Performance] src/api/users.py:120-135

**問題**: N+1クエリ問題
**影響**: ユーザー数に比例してクエリ数が増加

**修正提案:**
```suggestion
users = User.query.options(joinedload(User.profile)).all()
```

#### 🟡 Medium (2件)
{インラインコメント...}

#### 🟢 Low (1件)
{インラインコメント...}

### 統合サマリー

| 分野 | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| Security | 1 | 0 | 0 | 0 |
| Performance | 0 | 1 | 0 | 0 |
| Quality | 0 | 0 | 1 | 0 |
| Test | 0 | 0 | 1 | 0 |
| Docs | - | - | - | - |
| Consistency | - | - | - | - |

### 修正履歴
| ファイル | 問題 | 深刻度 | 修正内容 |
|---------|------|--------|---------|
| auth.py | SQLi | critical | パラメータ化クエリに変更 |

### 未レビュー（エラー時のみ）
- utils/legacy.py: Codexタイムアウト、手動確認推奨
```

## セキュリティチェックリスト参照

セキュリティレビュー時は以下を確認:

**OWASP Top 10 (2021):**
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable Components
- A07: Auth Failures
- A08: Data Integrity Failures
- A09: Logging Failures
- A10: SSRF

詳細チェックリストは [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) を参照。
