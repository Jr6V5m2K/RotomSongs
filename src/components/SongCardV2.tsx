'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SongListItem } from '@/types/song';
import { formatDateShort } from '@/lib/dateUtils';
import { sanitizeLyrics } from '@/lib/sanitize';

interface SongCardV2Props {
    song: SongListItem;
    hideLyrics?: boolean;
    isClient?: boolean;
}

export default function SongCardV2({ song, hideLyrics = false, isClient: parentIsClient }: SongCardV2Props) {
    const [localIsClient, setLocalIsClient] = useState(false);

    useEffect(() => {
        setLocalIsClient(true);
    }, []);

    const isClient = parentIsClient !== undefined ? parentIsClient : localIsClient;

    return (
        <Link
            href={`/songs/${song.id}`}
            className="group block bg-white/60 backdrop-blur-sm p-6 md:px-8 md:py-6 shadow-sm hover:shadow-lg transition-all duration-500 ease-out border border-white/50 hover:border-red-200 relative overflow-hidden rounded-xl"
        >
            {/* Decorative accent (Top center, subtle) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-stone-100 group-hover:bg-red-500/50 transition-colors duration-500" />

            <div className="flex flex-col h-full">
                {/* Header: Title & Original */}
                <div className="text-center mb-1 md:mb-2">
                    <h3 className="text-md md:text-xl font-serif font-medium text-stone-800 mb-2 group-hover:text-red-800 transition-colors duration-300">
                        {song.originalTitle}
                    </h3>
                    <p className="text-sm font-serif text-stone-500 uppercase tracking-widest">
                        {song.originalArtist}
                    </p>
                </div>

                {/* Lyrics Preview - Vertical Writing Aesthetic or Centered Poetry */}
                {!hideLyrics && (
                    <div className="flex-grow flex items-center justify-center py-4 relative">
                        {/* Background watermak/pattern could go here */}
                        <div
                            className="text-stone-600 font-serif leading-loose text-center line-clamp-4 japanese-text text-sm md:text-base opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                            dangerouslySetInnerHTML={{
                                __html: sanitizeLyrics(song.lyricsPreview)
                            }}
                            suppressHydrationWarning
                        />
                    </div>
                )}

                {/* Footer: Date & Metadata */}
                <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between">
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-serif text-stone-600">{formatDateShort(song.id)}</span>
                    </div>

                    {/* "Read" button visual */}
                    <div className="text-gray-400 border border-gray-200 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-800 transition-all duration-300 text-xs font-serif px-3 py-1 rounded-full">
                        詳細 &rarr;
                    </div>
                </div>
            </div>
        </Link>
    );
}
