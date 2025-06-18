'use client';

import { useState, useCallback, useEffect } from 'react';
import { SongListItem } from '@/types/song';
import SongList from '@/components/SongList';
import SearchBar from '@/components/SearchBar';

interface HomeContentProps {
  songs: SongListItem[];
}

export default function HomeContent({ songs }: HomeContentProps) {
  const [filteredSongs, setFilteredSongs] = useState<SongListItem[]>(songs);
  const [isSearching, setIsSearching] = useState(false);


  // propsのsongsが変わった時にfilteredSongsを更新
  useEffect(() => {
    setFilteredSongs(songs);
    setIsSearching(false);
  }, [songs]);

  const handleSearch = useCallback((newFilteredSongs: SongListItem[]) => {
    setFilteredSongs(newFilteredSongs);
    setIsSearching(newFilteredSongs.length !== songs.length);
  }, [songs.length]);

  return (
    <div className="container-responsive py-8">
      {/* ヒーローセクション */}
      <section className="text-center py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-orange-600">Rotom</span>Songs
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 japanese-text">
            家電和歌集
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-12 max-w-2xl mx-auto japanese-text">
            X（旧Twitter）で投稿された替え歌を体系的にまとめたコレクションサイトです。
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
