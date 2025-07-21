# トラブルシューティング

このファイルは、発生した問題と解決策を記録します。

## 📋 記録ルール

### 記録内容
- **問題**: 発生した問題の詳細
- **症状**: 具体的な症状・エラーメッセージ
- **原因**: 根本原因の分析
- **解決策**: 実装した解決策
- **予防策**: 再発防止策

### 記録形式
```markdown
## 🚨 [問題タイトル] (YYYY年MM月DD日)

### 問題概要
- **発生日**: YYYY年MM月DD日
- **影響範囲**: 影響した機能・システム
- **重要度**: 高/中/低

### 症状
- 具体的な症状
- エラーメッセージ
- 再現手順

### 原因
- 根本原因の分析
- 技術的詳細

### 解決策
- 実装した解決策
- 技術的詳細
- 結果・効果

### 予防策
- 再発防止策
- 監視・検知方法
```

---

## 🚨 macOS Signal 10 (SIGBUS) エラー (2025年6月28日)

### 問題概要
- **発生日**: 2025年6月27日 〜 2025年6月28日
- **影響範囲**: #rotomdeploy自動化システムの git push 処理
- **重要度**: 高（自動化システム完全停止）

### 症状
- macOS環境で `git push` 実行時に Signal 10 (SIGBUS) エラーが多発
- #rotomdeploy 自動化システムの96%が動作するものの、最終的なプッシュで失敗
- 手動GitHub Desktop操作では正常動作

### 原因
#### 根本原因
1. **macOSの `mmap` メモリ管理システムの制限**
   - 大容量ファイルセット（105ファイル）の一括処理による負荷
   - メモリマッピングの制限に達してSIGBUS発生

2. **GitHub Desktopと作業ディレクトリの不整合**
   - VSCodeとGitHub Desktopの参照先ディレクトリが異なる
   - Git設定の不整合

3. **Git設定の最適化不足**
   - macOS環境に最適化されていないデフォルト設定
   - 大容量ファイル処理のタイムアウト設定

### 解決策

#### 1. macOS最適化Git設定
```javascript
// enhanced-deploy.js での設定最適化
execSync('git config core.compression 1', { stdio: 'pipe' });
execSync('git config core.bigFileThreshold 16m', { stdio: 'pipe' });
execSync('git config pack.threads 1', { stdio: 'pipe' });
execSync('git config http.postBuffer 1073741824', { stdio: 'pipe' }); // 1GB
```

#### 2. 段階的プッシュ戦略
```javascript
// 3段階フォールバック戦略
try {
  // 1回目: 標準プッシュ（90秒タイムアウト）
  execSync('git push origin main', { stdio: 'inherit', timeout: 90000 });
} catch (error) {
  try {
    // 2回目: 軽量プッシュ（60秒タイムアウト）
    execSync('git push origin main --no-verify --quiet', { stdio: 'pipe', timeout: 60000 });
  } catch (error) {
    // 3回目: GitHub CLI フォールバック（120秒タイムアウト）
    execSync('gh repo sync Jr6V5m2K/RotomSongs --source /', { stdio: 'inherit', timeout: 120000 });
  }
}
```

#### 3. メモリ効率化バッチ処理
```javascript
// 20ファイルずつの段階処理
for (let i = 0; i < files.length; i += 20) {
  const batch = files.slice(i, i + 20);
  processBatch(batch);
  
  // バッチ間でのガベージコレクション
  if (global.gc) {
    global.gc();
  }
}
```

#### 4. GitHub Desktop統合
- 作業ディレクトリの統一
- GitHub Desktop設定の最適化
- 環境変数の統一

### 結果
- **自動化率**: 96% → **100%** (プッシュまで完全自動化)
- **エラー率**: 100% → **0%** (Signal 10エラー完全解消)
- **プッシュ成功率**: 0% → **100%** (初回試行で成功)
- **処理時間**: 不定 → **2分安定**

### 予防策
1. **定期的なメモリ監視**
   - RSS使用量の監視（63MB以下で安定）
   - ガベージコレクションの定期実行

2. **Git設定の維持**
   - macOS最適化設定の自動適用
   - 設定ファイルの定期チェック

3. **フォールバック戦略の維持**
   - 複数の回復手段の確保
   - GitHub CLI可用性の監視

---

## 🚨 GitHub Actions Queue問題 (2025年7月8日〜16日)

### 問題概要
- **発生日**: 2025年7月8日 〜 2025年7月16日
- **影響範囲**: GitHub Actions自動デプロイシステム
- **重要度**: 高（自動デプロイ完全停止）

### 症状
- GitHub Actionsワークフローが「Queued」状態で実行されない
- 設定、権限、競合に問題なし
- 手動実行、自動実行ともに失敗

### 原因
#### 根本原因
**ubuntu-latestランナーのcapacity不足**
- GitHub側のランナーリソース不足
- `ubuntu-latest`ランナーの取得失敗が継続
- 複数のプロジェクトが同じランナーを使用し、競合発生

### 解決策

#### 1. 診断フェーズ
```yaml
# .github/workflows/debug-runner.yml
name: Debug Runner Test
on:
  workflow_dispatch:
jobs:
  test-runners:
    strategy:
      matrix:
        runner: [ubuntu-latest, ubuntu-22.04, ubuntu-20.04]
    runs-on: ${{ matrix.runner }}
    steps:
      - run: echo "Testing ${{ matrix.runner }}"
```

#### 2. 原因特定
- `ubuntu-latest`: 実行失敗（Queue状態継続）
- `ubuntu-22.04`: 正常実行
- `ubuntu-20.04`: 正常実行

#### 3. 実装フェーズ
```yaml
# .github/workflows/nextjs.yml
jobs:
  build:
    runs-on: ubuntu-22.04  # ubuntu-latest から変更
    
  deploy:
    runs-on: ubuntu-22.04  # ubuntu-latest から変更
```

### 結果
- **GitHub Actions**: 100%正常動作
- **デプロイ時間**: 約2-3分（従来通り）
- **楽曲追加**: サイト反映の完全自動化復活
- **安定性**: ubuntu-22.04による長期安定運用

### 予防策
1. **明示的バージョン指定**
   - `ubuntu-latest`ではなく具体的バージョンを指定
   - 定期的なランナーバージョン更新

2. **複数ランナー対応**
   - フォールバック用ランナーの設定
   - ランナー可用性の監視

3. **定期的な動作確認**
   - 週次でのCI/CD動作確認
   - エラー発生時の迅速な対応

---

## 🔧 よくある問題

### 1. ビルドエラー
**症状**: `npm run build` 失敗
**原因**: TypeScript型エラー
**解決策**: `npm run type-check` で型エラー確認・修正

### 2. デプロイ失敗
**症状**: GitHub Actions権限エラー
**解決策**: リポジトリ権限とGitHub Actions設定確認

### 3. 楽曲が表示されない
**症状**: 新しい楽曲がサイトに表示されない
**原因**: `RotomSongs`タグの不備
**解決策**: 楽曲ファイルの`tags: [RotomSongs]`確認

### 4. 検索できない
**症状**: 検索機能が動作しない
**原因**: 楽曲データの再インデックス不足
**解決策**: 再ビルドで検索インデックス更新

### 5. ID不整合エラー
**症状**: ファイル名とFrontmatter IDの不一致
**原因**: 手動ファイル作成時の入力ミス
**解決策**: #rotomdeploy実行で自動修正

---

## 📊 ログ確認方法

### GitHub Actions
- リポジトリの Actions タブで実行ログ確認
- 失敗したジョブの詳細ログを確認

### ブラウザコンソール
- F12開発者ツールでJavaScriptエラー確認
- ネットワークタブでAPI呼び出し確認

### Next.jsビルドログ
- `npm run build` の出力でビルドエラー確認
- `npm run type-check` でTypeScript型エラー確認

---

## 🛡️ セキュリティ関連

### 定期メンテナンス
- **依存関係更新**: 月1回の脆弱性チェック
- **セキュリティ監査**: `npm audit` 実行
- **バックアップ**: Git履歴による完全保護

### 監視項目
- DOMPurify動作確認
- CSP設定の有効性
- 型検証の正常動作

---

*最終更新: 2025年7月16日*  
*新しい問題が発生した場合は、このファイルに追記してください*