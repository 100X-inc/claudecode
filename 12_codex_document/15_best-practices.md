---
name: best-practices
description: Codex CLI活用のためのベストプラクティス完全ガイド
---

# Codex CLI ベストプラクティス 完全ガイド

Codex CLIを最大限活用するためのベストプラクティス、ワークフロー最適化、よくある間違いの回避方法をまとめます。

## 目次

1. [プロンプティング](#プロンプティング)
2. [AGENTS.mdの活用](#agentsmdの活用)
3. [セキュリティと承認](#セキュリティと承認)
4. [セッション管理](#セッション管理)
5. [モデル選択](#モデル選択)
6. [コンテキスト管理](#コンテキスト管理)
7. [並列処理](#並列処理)
8. [ワークフロー設計](#ワークフロー設計)
9. [CI/CD統合](#cicd統合)
10. [よくある間違いと回避策](#よくある間違いと回避策)
11. [トラブルシューティング](#トラブルシューティング)

---

## プロンプティング

### 基本原則

#### 1. 意図ベースのプロンプト

```
# Good ✓ - 意図を伝える
"Add user authentication with JWT tokens and secure password hashing"

# Bad ✗ - 実装詳細を指定しすぎ
"Create a function called authenticateUser that takes username and password parameters and returns a JWT token using jsonwebtoken library"
```

#### 2. 明確で具体的に

```
# Good ✓
"Fix the TypeScript error in src/utils.ts on line 42 - the function expects a string but receives number"

# Bad ✗
"Fix errors"
```

#### 3. 一度に一つのタスク

```
# Good ✓ - 段階的アプローチ
1. "Analyze the current authentication implementation"
2. "Identify security vulnerabilities"
3. "Fix the identified issues one by one"

# Bad ✗ - 一度に多すぎ
"Analyze, fix all security issues, add tests, update docs, and deploy"
```

### 効果的なプロンプトパターン

#### 明確化質問パターン

```
Before starting, ask up to 3 clarifying questions if anything is underspecified.
If you can proceed safely, state your assumptions and ask me to confirm.
```

AGENTS.mdに追加して、Codexが確認してから作業するよう促す。

#### 段階的実行パターン

```
Implement this feature in stages:
1. First, create the data model
2. Then, implement the API endpoint
3. Finally, add tests

After each stage, verify the changes before proceeding.
```

#### 制約明示パターン

```
Constraints:
- Do not modify existing public APIs
- Maintain backward compatibility
- Keep changes minimal
```

### 過剰プロンプティングの回避

```
# Bad ✗ - 長すぎる開発者メッセージは品質低下
"You are an expert developer with 20 years of experience in..."
[500行の詳細指示]

# Good ✓ - 簡潔に
"Add error handling to the API endpoints"
[AGENTS.mdにコーディング規約を記載]
```

**重要**: GPT-5-Codexは短いプロンプトを期待しています。詳細なルールはAGENTS.mdに分離。

---

## AGENTS.mdの活用

### 基本構造

```markdown
# Project Name

## Build & Test
npm install
npm test
npm run lint

## Code Style
- TypeScript strict mode
- Functional components preferred
- ESLint + Prettier

## Security Rules
- Never commit .env files
- Use parameterized queries
- Validate all user input

## PR Guidelines
- Conventional commits
- Tests required
- 80% coverage minimum
```

### 階層的な設定

```
project/
├── AGENTS.md              # プロジェクト全体のルール
├── packages/
│   ├── api/
│   │   └── AGENTS.md      # API固有のルール
│   └── web/
│       └── AGENTS.md      # Web固有のルール
└── scripts/
    └── AGENTS.md          # スクリプト固有のルール
```

近いファイルが優先される（後で読み込まれるため）。

### ベストプラクティス

#### 1. 最小限に保つ

```markdown
# Good ✓ - 実行可能で簡潔
## Test
npm test

## Lint
npm run lint

# Bad ✗ - 冗長
## Testing Instructions
When you want to run tests, you should use npm test command.
This will run all unit tests in the project.
Make sure to run this before committing.
```

#### 2. 秘密情報は含めない

```markdown
# Bad ✗
API_KEY=sk-xxxx

# Good ✓
API keys are stored in .env (see .env.example)
```

#### 3. 実行可能なコマンドを含める

```markdown
## Commands
Build: `npm run build`
Test: `npm test`
Lint: `npm run lint`
```

#### 4. /init で開始

```bash
codex
> /init
```

プロジェクト構造を自動検出してスキャフォールドを生成。

---

## セキュリティと承認

### 段階的エスカレーション

```
最も制限的 → 最も緩い

1. read-only + on-request     # 初めてのプロジェクト探索
2. workspace-write + on-request  # 日常開発（デフォルト）
3. workspace-write + untrusted   # 効率重視
4. workspace-write + never       # CI/CD
5. danger-full-access            # 専用VM内のみ
```

### 推奨設定パターン

#### 安全な探索

```bash
codex --sandbox read-only
```

ファイルを読むだけ、変更なし。

#### 日常開発

```bash
codex --full-auto
# = --sandbox workspace-write --ask-for-approval on-request
```

#### CI/CD

```bash
codex exec --sandbox workspace-write --ask-for-approval never "Run tests"
```

#### 避けるべきパターン

```bash
# 避ける - 本番環境では使用しない
codex --yolo
codex --dangerously-bypass-approvals-and-sandbox
```

### 追加ディレクトリの許可

```bash
# danger-full-access の代わりに --add-dir
codex --add-dir /path/to/config --add-dir /shared/lib
```

### ネットワークアクセス

```toml
# デフォルトは無効
# 必要な場合のみ有効化
[sandbox_workspace_write]
network_access = true
```

Web検索だけなら:

```bash
codex --search
# または
codex --enable web_search_request
```

---

## セッション管理

### 効果的な再開

```bash
# 最後のセッションを即座に再開
codex resume --last

# コンテキストを補足
codex resume --last "We were working on authentication. Continue with refresh tokens."
```

### フォークの活用

```
# オリジナルのアプローチ
Task: Implement caching
→ Redis approach

# 別アプローチを試す
/fork
Task: Implement caching (fork)
→ In-memory approach

# 両方を比較して選択
```

### セッション保存のベストプラクティス

1. **意味のある区切りで新規開始**: `/new`
2. **重要な地点でフォーク**: `/fork`
3. **長い会話は圧縮**: `/compact`

---

## モデル選択

### モデル特性

| モデル | 用途 | 推論努力 |
|--------|------|---------|
| `gpt-5.2-codex` | 長時間の自律タスク、複雑なリファクタ | xhigh |
| `gpt-5-codex` | 日常のコーディング（デフォルト） | medium |
| `gpt-5` | 汎用タスク（Windowsデフォルト） | medium |
| `o3` | 推論重視のタスク | high |
| `o3-mini` | 軽量な推論タスク | medium |

### 推論努力の選択

```
none    → 低レイテンシ、単純なタスク
minimal → 軽い推論
low     → 速度重視
medium  → 日常タスク（推奨デフォルト）
high    → 複雑なタスク
xhigh   → 最も困難なタスク（数時間の自律作業）
```

### 切り替え方法

```
# TUI内で
/model
> gpt-5.2-codex
> reasoning effort: high

# または config.toml
model = "gpt-5.2-codex"
model_reasoning_effort = "high"
```

### 推奨パターン

```toml
# 日常用
model = "gpt-5-codex"
model_reasoning_effort = "medium"

# 難しいタスク用プロファイル
[profiles.hard]
model = "gpt-5.2-codex"
model_reasoning_effort = "xhigh"
```

```bash
codex --profile hard "Refactor the entire authentication system"
```

---

## コンテキスト管理

### コンパクション

長い会話はトークン制限に達する:

```
# 会話が長くなったら
/compact
```

自動的に要約してトークンを解放。

### トークン節約のコツ

1. **ファイル参照を絞る**

```
# Good ✓
/mention src/auth/login.ts
"Fix the bug in this file"

# Bad ✗
"Fix the bug somewhere in src/"
```

2. **不要な出力を抑制**

```
"Fix the bug. Output only the changed lines, not the entire file."
```

3. **段階的に作業**

```
# タスクを分割
1. "List the files that need changes"
2. "Fix src/auth.ts"
3. "Fix src/api.ts"
```

### 自動コンパクション

```toml
# config.toml
model_auto_compact_token_limit = 100000
```

指定トークン数を超えると自動でコンパクション。

---

## 並列処理

### 並列読み取りの原則

```
# Bad ✗ - 順次読み取り
Read file A
Read file B
Read file C

# Good ✓ - 並列読み取り
Read files A, B, C simultaneously
```

### AGENTS.mdでの指示

```markdown
## Parallelism Rules

Always maximize parallelism:
- Never read files one-by-one unless logically unavoidable
- Before any tool call, decide ALL files/resources you will need
- Batch everything - read multiple files together
```

### 効果的なパターン

```
"Analyze these 5 files: [list]. Read them all, then provide a summary."
```

---

## ワークフロー設計

### コマンドチェーン

```
# Think in workflows, not one-off commands

# Good ✓ - ワークフロー
"Run tests, fix any failures, then run tests again to verify"

# Bad ✗ - 単発コマンド
"Run tests"
[手動で結果を確認]
"Fix this error"
[手動で再テスト]
```

### レビュー → 修正 → 検証サイクル

```bash
# 1. レビュー（read-only）
codex --sandbox read-only "/review"

# 2. 修正
codex "Fix the issues identified in the review"

# 3. 検証
codex --sandbox read-only "/review"
```

### 長時間タスクの設計

[16_plans-md.md](16_plans-md.md) の PLANS.md パターンを参照:

```
1. 計画を立てる（read-only）
2. 計画をレビュー
3. 実装
4. 進捗を記録
5. 検証
```

---

## CI/CD統合

### 基本パターン

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    sandbox: workspace-write  # または read-only
    prompt: "Review this PR"
```

### セーフティ設定

```yaml
# Linux/macOS
safety-strategy: drop-sudo

# Windows
safety-strategy: unsafe
sandbox: read-only  # サンドボックスで制限
```

### 段階的エスカレーション

```yaml
jobs:
  # 1. まずread-onlyでレビュー
  review:
    steps:
      - uses: openai/codex-action@v1
        with:
          sandbox: read-only
          prompt: "Review for issues"

  # 2. 問題なければ修正
  fix:
    needs: review
    if: needs.review.outputs.has-issues == 'true'
    steps:
      - uses: openai/codex-action@v1
        with:
          sandbox: workspace-write
          prompt: "Fix the identified issues"
```

---

## よくある間違いと回避策

### 1. 認証関連

| 間違い | 回避策 |
|--------|--------|
| API キー期限切れ | `codex login` で再認証 |
| 環境変数未設定 | `echo $OPENAI_API_KEY` で確認 |
| レート制限 | 429エラー時は待機 |

### 2. 設定関連

| 間違い | 回避策 |
|--------|--------|
| 無効なモデル名 | モデル設定を削除してデフォルト使用 |
| TOML構文エラー | 文字列はクォート、ブールはクォートなし |
| 設定が反映されない | Codex再起動 |

### 3. プロンプト関連

| 間違い | 回避策 |
|--------|--------|
| 曖昧なプロンプト | 具体的に、ファイル名を含める |
| 過剰な詳細 | AGENTS.mdに分離 |
| 一度に多すぎ | 段階的に分割 |

### 4. セキュリティ関連

| 間違い | 回避策 |
|--------|--------|
| 本番で--yolo使用 | 絶対に避ける |
| シークレットをAGENTS.mdに | 環境変数を使用 |
| 古いバージョン使用 | 常に最新版に更新 |

### 5. CI/CD関連

| 間違い | 回避策 |
|--------|--------|
| 対話モードをCIで使用 | `codex exec`を使用 |
| 承認プロンプトでハング | `--ask-for-approval never` |
| Windowsでサンドボックスエラー | `safety-strategy: unsafe` |

---

## トラブルシューティング

### 診断手順

```bash
# 1. バージョン確認
codex --version

# 2. 認証確認
codex login status

# 3. 設定確認
cat ~/.codex/config.toml

# 4. ログ確認
codex --enable debug_logs
```

### 一般的な問題

#### Codexが遅い

```bash
# 会話を圧縮
/compact

# または新規セッション
/new
```

#### コマンドが失敗する

```bash
# サンドボックス設定確認
/status

# 権限を緩和（一時的に）
codex --add-dir /needed/path
```

#### 設定が反映されない

```bash
# config.toml の構文確認
# Codexを完全に終了して再起動
exit
codex
```

### フィードバック送信

```
# 問題を報告
/feedback
```

診断情報がCodexメンテナに送信される。

---

## チェックリスト

### 新規プロジェクト開始時

- [ ] `/init` でAGENTS.mdを生成
- [ ] ビルド・テストコマンドを追加
- [ ] コーディング規約を追加
- [ ] セキュリティルールを追加

### 日常作業時

- [ ] 適切なサンドボックスモードを使用
- [ ] 明確で具体的なプロンプト
- [ ] 長い会話は `/compact`
- [ ] コミット前に `/review`

### CI/CD設定時

- [ ] `codex exec` を使用
- [ ] 適切な `safety-strategy`
- [ ] シークレットは環境変数で
- [ ] 出力をアーティファクトとして保存

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [02_agents-md.md](02_agents-md.md) - AGENTS.md詳細
- [06_approval-sandbox.md](06_approval-sandbox.md) - セキュリティ設定
- [07_configuration.md](07_configuration.md) - 設定詳細
- [16_plans-md.md](16_plans-md.md) - PLANS.mdパターン

### 外部リソース

- [OpenAI Cookbook: Codex](https://cookbook.openai.com/examples/codex/)
- [GPT-5.1-Codex-Max Prompting Guide](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)
- [AGENTS.md Specification](https://agents.md/)
