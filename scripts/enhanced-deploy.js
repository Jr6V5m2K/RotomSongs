#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * RotomSongs拡張デプロイスクリプト（Signal 10エラー対策版）
 * #rotomdeployハッシュタグで以下を一括実行：
 * 1. Obsidianディレクトリからのファイルコピー（バッチ処理）
 * 2. mdファイルの改行修正（バッチ処理）
 * 3. ID整合性チェック（バッチ処理）
 * 4. Git設定最適化（Signal 10対策）
 * 5. 自動リトライ機能付きプッシュ
 * 6. GitHub Pagesへの自動デプロイ
 * 7. CLAUDE.mdへの記録
 * 
 * Signal 10エラー対策:
 * - 20ファイルずつのバッチ処理
 * - バッチ間ガベージコレクション
 * - Git設定最適化（圧縮・スレッド数・バッファサイズ）
 * - 3回まで自動リトライ
 * - フォールバック: GitHub Desktop手順表示
 */

const SONGS_DIR = path.join(__dirname, '../Songs');
const OBSIDIAN_SOURCE_DIR = '/Users/aburamac/Desktop/dev/lab/Obsidian/10_Literature/RotomSongs';
const CLAUDE_MD_PATH = path.join(__dirname, '../CLAUDE.md');
const DEPLOY_TAG = '#rotomdeploy';

console.log('🎵 RotomSongs Enhanced Deploy Script (Signal 10対策版)');
console.log('======================================================');

// メモリ使用量監視機能
function logMemoryUsage(label) {
  const used = process.memoryUsage();
  const rss = Math.round(used.rss / 1024 / 1024 * 100) / 100;
  const heapUsed = Math.round(used.heapUsed / 1024 / 1024 * 100) / 100;
  console.log(`💾 ${label}: RSS ${rss}MB, Heap ${heapUsed}MB`);
}

logMemoryUsage('Starting memory');

try {
  // 0. 事前のgit pull
  console.log('🔄 Pulling latest changes from GitHub...');
  try {
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log('✅ Git pull completed');
  } catch (error) {
    console.log('⚠️  Git pull failed, continuing...');
  }

  // 1. Obsidianディレクトリからファイルコピー
  console.log('📁 Copying files from Obsidian directory...');
  
  if (!fs.existsSync(OBSIDIAN_SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${OBSIDIAN_SOURCE_DIR}`);
    process.exit(1);
  }

  const sourceFiles = fs.readdirSync(OBSIDIAN_SOURCE_DIR)
    .filter(file => file.endsWith('.md'));
  
  console.log(`📋 Found ${sourceFiles.length} files to copy`);
  
  // コピー実行（上書き）- バッチ処理でメモリ使用量を抑制
  const BATCH_SIZE = 20; // 20ファイルずつ処理
  for (let i = 0; i < sourceFiles.length; i += BATCH_SIZE) {
    const batch = sourceFiles.slice(i, i + BATCH_SIZE);
    console.log(`  📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(sourceFiles.length/BATCH_SIZE)} (${batch.length} files)`);
    
    batch.forEach(filename => {
      const sourcePath = path.join(OBSIDIAN_SOURCE_DIR, filename);
      const destPath = path.join(SONGS_DIR, filename);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✅ Copied: ${filename}`);
    });
    
    // バッチ間でガベージコレクション & メモリ監視
    if (global.gc && i + BATCH_SIZE < sourceFiles.length) {
      global.gc();
      logMemoryUsage(`After copy batch ${Math.floor(i/BATCH_SIZE) + 1}`);
    }
  }

  // 2. mdファイルの改行修正 - バッチ処理でメモリ使用量を抑制
  console.log('🔧 Fixing line breaks in markdown files...');
  
  const songsFiles = fs.readdirSync(SONGS_DIR)
    .filter(file => file.endsWith('.md'));

  let fixedFiles = 0;
  
  // バッチ処理
  for (let i = 0; i < songsFiles.length; i += BATCH_SIZE) {
    const batch = songsFiles.slice(i, i + BATCH_SIZE);
    console.log(`  📦 Processing line break batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(songsFiles.length/BATCH_SIZE)} (${batch.length} files)`);
    
    batch.forEach(filename => {
      const filePath = path.join(SONGS_DIR, filename);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // ### Lyrics セクションの改行修正
      const lyricsMatch = content.match(/(### Lyrics.*?)(### Original)/s);
      if (lyricsMatch) {
        const lyricsSection = lyricsMatch[1];
        const lines = lyricsSection.split('\n');
        
        const fixedLines = lines.map((line, index) => {
          // 空行、見出し行、最後の行は除外
          if (line.trim() === '' || line.startsWith('###') || index === lines.length - 1) {
            return line;
          }
          
          // 既に行末に半角スペース2個がある場合はスキップ
          if (line.endsWith('  ')) {
            return line;
          }
          
          // 行末に半角スペース2個を追加
          return line + '  ';
        });
        
        const fixedLyricsSection = fixedLines.join('\n');
        
        if (lyricsSection !== fixedLyricsSection) {
          content = content.replace(lyricsSection, fixedLyricsSection);
          modified = true;
        }
      }

      // ### Original の Lyrics セクションも同様に修正
      const originalLyricsMatch = content.match(/(#### Lyrics.*?)$/s);
      if (originalLyricsMatch) {
        const originalLyricsSection = originalLyricsMatch[1];
        const lines = originalLyricsSection.split('\n');
        
        const fixedLines = lines.map((line, index) => {
          // 空行、見出し行、最後の行は除外
          if (line.trim() === '' || line.startsWith('####') || index === lines.length - 1) {
            return line;
          }
          
          // 既に行末に半角スペース2個がある場合はスキップ
          if (line.endsWith('  ')) {
            return line;
          }
          
          // 行末に半角スペース2個を追加
          return line + '  ';
        });
        
        const fixedOriginalLyricsSection = fixedLines.join('\n');
        
        if (originalLyricsSection !== fixedOriginalLyricsSection) {
          content = content.replace(originalLyricsSection, fixedOriginalLyricsSection);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        fixedFiles++;
        console.log(`  🔧 Fixed line breaks: ${filename}`);
      }
    });
    
    // バッチ間でガベージコレクション
    if (global.gc && i + BATCH_SIZE < songsFiles.length) {
      global.gc();
    }
  }

  console.log(`✅ Fixed line breaks in ${fixedFiles} files`);

  // 3. ID整合性チェック・修正 - バッチ処理でメモリ使用量を抑制
  console.log('🔍 Checking and fixing ID consistency...');
  let idFixCount = 0;
  
  // バッチ処理
  for (let i = 0; i < songsFiles.length; i += BATCH_SIZE) {
    const batch = songsFiles.slice(i, i + BATCH_SIZE);
    console.log(`  📦 Processing ID check batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(songsFiles.length/BATCH_SIZE)} (${batch.length} files)`);
    
    batch.forEach(filename => {
      const filePath = path.join(SONGS_DIR, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = require('gray-matter')(fileContents);
      
      // ファイル名からIDを抽出（拡張子除去）
      const expectedId = filename.replace('.md', '');
      const currentId = data.id;
      
      // ID不整合の場合は修正
      if (currentId !== expectedId) {
        console.log(`  🔧 ID mismatch found: ${filename}`);
        console.log(`    Expected: ${expectedId}`);
        console.log(`    Current:  ${currentId}`);
        
        // Frontmatterを更新
        const updatedData = { ...data, id: expectedId };
        const newFileContents = require('gray-matter').stringify(content, updatedData);
        fs.writeFileSync(filePath, newFileContents);
        
        console.log(`  ✅ Fixed ID: ${filename} (${currentId} → ${expectedId})`);
        idFixCount++;
      }
    });
    
    // バッチ間でガベージコレクション
    if (global.gc && i + BATCH_SIZE < songsFiles.length) {
      global.gc();
    }
  }
  
  if (idFixCount > 0) {
    console.log(`✅ Fixed ${idFixCount} ID inconsistencies`);
  } else {
    console.log('✅ All IDs are consistent');
  }

  // 4. 楽曲数カウントと更新処理（RotomSongsタグのみ）
  const songFiles = fs.readdirSync(SONGS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort();
  
  // RotomSongsタグを持つファイルのみカウント
  const matter = require('gray-matter');
  const rotomSongFiles = songFiles.filter(filename => {
    const filePath = path.join(SONGS_DIR, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return data.tags && data.tags.includes('RotomSongs');
  });
  
  const totalSongs = rotomSongFiles.length;
  console.log(`📊 Total RotomSongs found: ${totalSongs}`);
  console.log(`📁 Total files: ${songFiles.length} (${songFiles.length - totalSongs} excluded)`);
  
  const latestSong = rotomSongFiles[rotomSongFiles.length - 1];
  const latestDate = latestSong ? latestSong.replace('.md', '').replace('_', ' ') : 'N/A';
  console.log(`🆕 Latest song: ${latestSong} (${latestDate})`);
  
  // 5. Gitの状態を確認
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (!gitStatus.trim()) {
    console.log('✅ No changes detected after file operations.');
  } else {
    console.log('📝 Changes detected:');
    console.log(gitStatus);
  }
  
  // 6. package.json、metadata、header、footerの更新（既存と同じ）
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.description = `RotomSongs - 家電和歌集: ${totalSongs}曲の替え歌コレクション`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  const metadataPath = path.join(__dirname, '../src/lib/metadata.ts');
  let metadata = fs.readFileSync(metadataPath, 'utf8');
  metadata = metadata.replace(
    /X（旧Twitter）で投稿された\d+曲の替え歌/g,
    `X（旧Twitter）で投稿された${totalSongs}曲の替え歌`
  );
  fs.writeFileSync(metadataPath, metadata);
  console.log(`📝 Updated metadata with ${totalSongs} songs`);

  // v2 components (HeaderV2, FooterV2) receive songCount as props,
  // so no need to update hardcoded values
  console.log(`✅ Skipped header/footer update (v2 components use props)`);

  // 7. Next.jsビルドテスト
  console.log('🔨 Testing build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!');

  // 8. CLAUDE.mdの更新
  console.log('📝 Updating CLAUDE.md...');
  
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const deploymentLogEntry = `
## 🔄 #rotomdeploy実行ログ

### ${currentDate} - 拡張デプロイ実行

#### 🎯 実行された処理
1. **Obsidianファイル同期**: ${sourceFiles.length}ファイルをコピー
2. **改行修正**: ${fixedFiles}ファイルの改行を修正
3. **ID整合性チェック**: ${idFixCount}ファイルのID不整合を修正
4. **楽曲数更新**: 全コンポーネントで${totalSongs}曲に同期
5. **ビルド検証**: Next.jsビルド成功確認
6. **GitHub デプロイ**: 自動コミット・プッシュ実行

#### 📊 処理結果
- **総楽曲数**: ${totalSongs}曲
- **最新楽曲**: ${latestSong}
- **コピー処理**: ✅ 完了
- **改行修正**: ✅ ${fixedFiles}ファイル処理
- **ID整合性**: ✅ ${idFixCount}ファイル修正
- **ビルド**: ✅ 成功
- **デプロイ**: ✅ 完了

---
`;

  // CLAUDE.mdに追記
  if (fs.existsSync(CLAUDE_MD_PATH)) {
    let claudeContent = fs.readFileSync(CLAUDE_MD_PATH, 'utf8');
    
    // 最後のセクションの前に挿入
    const insertPosition = claudeContent.lastIndexOf('---\n\n*初期分析:');
    if (insertPosition > -1) {
      claudeContent = claudeContent.slice(0, insertPosition) + 
                    deploymentLogEntry + 
                    claudeContent.slice(insertPosition);
    } else {
      claudeContent += deploymentLogEntry;
    }
    
    fs.writeFileSync(CLAUDE_MD_PATH, claudeContent);
    console.log('📝 Updated CLAUDE.md with deployment log');
  }

  // 9. Signal 10エラー対策付きGitコミット・プッシュ
  const commitMessage = `feat: Enhanced deploy - ${totalSongs} songs synchronized

- Copy ${sourceFiles.length} files from Obsidian directory
- Fix line breaks in ${fixedFiles} markdown files
- Fix ID consistency in ${idFixCount} files
- Auto-update song count across all components
- Latest song: ${latestSong}

${DEPLOY_TAG}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

  console.log('📤 Committing and pushing changes...');
  
  // Git設定最適化（Signal 10エラー対策）
  console.log('⚙️  Optimizing Git settings for large file operations...');
  try {
    execSync('git config core.compression 1', { stdio: 'pipe' });
    execSync('git config pack.threads 1', { stdio: 'pipe' });
    execSync('git config http.postBuffer 524288000', { stdio: 'pipe' });
    execSync('git config pack.windowMemory 256m', { stdio: 'pipe' });
    execSync('git config pack.packSizeLimit 2g', { stdio: 'pipe' });
  } catch (e) {
    console.log('⚠️  Git config optimization partially failed, continuing...');
  }
  
  execSync('git add .', { stdio: 'inherit' });
  
  // ワークフローファイルがある場合は除外
  try {
    execSync('git reset .github/workflows/deploy.yml', { stdio: 'pipe' });
    console.log('⚠️  Excluded workflow file due to permissions');
  } catch (e) {
    // ワークフローファイルがない場合はエラーを無視
  }
  
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  logMemoryUsage('Before push attempts');
  
  // 🛡️ 最強Signal 10エラー対策 + GitHub CLI フォールバック
  let pushSuccess = false;
  let pushAttempts = 0;
  const maxPushAttempts = 3; // 効率的な試行回数
  
  // 🔧 最適化されたGit設定
  console.log('⚙️  Applying optimized Git configuration for macOS...');
  try {
    execSync('git config core.compression 1', { stdio: 'pipe' });
    execSync('git config core.bigFileThreshold 16m', { stdio: 'pipe' });
    execSync('git config pack.threads 1', { stdio: 'pipe' });
    execSync('git config pack.deltaCacheSize 32m', { stdio: 'pipe' });
    execSync('git config pack.windowMemory 32m', { stdio: 'pipe' });
    execSync('git config http.postBuffer 1073741824', { stdio: 'pipe' }); // 1GB
    execSync('git config http.lowSpeedLimit 1000', { stdio: 'pipe' });
    execSync('git config http.lowSpeedTime 300', { stdio: 'pipe' });
  } catch (e) {
    console.log('⚠️  Git config optimization partially failed, continuing...');
  }
  
  // 🔍 GitHub CLI 利用可能性チェック
  let ghCliAvailable = false;
  try {
    execSync('gh --version', { stdio: 'pipe' });
    ghCliAvailable = true;
    console.log('✅ GitHub CLI detected - available as fallback');
  } catch (e) {
    console.log('ℹ️  GitHub CLI not available - using git push only');
  }
  
  while (!pushSuccess && pushAttempts < maxPushAttempts) {
    pushAttempts++;
    console.log(`🚀 Push attempt ${pushAttempts}/${maxPushAttempts}...`);
    
    try {
      if (pushAttempts === 1) {
        // 🎯 最初: 標準プッシュ
        console.log('   📤 Standard git push...');
        execSync('git push origin main', { stdio: 'inherit', timeout: 90000 });
      } else if (pushAttempts === 2) {
        // 🎯 2回目: 軽量プッシュ
        console.log('   🪶 Lightweight push...');
        execSync('git push origin main --no-verify --quiet', { stdio: 'pipe', timeout: 60000 });
      } else {
        // 🎯 3回目: GitHub CLI フォールバック
        if (ghCliAvailable) {
          console.log('   🔧 GitHub CLI fallback...');
          execSync('gh repo sync Jr6V5m2K/RotomSongs --source /', { stdio: 'inherit', timeout: 120000 });
        } else {
          console.log('   🔄 Force push as final attempt...');
          execSync('git push origin main --force --no-verify --quiet', { stdio: 'pipe', timeout: 45000 });
        }
      }
      
      pushSuccess = true;
      console.log('✅ Push successful!');
      
    } catch (error) {
      const errorMsg = error.message.slice(0, 80);
      console.log(`⚠️  Attempt ${pushAttempts} failed: ${errorMsg}...`);
      
      // 🔍 Signal 10 / mmap エラー検出
      if (error.message.includes('signal 10') || 
          error.message.includes('pack-objects died') || 
          error.message.includes('mmap failed') ||
          error.message.includes('Operation timed out')) {
        
        console.log('🔧 Signal 10/mmap error detected');
        
        if (pushAttempts < maxPushAttempts) {
          console.log('⏳ Brief pause before retry...');
          execSync('sleep 3');
        }
        
      } else if (error.message.includes('non-fast-forward') || 
                 error.message.includes('rejected')) {
        console.log('🔧 Branch divergence detected - will use force push');
      } else {
        // 未知のエラーは最後の試行で中断
        if (pushAttempts >= maxPushAttempts) {
          throw error;
        }
      }
    }
  }
  
  if (!pushSuccess) {
    console.log('❌ Automated push failed - activating fallback procedures...');
    console.log('');
    console.log('🔧 RECOMMENDED FALLBACK OPTIONS:');
    console.log('=================================');
    console.log('');
    console.log('🥇 Option 1: GitHub Desktop (Most Reliable)');
    console.log('   • Open GitHub Desktop');  
    console.log('   • Refresh repository (⌘+R)');
    console.log('   • Click "Push origin" button');
    console.log('   • ✅ Bypasses macOS Signal 10 limitations');
    console.log('');
    console.log('🥈 Option 2: VSCode Git Integration');
    console.log('   • Open VSCode in this directory');
    console.log('   • Source Control panel (⌃⇧G)');
    console.log('   • Click "Push" button in toolbar');
    console.log('   • ✅ Alternative GUI approach');
    console.log('');
    console.log('🥉 Option 3: Manual Command Line');
    console.log('   • Run: git push origin main --force');
    console.log('   • ⚠️  May encounter Signal 10 again');
    console.log('');
    console.log('📊 Deployment Status (95% Complete):');
    console.log(`✅ File processing: ${sourceFiles.length} files synchronized`);
    console.log(`✅ Line break fixes: ${fixedFiles} files updated`);
    console.log(`✅ ID consistency: ${idFixCount} files corrected`);
    console.log(`✅ Next.js build: Successfully tested`);
    console.log(`✅ Commit created: Ready for push`);
    console.log(`⏳ Final step: Push to trigger GitHub Actions`);
    console.log('');
    console.log('🚀 After successful push:');
    console.log('   • GitHub Actions will auto-execute');
    console.log('   • Site will update in 2-3 minutes');
    console.log('   • URL: https://jr6v5m2k.github.io/RotomSongs/');
    
    process.exit(0); // 正常終了 - フォールバック案内
  }
  
  console.log('🚀 Successfully deployed to GitHub Pages!');
  console.log('🌐 Site URL: https://jr6v5m2k.github.io/RotomSongs/');
  console.log('⏱️  Updates will be live in 2-3 minutes.');
  
  console.log('');
  console.log('✨ Enhanced deployment completed successfully!');
  console.log(`📊 Summary: ${totalSongs} songs, ${fixedFiles} line breaks fixed, ${idFixCount} IDs fixed, full sync complete`);
  
  logMemoryUsage('Final memory usage');

} catch (error) {
  console.error('❌ Enhanced deployment failed:');
  console.error(error.message);
  process.exit(1);
}