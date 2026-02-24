'use client';

import Link from 'next/link';
import { SongListItem } from '@/types/song';
import { formatDateShort } from '@/lib/dateUtils';
import { sanitizeLyrics } from '@/lib/sanitize';

interface SongCardV2Props {
    song: SongListItem;
}

export default function SongCardV2({ song }: SongCardV2Props) {
    return (
        <Link
            href={`/songs/${song.slug}`}
            className="group block bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-500 ease-out border border-stone-100 hover:border-red-100 relative overflow-hidden"
        >
            {/* Decorative accent (Top center, subtle) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-stone-100 group-hover:bg-red-500/50 transition-colors duration-500" />

            <div className="flex flex-col h-full">
                {/* Header: Title & Original */}
                <div className="text-center mb-6">
                    <h3 className="text-xl md:text-2xl font-serif font-medium text-stone-800 mb-2 group-hover:text-red-800 transition-colors duration-300">
                        {song.title}
                    </h3>
                    <p className="text-xs font-sans text-stone-400 uppercase tracking-widest">
                        {song.originalArtist} / {song.originalTitle}
                    </p>
                </div>

                {/* Lyrics Preview - Vertical Writing Aesthetic or Centered Poetry */}
                <div className="flex-grow flex items-center justify-center py-4 relative">
                    {/* Background watermak/pattern could go here */}
                    <div
                        className="text-stone-600 font-serif leading-loose text-center line-clamp-4 japanese-text text-sm md:text-base opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeLyrics(song.lyricsPreview)
                        }}
                    />
                </div>

                {/* Footer: Date & Metadata */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-end">
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] text-stone-400 tracking-widest uppercase">Posted</span>
                        <span className="text-sm font-serif text-stone-600">{formatDateShort(song.id)}</span>
                    </div>

                    {/* "Read" button visual */}
                    <div className="text-red-800/0 group-hover:text-red-800/100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-xs font-serif border border-red-200 px-3 py-1 rounded-full bg-red-50">
                        詠む &rarr;
                    </div>
                </div>
            </div>
        </Link>
    );
}
