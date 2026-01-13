# ReviewDocuments3

## スコープ
- 要件: kaki要件定義.md
- 設計: doc/slack-integration-design.md

## 指摘事項

### High

H-01: MVPの継続フローが要件（キュー + 方式B）と不一致  
Evidence: kaki要件定義.md:119, kaki要件定義.md:286, doc/slack-integration-design.md:336  
Risk: Claude Codeが停止中だと返信が失われ、MVP受け入れ基準を満たさない。  
Recommendation: 返信キューと方式B（指示ファイル）をMVPに実装するか、要件/受け入れ基準を改訂する。

H-02: Slackコマンドの取り扱いが設計に存在しない  
Evidence: kaki要件定義.md:101, kaki要件定義.md:103, doc/slack-integration-design.md:308  
Risk: /kaki continue/stop/summarize が経路不明となり、通常文との判別もできない。  
Recommendation: スラッシュコマンド処理（またはプレフィックス判定）と必要なSlackスコープを追加し、コマンド実行ルールを定義する。

H-03: Hook/Slackイベントの受信時セキュリティ検証が未定義  
Evidence: kaki要件定義.md:138, doc/slack-integration-design.md:375, doc/slack-integration-design.md:286, doc/slack-integration-design.md:241  
Risk: 認証なしでSlack投稿や再開処理がトリガーされる。署名検証が行われない。  
Recommendation: Webhookはlocalhostバインド + 共有トークン/HMACを必須化し、Slack署名検証またはSocket Modeの検証方法を明記する。

### Medium

M-01: Hookインターフェースとイベント種別が要件と不整合  
Evidence: kaki要件定義.md:82, kaki要件定義.md:209, doc/slack-integration-design.md:375, doc/slack-integration-design.md:731  
Risk: TASK_COMPLETED/CHECKPOINT/TASK_FAILED が伝達されず、インターフェース契約が崩れる。  
Recommendation: HookのI/Fとpayloadを統一する。HTTPを正とするならevent_typeを含めて明文化する。

M-02: Slack完了メッセージに必須メタデータ/サマリが不足  
Evidence: kaki要件定義.md:87, doc/slack-integration-design.md:421, doc/slack-integration-design.md:437  
Risk: タスク/ブランチ/PRに紐づけられず、要約も確認できない。  
Recommendation: payloadとBlockメッセージにサマリやartifact情報を追加する。

M-03: 冪等キーの保存・重複排除経路が未定義  
Evidence: kaki要件定義.md:266, doc/slack-integration-design.md:609  
Risk: 重複イベントで二重にresumeが実行される。  
Recommendation: event_id（またはSlack ts）を永続化し、処理前に重複排除する。

M-04: 返信注入時のコンテキストが不足  
Evidence: kaki要件定義.md:105, doc/slack-integration-design.md:336  
Risk: スレッドリンクや直近サマリが欠け、文脈が崩れる。  
Recommendation: スレッドリンクと最新サマリをプロンプトまたは構造化ラッパーに含める。

M-05: 監査ログ要件が設計に反映されていない  
Evidence: kaki要件定義.md:126, doc/slack-integration-design.md:382  
Risk: トラブルシュートや監査が困難になり、MVP要件を満たせない。  
Recommendation: event type、thread_ts、statusを含むイベントログテーブルまたはファイルログを追加する。

### Low

L-01: thread_ts不明時の扱いが設計で未定義  
Evidence: kaki要件定義.md:258, doc/slack-integration-design.md:322  
Risk: 既知スレッド外の返信が無視される。  
Recommendation: 新規セッション化かエラー返信かを決めて記載する。

L-02: セッション状態モデルが不一致  
Evidence: kaki要件定義.md:116, doc/slack-integration-design.md:594  
Risk: 状態遷移がドキュメント間で食い違う。  
Recommendation: 状態名と遷移ルールを揃える。
