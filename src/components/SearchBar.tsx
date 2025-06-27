'use client';

import { useState, useEffect, useMemo } from 'react';
import { SongListItem } from '@/types/song';
import { quickSearch, getSearchEngine } from '@/lib/search';
import { SongSearchInput } from '@/components/SearchInput';

interface SearchBarProps {
  songs: SongListItem[];
  onSearch: (filteredSongs: SongListItem[]) => void;
}

export default function SearchBar({ songs, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 検索エンジンの初期化（メモ化でパフォーマンス最適化）
  const searchEngine = useMemo(() => {
    return getSearchEngine(songs);
  }, [songs]);

  useEffect(() => {
    if (!query.trim()) {
      setIsSearching(false);
      onSearch(songs);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    // デバウンス処理（Fuse.js使用）
    const timeoutId = setTimeout(() => {
      try {
        // Fuse.js高速検索実行
        const filteredSongs = quickSearch(songs, query);
        
        // 検索候補の生成
        const newSuggestions = searchEngine.getSuggestions(query, 5);
        setSuggestions(newSuggestions);
        
        onSearch(filteredSongs);
        setIsSearching(false);
      } catch (error) {
        console.error('Search error:', error);
        // フォールバック: 基本検索
        const searchTerm = query.toLowerCase().trim();
        const fallbackResults = songs.filter(song => {
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
        onSearch(fallbackResults);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, songs, onSearch, searchEngine]);

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // 少し遅延させてクリックイベントを処理できるようにする
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        {/* 検索入力フィールド */}
        <SongSearchInput
          value={query}
          onChange={setQuery}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClear={handleClear}
          isLoading={isSearching}
          showClearButton={true}
          aria-describedby={query ? "search-results" : undefined}
        />

        {/* 検索候補ドロップダウン */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 first:rounded-t-lg last:rounded-b-lg transition-colors duration-150"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* 検索結果情報 */}
      {query && !isSearching && (
        <div id="search-results" className="mt-2 text-sm text-gray-600 text-center">
          「{query}」の検索結果
        </div>
      )}
    </div>
  );
}
