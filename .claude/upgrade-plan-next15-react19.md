# Next.js 15 & React 19 アップグレード改修計画書

## 📋 計画概要

- **作成日**: 2025年7月27日
- **最終更新**: 2025年7月27日（最新安定バージョン確認済み）
- **対象プロジェクト**: RotomSongs (家電和歌集)
- **デプロイ環境**: GitHub Pages（静的サイトホスティング）
- **現在バージョン**: Next.js 14.2.4 + React 18.3.1 + Tailwind CSS 3.4.4
- **目標バージョン**: Next.js 15.4 + React 19.1.0 + Tailwind CSS 4.1.11
- **予想工期**: 3-4週間（検証・テスト含む）
- **リスクレベル**: 🟡 中リスク（破壊的変更あり）
- **注意事項**: SSR不使用、静的サイト生成（SSG）のみ

## 🎯 アップグレード目標

### 技術的目標
- **Next.js 15**: Turbopack安定化、パフォーマンス向上、React 19サポート
- **React 19**: React Compiler最適化、新Hooks、より良いSSR
- **Tailwind CSS 4**: CSS-firstコンフィグ、大幅なパフォーマンス向上、現代的なCSS機能活用
- **長期保守性**: 最新技術スタックによる持続可能な開発

### ビジネス価値
- **パフォーマンス向上**: 
  - Next.js: ビルド時間76%短縮、Fast Refresh 96%高速化
  - Tailwind CSS: フルビルド5倍高速化、インクリメンタルビルド100倍以上高速化
- **開発体験向上**: React Compiler自動最適化、CSS-firstコンフィグの簡素化
- **将来対応**: 2025年のReact/Next.js/Tailwindエコシステムとの親和性

## 🔍 最新バージョン調査結果（2025年7月27日）

### 確認済み最新安定バージョン
```yaml
Next.js 15.4:
  - リリース日: 2025年7月
  - 主要改善: パフォーマンス、安定性、Turbopack互換性
  - 前バージョン: 15.3 (2025年4月), 15.2 (2025年2月)
  - 状態: ✅ 安定版・本番推奨

React 19.1.0:
  - リリース日: 2025年3月
  - 前バージョン: 19.0.0 (2024年12月 - 初回安定版)
  - 主要機能: Actions, Server Components, React Compiler
  - 状態: ✅ 安定版・本番推奨

Tailwind CSS 4.1.11:
  - リリース日: 2025年6月
  - 前バージョン: 4.1.x系列の最新パッチ
  - 主要機能: text-shadow, mask utilities, 大幅性能向上
  - 状態: ✅ 安定版・本番推奨
  - 互換性: Safari 16.4+, Chrome 111+, Firefox 128+
```

### 調査ソース
- Next.js: 公式リリースノート、GitHub Releases
- React: npm registry、公式ブログ
- Tailwind CSS: 公式サイト、npm registry

## 📊 現状分析

### 現在の技術スタック
```yaml
Core Framework:
  Next.js: 14.2.4 → 15.4 (Major Upgrade - 2025年7月最新)
  React: 18.3.1 → 19.1.0 (Major Upgrade - 2025年3月最新)
  TypeScript: 5.5.2 (互換性維持)

Styling:
  Tailwind CSS: 3.4.4 → 4.1.11 (Major Upgrade - 2025年6月最新)
  @tailwindcss/typography: 0.5.13 → v4対応版
  @tailwindcss/postcss: 新規導入必要

依存関係 (28 packages):
  Production:
    - dompurify: 3.2.6 ⚠️ (SSR互換性要調整)
    - fuse.js: 7.1.0 ✅ (互換性OK)
    - gray-matter: 4.0.3 ❓ (4年前、要確認)
    - lucide-react: 0.522.0 ⚠️ (peer dependency警告)
    - remark: 15.0.1 ✅ (互換性OK)
    - zod: 3.25.67 ✅ (互換性OK)
  
  Development:
    - @types/react: 18.3.3 → 19.x (要更新)
    - @types/react-dom: 18.3.0 → 19.x (要更新)
    - eslint: 8.57.0 ✅ (互換性OK)
    - tailwindcss: 3.4.4 ✅ (互換性OK)
```

### 影響を受けるコードベース

#### 🔴 High Impact (必須対応)
```yaml
SearchInput.tsx (L24):
  - forwardRef使用 → React 19で簡素化可能
  - 移行: refをpropsとして受け取る形式に変更

OptimizedImage.tsx (L41):
  - useRef<HTMLImageElement>(null) 使用
  - 型定義更新が必要 (MutableRefObject → RefObject)

layout.tsx (L30-40):
  - dangerouslySetInnerHTML使用
  - セキュリティレビュー・代替実装検討

SongCard.tsx (L79), SongDetail.tsx (L155, L192):
  - dangerouslySetInnerHTML使用
  - ビルド時・クライアント時のDOMPurify動作確認
  - 注意: GitHub Pages = 静的サイトのためSSRなし

Tailwind CSS構成全体:
  - tailwind.config.js → CSS-first設定に移行必要
  - globals.css: @tailwind directives → @import変更
  - postcss.config.js: PostCSS plugin更新
  - @tailwindcss/typography: v4互換性要確認
```

#### 🟡 Medium Impact (推奨対応)
```yaml
Type Definitions:
  - @types/react 19対応
  - @types/react-dom 19対応
  - カスタム型定義の調整

Build Configuration:
  - next.config.js: React 19最適化設定
  - tsconfig.json: 新機能対応設定
  - ESLint: React 19ルール追加
```

#### 🟢 Low Impact (様子見)
```yaml
Performance:
  - React Compiler自動最適化の効果測定
  - memo(), useMemo()最適化の見直し
  - Bundle sizeの改善確認
```

## 🔄 段階的移行計画

### Phase 1: React 19アップグレード (2-3日)

#### 1.1 開発環境のセットアップ
```bash
# 検証用ブランチ作成
git checkout -b upgrade/next15-react19

# React 19のみ先行更新
npm install react@19.1.0 react-dom@19.1.0 --save
npm install @types/react@19 @types/react-dom@19 --save-dev
npm install eslint-config-next@15.4 --save-dev
```

#### 1.2 型定義の修正
```typescript
// useRef型定義の更新例
// Before (React 18)
const imgRef = useRef<HTMLImageElement>(null);

// After (React 19)
const imgRef = useRef<HTMLImageElement>(null);
// 型の扱いが変更される可能性があるため要確認
```

#### 1.3 基本動作確認
```bash
# 開発サーバー起動テスト
npm run dev

# ビルドテスト
npm run build

# 型チェック
npm run type-check
```

### Phase 2: Next.js 15アップグレード (1-2日)

#### 2.1 Next.js 15インストール
```bash
# Next.js 15更新
npm uninstall next
npm install next@15.4

# 設定ファイル更新検討
# next.config.js - React 19最適化設定確認

# ビルドテスト
npm run build
```

#### 2.2 基本動作確認
```bash
# 開発サーバー起動テスト
npm run dev

# 型チェック
npm run type-check

# 静的サイト生成確認
npm run build
```

### Phase 3: コード修正・依存関係調整 (2-3日)

#### 3.1 forwardRef → ref prop 移行
```typescript
// React 19: forwardRef非推奨、ref propに移行
// SearchInput.tsx修正例

// Before (React 18 + forwardRef)
// const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(...);

// After (React 19 - ref as prop)
interface SearchInputProps {
  ref?: React.Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  // ... other props
}

function SearchInput({ ref, value, onChange, ...props }: SearchInputProps) {
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}
```

#### 3.2 DOMPurify ビルド時・実行時対応確認
```typescript
// ビルド時（Node.js環境）/実行時（ブラウザ環境）分岐の確認
export function sanitizeLyrics(content: string): string {
  if (typeof window === 'undefined') {
    // ビルド時（静的生成）: 基本的なエスケープ処理
    return escapeHtml(content);
  }
  
  // クライアント実行時: DOMPurify使用
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['br', 'p', 'span'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

// 注意: GitHub Pages = 静的サイト生成のみ
// SSR（サーバーサイドレンダリング）は使用しない
```

#### 3.3 依存関係問題の解決
```bash
# lucide-react peer dependency警告対応
npm install lucide-react@latest --legacy-peer-deps

# gray-matter代替検討（必要に応じて）
npm install front-matter  # 代替候補

# 注意: isomorphic-dompurifyは不要（静的サイト生成のため）
```

### Phase 4: Tailwind CSS v4 移行 (3-4日)

#### 4.1 Tailwind CSS v4 自動移行ツール実行
```bash
# Node.js 20以上が必要
node --version  # 20+ 確認

# Tailwind CSS v4 自動移行ツール実行
# 公式の移行ツールを使用（Node.js 20+が必要）
npx @tailwindcss/upgrade

# または手動設定（推奨）
npm uninstall tailwindcss @tailwindcss/typography
npm install tailwindcss@4.1.11 @tailwindcss/postcss@latest
```

#### 4.2 設定ファイルの手動変換
```css
/* globals.css - v3からv4への変更 */
/* Before (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (v4) */
@import "tailwindcss";

/* カスタム設定をCSS-firstに移行 */
@theme {
  --color-primary-50: #fff7ed;
  --color-primary-100: #ffedd5;
  --color-primary-200: #fed7aa;
  --color-primary-300: #fdba74;
  --color-primary-400: #fb923c;
  --color-primary-500: #f97316;
  --color-primary-600: #ea580c;
  --color-primary-700: #c2410c;
  --color-primary-800: #9a3412;
  --color-primary-900: #7c2d12;
  
  --color-secondary-50: #f9fafb;
  --color-secondary-100: #f3f4f6;
  --color-secondary-500: #6b7280;
  --color-secondary-600: #4b5563;
  --color-secondary-700: #374151;
}
```

#### 4.3 PostCSS設定更新
```javascript
// postcss.config.js - v4対応
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // 新しいプラグイン
    autoprefixer: {},
  },
}
```

#### 4.4 カスタム@layerの互換性確認
```css
/* 既存のカスタムレイヤーの動作確認 */
@layer components {
  .btn-primary { /* 動作確認 */ }
  .card { /* 動作確認 */ }
  .search-input { /* 動作確認 */ }
}

@layer utilities {
  .text-balance { /* 動作確認 */ }
  .scrollbar-thin { /* 動作確認 */ }
}
```

### Phase 5: 包括テスト・デバッグ (2-3日)

#### 5.1 機能テスト
```yaml
Core Features Testing:
  - 楽曲一覧表示 ✓
  - 楽曲詳細表示 ✓
  - 検索機能 (Fuse.js) ✓
  - オートコンプリート ✓
  - レスポンシブデザイン ✓
  - SEO/メタデータ ✓

Performance Testing:
  - Core Web Vitals測定
  - ビルド時間測定
  - Bundle size分析
  - 検索パフォーマンス ✓
```

#### 5.2 静的サイト生成（SSG）テスト
```bash
# 静的生成テスト（GitHub Pages用）
npm run build  # 自動的に static export実行

# 本番環境シミュレーション
npx serve out

# 111楽曲すべてのページ生成確認
ls out/songs/ | wc -l  # 111であることを確認

# 静的アセット確認
ls out/_next/static/
ls out/images/
```

#### 5.3 自動化テスト
```bash
# enhanced-deploy.jsのテスト
npm run enhanced-deploy

# 型チェック厳格化
npm run type-check

# Lint & Format
npm run lint
```

### Phase 4: 本番適用・監視 (2-3日)

#### 4.1 段階的デプロイ
```yaml
Deployment Strategy:
  Day 1: dev環境デプロイ
  Day 2: staging相当（GitHub Pages preview）
  Day 3: 本番デプロイ（jr6v5m2k.github.io）
```

#### 4.2 監視・検証
```yaml
Success Metrics:
  - サイト正常動作 ✓
  - 検索機能正常動作 ✓
  - ページロード時間維持 ✓
  - エラー率 < 1%
  - Core Web Vitals維持
```

## ⚠️ リスク分析と対策

### 🔴 High Risk

#### 1. DOMPurify ビルド時互換性問題
```yaml
Risk: ビルド時（Node.js環境）でDOMPurify関連エラー
Impact: 静的サイト生成の失敗
Probability: 20%

対策:
  - typeof window チェック確認
  - ビルド時フォールバック強化
  - 段階的テスト実施

Rollback Plan:
  - React 18.3への即座復帰
  - 既存sanitize.ts復元

注意: GitHub Pages = SSRなし、静的生成のみ
```

#### 2. forwardRef破壊的変更
```yaml
Risk: SearchInput等で型エラー・実行時エラー
Impact: 検索機能停止
Probability: 30%

対策:
  - 段階的移行（forwardRef → ref prop）
  - 十分なテスト実施
  - TypeScript strict mode活用

Rollback Plan:
  - forwardRef実装への復帰
  - React 18.x型定義復元
```

### 🟡 Medium Risk

#### 3. Tailwind CSS v4 設定移行問題
```yaml
Risk: CSS-first設定への移行でスタイリング破綻
Impact: 全サイトのデザイン崩れ
Probability: 60%

対策:
  - 自動移行ツール使用
  - 段階的な手動移行
  - カスタム@layerの動作確認

Rollback Plan:
  - Tailwind CSS v3.4.4への復帰
  - 既存設定ファイル復元
  - PostCSS設定巻き戻し

注意: v4は完全書き換えのため要注意
```

#### 4. 依存関係の互換性問題
```yaml
Risk: lucide-react, gray-matter等で警告・エラー
Impact: アイコン表示異常、Markdown解析失敗
Probability: 50%

対策:
  - --legacy-peer-deps使用
  - 代替ライブラリの準備
  - 詳細な動作確認

Rollback Plan:
  - package-lock.json復元
  - 全依存関係の巻き戻し
```

#### 4. パフォーマンス劣化
```yaml
Risk: React 19移行でパフォーマンス低下
Impact: UX悪化、SEO影響
Probability: 20%

対策:
  - React Compiler活用検討
  - Bundle analyzer使用
  - Core Web Vitals継続測定

Rollback Plan:
  - 前バージョンへの即座復帰
  - パフォーマンス最適化の見直し
```

### 🟢 Low Risk

#### 5. 自動化デプロイ影響
```yaml
Risk: enhanced-deploy.jsでの問題
Impact: デプロイ自動化停止
Probability: 15%

対策:
  - Node.js互換性確認
  - Git操作の動作確認
  - manual deployの準備

Rollback Plan:
  - 手動デプロイへの切り替え
  - スクリプト修正・復旧
```

## 🔧 実行手順詳細

### 事前準備

#### 1. バックアップ作成
```bash
# 現在の安定版をタグ付け
git tag v1.0.0-stable
git push origin v1.0.0-stable

# 完全バックアップ
cp -r . ../RotomSongs-backup-$(date +%Y%m%d)
```

#### 2. 作業環境準備
```bash
# 作業ブランチ作成
git checkout -b upgrade/next15-react19

# 依存関係の現状確認
npm list --depth=0 > pre-upgrade-dependencies.txt
```

### Step 1: React 19アップグレード

```bash
# 1. React本体のアップグレード
npm uninstall react react-dom
npm install react@19.1.0 react-dom@19.1.0

# 2. 型定義の更新
npm uninstall @types/react @types/react-dom
npm install @types/react@19 @types/react-dom@19 --save-dev

# 3. ESLint設定の更新
npm install eslint-config-next@15.4 --save-dev

# 4. 基本動作確認
npm run type-check
npm run dev
```

### Step 2: Next.js 15アップグレード

```bash
# 1. Next.js更新
npm uninstall next
npm install next@15.4

# 2. 設定ファイル更新検討
# next.config.js - React 19最適化設定追加

# 3. ビルドテスト
npm run build
```

### Step 3: コード修正

#### 3.1 SearchInput.tsx修正
```typescript
// React 19: forwardRef非推奨、ref propに移行
// 注意: React 19でforwardRefは完全に非推奨になりました

// Before (React 18 + forwardRef)
// const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(...);

// After (React 19 - ref as prop)
interface SearchInputProps {
  ref?: React.Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // ... other props
}

function SearchInput({ ref, value, onChange, ...props }: SearchInputProps) {
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

// displayNameも不要になります
// SearchInput.displayName = 'SearchInput'; // 削除
```

#### 3.2 OptimizedImage.tsx修正
```typescript
// useRef型定義確認・修正
const imgRef = useRef<HTMLImageElement>(null);
// React 19での型定義変更に対応
```

#### 3.3 DOMPurify動作確認
```bash
# 現在の実装確認・テスト
npm run build  # ビルド時エラーチェック
npm run dev    # 開発環境での動作確認

# 必要に応じてsanitize.tsの微調整
# 注意: GitHub Pages = 静的生成のみのため、
# isomorphic-dompurifyは不要
```

### Step 4: 依存関係調整

```bash
# 問題のある依存関係を個別対応
npm install lucide-react@latest --legacy-peer-deps

# gray-matterの動作確認・代替検討
npm test gray-matter-functionality

# 全体の依存関係確認
npm audit
npm list --depth=0
```

### Step 5: Tailwind CSS v4 移行

#### 5.1 環境確認・準備
```bash
# Node.js 20+ 確認
node --version

# 現在のTailwind設定バックアップ
cp tailwind.config.js tailwind.config.js.backup
cp src/app/globals.css src/app/globals.css.backup
cp postcss.config.js postcss.config.js.backup
```

#### 5.2 自動移行ツール実行
```bash
# Tailwind CSS v4 移行ツール
npx @tailwindcss/upgrade

# 移行結果確認
npm run dev  # 基本動作確認
```

#### 5.3 手動設定移行
```css
/* src/app/globals.css 更新 */
/* @tailwind directives削除 */
@import "tailwindcss";

/* カスタムテーマをCSS変数で定義 */
@theme {
  --color-primary-50: #fff7ed;
  --color-primary-100: #ffedd5;
  /* ... 他のカラー設定 */
  
  --font-family-sans: Inter, "Noto Sans JP", system-ui, sans-serif;
  --font-family-mono: "Fira Code", monospace;
}

/* 既存の@layer構文はそのまま維持 */
@layer components {
  .btn-primary {
    @apply bg-orange-500 hover:bg-orange-600 text-white;
  }
  /* ... 他のコンポーネント */
}
```

#### 5.4 PostCSS設定更新
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // 新プラグイン
    autoprefixer: {},
  },
}
```

#### 5.5 Typography plugin確認
```css
/* v4では@pluginディレクティブでCSSに直接含める */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* 従来のJavaScript設定は不要 */
/* tailwind.config.js の plugins: [require('@tailwindcss/typography')] 削除 */
```

```bash
# v4対応: プラグインは直接CSSで指定するため、
# package.jsonからの削除を検討
npm uninstall @tailwindcss/typography

# 必要に応じてカスタマイズを@themeで再定義
```

### Step 6: 包括テスト

#### 6.1 開発環境テスト
```bash
# 開発サーバー
npm run dev
# http://localhost:3000 で全機能確認

# 型チェック
npm run type-check

# Lint確認
npm run lint
```

#### 6.2 ビルド・本番テスト
```bash
# 静的生成
npm run build

# 出力確認
ls -la out/
ls out/songs/ | wc -l  # 111楽曲確認

# 本番環境シミュレーション
npx serve out
# http://localhost:3000 で動作確認
```

#### 6.3 自動化テスト
```bash
# enhanced-deploy.js テスト
# 注意: 実際のデプロイは避け、dry-runモード実装推奨
npm run enhanced-deploy -- --dry-run
```

### Step 6: 本番デプロイ

#### 6.1 最終確認
```bash
# 変更内容レビュー
git diff main..HEAD

# コミット準備
git add .
git commit -m "feat: Upgrade to Next.js 15 + React 19

- Upgrade Next.js 14.2.4 → 15.x
- Upgrade React 18.3.1 → 19.x  
- Update @types/react and @types/react-dom to v19
- Migrate forwardRef to ref prop pattern
- Enhance DOMPurify SSR compatibility
- Resolve lucide-react peer dependency issues

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 6.2 デプロイ実行
```bash
# 本番デプロイ
npm run enhanced-deploy

# または手動デプロイ
git push origin upgrade/next15-react19
# GitHub Actions経由、またはmerge後のデプロイ
```

#### 6.3 デプロイ後監視
```yaml
Immediate Checks (15分以内):
  - サイトアクセス確認: https://jr6v5m2k.github.io/RotomSongs/
  - 楽曲詳細ページ: ランダムに5-10楽曲確認
  - 検索機能: 「ロトム」「家電」等でテスト
  - レスポンシブ: モバイル・タブレット確認

Performance Monitoring (24時間):
  - PageSpeed Insights実行
  - Core Web Vitals確認
  - エラーログ監視
  - アクセス解析確認
```

## 🔄 ロールバック計画

### 緊急ロールバック (1時間以内)

#### パターン1: 即座のGit revert
```bash
# 直前のコミットに戻す
git revert HEAD

# 緊急デプロイ
npm run enhanced-deploy

# または、安定版タグへの復帰
git checkout v1.0.0-stable
git push origin main --force  # 注意: 慎重に実行
```

#### パターン2: ブランチ切り替え
```bash
# main ブランチを安定版に戻す
git checkout main
git reset --hard v1.0.0-stable
git push origin main --force

# 即座にデプロイ
npm run enhanced-deploy
```

### 段階的ロールバック (半日)

#### 1. 部分的修正
```bash
# 特定の問題箇所のみ修正
git checkout HEAD~1 -- src/components/SearchInput.tsx
git commit -m "fix: Revert SearchInput to forwardRef pattern"
```

#### 2. 依存関係のみロールバック
```bash
# React/Next.jsのみダウングレード
npm install react@18.3.1 react-dom@18.3.1
npm install next@14.2.4
npm install @types/react@18.3.3 @types/react-dom@18.3.0 --save-dev

git commit -m "fix: Rollback to React 18 + Next.js 14"
```

## 📊 成功基準・KPI

### 機能要件 ✅
```yaml
必須機能 (100%動作):
  ✓ 楽曲一覧表示（111楽曲）
  ✓ 楽曲詳細表示
  ✓ Fuse.js検索機能
  ✓ オートコンプリート
  ✓ ページネーション
  ✓ レスポンシブデザイン
  ✓ SEO/メタデータ

品質要件:
  ✓ TypeScript型エラー: 0件
  ✓ ESLint警告: 0件
  ✓ ビルドエラー: 0件
  ✓ ランタイムエラー: 0件
```

### パフォーマンス要件 📈
```yaml
Core Web Vitals:
  - FCP (First Contentful Paint): ≤ 1.5s
  - LCP (Largest Contentful Paint): ≤ 2.5s  
  - TTI (Time to Interactive): ≤ 3.0s
  - CLS (Cumulative Layout Shift): ≤ 0.1

Build Performance:
  - ビルド時間: 前バージョン比 ±20%以内
  - Bundle size: 前バージョン比 ±10%以内
  
Search Performance:
  - 検索応答時間: ≤ 100ms (111楽曲)
  - オートコンプリート: ≤ 50ms
```

### 信頼性要件 🛡️
```yaml
Availability:
  - サイト稼働率: ≥ 99.9%
  - 検索機能稼働率: ≥ 99.5%

Error Handling:
  - JavaScript Error Rate: ≤ 0.1%
  - Network Error Recovery: 正常動作
  - Graceful Degradation: 対応済み

Security:
  - DOMPurify動作: 正常
  - CSP Headers: 維持
  - XSS防御: 維持
```

### 開発体験要件 🔧
```yaml
Development:
  - Dev server起動時間: 前バージョン比向上
  - Hot Reload: 正常動作
  - Type checking: 高速化
  
Automation:
  - enhanced-deploy.js: 正常動作
  - #rotomdeploy: 2分以内完了
  - CI/CD pipeline: 正常動作
```

## 📚 関連資料・参考情報

### 公式ドキュメント
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)

### 破壊的変更詳細
- Next.js 15: Async Request APIs, Caching Changes, Turbopack Stable
- React 19: forwardRef changes, useRef types, PropTypes removal

### Codemod Tools
```bash
# React 19自動移行
npx types-react-codemod@latest preset-19 ./src

# Next.js 15自動移行
npx @next/codemod@latest upgrade ./
```

### 依存関係互換性
- ✅ Zod, Fuse.js, Tailwind CSS: 完全互換
- ⚠️ Lucide React: peer dependency警告（機能は正常）
- ⚠️ DOMPurify: SSR対応強化必要
- ❓ Gray-matter: 古いライブラリ、要監視

## 📝 実行ログ・チェックリスト

### Pre-upgrade Checklist
- [ ] 現在の動作環境バックアップ
- [ ] Git tag作成 (v1.0.0-stable)
- [ ] 依存関係リスト保存
- [ ] 作業ブランチ作成

### Phase 1: 環境準備
- [ ] React 19インストール
- [ ] Next.js 15インストール  
- [ ] TypeScript型定義更新
- [ ] 基本動作確認

### Phase 2: コード修正
- [ ] forwardRef → ref prop移行
- [ ] useRef型定義確認
- [ ] DOMPurify ビルド時対応
- [ ] 依存関係問題解決

### Phase 3: Tailwind CSS v4 移行
- [ ] Node.js 20+ 環境確認
- [ ] 自動移行ツール実行
- [ ] CSS-first設定変換
- [ ] PostCSS設定更新
- [ ] Typography plugin確認

### Phase 4: テスト
- [ ] 機能テスト完了
- [ ] パフォーマンステスト
- [ ] ビルド・デプロイテスト
- [ ] クロスブラウザテスト

### Phase 4: 本番適用
- [ ] コードレビュー完了
- [ ] 本番デプロイ実行
- [ ] 稼働監視開始
- [ ] KPI確認完了

### Post-upgrade Tasks
- [ ] パフォーマンス改善提案
- [ ] 技術債務整理
- [ ] ドキュメント更新
- [ ] チーム知見共有

---

## 🎯 まとめ

このアップグレード計画は、RotomSongsプロジェクトの**持続可能な成長**を目的とした戦略的な技術投資です。

### 期待される効果
- **開発効率**: React Compiler自動最適化、Turbopack高速化
- **ユーザー体験**: パフォーマンス向上、より良いエラーハンドリング  
- **保守性**: 最新技術スタックによる長期サポート
- **技術的価値**: 2025年のベストプラクティス準拠

### 慎重なアプローチ
段階的移行とリスク管理により、**ゼロダウンタイム**でのアップグレードを実現します。万一の問題発生時も、確実なロールバック手順により迅速な復旧が可能です。

**成功の鍵**: 徹底したテスト、段階的実装、継続的監視

---

*Next.js 15 & React 19 アップグレード改修計画書 v1.0*  
*作成者: Claude Code*  
*最終更新: 2025年7月27日*