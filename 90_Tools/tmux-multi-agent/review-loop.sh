#!/bin/bash
#
# Review Loop - Codexへの自動レビュー依頼
#
# 使用方法:
#   bash review-loop.sh <file_path> [wait_seconds]
#
# 引数:
#   file_path    - レビュー対象ファイル
#   wait_seconds - 応答待機秒数 (デフォルト: 10)
#
# 例:
#   bash review-loop.sh src/app.js
#   bash review-loop.sh index.html 15
#
# 動作:
#   1. Codexペインにレビュー依頼を送信
#   2. 指定秒数待機
#   3. Codexの応答を取得して表示
#   4. "OK" または "Findings" の判定
#

FILE=${1:-""}
WAIT_SECONDS=${2:-10}
SESSION="agents"
WINDOW="main"
CODEX_PANE=1

# 引数チェック
if [[ -z "$FILE" ]]; then
    echo "Usage: review-loop.sh <file_path> [wait_seconds]"
    echo "Example: review-loop.sh src/app.js 10"
    exit 1
fi

# セッション存在確認
if ! tmux has-session -t $SESSION 2>/dev/null; then
    echo "Error: Session '$SESSION' not found"
    echo "Run setup.sh first to create the session"
    exit 1
fi

# レビュー依頼メッセージ作成
REVIEW_MSG="${FILE}を変更しました。レビューお願いします。問題なければOKと言ってください。

git diff ${FILE}"

echo "=== Codexにレビュー依頼を送信 ==="
echo "対象ファイル: $FILE"
echo "待機時間: ${WAIT_SECONDS}秒"
echo ""

# Codexペインにメッセージ送信
tmux send-keys -t $SESSION:$WINDOW.$CODEX_PANE "$REVIEW_MSG" Enter

# 応答待機
echo "Codexの応答を待機中..."
sleep $WAIT_SECONDS

# 応答取得
echo ""
echo "=== Codexからの応答 ==="
RESPONSE=$(tmux capture-pane -t $SESSION:$WINDOW.$CODEX_PANE -p -S -30)
echo "$RESPONSE"
echo ""

# 結果判定
if echo "$RESPONSE" | grep -qi "OK"; then
    echo "=== 結果: レビュー完了 (OK) ==="
    exit 0
elif echo "$RESPONSE" | grep -qi "Findings"; then
    echo "=== 結果: 要修正 (Findingsあり) ==="
    exit 1
else
    echo "=== 結果: 応答待ち or 不明 ==="
    echo "Tip: 待機時間を増やして再実行してください"
    exit 2
fi
