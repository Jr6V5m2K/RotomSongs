#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * RotomSongs自動デプロイスクリプト
 * #rotomdeployハッシュタグでGitHub Pagesへの自動デプロイを実行
 */

const SONGS_DIR = path.join(__dirname, '../Songs');
const DEPLOY_TAG = '#rotomdeploy';

console.log('🎵 RotomSongs Auto Deploy Script');
console.log('=====================================');

try {
  // 1. Songsディレクトリの楽曲数をカウント（RotomSongsタグのみ）
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
  
  // 2. 最新の楽曲情報を取得（RotomSongsタグのファイルから）
  const latestSong = rotomSongFiles[rotomSongFiles.length - 1];
  const latestDate = latestSong ? latestSong.replace('.md', '').replace('_', ' ') : 'N/A';
  console.log(`🆕 Latest song: ${latestSong} (${latestDate})`);
  
  // 3. Gitの状態を確認
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (!gitStatus.trim()) {
    console.log('✅ No changes detected. Nothing to deploy.');
    return;
  }
  
  console.log('📝 Changes detected:');
  console.log(gitStatus);
  
  // 4. package.jsonの楽曲数を更新
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.description = `RotomSongs - 家電和歌集: ${totalSongs}曲の替え歌コレクション`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  // 5. メタデータの楽曲数を更新
  const metadataPath = path.join(__dirname, '../src/lib/metadata.ts');
  let metadata = fs.readFileSync(metadataPath, 'utf8');
  
  // 説明文の楽曲数を更新
  metadata = metadata.replace(
    /X（旧Twitter）で投稿された\d+曲の替え歌/g,
    `X（旧Twitter）で投稿された${totalSongs}曲の替え歌`
  );
  
  fs.writeFileSync(metadataPath, metadata);
  console.log(`📝 Updated metadata with ${totalSongs} songs`);
  
  // 6. ヘッダーの楽曲数を更新
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
  
  // 7. フッターの楽曲数を更新
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
  
  // 8. Next.jsビルドテスト
  console.log('🔨 Testing build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!');
  
  // 9. Gitコミット・プッシュ
  const commitMessage = `feat: Update song collection to ${totalSongs} songs

- Add/update songs in collection
- Auto-update song count in metadata, header, and footer components
- Latest song: ${latestSong}

${DEPLOY_TAG}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

  console.log('📤 Committing and pushing changes...');
  
  // ワークフローファイルを除外してadd
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

} catch (error) {
  console.error('❌ Deployment failed:');
  console.error(error.message);
  process.exit(1);
}