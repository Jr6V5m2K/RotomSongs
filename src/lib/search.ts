import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import { SongListItem } from '@/types/song';
import { sanitizeSearchQuery } from './sanitize';

/**
 * Fuse.js検索エンジンの設定
 * 日本語テキスト検索に最適化された設定
 */
const searchOptions: IFuseOptions<SongListItem> = {
  // 検索対象フィールドの設定（重要度順）
  keys: [
    { name: 'title', weight: 0.3 },           // 楽曲タイトル（最重要）
    { name: 'lyrics', weight: 0.25 },         // 替え歌歌詞
    { name: 'originalTitle', weight: 0.2 },   // 原曲タイトル
    { name: 'originalArtist', weight: 0.15 }, // アーティスト名
    { name: 'originalLyrics', weight: 0.1 }   // 原曲歌詞
  ],
  
  // 検索精度の設定
  threshold: 0.4,        // 0.0 (完全一致) ～ 1.0 (任意一致)
  distance: 100,         // 検索語が離れていても許容する距離
  minMatchCharLength: 1, // 最小マッチ文字数
  
  // 結果の詳細情報を含める
  includeScore: true,
  includeMatches: true,
  
  // 日本語検索の最適化
  ignoreLocation: true,  // 文字位置を無視（日本語は語順が柔軟）
  findAllMatches: true,  // 全てのマッチを検索
  shouldSort: true       // スコア順ソート
};

/**
 * 検索結果とマッチング詳細
 */
export interface SearchResult {
  song: SongListItem;
  score: number;
  matches: FuseResult<SongListItem>['matches'];
}

/**
 * 高性能ファジー検索エンジンクラス
 */
export class SongSearchEngine {
  private fuse: Fuse<SongListItem>;
  private songs: SongListItem[];

  constructor(songs: SongListItem[]) {
    this.songs = songs;
    this.fuse = new Fuse(songs, searchOptions);
  }

  /**
   * 楽曲検索の実行
   * @param query 検索クエリ
   * @param limit 結果件数制限（デフォルト: 制限なし）
   * @returns 検索結果配列
   */
  search(query: string, limit?: number): SearchResult[] {
    // 安全な検索クエリに変換
    const sanitizedQuery = sanitizeSearchQuery(query);
    
    if (!sanitizedQuery.trim()) {
      return this.songs.map(song => ({
        song,
        score: 0,
        matches: []
      }));
    }

    // Fuse.js検索実行
    const fuseResults = limit 
      ? this.fuse.search(sanitizedQuery, { limit })
      : this.fuse.search(sanitizedQuery);
    
    return fuseResults.map(result => ({
      song: result.item,
      score: result.score || 0,
      matches: result.matches || []
    }));
  }

  /**
   * 楽曲データ更新
   * @param newSongs 新しい楽曲データ
   */
  updateSongs(newSongs: SongListItem[]): void {
    this.songs = newSongs;
    this.fuse = new Fuse(newSongs, searchOptions);
  }

  /**
   * 検索候補の生成（オートコンプリート用）
   * @param query 部分的な検索クエリ
   * @param maxSuggestions 最大候補数
   * @returns 検索候補配列
   */
  getSuggestions(query: string, maxSuggestions: number = 5): string[] {
    const sanitizedQuery = sanitizeSearchQuery(query).toLowerCase();
    
    if (sanitizedQuery.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    
    // タイトルからの候補抽出
    this.songs.forEach(song => {
      if (song.title.toLowerCase().includes(sanitizedQuery)) {
        suggestions.add(song.title);
      }
      if (song.originalTitle.toLowerCase().includes(sanitizedQuery)) {
        suggestions.add(song.originalTitle);
      }
      if (song.originalArtist.toLowerCase().includes(sanitizedQuery)) {
        suggestions.add(song.originalArtist);
      }
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * 人気検索キーワードの取得
   * @param limit 取得件数
   * @returns 人気キーワード配列
   */
  getPopularKeywords(limit: number = 10): string[] {
    // アーティスト別楽曲数でソート
    const artistCount = this.songs.reduce((acc, song) => {
      acc[song.originalArtist] = (acc[song.originalArtist] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(artistCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([artist]) => artist);
  }

  /**
   * 統計情報の取得
   */
  getStats() {
    return {
      totalSongs: this.songs.length,
      artists: new Set(this.songs.map(s => s.originalArtist)).size,
      tags: new Set(this.songs.flatMap(s => s.tags)).size
    };
  }
}

/**
 * グローバル検索エンジンインスタンス（シングルトン）
 * パフォーマンス最適化のため、アプリケーション全体で共有
 */
let globalSearchEngine: SongSearchEngine | null = null;

/**
 * 検索エンジンインスタンスの取得/初期化
 * @param songs 楽曲データ（初期化時のみ必要）
 * @returns 検索エンジンインスタンス
 */
export function getSearchEngine(songs?: SongListItem[]): SongSearchEngine {
  if (!globalSearchEngine && songs) {
    globalSearchEngine = new SongSearchEngine(songs);
  } else if (globalSearchEngine && songs) {
    // データ更新
    globalSearchEngine.updateSongs(songs);
  }
  
  if (!globalSearchEngine) {
    throw new Error('Search engine not initialized. Provide songs data first.');
  }
  
  return globalSearchEngine;
}

/**
 * クイック検索（コンポーネントから直接使用）
 * @param songs 楽曲データ
 * @param query 検索クエリ
 * @param limit 結果件数制限
 * @returns 楽曲配列
 */
export function quickSearch(
  songs: SongListItem[], 
  query: string, 
  limit?: number
): SongListItem[] {
  const engine = getSearchEngine(songs);
  const results = engine.search(query, limit);
  return results.map(result => result.song);
}