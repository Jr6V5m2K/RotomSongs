'use client';

import { useState, useEffect } from 'react';
import { SongListItem } from '@/types/song';
import { formatDateShort } from '@/lib/dateUtils';

interface SongListProps {
  initialSongs: SongListItem[];
  filteredSongs: SongListItem[];
  isSearching: boolean;
}

export default function SongList({ initialSongs, filteredSongs, isSearching }: SongListProps) {
  const [displayedSongs, setDisplayedSongs] = useState<SongListItem[]>([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  // 検索結果が変わったときの処理
  useEffect(() => {
    if (isSearching) {
      // 検索中は全て表示
      setDisplayedSongs(filteredSongs);
    } else {
      // 通常表示は6曲からスタート
      setDisplayedSongs(filteredSongs.slice(0, displayCount));
    }
  }, [filteredSongs, isSearching, displayCount]);

  const loadMoreSongs = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const nextCount = Math.min(displayCount + 6, initialSongs.length);
      setDisplayedSongs(initialSongs.slice(0, nextCount));
      setDisplayCount(nextCount);
      setIsLoading(false);
    }, 500);
  };

  const hasMoreSongs = !isSearching && displayCount < initialSongs.length;
  const showAllDisplayed = !isSearching && !hasMoreSongs && initialSongs.length > 6;

  return (
    <div>
      {/* 検索結果が空の場合 */}
      {isSearching && filteredSongs.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">検索結果が見つかりません</p>
          <p className="mt-2 text-sm text-gray-500">別のキーワードで検索してみてください。</p>
        </div>
      )}
      {/* 楽曲グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayedSongs.map((song) => (
          <div key={song.id} className="card card-hover">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {song.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {song.originalArtist} - {song.originalTitle}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {formatDateShort(song.id)}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 line-clamp-3 japanese-text">
                {song.lyricsPreview}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {song.sourceUrl ? (
                    <a
                      href={song.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      元ポストを見る
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">ソースなし</span>
                  )}
                </div>
                <a
                  href={`/songs/${song.slug}`}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
                >
                  詳細 →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* もっと見るボタン */}
      {hasMoreSongs && (
        <div className="text-center">
          <button
            onClick={loadMoreSongs}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                読み込み中...
              </div>
            ) : (
              `もっと見る（残り${initialSongs.length - displayCount}曲）`
            )}
          </button>
        </div>
      )}

      {/* すべて表示済みの場合 */}
      {showAllDisplayed && (
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            全{initialSongs.length}曲を表示しています
          </p>
        </div>
      )}
    </div>
  );
}
