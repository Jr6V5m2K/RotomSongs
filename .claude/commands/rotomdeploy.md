# RotomSongs 自動デプロイコマンド

**#rotomdeploy** - RotomSongsプロジェクトの完全自動デプロイを実行します。

## 実行内容

以下の処理を自動で実行し、約2分で完全デプロイを完了します：

### 1. ファイル同期
- Obsidianディレクトリ（`/Users/aburamac/Desktop/dev/lab/Obsidian/10_Literature/RotomSongs`）から最新楽曲ファイルをコピー
- バッチ処理（20ファイル単位）でメモリ効率化
- Signal 10エラー対策実装済み

### 2. データ整合性チェック
- Markdownファイルの改行修正
- 楽曲IDの整合性検証・自動修正
- フロントマターの形式確認

### 3. 楽曲数自動更新
- `CLAUDE.md`の基本情報（楽曲数・最終更新日）
- ディレクトリ構造情報の同期
- package.jsonの説明文更新

### 4. ビルド・デプロイ
- Next.jsプロジェクトのビルド実行
- 型チェック・Lintの実行
- GitHub Pagesへの自動デプロイ

### 5. Git操作（Signal 10対策）
- Git設定最適化（圧縮レベル、スレッド数、バッファサイズ）
- 3段階リトライ機能：
  1. 通常のgit push
  2. GitHub CLI (`gh`) を使用
  3. force pushフォールバック
- 失敗時はGitHub Desktop手順を表示

## 実行方法

```bash
npm run enhanced-deploy
```

または直接実行：

```bash
node --expose-gc --max-old-space-size=2048 scripts/enhanced-deploy.js
```

## 自動記録

実行完了後、以下に自動記録されます：

- **デプロイログ**: `.claude/deploy-logs.md`
- **プロジェクト情報更新**: `CLAUDE.md`
- **Git履歴**: 実行日時・楽曲数・処理結果

## 実行条件

- **作業ディレクトリ**: RotomSongsプロジェクトルート
- **必要環境**: Node.js, Git, GitHub CLI (推奨)
- **Obsidianディレクトリ**: アクセス可能な状態

## パフォーマンス

- **実行時間**: 約2分（111楽曲対応）
- **効率化**: 手動23分 → 自動50秒（96%短縮）
- **メモリ最適化**: バッチ処理・ガベージコレクション

## エラー対応

Signal 10エラー（macOS特有の問題）に対する包括的な対策を実装：

1. **バッチ処理**: メモリ使用量の制御
2. **Git設定最適化**: macOS環境に最適化
3. **多段階リトライ**: 3つの異なる手法で自動リトライ
4. **手動フォールバック**: 最終手段としてGitHub Desktop手順表示

## 注意事項

- 実行前に重要な変更はコミット推奨
- Obsidianディレクトリへのアクセス権限確認
- 実行中はターミナルを閉じないでください

---

**使用例**:
```
/rotomdeploy
```

→ 完全自動デプロイが開始され、約2分後にGitHub Pagesに最新版が公開されます。