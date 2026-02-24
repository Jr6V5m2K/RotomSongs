'use client';

import { SongListItem } from '@/types/song';
import SongCardV2 from './SongCardV2';

interface HomeContentV2Props {
    songs: SongListItem[];
}

export default function HomeContentV2({ songs }: HomeContentV2Props) {
    return (
        <div className="container-responsive py-12 md:py-20">
            {/* Intro / Hero Area */}
            <div className="text-center mb-20">
                <span className="inline-block py-1 px-3 border border-stone-300 rounded-full text-xs font-serif text-stone-500 mb-4 tracking-widest">
                    令和の替え歌
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-thin text-stone-800 mb-6 leading-tight">
                    言葉を紡ぎ、<br />
                    音を奏でる。
                </h2>
                <p className="text-stone-500 font-serif text-sm md:text-base max-w-lg mx-auto leading-loose">
                    RotomSongsは、X（旧Twitter）で生まれた数々の替え歌を収集したデジタル歌集です。<br />
                    懐かしき家電の音色に、新たな魂を吹き込んで。
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {songs.map((song) => (
                    <SongCardV2 key={song.id} song={song} />
                ))}
            </div>

            {/* Pagination / Load More (Placeholder) */}
            <div className="mt-20 text-center">
                <p className="text-stone-400 font-serif text-sm italic">
                    全{songs.length}首
                </p>
            </div>
        </div>
    );
}
