---
name: session-management
description: Codex CLIのセッション管理と履歴機能
---

# Session管理 完全ガイド

Codex CLIはセッションを自動保存し、後から再開できます。

## 目次

1. [概要](#概要)
2. [セッションの保存](#セッションの保存)
3. [セッションの再開](#セッションの再開)
4. [セッションの分岐](#セッションの分岐)
5. [履歴管理](#履歴管理)
6. [設定](#設定)
7. [ユースケース](#ユースケース)

---

## 概要

### セッション管理とは

- 会話履歴の自動保存
- 中断したセッションの再開
- セッションの分岐（フォーク）
- ローカル履歴ファイル管理

### 特徴

| 特徴 | 説明 |
|------|------|
| **自動保存** | セッションは自動的に保存 |
| **再開** | `/resume` で過去セッション再開 |
| **分岐** | `/fork` で別アプローチを試行 |
| **Exec再開** | `codex exec resume` でスクリプト統合 |

---

## セッションの保存

### 自動保存

セッションはデフォルトで自動保存:

```
~/.codex/history.jsonl
```

### 保存される情報

- セッションID
- タイムスタンプ
- プロンプトと応答
- ツール使用履歴
- 作業ディレクトリ

### 保存の無効化

```toml
# ~/.codex/config.toml
[history]
persistence = "none"
```

---

## セッションの再開

### TUIでの再開

```
# セッションリスト表示
/resume

# 最後のセッションを即座に再開
/resume --last

# 全ディレクトリのセッションを表示
/resume --all
```

### セッション選択

```
/resume
┌─ Recent Sessions ──────────────────────────────────┐
│ 1. [2h ago] Fix authentication bug (src/auth/)    │
│ 2. [1d ago] Implement user dashboard (src/pages/) │
│ 3. [2d ago] Refactor API layer (src/api/)        │
└────────────────────────────────────────────────────┘
Select session (1-3):
```

### フォローアッププロンプト

```
/resume --last
> Now add tests for the changes we made
```

### CLIでの再開

```bash
# 対話モードで再開
codex resume
codex resume --last
codex resume --all
codex resume <SESSION_ID>

# Exec Modeで再開
codex exec resume --last "Continue with the next step"
codex exec resume <SESSION_ID> "Add error handling"
```

---

## セッションの分岐

### /fork コマンド

```
/fork
```

選択したセッションを新しいスレッドとして分岐。

### ユースケース

```
# オリジナルセッション
Task: Implement login
→ JWT approach

# フォークして別アプローチ
/fork
Task: Implement login (fork)
→ Session-based approach
```

### 分岐の活用

1. **A/Bテスト**: 2つのアプローチを並行評価
2. **実験**: 本線を汚さずに実験
3. **バックアップ**: 重要な地点を保存

---

## 履歴管理

### 履歴ファイル

```
~/.codex/history.jsonl
```

JSON Lines形式で保存。

### 履歴の確認

```bash
# 最新のセッション確認
tail -n 100 ~/.codex/history.jsonl | jq '.sessionId' | uniq

# セッション検索
grep "authentication" ~/.codex/history.jsonl | jq '.'
```

### 履歴の削除

```bash
# 全履歴削除
rm ~/.codex/history.jsonl

# 特定期間の削除（例: 30日以上前）
# 手動でファイル編集
```

---

## 設定

### config.toml

```toml
# ~/.codex/config.toml

[history]
# 保存モード
persistence = "save-all"  # save-all | none

# 最大ファイルサイズ
max_bytes = 104857600  # 100MB
```

### 設定オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `persistence` | string | `save-all` | 保存モード |
| `max_bytes` | number | - | 最大ファイルサイズ |

---

## ユースケース

### 長期プロジェクト

```
# Day 1: 基本実装
codex
> Implement user authentication

# Day 2: 再開して続行
codex resume --last
> Now add password reset functionality
```

### 複数アプローチの検討

```
# アプローチ1
codex
> Implement caching with Redis

# セッション保存、新規開始
/new

# アプローチ2
> Implement caching with in-memory store

# 後でアプローチ1を再開
/resume
> (select Redis session)
```

### デバッグ継続

```
# 問題調査中に中断
codex
> Debug the memory leak
> (found some clues, need to stop)

# 後で再開
codex resume --last
> Let's continue investigating the memory leak
```

### CI/CDでの継続タスク

```yaml
# ステップ1: 分析
- name: Analyze
  id: analyze
  run: |
    codex exec "Analyze codebase" > session_id.txt

# ステップ2: 継続
- name: Fix
  run: |
    SESSION_ID=$(cat session_id.txt)
    codex exec resume $SESSION_ID "Now fix the issues found"
```

---

## トラブルシューティング

### セッションが見つからない

```bash
# 全ディレクトリを検索
codex resume --all

# 履歴ファイル確認
ls -la ~/.codex/history.jsonl
```

### 履歴ファイルが大きすぎる

```toml
# サイズ制限を設定
[history]
max_bytes = 52428800  # 50MB

# または古い履歴を削除
```

### 再開後のコンテキスト不足

```
# フォローアッププロンプトでコンテキスト追加
/resume --last
> We were working on the authentication module.
> The last change was adding JWT validation.
> Let's continue with refresh token implementation.
```

---

## Claude Codeとの比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| セッション保存 | なし | 自動 |
| セッション再開 | `--resume` | `/resume`, `resume` |
| セッション分岐 | なし | `/fork` |
| 履歴ファイル | なし | `history.jsonl` |
| 履歴設定 | なし | `[history]` |

---

## 関連ドキュメント

- [05_slash-commands.md](05_slash-commands.md) - Slash Commands
- [07_configuration.md](07_configuration.md) - 設定詳細
- [09_exec-mode.md](09_exec-mode.md) - Exec Mode
