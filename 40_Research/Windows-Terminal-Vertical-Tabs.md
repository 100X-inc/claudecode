# Windows Terminal 縦タブ機能の調査

調査日: 2026-01-10

## 概要

PowerShell / Windows Terminal で「縦タブ」（タブを左側や右側に縦配置する機能）が利用可能か調査した。

## 結論

**現時点でWindows Terminalには縦タブ機能は実装されていない。**

機能リクエストとして要望されているが、実装予定時期は未定。

---

## 機能リクエストの状況

| Issue | 内容 | ステータス |
|-------|------|-----------|
| [#9100](https://github.com/microsoft/terminal/issues/9100) | 縦タブオプション | クローズ（#835と重複） |
| [#835](https://github.com/microsoft/terminal/issues/835) | タブ位置カスタマイズ（上下左右） | **オープン（Backlog）** |

### 詳細

- 2019年5月から要望されている長期リクエスト
- 62件の👍リアクションがあり、ユーザーからの需要は高い
- 開発チーム（Mike Griese氏）は「技術的には可能」と認めている
- ただし、正式なデザインレビューと優先度決定を待っている状態
- **具体的な実装予定時期は未定**

---

## 現在利用可能な代替手段

### 1. ペイン分割

複数のシェルを同一タブ内で並べて表示できる。

| ショートカット | 動作 |
|---------------|------|
| `Alt + Shift + +` | 右に縦分割（新しいペインを右側に作成） |
| `Alt + Shift + -` | 下に横分割（新しいペインを下側に作成） |
| `Alt + 矢印キー` | ペイン間の移動 |
| `Ctrl + Shift + W` | フォーカス中のペインを閉じる |

### 2. タブ幅の調整

`settings.json` で `tabWidthMode` を設定可能：

```json
{
    "tabWidthMode": "compact"
}
```

オプション：
- `equal` - すべてのタブを同じ幅に
- `titleLength` - タイトルの長さに応じた幅
- `compact` - コンパクト表示

### 3. タブ位置の現在の設定

```json
{
    "showTabsInTitlebar": true,
    "alwaysShowTabs": true
}
```

- `showTabsInTitlebar: true` - タブをタイトルバーに統合
- `showTabsInTitlebar: false` - タブをタイトルバーの下に配置

---

## 参考リンク

- [GitHub Issue #9100 - Vertical Tabs Option](https://github.com/microsoft/terminal/issues/9100)
- [GitHub Issue #835 - Enable customization for tabs on bottom/right/left](https://github.com/microsoft/terminal/issues/835)
- [Microsoft Learn - Windows Terminal Panes](https://learn.microsoft.com/en-us/windows/terminal/panes)
- [Microsoft Learn - Windows Terminal Appearance Settings](https://learn.microsoft.com/ja-jp/windows/terminal/customize-settings/appearance)

---

## 今後のアクション

縦タブ機能が必要な場合：

1. [Issue #835](https://github.com/microsoft/terminal/issues/835) をウォッチして進捗を追う
2. 当面はペイン分割で代用する
3. サードパーティのターミナルエミュレータ（Tabby等）を検討する
