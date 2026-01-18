#!/bin/bash
#
# Send to Pane - 他ペインにメッセージ送信
#
# 使用方法:
#   bash send-to-pane.sh <pane_number> <message>
#
# 引数:
#   pane_number - 送信先ペイン番号 (0=左, 1=右)
#   message     - 送信するメッセージ
#
# 例:
#   bash send-to-pane.sh 1 "コードをレビューしてください"
#   bash send-to-pane.sh 0 "修正完了しました"
#

PANE=${1:-1}
MESSAGE="$2"
SESSION="agents"
WINDOW="main"

# 引数チェック
if [[ -z "$MESSAGE" ]]; then
    echo "Usage: send-to-pane.sh <pane_number> <message>"
    echo "Example: send-to-pane.sh 1 \"Please review this code\""
    exit 1
fi

# セッション存在確認
if ! tmux has-session -t $SESSION 2>/dev/null; then
    echo "Error: Session '$SESSION' not found"
    echo "Run setup.sh first to create the session"
    exit 1
fi

# メッセージ送信
tmux send-keys -t $SESSION:$WINDOW.$PANE "$MESSAGE" Enter

echo "Message sent to pane $PANE"
