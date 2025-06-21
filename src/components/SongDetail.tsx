'use client';

import Link from 'next/link';
import { Song, SongListItem } from '@/types/song';
import { formatDateFromId, formatDateShort } from '@/lib/dateUtils';

interface SongDetailProps {
  song: Song;
  navigation: {
    prev: SongListItem | null;
    next: SongListItem | null;
  };
  relatedSongs: SongListItem[];
}

export default function SongDetail({ song, navigation, relatedSongs }: SongDetailProps) {
  const createdDateTime = formatDateFromId(song.id);
  const updatedDateTime = song.frontmatter.updated !== song.frontmatter.created 
    ? formatDateFromId(song.frontmatter.title) // titleはIDと同じ形式
    : null;

  // 関連楽曲を日付降順でソート
  const sortedRelatedSongs = relatedSongs.sort((a, b) => {
    const aTime = parseInt(String(a.id).replace('_', ''));
    const bTime = parseInt(String(b.id).replace('_', ''));
    return bTime - aTime;
  });

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: song.frontmatter.title,
          text: `${song.original.artist} - ${song.original.title}の替え歌`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('URLをコピーしました');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* パンくずナビ */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
          ホーム
        </Link>
        <span className="mx-2">›</span>
        <span>楽曲詳細</span>
      </nav>

      {/* メインコンテンツ */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* ヘッダー */}
        <header className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-8 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {song.frontmatter.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>投稿: {createdDateTime}</span>
                </div>
                
                {updatedDateTime && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>更新: {updatedDateTime}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* アクションボタン */}
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              {song.sourceUrl && (
                <a
                  href={song.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  元投稿を見る
                </a>
              )}
              
              <button
                className="btn-secondary text-sm"
                onClick={handleShare}
              >
                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                共有
              </button>
            </div>
          </div>
          
          {/* タグ */}
          {song.frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {song.frontmatter.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 替え歌歌詞 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                替え歌歌詞
              </h2>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <pre className="lyrics text-gray-800 whitespace-pre-wrap">
                  {song.lyrics}
                </pre>
              </div>
            </section>

            {/* 原曲情報 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                原曲情報
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">アーティスト</dt>
                      <dd className="text-lg text-gray-900 japanese-text">{song.original.artist}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">楽曲タイトル</dt>
                      <dd className="text-lg text-gray-900 japanese-text">{song.original.title}</dd>
                    </div>
                  </div>
                </div>

                {song.original.lyrics && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">原曲歌詞（抜粋）</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="lyrics text-gray-700 whitespace-pre-wrap">
                        {song.original.lyrics}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </article>

      {/* 同じ原曲の替え歌セクション */}
      {relatedSongs.length > 0 && (
        <section className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              同じ原曲の替え歌
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              「{song.original.artist} - {song.original.title}」を原曲とした他の替え歌です。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedRelatedSongs.map(relatedSong => (
                <Link
                  key={relatedSong.id}
                  href={`/songs/${relatedSong.slug}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {relatedSong.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedSong.lyricsPreview}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {formatDateShort(relatedSong.id)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ナビゲーション */}
      <nav className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex-1">
          {navigation.prev && (
            <Link
              href={`/songs/${navigation.prev.slug}`}
              className="group flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <div className="text-sm">前の楽曲</div>
                <div className="font-medium japanese-text">{navigation.prev.title}</div>
              </div>
            </Link>
          )}
        </div>

        <Link
          href="/"
          className="btn-secondary"
        >
          一覧に戻る
        </Link>

        <div className="flex-1 text-right">
          {navigation.next && (
            <Link
              href={`/songs/${navigation.next.slug}`}
              className="group flex items-center justify-end text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              <div className="text-right">
                <div className="text-sm">次の楽曲</div>
                <div className="font-medium japanese-text">{navigation.next.title}</div>
              </div>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
