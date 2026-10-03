# What We Eat — GitHub Pages / PWA版

夕食を短時間で決めるWebアプリです。ZIPを展開し、中のファイルをすべてGitHubリポジトリの最上位にアップロードしてください。ZIPそのものはアップロードしません。ビルドやAPIキーは不要です。

## GitHub Pagesで公開

1. GitHubで新しいPublicリポジトリ（例: `what-we-eat`）を作成します。
2. `Add file` → `Upload files` から、展開したファイルを**すべて**アップロードし、`Commit changes`を押します。`index.html`がリポジトリ直下に見える状態にします。
3. `Settings` → `Pages` → `Build and deployment` の `Source` を `Deploy from a branch` にします。
4. `Branch` で `main`、フォルダーで `/ (root)` を選び、`Save`します。
5. 数分後、同じPages画面の `Visit site` から公開URLを開きます。通常は `https://ユーザー名.github.io/what-we-eat/` です。

## スマートフォンに追加

- iPhone: Safariで公開URLを開く → 共有ボタン → `ホーム画面に追加` → 必要なら `ウェブアプリとして開く` をオン → `追加`。
- Android: Chromeで公開URLを開く → 右上の `⋮` → `アプリをインストール` または `ホーム画面に追加` → 画面の案内に従います。

## PWAの構成

- `manifest.webmanifest`: 名前・起動URL・表示方式・アイコン。
- `icon-180.png`、`icon-192.png`、`icon-512.png`: 指定された既存ロゴのサイズ違い。
- `pwa-register.js`、`service-worker.js`: アプリ画面の基本ファイルをキャッシュし、通信が切れても読み込みを試みます。更新時はネットワークを優先します。
- 位置情報と外食検索には通信、HTTPS、ブラウザの許可が必要です。サービスワーカーは外部APIの結果を保存しません。

## データと制約

- 自炊候補は197件。料理写真は`dinner.webp`に合う1品のみです。一部レシピは概略手順です。
- 店舗はOpenStreetMapのOverpass API、駅名・地名候補はNominatimを利用します。公開APIの混雑・停止時は店舗を取得できないことがあります。
- 店舗の営業時間・営業状況・価格帯は取得できるデータだけを表示します。
- 位置情報は許可後、店舗検索のためだけに使い、アプリには保存しません。
