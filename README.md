# NASA SPACE VIEWER

NASA Astronomy Picture of the Day（APOD）を2つのテーマから探索するFlask Webアプリです。

- **7 DAYS**：最近7日間の画像と動画
- **MOON COLLECTION**：NASA Image Libraryで検索した月画像

画面にはAPIの取得時刻、JSONサンプル、5分間隔の手動更新ボタンを表示します。通常の閲覧では1時間キャッシュを利用します。

各画像の♡ボタンを押すと、ブラウザの`localStorage`にお気に入りを保存します。ログインや個人情報の登録は不要で、`FAVORITES`画面から選んだ画像を確認・解除できます。

`FAVORITES`画面のボタンから、選択した画像・タイトル・日付・出典をまとめた`MY NASA ALBUM` PDFを生成してダウンロードできます。PDFはサーバーへ保存せず、その場で生成します。

ナビゲーションは`01 7 DAYS`と`02 MOON COLLECTION`を主ボタンにし、その下に`♡ FAVORITES → PDF DOWNLOAD`をテキストリンクとして配置しています。お気に入り件数はリンク上に自動表示されます。

PDFボタン横のシェアアイコンから、対応するスマートフォンの共有メニューへPDFを渡せます。ファイル共有に対応していないブラウザではPDFダウンロードへ切り替わります。

## 学習内容

- `requests`によるNASA APIの利用
- JSONデータの取得
- URLパラメータと条件分岐
- キーワードによるデータの絞り込み
- FlaskとJinjaによるWeb表示
- GitHubとRenderによるWeb公開

## ローカルで実行

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

ブラウザで `http://127.0.0.1:5000` を開きます。

`NASA_API_KEY`が未設定の場合は、学習用の`DEMO_KEY`を使用します。

## Renderで公開

1. このリポジトリをGitHubへアップロードします。
2. Renderで「New Web Service」を選び、リポジトリを接続します。
3. Environment Variablesに `NASA_API_KEY` を登録します。
4. デプロイ後、RenderのURLを開きます。

NASA APIキーはGitHubへ書き込まず、Renderの環境変数へ設定してください。
