# Web制作ポートフォリオ

UXの課題整理、情報設計、文章改善をテーマにしたポートフォリオ用Webページです。GitHub Pagesで公開できるよう、HTML・CSS・JavaScriptをリポジトリのルートに配置しています。

## ポートフォリオページ

- `index.html`：ポートフォリオの公開用トップページ（GitHub Pagesの標準ページ）
- `index_portfolio.html`：ポートフォリオ版のHTML
- `index_google_form_button_portfolio.html`：お問い合わせフォームをボタンから開くポートフォリオ版
- `index_google_form_button.html`：元のGoogleフォームボタン版
- `style.css`：ページの見た目・レイアウト
- `script.js`：ページの動き
- `README.md`：このプロジェクトの説明
- `LICENSE.txt`：ライセンス
- `requirements.txt`：Python関連の依存関係（リポジトリ内の他のアプリ用）
- `app.js`、`app.py`、`render.yaml`：リポジトリ内の既存アプリ用ファイル

## 公開方法（GitHub Pages）

1. GitHubリポジトリの **Settings → Pages** を開きます。
2. 公開元として `main` ブランチと `/(root)` を選択します。
3. 保存後、表示された公開URLを開いてページを確認します。

ルートの `index.html` が公開トップページとして使われます。フォームや外部リンクは、公開前に実際に動作するか確認してください。

## Googleフォームについて

- `index.html` はページ内埋め込みフォーム版です。
- `index_google_form_button_portfolio.html` はフォームを別タブで開くボタン版です。
- 使用する場合は、自分のフォームURL・埋め込みコードに差し替え、別アカウントまたはログアウト状態でもアクセスできることを確認してください。

## 画像について

テンプレート内の画像URLは外部サービスを参照しています。画像を差し替える場合は、HTMLの `src` またはCSSのURLを更新してください。外部画像を利用するページは閲覧時にインターネット接続が必要です。

## 公開前のチェックリスト

- 制作事例へのリンクが実際のページを指している
- GoogleフォームのURL・公開権限が正しい
- スマートフォンとPCの両方で表示を確認した
- 成果や数値は、実際に確認できる情報だけを記載した
