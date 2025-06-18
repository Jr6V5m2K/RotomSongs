# RotomSongs - 家電和歌集

X（旧Twitter）で投稿された替え歌をまとめたコレクションサイトです。

## 🎵 概要

- **楽曲数**: 83曲収録（2023年〜2025年）
- **技術スタック**: Next.js 14 + TypeScript + Tailwind CSS
- **デプロイ**: GitHub Pages（自動デプロイ対応）
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ

## 🌐 サイト

**本番URL**: https://jr6v5m2k.github.io/RotomSongs

## 📁 プロジェクト構造

```
RotomSongs/
├── Songs/                    # 替え歌データ（Markdownファイル）
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reactコンポーネント
│   ├── lib/                  # ユーティリティ関数
│   └── types/                # TypeScript型定義
├── .github/workflows/        # GitHub Actions設定
└── public/                   # 静的ファイル
```

## 🚀 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check
```

## 📝 楽曲データ形式

各替え歌は以下の形式のMarkdownファイルです：

```markdown
---
title: ファイル名
id: 数値ID
created: 作成日
updated: 更新日
tags:
  - RotomSongs
---

# タイトル

### Source
![](X投稿URL)

### Lyrics
替え歌の歌詞

### Original
#### Artist
原曲アーティスト

#### Title
原曲タイトル

#### Lyrics
原曲歌詞
```

## 🔄 自動デプロイ

以下の変更時に自動でGitHub Pagesに反映されます：

- `Songs/` フォルダ内のMarkdownファイル更新
- `src/` フォルダ内のコード変更
- 設定ファイルの変更

## 🎨 主な機能

- **楽曲一覧表示**: 時系列順での楽曲リスト
- **楽曲詳細表示**: 替え歌歌詞と原曲情報の表示
- **レスポンシブデザイン**: 全デバイス対応
- **SEO最適化**: メタデータ・OGP対応
- **共有機能**: URL共有・SNSシェア
- **ナビゲーション**: 前後楽曲への移動

## 📱 対応ブラウザ

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 🔧 技術仕様

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5.5
- **スタイリング**: Tailwind CSS 3.4
- **ビルド**: Static Site Generation (SSG)
- **CI/CD**: GitHub Actions
- **ホスティング**: GitHub Pages

## 📄 ライセンス

MIT License

## 👨‍💻 作成者

**Jr6V5m2K**
- X: [@Starlystrongest](https://x.com/Starlystrongest)
- GitHub: [Jr6V5m2K](https://github.com/Jr6V5m2K)

---

*このプロジェクトは Next.js と GitHub Pages を使用して構築されています。*