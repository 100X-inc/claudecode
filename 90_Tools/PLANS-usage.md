# PLANS.md テンプレート使用ガイド

Claude Code / OpenAI Codex 両対応の実行計画テンプレート

## セットアップ

### ファイル配置

```
your-project/
├── CLAUDE.md              # 最小限のポインタのみ（2-3行）
├── AGENTS.md              # 最小限のトリガールールのみ（3-5行）
├── doc/
│   └── plans/
│       ├── PLANS-template.md   # テンプレート本体
│       ├── PLANS-guide.md      # 詳細な使い方（オプション）
│       └── PLAN-*.md           # 各タスクの計画
```

---

## Claude Code 用設定（推奨）

### CLAUDE.md に追加（2-3行のみ）

```markdown
## 大規模タスク
3ファイル以上の変更時は `doc/plans/PLAN-{yyyymmdd_hhmm}-{feature}.md` を作成。
例: `PLAN-20260115_1430-auth.md`
テンプレート: [doc/plans/PLANS-template.md](doc/plans/PLANS-template.md)
```

**これだけ。** 詳細な使い方はテンプレートファイル自体に書いてあるので、
Claudeは必要な時に読みに行く（Progressive Disclosure）。

### 代替案: Skill として設定

より確実に動作させたい場合:

```
.claude/skills/exec-plans/
├── SKILL.md              # 発動条件と基本指示
└── PLANS-template.md     # テンプレート
```

```markdown
<!-- .claude/skills/exec-plans/SKILL.md -->
---
name: exec-plans
description: 複雑なタスクの実行計画を作成・管理する
---

# ExecPlans

3ファイル以上の変更、新機能実装、リファクタリング時に発動。

## 使い方
1. `doc/plans/PLAN-{yyyymmdd_hhmm}-{feature}.md` を作成
2. PLANS-template.md の構造に従う
3. Progress を随時更新
```

---

## OpenAI Codex 用設定

### AGENTS.md に追加（3-5行のみ）

```markdown
# ExecPlans
When writing complex features (3+ files) or significant refactors,
create an ExecPlan following doc/plans/PLANS-template.md.
Say "do the plan" to execute methodically.
```

**詳細はテンプレートに任せる。** AGENTS.md を肥大化させない。

---

## 使用例

### 1. 計画作成

```bash
# Claude Code
"認証機能を追加したい。まず計画を立てて"
# → PLAN-20260115_1430-auth.md が作成される

# Codex
"Create an ExecPlan for adding authentication feature"
```

### 2. 計画実行

```bash
# Claude Code
"PLAN-20260115_1430-auth.md の計画に従って実装を進めて"

# Codex
"Do the plan in doc/plans/PLAN-20260115_1430-auth.md"
```

### 3. 進捗確認

```bash
# Both
"最新の PLAN の Progress を更新して現状を教えて"
```

---

## ベストプラクティス

### DO（推奨）

- **Purpose を最初に書く** - なぜやるかが明確でないと迷走する
- **Concrete Steps は具体的に** - ファイル名、コマンド、期待出力を明記
- **Progress は頻繁に更新** - タイムスタンプ付きで記録
- **Decision Log を活用** - 後から「なぜこうなった？」がわかる
- **Validation は必須** - 完了条件を明確に

### DON'T（非推奨）

- 計画なしで大規模変更を始める
- Progress を更新せずに進める
- 検証方法を曖昧にする（「動作確認する」だけ）
- Surprises を記録しない（同じ問題で再度ハマる）

---

## テンプレートのカスタマイズ

### ミニマル版（小規模タスク用）

```markdown
# [Task Title]

## Purpose
[Why are we doing this?]

## Progress
- [ ] Step 1
- [ ] Step 2

## Steps
1. [Concrete step with file/command]
2. [Next step]

## Validation
- [ ] [How to verify completion]

## Notes
[Discoveries, decisions, outcomes]
```

### フル版
`90_Tools/PLANS-template.md` を使用

---

## トラブルシューティング

### エージェントが計画を無視する

1. CLAUDE.md / AGENTS.md の指示を強化
2. タスク開始時に明示的に「計画を確認して」と指示
3. 計画ファイルを会話に含める

### 計画が古くなる

1. 各セッション開始時に Progress を確認
2. 状況が変わったら Context and Orientation を更新
3. 大きな方針変更は Decision Log に記録

### 計画が複雑すぎる

1. Phase に分割
2. 各 Phase を別の PLAN ファイルにする
3. 親 PLAN から子 PLAN を参照
