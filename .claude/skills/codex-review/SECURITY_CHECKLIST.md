# SECURITY_CHECKLIST.md

codex-review スキル用セキュリティチェックリスト

---

## OWASP Top 10 (2021)

### A01: Broken Access Control

- [ ] 認可チェックが全ての保護リソースに適用されているか
- [ ] IDOR（Insecure Direct Object Reference）脆弱性がないか
- [ ] 水平権限昇格（他ユーザーのデータアクセス）が防止されているか
- [ ] 垂直権限昇格（管理者機能へのアクセス）が防止されているか
- [ ] CORS設定が適切か

### A02: Cryptographic Failures

- [ ] 機密データが暗号化されているか（転送中・保存時）
- [ ] 強力な暗号化アルゴリズムを使用しているか（AES-256, RSA-2048+）
- [ ] 非推奨アルゴリズムを使用していないか（MD5, SHA1, DES）
- [ ] 暗号化キーが適切に管理されているか
- [ ] TLS 1.2+ を強制しているか

### A03: Injection

- [ ] SQLインジェクション対策（パラメータ化クエリ）
- [ ] NoSQLインジェクション対策
- [ ] コマンドインジェクション対策
- [ ] LDAPインジェクション対策
- [ ] XPathインジェクション対策
- [ ] テンプレートインジェクション対策

### A04: Insecure Design

- [ ] 脅威モデリングが実施されているか
- [ ] セキュリティ要件が定義されているか
- [ ] 安全なデザインパターンを使用しているか
- [ ] ビジネスロジックの悪用が防止されているか

### A05: Security Misconfiguration

- [ ] 不要な機能・ポートが無効化されているか
- [ ] デフォルト認証情報が変更されているか
- [ ] エラーメッセージが過度な情報を漏洩していないか
- [ ] セキュリティヘッダーが設定されているか
- [ ] 最新のセキュリティパッチが適用されているか

### A06: Vulnerable and Outdated Components

- [ ] 依存関係に既知の脆弱性がないか
- [ ] 依存関係のバージョンが固定されているか
- [ ] 不要な依存関係が削除されているか
- [ ] 脆弱性スキャンが実行されているか（npm audit, snyk等）

### A07: Identification and Authentication Failures

- [ ] パスワードが適切にハッシュ化されているか（bcrypt, Argon2）
- [ ] ブルートフォース攻撃対策（レート制限、アカウントロック）
- [ ] セッション管理が適切か（有効期限、再生成）
- [ ] MFA（多要素認証）がサポートされているか
- [ ] パスワードリセットフローが安全か

### A08: Software and Data Integrity Failures

- [ ] 依存関係の整合性検証（lockfile, SRI）
- [ ] CI/CDパイプラインのセキュリティ
- [ ] デシリアライゼーションの安全性
- [ ] 署名検証が適切に実装されているか

### A09: Security Logging and Monitoring Failures

- [ ] セキュリティイベントがログに記録されているか
- [ ] ログに機密情報が含まれていないか
- [ ] ログの改ざん防止策があるか
- [ ] アラート/監視が設定されているか

### A10: Server-Side Request Forgery (SSRF)

- [ ] ユーザー提供URLの検証
- [ ] 内部ネットワークへのアクセス制限
- [ ] 許可リストによるURL制限

---

## CWE参照（頻出）

| CWE | 名称 | 説明 |
|-----|------|------|
| CWE-89 | SQL Injection | SQLクエリへの未検証入力 |
| CWE-79 | XSS | クロスサイトスクリプティング |
| CWE-352 | CSRF | クロスサイトリクエストフォージェリ |
| CWE-287 | Improper Authentication | 不適切な認証 |
| CWE-862 | Missing Authorization | 認可チェックの欠如 |
| CWE-798 | Hardcoded Credentials | ハードコードされた認証情報 |
| CWE-78 | OS Command Injection | OSコマンドインジェクション |
| CWE-22 | Path Traversal | パストラバーサル |
| CWE-502 | Deserialization | 安全でないデシリアライゼーション |
| CWE-918 | SSRF | サーバーサイドリクエストフォージェリ |

---

## 言語別チェックポイント

### JavaScript/TypeScript

```javascript
// 危険なパターン
eval(userInput)                    // CWE-94
innerHTML = userInput              // CWE-79
exec(userInput)                    // CWE-78
require(userInput)                 // CWE-94

// 安全なパターン
textContent = userInput            // XSS対策
execFile(cmd, [arg1, arg2])        // コマンドインジェクション対策
```

### Python

```python
# 危険なパターン
eval(user_input)                   # CWE-94
exec(user_input)                   # CWE-94
os.system(f"cmd {user_input}")     # CWE-78
pickle.loads(user_data)            # CWE-502
f"SELECT * FROM t WHERE id={id}"   # CWE-89

# 安全なパターン
ast.literal_eval(user_input)       # 制限付き評価
subprocess.run([cmd, arg])         # コマンドインジェクション対策
cursor.execute("SELECT * FROM t WHERE id=?", (id,))  # SQLi対策
```

### Go

```go
// 危険なパターン
template.HTML(userInput)           // XSS
exec.Command("sh", "-c", userInput) // CWE-78

// 安全なパターン
template.HTMLEscapeString(input)   // XSS対策
exec.Command(cmd, arg1, arg2)      // コマンドインジェクション対策
```

---

## 機密情報チェックリスト

- [ ] APIキーがハードコードされていないか
- [ ] パスワードがソースコードに含まれていないか
- [ ] .env ファイルが .gitignore に含まれているか
- [ ] ログに機密情報が出力されていないか
- [ ] エラーメッセージに内部情報が含まれていないか
- [ ] コメントに機密情報が含まれていないか

---

## 使用方法

diffレビュー時、このチェックリストの該当項目を確認し、問題があれば`issues`に以下の形式で追加:

```json
{
  "severity": "critical",
  "file": "path/to/file.ts",
  "lines": "42-45",
  "problem": "SQLインジェクション脆弱性",
  "cwe": "CWE-89",
  "owasp": "A03:2021-Injection",
  "recommendation": "パラメータ化クエリを使用"
}
```

**注**: 各専門家の出力では`domain`はトップレベルで`"security"`として出力されるため、個別issueには不要。統合結果の`inlineComments`では出所を示すため各コメントに`domain`が含まれる。
