# Extended Thinking

Claudeの内部推論プロセスを活用して複雑な問題を解決する

---

## 目次

1. [概要](#1-概要)
2. [対応モデル](#2-対応モデル)
3. [トリガーキーワード](#3-トリガーキーワード)
4. [API設定](#4-api設定)
5. [Interleaved Thinking](#5-interleaved-thinking)
6. [使用シナリオ](#6-使用シナリオ)
7. [ベストプラクティス](#7-ベストプラクティス)
8. [参照リソース](#8-参照リソース)

---

## 1. 概要

Extended Thinkingは、Claudeに内部推論プロセスを明示的に実行させる機能。通常の応答生成前に「思考」フェーズを設けることで、複雑な問題の解決品質が大幅に向上する。

### 仕組み

```
┌──────────────────────────────────────────────────────┐
│                    Extended Thinking                  │
├────────────────────┬─────────────────────────────────┤
│   Thinking Phase   │        Response Phase           │
│   (内部推論)        │        (最終回答)                │
│                    │                                  │
│   - 問題の分解      │   - 結論の提示                   │
│   - 選択肢の検討    │   - コードの生成                 │
│   - トレードオフ分析 │   - 説明の提供                   │
└────────────────────┴─────────────────────────────────┘
```

### 効果

| 領域 | 改善効果 |
|-----|---------|
| 数学的推論 | 正確性が大幅向上 |
| コード分析 | バグ検出率向上 |
| アーキテクチャ設計 | より包括的な検討 |
| マルチステップ問題 | 一貫性のある解決 |

---

## 2. 対応モデル

Extended Thinkingは以下のモデルで利用可能:

| モデル | サポート | 備考 |
|-------|---------|------|
| Claude Opus 4.5 | ✅ | 最高品質の思考 |
| Claude Sonnet 4.5 | ✅ | バランス型 |
| Claude Haiku 4.5 | ✅ | 高速 |
| Claude 4 | ✅ | 標準 |

---

## 3. トリガーキーワード

Claude Code内では、プロンプトにキーワードを含めることで思考レベルを調整できる。

### レベル一覧

| レベル | キーワード | 思考予算 | 用途 |
|-------|-----------|---------|------|
| 1 | `think` | 低 | 簡単な問題 |
| 2 | `think hard` | 中 | 中程度の問題 |
| 3 | `think harder` | 高 | 複雑な問題 |
| 4 | `ultrathink` | 最大 | 最も困難な問題 |

### 使用例

```
# レベル1: 簡単な問題
"Think about how to fix this null check"

# レベル2: 中程度の問題
"Think hard about the best approach for this refactoring"

# レベル3: 複雑な問題
"Think harder about the security implications of this change"

# レベル4: 最も困難な問題
"Ultrathink about the architecture for this distributed system"
```

---

## 4. API設定

### 4.1 基本設定

```json
{
  "model": "claude-sonnet-4-5-20250514",
  "max_tokens": 16000,
  "thinking": {
    "type": "enabled",
    "budget_tokens": 10000
  },
  "messages": [
    {
      "role": "user",
      "content": "Solve this complex problem..."
    }
  ]
}
```

### 4.2 パラメータ

| パラメータ | 説明 | 推奨値 |
|-----------|------|--------|
| `type` | `enabled` または `disabled` | `enabled` |
| `budget_tokens` | 思考に使用する最大トークン数 | 5000-20000 |

### 4.3 予算の目安

| タスク複雑度 | budget_tokens |
|-------------|---------------|
| 簡単 | 2000-5000 |
| 中程度 | 5000-10000 |
| 複雑 | 10000-20000 |
| 最高難度 | 20000+ |

---

## 5. Interleaved Thinking

Claude 4モデルでは、ツール呼び出しの間に思考ブロックを挿入できる。

### 仕組み

```
User → [思考1] → Tool呼び出し → [思考2] → Tool呼び出し → [思考3] → 最終回答
       ↑                        ↑                        ↑
       中間結果を分析            次のステップを計画        結論を導出
```

### 利点

| 利点 | 説明 |
|-----|------|
| 中間結果の分析 | ツール結果を深く理解してから次のアクションを決定 |
| エラー回復 | 予期しない結果に対して適応的に対応 |
| 品質向上 | 各ステップで最適な判断 |

### API応答例

```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "ファイルを読み込んだ結果、3つの問題が見つかった..."
    },
    {
      "type": "tool_use",
      "name": "Edit",
      "input": { "file_path": "..." }
    },
    {
      "type": "thinking",
      "thinking": "最初の問題を修正した。次は..."
    },
    {
      "type": "text",
      "text": "3つの問題を修正しました。"
    }
  ]
}
```

---

## 6. 使用シナリオ

### 6.1 推奨シナリオ

| シナリオ | 説明 | 推奨レベル |
|---------|------|-----------|
| 複雑なバグ修正 | 原因特定が難しいバグ | think hard |
| アーキテクチャ設計 | システム全体の設計 | ultrathink |
| セキュリティレビュー | 脆弱性の網羅的検査 | think harder |
| リファクタリング計画 | 大規模な構造変更 | think hard |
| 数学的計算 | 複雑なアルゴリズム | think harder |

### 6.2 非推奨シナリオ

| シナリオ | 理由 |
|---------|------|
| 単純なタイポ修正 | オーバーヘッドが無駄 |
| 定型的なコード生成 | 標準応答で十分 |
| 情報の検索 | 思考より検索が効率的 |

---

## 7. ベストプラクティス

### 7.1 プロンプト設計

```
✅ 良い例:
"Think hard about how to implement pagination that handles:
- Large datasets efficiently
- Edge cases (empty results, single page)
- API rate limiting"

❌ 悪い例:
"Add pagination"
```

### 7.2 予算の最適化

```
# 段階的アプローチ
1. まず低い予算で試す（budget_tokens: 5000）
2. 品質が不十分なら予算を増やす
3. コストと品質のバランスを見つける
```

### 7.3 結果の活用

```python
# 思考プロセスをログに保存
response = client.messages.create(...)
for block in response.content:
    if block.type == "thinking":
        logger.info(f"Thinking: {block.thinking}")
```

---

## 8. 参照リソース

### 公式ドキュメント

- Extended Thinking概要: https://docs.claude.com/en/docs/build-with-claude/extended-thinking
- 実践Tips: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/extended-thinking-tips

### 関連ドキュメント

- [Agent Best Practices](11_agent-best-practices.md) - エージェント設計の原則
- [Progressive Disclosure](10_progressive-disclosure.md) - 情報の段階的開示
