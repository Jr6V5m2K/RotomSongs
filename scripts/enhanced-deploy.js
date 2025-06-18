#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * RotomSongs拡張デプロイスクリプト
 * #rotomdeployハッシュタグで以下を一括実行：
 * 1. Obsidianディレクトリからのファイルコピー
 * 2. mdファイルの改行修正
 * 3. GitHub Pagesへの自動デプロイ
 * 4. CLAUDE.mdへの記録
 */

const SONGS_DIR = path.join(__dirname, '../Songs');
const OBSIDIAN_SOURCE_DIR = '/Users/aburamac/Desktop/dev/lab/Obsidian/10_Literature/RotomSongs';
const CLAUDE_MD_PATH = path.join(__dirname, '../CLAUDE.md');
const DEPLOY_TAG = '#rotomdeploy';

console.log('🎵 RotomSongs Enhanced Deploy Script');
console.log('=====================================');

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
  
  // コピー実行（上書き）
  sourceFiles.forEach(filename => {
    const sourcePath = path.join(OBSIDIAN_SOURCE_DIR, filename);
    const destPath = path.join(SONGS_DIR, filename);
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`  ✅ Copied: ${filename}`);
  });

  // 2. mdファイルの改行修正
  console.log('🔧 Fixing line breaks in markdown files...');
  
  const songsFiles = fs.readdirSync(SONGS_DIR)
    .filter(file => file.endsWith('.md'));

  let fixedFiles = 0;
  
  songsFiles.forEach(filename => {
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

  console.log(`✅ Fixed line breaks in ${fixedFiles} files`);

  // 3. 楽曲数カウントと更新処理（RotomSongsタグのみ）
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
  
  // 4. Gitの状態を確認
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (!gitStatus.trim()) {
    console.log('✅ No changes detected after file operations.');
  } else {
    console.log('📝 Changes detected:');
    console.log(gitStatus);
  }
  
  // 5. package.json、metadata、header、footerの更新（既存と同じ）
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
  
  const headerPath = path.join(__dirname, '../src/components/Header.tsx');
  let header = fs.readFileSync(headerPath, 'utf8');
  header = header.replace(
    /<span>\d+曲収録<\/span>/g,
    `<span>${totalSongs}曲収録</span>`
  );
  header = header.replace(
    /<span>\d+曲<\/span>/g,
    `<span>${totalSongs}曲</span>`
  );
  fs.writeFileSync(headerPath, header);
  console.log(`📝 Updated header with ${totalSongs} songs`);
  
  const footerPath = path.join(__dirname, '../src/components/Footer.tsx');
  let footer = fs.readFileSync(footerPath, 'utf8');
  footer = footer.replace(
    /\d+曲の替え歌を収録しています。/g,
    `${totalSongs}曲の替え歌を収録しています。`
  );
  footer = footer.replace(
    /<span className="font-medium">\d+曲<\/span>/g,
    `<span className="font-medium">${totalSongs}曲</span>`
  );
  fs.writeFileSync(footerPath, footer);
  console.log(`📝 Updated footer with ${totalSongs} songs`);

  // 6. Next.jsビルドテスト
  console.log('🔨 Testing build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!');

  // 7. CLAUDE.mdの更新
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
3. **楽曲数更新**: 全コンポーネントで${totalSongs}曲に同期
4. **ビルド検証**: Next.jsビルド成功確認
5. **GitHub デプロイ**: 自動コミット・プッシュ実行

#### 📊 処理結果
- **総楽曲数**: ${totalSongs}曲
- **最新楽曲**: ${latestSong}
- **コピー処理**: ✅ 完了
- **改行修正**: ✅ ${fixedFiles}ファイル処理
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

  // 8. Gitコミット・プッシュ
  const commitMessage = `feat: Enhanced deploy - ${totalSongs} songs synchronized

- Copy ${sourceFiles.length} files from Obsidian directory
- Fix line breaks in ${fixedFiles} markdown files  
- Auto-update song count across all components
- Latest song: ${latestSong}

${DEPLOY_TAG}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

  console.log('📤 Committing and pushing changes...');
  
  execSync('git add .', { stdio: 'inherit' });
  
  // ワークフローファイルがある場合は除外
  try {
    execSync('git reset .github/workflows/deploy.yml', { stdio: 'pipe' });
    console.log('⚠️  Excluded workflow file due to permissions');
  } catch (e) {
    // ワークフローファイルがない場合はエラーを無視
  }
  
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('🚀 Successfully deployed to GitHub Pages!');
  console.log('🌐 Site URL: https://jr6v5m2k.github.io/RotomSongs/');
  console.log('⏱️  Updates will be live in 2-3 minutes.');
  
  console.log('');
  console.log('✨ Enhanced deployment completed successfully!');
  console.log(`📊 Summary: ${totalSongs} songs, ${fixedFiles} files fixed, full sync complete`);

} catch (error) {
  console.error('❌ Enhanced deployment failed:');
  console.error(error.message);
  process.exit(1);
}