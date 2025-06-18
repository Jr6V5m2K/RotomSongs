# GitHub Actions自動デプロイ設定手順

## 問題の原因
Personal Access Tokenに`workflow`スコープが含まれていないため、GitHub Actionsワークフローファイルをプッシュできません。

## 解決方法

### 方法1: GitHub Web UI で直接作成（推奨）

1. **GitHubリポジトリにアクセス**
   - https://github.com/Jr6V5m2K/RotomSongs にアクセス

2. **Actions タブに移動**
   - 「Actions」タブをクリック

3. **新しいワークフローを作成**
   - 「New workflow」ボタンをクリック
   - 「set up a workflow yourself」を選択

4. **ワークフローファイルを作成**
   - ファイル名: `.github/workflows/deploy.yml`
   - 以下の内容をコピー&ペースト：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
    paths: 
      - 'Songs/**/*.md'
      - 'src/**'
      - 'public/**'
      - 'package*.json'
      - 'next.config.js'
      - 'tailwind.config.js'
      - 'tsconfig.json'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next

      - name: Install dependencies
        run: npm ci

      - name: Build with Next.js
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. **コミット**
   - 「Commit changes...」をクリック
   - コミットメッセージ: `feat: Add GitHub Actions workflow for automated deployment`
   - 「Commit changes」をクリック

### 方法2: GitHub Pages設定

1. **Settings → Pages**
   - リポジトリの「Settings」タブ → 「Pages」
   - Source: 「GitHub Actions」を選択

## 設定後の動作

- `main`ブランチへのプッシュで自動デプロイ
- `Songs/`ディレクトリのMDファイル変更で自動ビルド
- 手動デプロイも可能（workflow_dispatch）

## 確認方法

1. Actions タブでワークフロー実行状況を確認
2. 完了後、https://jr6v5m2k.github.io/RotomSongs/ で更新を確認