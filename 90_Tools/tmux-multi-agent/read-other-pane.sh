#!/bin/bash
#
# Read Other Pane - 他ペインの出力を取得
#
# 使用方法:
#   bash read-other-pane.sh [pane_number] [lines]
#
# 引数:
#   pane_number - 読み取り対象ペイン番号 (0=左, 1=右, デフォルト: 1)
#   lines       - 取得する行数 (デフォルト: 50)
#
# 例:
#   bash read-other-pane.sh 1 50   # 右ペインの最新50行を取得
#   bash read-other-pane.sh 0 100  # 左ペインの最新100行を取得
#

PANE=${1:-1}
LINES=${2:-50}
SESSION="agents"
WINDOW="main"

# セッション存在確認
if ! tmux has-session -t $SESSION 2>/dev/null; then
    echo "Error: Session '$SESSION' not found"
    echo "Run setup.sh first to create the session"
    exit 1
fi

# ペイン出力取得
# -p: stdout出力
# -S: 開始行 (負数で末尾から)
# -J: 改行を結合しない
tmux capture-pane -t $SESSION:$WINDOW.$PANE -p -S -$LINES
