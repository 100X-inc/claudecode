# OpenAI o3モデル（o3-search-mcp）ガイド

## o3とは

OpenAIの最新推論特化型モデル（2025年1月発表）。高度な推論能力を持ち、自律的にWeb検索して問題を解決できる。

---

## セットアップ済みの環境

- **o3-search-mcp**: MCPサーバーとしてインストール済み
- **設定ファイル**: .mcp.jsonにOpenAI APIキー設定済み
- **実行スクリプト**: o3-search.js作成済み

---

## 使い方

### 直接実行

```bash
# 簡単な実行方法
node o3-search.js "検索したい内容"

# 例：技術的な問題を解決
node o3-search.js "Node.jsでメモリリークを解決する方法"

# 例：最新情報を取得
node o3-search.js "2025年の最新AIニュース"
```

### MCPクライアントでの使用

```bash
# インタラクティブモード
node mcp-client-full.js
MCP> search o3 質問内容

# コマンドライン実行
node mcp-client-full.js search o3 "質問内容"
```

---

## 仕組み

1. ユーザーが質問を入力
2. o3-search-mcpがOpenAI o3モデルにリクエスト
3. o3が自動的に：
   - 検索の必要性を判断
   - 適切な検索クエリを生成
   - Web検索を実行
   - 結果を分析・推論
4. 最適化された回答を返す

---

## 注意事項

- OpenAI APIキーが必要（.mcp.jsonに設定）
- o3モデルへのアクセス権限が必要（Tier 4以上）
- 応答に時間がかかる場合がある（推論処理のため）

---

## APIキーの設定方法

以下のいずれかの方法でAPIキーを設定：

### 1. 環境変数として設定

```bash
export OPENAI_API_KEY="your-api-key"
```

### 2. .envファイル作成

```bash
echo "OPENAI_API_KEY=your-api-key" > .env
```

### 3. Claude Codeグローバル設定

```bash
claude mcp add o3 -s user -e OPENAI_API_KEY=your-api-key -- npx o3-search-mcp
```

※セキュリティのため、APIキーは直接メモリに保存しません

---

## 環境変数設定（永続化済み）

OPENAI_API_KEYは~/.bashrcに永続的に設定済み。
どのプロジェクトでも環境変数として自動的に利用可能。

---

## 新規プロジェクトでのセットアップ

1. `npm install o3-search-mcp`
2. `.mcp.json`ファイルを作成（環境変数を参照）
3. `o3-search.js`と`mcp-client-full.js`をコピー（必要に応じて）

### .mcp.json テンプレート（Windows）

```json
{
  "mcpServers": {
    "o3-search": {
      "command": "cmd",
      "args": ["/c", "npx", "o3-search-mcp"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```
