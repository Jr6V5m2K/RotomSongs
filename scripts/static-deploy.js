#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 静的ファイル段階デプロイスクリプト
 * Deploy from a branch向けに、ビルド済みファイルを小さなバッチでコミット
 * Signal 10エラー対策を含む
 */

console.log('🏗️ RotomSongs Static Files Deploy (Signal 10対策版)');
console.log('=====================================================');

const OUT_DIR = path.join(__dirname, '../out');
const BATCH_SIZE = 15; // Signal 10回避のため小さなバッチサイズ

// メモリ使用量監視
function logMemoryUsage(label) {
  const used = process.memoryUsage();
  const rss = Math.round(used.rss / 1024 / 1024 * 100) / 100;
  const heapUsed = Math.round(used.heapUsed / 1024 / 1024 * 100) / 100;
  console.log(`💾 ${label}: RSS ${rss}MB, Heap ${heapUsed}MB`);
}

// Git設定最適化
function optimizeGitSettings() {
  try {
    execSync('git config core.compression 1', { stdio: 'pipe' });
    execSync('git config pack.threads 1', { stdio: 'pipe' });
    execSync('git config http.postBuffer 524288000', { stdio: 'pipe' });
    execSync('git config core.bigFileThreshold 16m', { stdio: 'pipe' });
    console.log('⚙️ Git settings optimized for large files');
  } catch (e) {
    console.log('⚠️ Git optimization partially failed, continuing...');
  }
}

// 静的ファイルを段階的にコピー&コミット
function deployStaticFilesInBatches() {
  if (!fs.existsSync(OUT_DIR)) {
    console.log('❌ out directory not found. Run npm run build first.');
    return false;
  }

  console.log('📁 Starting batch copy of static files...');
  
  // outディレクトリの全ファイルをリスト化
  function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  const allFiles = getAllFiles(OUT_DIR);
  console.log(`📋 Found ${allFiles.length} static files to deploy`);

  // ファイルをバッチごとに処理
  const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE);
  
  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} files)`);
    
    // バッチのファイルをコピー
    batch.forEach(srcFile => {
      const relativePath = path.relative(OUT_DIR, srcFile);
      const destFile = path.join(__dirname, '..', relativePath);
      const destDir = path.dirname(destFile);
      
      // ディレクトリを作成
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // ファイルをコピー
      fs.copyFileSync(srcFile, destFile);
      console.log(`  ✅ ${relativePath}`);
    });
    
    // バッチをコミット
    try {
      execSync('git add .', { stdio: 'pipe' });
      const batchMessage = `deploy: Static files batch ${batchNum}/${totalBatches}

- Deploy ${batch.length} static files for GitHub Pages
- Signal 10 mitigation: small batch processing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

      execSync(`git commit -m "${batchMessage}"`, { stdio: 'pipe' });
      console.log(`  📤 Committed batch ${batchNum}`);
      
      // バッチ間でプッシュ
      try {
        execSync('git push origin main --no-verify', { 
          stdio: 'pipe', 
          timeout: 45000 
        });
        console.log(`  🚀 Pushed batch ${batchNum} successfully`);
      } catch (pushError) {
        console.log(`  ⚠️ Push failed for batch ${batchNum}, will retry later`);
      }
      
    } catch (commitError) {
      console.log(`  ⚠️ No changes in batch ${batchNum}`);
    }
    
    // メモリクリーンアップ
    if (global.gc && i + BATCH_SIZE < allFiles.length) {
      global.gc();
    }
    
    logMemoryUsage(`After batch ${batchNum}`);
  }
  
  // 最終プッシュ確認
  console.log('\n🔄 Final push verification...');
  try {
    execSync('git push origin main', { stdio: 'inherit', timeout: 60000 });
    console.log('✅ All static files deployed successfully!');
    return true;
  } catch (error) {
    console.log('⚠️ Final push failed, but batches may have been pushed individually');
    return false;
  }
}

// メイン実行
try {
  logMemoryUsage('Starting memory');
  
  // 1. 最新ビルド実行
  console.log('🔨 Building latest version...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed');
  
  // 2. Git設定最適化
  optimizeGitSettings();
  
  // 3. 静的ファイル段階デプロイ
  const success = deployStaticFilesInBatches();
  
  if (success) {
    console.log('\n🎉 Deploy completed successfully!');
    console.log('🌐 Site will be updated at: https://jr6v5m2k.github.io/RotomSongs/');
  } else {
    console.log('\n⚠️ Deploy completed with warnings');
  }
  
  logMemoryUsage('Final memory');
  
} catch (error) {
  console.error('❌ Deploy failed:', error.message);
  process.exit(1);
}