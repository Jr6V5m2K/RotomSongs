'use client';

import { useState, useEffect } from 'react';
import { SongListItem } from '@/types/song';

interface SearchBarProps {
  songs: SongListItem[];
  onSearch: (filteredSongs: SongListItem[]) => void;
}

export default function SearchBar({ songs, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setIsSearching(false);
      onSearch(songs);
      return;
    }

    setIsSearching(true);
    
    // デバウンス処理
    const timeoutId = setTimeout(() => {
      const searchTerm = query.toLowerCase().trim();
      
      const filteredSongs = songs.filter(song => {
        const searchableText = [
          song.title,
          song.originalArtist,
          song.originalTitle,
          song.lyrics,
          song.originalLyrics,
          song.tags.join(' ')
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
      
      onSearch(filteredSongs);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, songs, onSearch]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        {/* 検索アイコン */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* 検索入力フィールド */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="替え歌の歌詞、原曲のタイトル・アーティストで検索..."
          className="search-input pl-10 pr-12 py-3 text-base"
        />

        {/* クリアボタンとローディング */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isSearching ? (
            <svg 
              className="animate-spin h-5 w-5 text-orange-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : query && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 検索結果情報 */}
      {query && !isSearching && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          「{query}」の検索結果
        </div>
      )}
    </div>
  );
}
