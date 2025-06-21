'use client';

import { useState, useCallback, useEffect } from 'react';
import { SongListItem } from '@/types/song';
import SongList from '@/components/SongList';
import SearchBar from '@/components/SearchBar';
import { ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { formatDateShort } from '@/lib/dateUtils';

interface HomeContentProps {
  songs: SongListItem[];
}

export default function HomeContent({ songs }: HomeContentProps) {
  const [filteredSongs, setFilteredSongs] = useState<SongListItem[]>(songs);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ実行（Hydration Mismatch回避）
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 年度別楽曲を分類する関数
  const groupSongsByYear = useCallback((songs: SongListItem[]) => {
    try {
      const yearGroups: { [year: string]: SongListItem[] } = {};
      
      songs.forEach(song => {
        try {
          // ファイル名のIDから年度を確実に取得
          let year: string;
          
          // まずIDから年度を取得（20230209_1519 → 2023）
          const idMatch = song.id?.match(/^(\d{4})/);
          if (idMatch) {
            year = idMatch[1];
          } else {
            // フォールバック: createdフィールドから取得
            const createdStr = String(song.created || '');
            if (createdStr.includes('-')) {
              // YYYY-MM-DD 形式
              year = createdStr.substring(0, 4);
            } else {
              // YYYYMMDD_HHMM 形式
              year = createdStr.substring(0, 4);
            }
          }
          
          // 年度が有効でない場合はスキップ
          if (!year || !/^\d{4}$/.test(year)) {
            console.warn('Invalid year for song:', song);
            return;
          }
          
          if (!yearGroups[year]) {
            yearGroups[year] = [];
          }
          yearGroups[year].push(song);
        } catch (error) {
          console.error('Error processing song:', song, error);
        }
      });

      // 年度を降順でソート
      const sortedYears = Object.keys(yearGroups).sort((a, b) => b.localeCompare(a));
      return sortedYears.map(year => ({
        year,
        songs: yearGroups[year].sort((a, b) => {
          try {
            // IDベースで降順ソート（新しい順）
            const aTime = parseInt(String(a.id || '').replace('_', ''));
            const bTime = parseInt(String(b.id || '').replace('_', ''));
            return bTime - aTime;
          } catch (error) {
            console.error('Error sorting songs:', error);
            return 0;
          }
        }),
        count: yearGroups[year].length
      }));
    } catch (error) {
      console.error('Error grouping songs by year:', error);
      return [];
    }
  }, []);

  const yearlyGroups = groupSongsByYear(songs);

  // 年度の展開/折りたたみ切り替え
  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };


  // propsのsongsが変わった時にfilteredSongsを更新
  useEffect(() => {
    setFilteredSongs(songs);
    setIsSearching(false);
  }, [songs]);

  const handleSearch = useCallback((newFilteredSongs: SongListItem[]) => {
    setFilteredSongs(newFilteredSongs);
    setIsSearching(newFilteredSongs.length !== songs.length);
  }, [songs.length]);

  // データ検証
  if (!songs || !Array.isArray(songs)) {
    return (
      <div className="container-responsive py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">楽曲データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // クライアントサイドでのみレンダリング（重い処理）
  if (!isClient) {
    return (
      <div className="container-responsive py-8">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-8">
      {/* ヒーローセクション */}
      <section className="text-center py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* ヒーロー画像 */}
          <div className="mb-8">
            <img 
              src={`${process.env.NODE_ENV === 'production' ? '/RotomSongs' : ''}/images/hero.png`}
              alt="RotomSongs Hero" 
              className="w-32 h-32 md:w-40 md:h-40 mx-auto"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-orange-600">Rotom</span>Songs
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 japanese-text">
            家電和歌集
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-12 max-w-2xl mx-auto japanese-text">
            X（旧Twitter）で投稿された替え歌をまとめたコレクションサイトです。
            <br />
            2023年から現在まで、<span className="font-semibold text-orange-600">{songs.length}曲</span>の替え歌を収録しています。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#songs"
              className="btn-primary text-center"
            >
              楽曲を探す
            </a>
            <a
              href="https://x.com/Starlystrongest"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center"
            >
              X でフォロー
            </a>
          </div>
        </div>
      </section>

      {/* 検索セクション */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto">
          <SearchBar songs={songs} onSearch={handleSearch} />
        </div>
      </section>

      {/* 最新楽曲セクション */}
      <section id="songs" className="py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isSearching ? '検索結果' : '最新の楽曲'}
            </h2>
            <div className="text-sm text-gray-500">
              {isSearching 
                ? `${filteredSongs.length}曲見つかりました` 
                : `${songs.length}曲収録`
              }
            </div>
          </div>
          
          <SongList 
            initialSongs={songs} 
            filteredSongs={filteredSongs} 
            isSearching={isSearching} 
          />
        </div>
      </section>

      {/* 年度別楽曲セクション（検索時は非表示） */}
      {!isSearching && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">年度別楽曲</h2>
            
            <div className="space-y-4">
              {yearlyGroups.map(({ year, songs: yearSongs, count }) => (
                <div key={year} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {expandedYears.has(year) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <span className="text-lg font-semibold text-gray-900">
                        {year}年 ({count}件)
                      </span>
                    </div>
                  </button>
                  
                  {expandedYears.has(year) && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {yearSongs.map(song => (
                          <Link
                            key={song.id}
                            href={`/songs/${song.slug}`}
                            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
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
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* コレクションの特徴セクション（検索時は非表示） */}
      {!isSearching && (
        <section className="py-16 bg-white rounded-2xl shadow-sm border border-gray-200 mb-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              コレクションの特徴
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">豊富なコレクション</h3>
                <p className="text-gray-600 japanese-text">
                  2023年から継続的に投稿された{songs.length}曲の替え歌を、時系列順に整理して収録しています。
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">検索機能</h3>
                <p className="text-gray-600 japanese-text">
                  替え歌の歌詞に加え、原曲のタイトル・歌詞でも検索ができます。
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">原曲情報付き</h3>
                <p className="text-gray-600 japanese-text">
                  各替え歌には原曲のアーティスト、タイトル、歌詞情報を併記。元ネタも楽しめます。
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
