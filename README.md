# LPテンプレート（GitHub Pages用）

このフォルダの中身をGitHubリポジトリの一番上（root）にアップロードすると、GitHub Pagesで公開できます。

## ファイル

- `index.html`：ページの内容
- `style.css`：見た目・レイアウト
- `script.js`：メニューなどの動き

## 画像を変更する

画像URLはPicsum Photosのseed付きURLです。同じseedでは同じ画像が表示されます。別の画像にしたいときは、URLの `seed/lp-card-one` の部分のseed名を変更します。

例：`https://picsum.photos/seed/my-new-image/800/600`

画像URLを使うため、ページ閲覧時にインターネット接続が必要です。自分で選んだ画像を使う場合は、画像ファイルをリポジトリに置き、`src` またはCSSのURLをそのファイルのパスに変更してください。

## Googleフォームを埋め込む

1. 自分のGoogleフォームを開き、「送信」から埋め込み用のiframeコードをコピーします。
2. `index.html` の `Googleフォーム埋め込み欄` を探します。
3. サンプルの `<iframe>...</iframe>` を、コピーしたコードに置き換えます。
4. `src` のURLに `REPLACE_WITH_YOUR_FORM_ID` が残っていないことを確認します。
5. 公開前に、別アカウントまたはログアウト状態でフォームを開けるか確認します。

## GitHub Pagesで公開する

1. GitHubで新しいリポジトリを作ります。
2. このフォルダの中のファイルをリポジトリのrootにアップロードしてcommitします。
3. リポジトリの **Settings → Pages** を開き、公開元としてブランチとrootフォルダを選択します。
4. 表示された公開URLを開き、画像・リンク・フォームを確認します。

※このテンプレートの問い合わせフォームは、Googleフォームの埋め込みURLに差し替えてから利用してください。
