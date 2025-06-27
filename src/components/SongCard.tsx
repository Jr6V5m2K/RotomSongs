'use client';

import Link from 'next/link';
import { SongListItem } from '@/types/song';
import { formatDateShort } from '@/lib/dateUtils';
import { sanitizeLyrics } from '@/lib/sanitize';

interface SongCardProps {
  song: SongListItem;
  variant?: 'default' | 'compact' | 'minimal';
  showLyrics?: boolean;
  showSource?: boolean;
  className?: string;
}

/**
 * 再利用可能な楽曲カードコンポーネント
 * 複数のレイアウトバリエーションに対応
 */
export default function SongCard({ 
  song, 
  variant = 'default',
  showLyrics = true,
  showSource = true,
  className = ''
}: SongCardProps) {
  // バリエーション別のスタイリング
  const getCardStyles = () => {
    const baseClasses = 'transition-all duration-200';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 ${className}`;
      
      case 'minimal':
        return `${baseClasses} block p-3 hover:bg-gray-50 rounded-md ${className}`;
      
      default:
        return `${baseClasses} card card-hover ${className}`;
    }
  };

  const getContentPadding = () => {
    switch (variant) {
      case 'compact':
      case 'minimal':
        return '';
      default:
        return 'p-6';
    }
  };

  // 楽曲カードのメインコンテンツ
  const renderCardContent = () => (
    <div className={getContentPadding()}>
      {/* ヘッダー部分：タイトル、アーティスト、日付 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 mb-1 ${
            variant === 'minimal' ? 'line-clamp-1' : 'line-clamp-2'
          }`}>
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
      
      {/* 歌詞プレビュー（showLyricsがtrueかつdefaultバリアントの場合） */}
      {showLyrics && variant === 'default' && (
        <div 
          className="text-sm text-gray-700 mb-4 line-clamp-3 japanese-text"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeLyrics(song.lyricsPreview) 
          }}
        />
      )}
      
      {/* フッター部分：ソースリンクと詳細リンク */}
      {(showSource || variant === 'default') && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showSource && song.sourceUrl ? (
              <a
                href={song.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()} // Link伝播を防ぐ
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                元ポストを見る
              </a>
            ) : showSource ? (
              <span className="text-xs text-gray-400">ソースなし</span>
            ) : null}
          </div>
          
          {variant === 'default' && (
            <span className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200">
              詳細 →
            </span>
          )}
        </div>
      )}
    </div>
  );

  // compact/minimal バリアントの場合はLinkで包む
  if (variant === 'compact' || variant === 'minimal') {
    return (
      <Link href={`/songs/${song.slug}`} className={getCardStyles()}>
        {renderCardContent()}
      </Link>
    );
  }

  // default バリアントの場合はdivとLinkを分離
  return (
    <div className={`${getCardStyles()} relative`}>
      {renderCardContent()}
      {/* 詳細リンクは別途配置 */}
      <Link
        href={`/songs/${song.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${song.title}の詳細を見る`}
      >
        <span className="sr-only">{song.title}の詳細を見る</span>
      </Link>
    </div>
  );
}

/**
 * 楽曲カードリスト用のラッパーコンポーネント
 * グリッドレイアウトの一貫性を保つ
 */
interface SongCardListProps {
  songs: SongListItem[];
  variant?: SongCardProps['variant'];
  showLyrics?: boolean;
  showSource?: boolean;
  className?: string;
  cardClassName?: string;
}

export function SongCardList({ 
  songs, 
  variant = 'default',
  showLyrics = true,
  showSource = true,
  className = '',
  cardClassName = ''
}: SongCardListProps) {
  const getGridClasses = () => {
    switch (variant) {
      case 'compact':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'minimal':
        return 'space-y-2';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          variant={variant}
          showLyrics={showLyrics}
          showSource={showSource}
          className={cardClassName}
        />
      ))}
    </div>
  );
}

/**
 * 検索結果用の楽曲カード（ハイライト対応）
 */
interface SearchResultCardProps extends SongCardProps {
  searchQuery?: string;
}

export function SearchResultCard({ 
  searchQuery, 
  ...props 
}: SearchResultCardProps) {
  // 検索クエリのハイライト機能は今後の拡張として予約
  // 現在は通常のSongCardと同じ動作
  return <SongCard {...props} />;
}