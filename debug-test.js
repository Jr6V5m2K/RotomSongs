#!/usr/bin/env node

// デバッグ用テストスクリプト
const { SongRepository } = require('./src/lib/songRepository.ts');

async function test() {
  console.log('🔍 Starting debug test...');
  const repository = new SongRepository();
  
  try {
    const songs = await repository.getAllSongs();
    console.log('🔍 Final result:', songs.length, 'songs');
  } catch (error) {
    console.error('🔍 Test error:', error);
  }
}

test();