# X Reader

Playwright永続化プロファイルを使ってX (Twitter) の投稿を読み取るツール。

## セットアップ

### 1. 初回ログイン（1回だけ）

```bash
cd C:\ai_programming\claudecode\90_Tools\x-reader
node login.js
```

ブラウザが開くので、Xにログインしてからブラウザを閉じる。
セッションは `x-profile/` フォルダに保存される。

### 2. 投稿の取得

```bash
node read-post.js https://x.com/username/status/123456789
```

## 出力例

```
=== Post Content ===
Author: Anthropic
Handle: @AnthropicAI
Time: 2025-01-14T18:00:00.000Z

Content:
投稿の本文がここに表示されます

Stats:
  replies: 123 replies
  reposts: 456 reposts
  likes: 789 likes
====================

JSON: { ... }
```

## セッションの更新

セッションが切れた場合は `node login.js` を再実行。
