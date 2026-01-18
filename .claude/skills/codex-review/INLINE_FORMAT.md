# インラインコメント出力形式

codex-review v3 で使用するインラインコメントの形式仕様

---

## 基本構造

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

---

## 深刻度アイコン

| アイコン | レベル | 説明 | ok判定 |
|---------|-------|------|--------|
| 🔴 | Critical | セキュリティ脆弱性、データ損失リスク、重大バグ | `ok: false` |
| 🟠 | High | 機能バグ、重大なパフォーマンス問題 | `ok: false` |
| 🟡 | Medium | 保守性問題、テスト不足、中程度のリスク | `ok: true`（警告） |
| 🟢 | Low | スタイル、ドキュメント、軽微な改善 | `ok: true`（参考） |

---

## 分野タグ

| タグ | 専門レビュアー | 主なチェック項目 |
|-----|--------------|-----------------|
| `[Security]` | security-reviewer | OWASP, CWE, 認証/認可 |
| `[Performance]` | performance-reviewer | N+1, メモリリーク, 計算量 |
| `[Quality]` | quality-reviewer | DRY, 命名, エラーハンドリング |
| `[Test]` | test-reviewer | カバレッジ, テスト品質 |
| `[Docs]` | docs-reviewer | ドキュメント正確性 |

---

## 分野別フォーマット例

### Security

```markdown
### 🔴 [Security] src/auth.py:42-45

**問題**: SQLインジェクション脆弱性
**CWE**: CWE-89 | **OWASP**: A03:2021-Injection

ユーザー入力 `user_id` が直接SQLクエリに挿入されています。
悪意のある入力により、データベースの読み取り・改ざん・削除が可能です。

**修正提案:**
```suggestion
cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
```
```

### Performance

```markdown
### 🔴 [Performance] src/api/users.py:120-135

**問題**: N+1クエリ問題
**影響**: ユーザー数に比例してクエリ数が増加

ループ内で個別にプロファイル情報を取得しています。
100ユーザーの場合、101回のDBクエリが発生します。

**修正提案:**
```suggestion
users = User.query.options(joinedload(User.profile)).all()
```
```

### Quality

```markdown
### 🟠 [Quality] src/utils/helpers.ts:58-72

**問題**: 関数の責務過多
**理由**: 単一責任原則違反、テストが困難

この関数は検証、変換、保存の3つの責務を持っています。
それぞれを分離することで保守性とテスト容易性が向上します。

**修正提案:**
```suggestion
function validateData(data: Input): ValidationResult { ... }
function transformData(data: Input): Output { ... }
function saveData(data: Output): Promise<void> { ... }
```
```

### Test

```markdown
### 🟠 [Test] src/services/order.ts:45-60

**問題**: テストカバレッジ不足
**対象コード**: `calculateTotal` 関数

この関数にはテストがありません。
特に割引適用とエッジケースのテストが必要です。

**推奨テストケース:**
- 正常系: 「商品3個で合計が正しく計算される」
- 割引: 「10%割引が正しく適用される」
- 境界値: 「空のカートの場合、0が返される」

**修正提案:**
```suggestion
describe('calculateTotal', () => {
  it('正しく合計を計算する', () => {
    const items = [{ price: 100, qty: 2 }];
    expect(calculateTotal(items)).toBe(200);
  });
});
```
```

### Docs

```markdown
### 🟡 [Docs] src/api/handler.ts:15-18

**問題**: ドキュメントと実装の不一致
**種類**: 古い情報

JSDocの戻り値の型が `string` と記載されていますが、
実際には `Promise<UserDTO>` を返しています。

**現状**:
```typescript
/**
 * @returns {string} ユーザー情報
 */
```

**修正提案:**
```suggestion
/**
 * @returns {Promise<UserDTO>} ユーザー情報オブジェクト
 */
```
```

---

## 統合レポート形式

```markdown
## Codexレビュー結果 v3

- 規模: {規模}（{ファイル数}ファイル、{行数}行）
- レビュアー: {起動したレビュアー}
- 反復: {現在}/{最大} / ステータス: {アイコン} {ステータス}
- 静的解析: {結果}
- テスト: {結果}

### インラインフィードバック

#### 🔴 Critical ({件数}件)
{インラインコメント...}

#### 🟠 High ({件数}件)
{インラインコメント...}

#### 🟡 Medium ({件数}件)
{インラインコメント...}

#### 🟢 Low ({件数}件)
{インラインコメント...}

### 統合サマリー

| 分野 | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| Security | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 | 0 |
| Quality | 0 | 0 | 0 | 0 |
| Test | 0 | 0 | 0 | 0 |
| Docs | 0 | 0 | 0 | 0 |
```

---

## suggestion ブロック

`suggestion` ブロックは修正コードを提示するために使用します。

### 単一行の修正

```markdown
**修正提案:**
```suggestion
const result = await fetchData();
```
```

### 複数行の修正

```markdown
**修正提案:**
```suggestion
async function fetchUsers(): Promise<User[]> {
  const response = await api.get('/users');
  return response.data;
}
```
```

### 注意事項

- `suggestion` ブロックは指定した行範囲を**完全に置換**
- 構文的に正しい完全なコードを提供
- インデントを正確に維持
- 言語タグは不要（`suggestion` のみ）

---

## 重複マージルール

同一ファイル・同一行範囲に複数の指摘がある場合：

1. **異なる分野からの指摘**: **JSONでは別エントリとして保持**（`domain`は単一値）
2. **同一分野で重複**: より深刻度が高い方を優先（1エントリのみ）
3. **レポート表示時のみ**: 同一file:linesを視覚的にグルーピング可

**JSON出力例**（別エントリ）:
```json
[
  { "domain": "security", "file": "src/auth.py", "lines": "42-45", "problem": "SQLインジェクション" },
  { "domain": "quality", "file": "src/auth.py", "lines": "42-45", "problem": "エラーハンドリング不足" }
]
```

**レポート表示例**（視覚的グルーピング）:
```markdown
### 🔴 [Security] 🟠 [Quality] src/auth.py:42-45

**問題 (Security)**: SQLインジェクション脆弱性
**問題 (Quality)**: エラーハンドリング不足

{詳細説明...}
```
