'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { SongListItem } from '@/types/song';
import SongCardV2 from './SongCardV2';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getAssetPath } from '@/lib/assetPath';

interface HomeContentV2Props {
    songs: SongListItem[];
}

export default function HomeContentV2({ songs }: HomeContentV2Props) {
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Latest Songs State
    const [visibleCount, setVisibleCount] = useState(6);

    // Yearly Archive State
    const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Randomize hero image after hydration completes
        const timer = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * 30);
            setHeroImageIndex(randomIndex);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Reset pagination when search changes
    useEffect(() => {
        setVisibleCount(6);
    }, [searchQuery]);

    const filteredSongs = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return songs.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.originalTitle.toLowerCase().includes(query) ||
            song.originalArtist.toLowerCase().includes(query) ||
            song.lyrics.toLowerCase().includes(query)
        );
    }, [songs, searchQuery]);

    const displaySongs = filteredSongs.slice(0, visibleCount);
    const hasMorecase = visibleCount < filteredSongs.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    // Group Songs by Year Logic (ported from HomeContent.tsx)
    const yearlyGroups = useMemo(() => {
        try {
            const yearGroups: { [year: string]: SongListItem[] } = {};

            songs.forEach(song => {
                let year: string | undefined;
                const idMatch = song.id?.match(/^(\d{4})/);
                if (idMatch) {
                    year = idMatch[1];
                } else {
                    const createdStr = String(song.created || '');
                    year = createdStr.substring(0, 4);
                }

                if (!year || !/^\d{4}$/.test(year)) return;

                if (!yearGroups[year]) {
                    yearGroups[year] = [];
                }
                yearGroups[year].push(song);
            });

            const sortedYears = Object.keys(yearGroups).sort((a, b) => b.localeCompare(a));
            return sortedYears.map(year => ({
                year,
                songs: yearGroups[year].sort((a, b) => {
                    const aTime = parseInt(String(a.id || '').replace('_', ''));
                    const bTime = parseInt(String(b.id || '').replace('_', ''));
                    return bTime - aTime;
                }),
                count: yearGroups[year].length
            }));
        } catch (error) {
            console.error('Error grouping songs by year:', error);
            return [];
        }
    }, [songs]);

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

    return (
        <div className="container-responsive py-8 md:py-16">
            {/* Intro / Hero Area */}
            <div className="text-center mb-12 md:mb-20">
                <h2 className="text-4xl md:text-5xl font-waterfall text-stone-600 mb-6 md:mb-10 leading-tight">
                    Heartfelt Parody Songs for <span className='text-orange-600'>Obata</span>
                </h2>

                <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto mb-6 md:mb-10 rounded-full overflow-hidden shadow-md md:shadow-lg border-3 border-white/50 bg-white">
                    <Image
                        src={getAssetPath(`/images/hero/heroimage_${heroImageIndex.toString().padStart(2, '0')}.png`)}
                        alt="RotomSongs Hero"
                        fill
                        className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        priority
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>

                <p className="text-stone-500 font-serif text-sm md:text-base max-w-xl mx-auto leading-loose mb-8">
                    X（旧Twitter）で生まれた替え歌の歌集です。<br />
                    {songs.length}曲の替え歌を収録しています。
                </p>

                {/* X Link Button */}
                <div className="mb-6 md:mb-10">
                    <a
                        href="https://x.com/Starlystrongest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-stone-800 text-white font-serif px-6 py-2 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors shadow-sm"
                    >
                        <span>詠み人のXはこちら</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                </div>

                {/* Search Window */}
                <div className="max-w-lg mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <svg className="h-5 w-5 text-stone-500 group-focus-within:text-orange-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="歌詞・タイトル・アーティスト名で検索"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-full font-serif leading-5 bg-white/80 backdrop-blur-sm placeholder-stone-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 shadow-sm"
                    />
                </div>
            </div>

            {/* Main Content Area: Latest Songs OR Search Results */}
            <div className="mb-12 md:mb-32">
                <div className="flex items-center justify-center mb-6 md:mb-12">
                    <h3 className="text-2xl md:text-3xl font-serif text-stone-800 relative inline-block">
                        <span className="relative z-10">{searchQuery ? '検索結果' : '最新の替え歌'}</span>
                        <span className="absolute bottom-1 left-0 w-full h-3 bg-orange-100/50 -z-0 rotate-1 rounded-sm"></span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
                    {/* If searching, show all filtered. If not, show paginated displaySongs */}
                    {(searchQuery ? filteredSongs : displaySongs).length > 0 ? (
                        (searchQuery ? filteredSongs : displaySongs).map((song) => (
                            <SongCardV2 key={song.id} song={song} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-stone-400 font-serif">
                            該当する楽曲が見つかりませんでした。
                        </div>
                    )}
                </div>

                {/* Load More Button (Only show if NOT searching and there are more songs) */}
                {!searchQuery && hasMorecase && (
                    <div className="mt-16 text-center">
                        <button
                            onClick={handleLoadMore}
                            className="bg-white border border-stone-200 text-stone-600 hover:text-red-800 hover:border-red-200 hover:bg-red-50 px-8 py-3 rounded-full font-serif text-sm md:text-base transition-all duration-500 ease-out shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                        >
                            もっと見る ({filteredSongs.length - visibleCount})
                        </button>
                    </div>
                )}
            </div>

            {/* Yearly Archive Section (Only if not searching) */}
            {!searchQuery && (
                <div className="pb-8 md:pb-20 px-4 md:px-0">
                    <div className="flex items-center justify-center mb-6 md:mb-12">
                        <h3 className="text-2xl md:text-3xl font-serif text-stone-800 relative inline-block">
                            <span className="relative z-10">年度別替え歌</span>
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-orange-100/50 -z-0 -rotate-1 rounded-sm"></span>
                        </h3>
                    </div>

                    <div className="space-y-6 max-w-7xl mx-auto">
                        {yearlyGroups.map(({ year, songs: yearSongs, count }) => {
                            const isExpanded = expandedYears.has(year);
                            return (
                                <div key={year} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 overflow-hidden">
                                    <button
                                        onClick={() => toggleYear(year)}
                                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center transition-colors duration-300 ${isExpanded ? 'bg-orange-100 text-orange-600' : 'group-hover:bg-orange-50 group-hover:text-orange-500'}`}>
                                                <ChevronDown
                                                    className={`w-5 h-5 text-stone-500 transition-transform duration-500 ease-out ${isExpanded ? 'rotate-180 text-orange-600' : 'rotate-0'}`}
                                                />
                                            </div>
                                            <span className="text-xl font-serif text-stone-700">
                                                {year}年 <span className="text-sm text-stone-400 ml-2 font-serif trackng-widest">({count}曲)</span>
                                            </span>
                                        </div>
                                    </button>

                                    <div className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            <div className="px-6 pb-8 pt-2">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {yearSongs.map(song => (
                                                        <SongCardV2 key={song.id} song={song} hideLyrics={true} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
