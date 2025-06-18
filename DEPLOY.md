# RotomSongs デプロイガイド

## 🚀 自動デプロイ機能

### #rotomdeploy ハッシュタグでの自動デプロイ

新しい楽曲を追加した後、以下のコマンドで自動デプロイが可能です：

```bash
npm run rotomdeploy
```

または

```bash
npm run deploy
```

### 自動実行される処理

1. **楽曲数カウント**: Songsディレクトリ内のMDファイルを自動カウント
2. **メタデータ更新**: 以下のファイルの楽曲数を自動更新
   - `package.json`の説明文
   - `src/lib/metadata.ts`のOG/Twitter Card情報
   - `src/components/Header.tsx`の表示楽曲数
3. **ビルドテスト**: エラーがないことを確認
4. **Git操作**: 自動的にadd, commit, push実行
5. **GitHub Pages**: 自動デプロイトリガー

## 📝 楽曲追加ワークフロー

### 1. 新しい楽曲MDファイルを追加
```bash
# Songsディレクトリに新しいMDファイルを追加
cp template.md Songs/20250618_1400.md
# ファイルを編集...
```

### 2. 自動デプロイ実行
```bash
npm run rotomdeploy
```

### 3. 結果確認
- GitHub Actions: https://github.com/Jr6V5m2K/RotomSongs/actions
- 公開サイト: https://jr6v5m2k.github.io/RotomSongs/
- 更新反映: 2-3分後

## 🔧 手動デプロイ（従来方法）

```bash
# 1. 変更をステージ
git add .

# 2. コミット
git commit -m "feat: Add new song YYYYMMDD_HHMM

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. プッシュ
git push origin main
```

## 📊 現在の設定

- **自動検出**: Next.jsが自動的にSongsディレクトリをスキャン
- **時系列ソート**: ファイル名（YYYYMMDDHHMM）による自動ソート
- **楽曲数表示**: ヘッダーとメタデータで自動更新
- **GitHub Actions**: mainブランチプッシュで自動ビルド・デプロイ

## 🚨 注意事項

- **ファイル命名**: `YYYYMMDD_HHMM.md` 形式を厳守
- **MDファイル構造**: 既存ファイルと同じ構造を維持
- **ビルドエラー**: デプロイ前に自動チェック実行
- **Git権限**: リポジトリへのpush権限が必要

## 🆘 トラブルシューティング

### デプロイが失敗する場合
```bash
# 手動でビルドテスト
npm run build

# Git状況確認
git status

# 手動でプッシュ
git push origin main
```

### 楽曲数が更新されない場合
- `npm run rotomdeploy`を再実行
- GitHub Actionsの実行状況を確認
- キャッシュクリア後にサイトを再読み込み

## 📈 実装済み自動化機能

✅ **MDファイル自動検出**: Songsディレクトリの全MDファイルを自動読み込み  
✅ **楽曲数自動更新**: package.json, metadata.ts, Header.tsxの楽曲数を自動更新  
✅ **時系列ソート**: 新しい楽曲が自動的に最上位表示  
✅ **検索機能**: 新しい楽曲も自動的に検索対象に追加  
✅ **ビルド検証**: デプロイ前のエラーチェック  
✅ **GitHub Actions**: プッシュ後の自動ビルド・デプロイ

**使用方法**: 新しいMDファイルをSongsに追加 → `npm run rotomdeploy` → 完了！