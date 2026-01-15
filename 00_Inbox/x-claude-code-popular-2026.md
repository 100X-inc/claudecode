# X(Twitter)で話題のClaude Code情報 (2026年1月)

## Boris Cherny（Claude Code作者）のワークフロー

2026年1月2日、Boris Cherny氏がXで自身のセットアップを公開し、300万回以上閲覧される話題に。

### 主なポイント

1. **Plan Mode優先**
   - PRを書く前にPlan modeで計画を練る
   - Claudeと何度もやり取りして計画を洗練
   - 良い計画があれば、auto-acceptモードで一発完成

2. **並列セッション**
   - ターミナルで5つのClaudeを並列実行（タブ1-5）
   - claude.ai/codeで5-10個を追加で並列実行
   - teleportで行き来

3. **Slash Commands活用**
   - `/commit-push-pr`を1日に数十回使用
   - 頻繁に行う作業はすべてコマンド化
   - `.claude/commands/`にgit管理

4. **CLAUDE.md運用**
   - チームでCLAUDE.mdをgit管理
   - ミスが起きたら記録して改善
   - 約2.5kトークンに収める
   - 「繰り返し同じことを言っていたら追加」

5. **検証ループが最重要**
   > "give Claude a way to verify its work. If Claude has that feedback loop, it will 2-3x the quality"

### 実績
- 30日間で259 PR、497コミット
- 40k行追加、38k行削除

**Source:** [Boris Cherny on X](https://x.com/bcherny/status/2007179832300581177)

---

## 話題のツイート

### Jaana Dogan氏（Google）
> "I'm not joking and this isn't funny. We have been trying to build distributed agent orchestrators at Google since last year... I gave Claude Code a description of the problem, it generated what we built last year in an hour."

**Source:** [Jaana Dogan on X](https://x.com/rakyll/status/2007239758158975130)

---

## Tips & Tricks集

### @EarningsNugget のTips
- 複雑な機能は**先に計画を立てさせる**
- 「ファイルを読む → 一旦止める → ブレインストーム → コード」の順序
- CLAUDE.mdの種類: Repository / Personal / Global / Nested

### @xBenJamminx の「チートのようなTips」(2026/1/8)
1. `/init`でCLAUDE.md自動作成
2. Skillsで繰り返しタスクを自動化
3. Chrome拡張でブラウザ操作連携 (`claude --chrome`)

**Source:** [Ben Jammin on X](https://x.com/xBenJamminx/status/2009343001990996465)

---

## 人気リソース

### ykdojo/claude-code-tips (GitHub)
40以上のTipsを収録:
- カスタムステータスライン
- システムプロンプト半減テクニック
- Gemini CLIをClaude Codeの手下に
- Claude Codeをコンテナで実行

**Source:** [GitHub](https://github.com/ykdojo/claude-code-tips) | [@mohritaroh](https://x.com/mohritaroh/status/2008168241374343517)

---

## 参考記事

- [Boris Cherny Claude Code Creator Shares These 22 Tips](https://medium.com/@joe.njenga/boris-cherny-claude-code-creator-shares-these-22-tips-youre-probably-using-it-wrong-1b570aedefbe)
- [17 Best Claude Code Workflows](https://medium.com/@joe.njenga/17-best-claude-code-workflows-that-separate-amateurs-from-pros-instantly-level-up-5075680d4c49)
- [How the Creator of Claude Code Actually Uses It](https://blog.devgenius.io/how-the-creator-of-claude-code-actually-uses-it-13-practical-moves-2bf02eec032a)
- [Inside the Development Workflow of Claude Code's Creator - InfoQ](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)

---

*収集日: 2026-01-15*
