'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Song, SongListItem } from '@/types/song';
import { formatDateFromId, formatDateShort } from '@/lib/dateUtils';
import { sanitizeLyrics } from '@/lib/sanitize';

interface SongDetailV2Props {
    song: Song;
    navigation: {
        prev: SongListItem | null;
        next: SongListItem | null;
    };
    relatedSongs: SongListItem[];
}

export default function SongDetailV2({ song, navigation, relatedSongs }: SongDetailV2Props) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!song || !song.id) {
        return (
            <div className="container-responsive py-20 text-center">
                <p className="text-stone-500 font-serif">楽曲データを読み込んでいます...</p>
            </div>
        );
    }

    const createdDateTime = formatDateFromId(song.id);

    const sortedRelatedSongs = (relatedSongs || []).sort((a, b) => {
        try {
            const aTime = parseInt(String(a.id || '').replace('_', ''));
            const bTime = parseInt(String(b.id || '').replace('_', ''));
            return bTime - aTime;
        } catch (error) {
            console.error('Error sorting related songs:', error);
            return 0;
        }
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
        <div className="container-responsive py-12 md:py-16">
            {/* Breadcrumb */}
            <nav className="text-xs md:text-sm text-stone-400 mb-8 font-serif">
                <Link href="/" className="hover:text-red-800 transition-colors duration-200">
                    ホーム
                </Link>
                <span className="mx-2">›</span>
                <span className="text-stone-600">楽曲詳細</span>
            </nav>

            <article className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xs border border-white/60 mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-xl md:text-3xl font-serif text-stone-800 mb-2 leading-tight">
                                    {song.original.title}
                                </h1>
                                <div className="text-stone-500 font-serif text-base md:text-xl mb-4">
                                        {song.original.artist}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 text-xs md:text-sm text-stone-500 font-sans tracking-wide">
                                    <div className="flex items-center gap-2">
                                        <span>POSTED: {createdDateTime}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {song.sourceUrl && (
                                    <a
                                        href={song.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-stone-200 hover:bg-orange-600 text-stone-600 hover:text-stone-100 rounded-full font-serif text-xs md:text-sm font-semibold transition-colors"
                                    >
                                        元投稿
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-linear-to-br from-orange-100/30 to-red-100/30 rounded-full blur-3xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Lyrics Section */}
                    <section className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/40 shadow-xs">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-8 bg-orange-400 rounded-full"></div>
                            <h2 className="text-xl font-serif text-stone-800">替え歌歌詞</h2>
                        </div>
                        {isClient ? (
                            <div
                                className="font-serif leading-loose text-stone-700 whitespace-pre-wrap japanese-text text-base md:text-lg"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeLyrics(song.lyrics)
                                }}
                            />
                        ) : (
                            <div className="font-serif leading-loose text-stone-700 whitespace-pre-wrap japanese-text text-base md:text-lg">
                                {song.lyrics}
                            </div>
                        )}
                    </section>

                    {/* Original Song Info */}
                    <section className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/40 shadow-xs h-fit">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-8 bg-stone-300 rounded-full"></div>
                            <h2 className="text-xl font-serif text-stone-800">原曲情報</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-sans text-stone-400 uppercase tracking-widest mb-1">Artist</h3>
                                <p className="text-lg md:text-xl font-serif text-stone-800">{song.original.artist}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-sans text-stone-400 uppercase tracking-widest mb-1">Title</h3>
                                <p className="text-lg md:text-xl font-serif text-stone-800">{song.original.title}</p>
                            </div>

                            {song.original.lyrics && (
                                <div className="pt-6 border-t border-stone-200/50">
                                    <h3 className="text-xs font-sans text-stone-400 uppercase tracking-widest mb-4">Original Lyrics</h3>
                                    {isClient ? (
                                        <div
                                            className="font-serif leading-loose text-stone-600 text-sm whitespace-pre-wrap japanese-text"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeLyrics(song.original.lyrics)
                                            }}
                                        />
                                    ) : (
                                        <div className="font-serif leading-loose text-stone-600 text-sm whitespace-pre-wrap japanese-text">
                                            {song.original.lyrics}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Related Songs */}
                {relatedSongs.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-center mb-10">
                            <h3 className="text-xl md:text-2xl font-serif text-stone-800 relative inline-block">
                                <span className="relative z-10">同じ原曲の替え歌</span>
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-stone-200/50 -z-0 -rotate-1 rounded-sm"></span>
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sortedRelatedSongs.map(relatedSong => (
                                <Link
                                    key={relatedSong.id}
                                    href={`/songs/${relatedSong.id}`}
                                    className="block p-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 hover:border-orange-200 transition-all duration-300 group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-serif text-stone-800 group-hover:text-orange-800 transition-colors mb-2">
                                                {relatedSong.title}
                                            </h4>
                                            <p className="text-stone-500 text-sm line-clamp-2 font-serif opacity-70">
                                                {relatedSong.lyricsPreview}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Navigation */}
                <nav className="border-t border-stone-200 pt-12 flex flex-row justify-between items-center gap-2 md:gap-4">
                    <div className="flex-1">
                        {navigation.prev ? (
                            <Link
                                href={`/songs/${navigation.prev.id}`}
                                className="group inline-block text-left px-2 md:px-4 py-3 rounded-xl hover:bg-white/40 transition-colors duration-500"
                            >
                                <div className="text-xs md:text-sm font-serif text-stone-500 uppercase tracking-wider group-hover:text-orange-500 transition-colors duration-500">Previous</div>
                            </Link>
                        ) : (
                            <div className="h-12"></div>
                        )}
                    </div>

                    <Link
                        href="/"
                        className="px-4 md:px-8 py-3 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-red-800 hover:border-red-200 hover:bg-red-50 font-serif text-xs md:text-sm transition-all shadow-sm duration-300 text-center whitespace-nowrap"
                    >
                        一覧に戻る
                    </Link>

                    <div className="flex-1 text-right">
                        {navigation.next ? (
                            <Link
                                href={`/songs/${navigation.next.id}`}
                                className="group inline-block text-right px-2 md:px-4 py-3 rounded-xl hover:bg-white/40 transition-colors duration-500"
                            >
                                <div className="text-xs md:text-sm font-serif text-stone-500 uppercase tracking-wider group-hover:text-orange-500 transition-colors duration-500">Next</div>
                            </Link>
                        ) : (
                            <div className="h-12"></div>
                        )}
                    </div>
                </nav>
            </article>
        </div>
    );
}
