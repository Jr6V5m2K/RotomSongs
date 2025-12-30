import { notFound } from 'next/navigation';
import { getSongById, getSongNavigation, getRelatedSongs, generateStaticParams as getStaticParams, getSongList } from '@/lib/songs';
import { generateSongMetadata } from '@/lib/metadata';
import { formatDateShort } from '@/lib/dateUtils';
import LayoutV2 from '@/components/LayoutV2';
import SongDetailV2 from '@/components/SongDetailV2';

interface SongPageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    const params = await getStaticParams();
    return params.map(p => ({
        id: p.id
    }));
}

export async function generateMetadata({ params }: SongPageProps) {
    const song = await getSongById(params.id);

    if (!song) {
        return {
            title: '楽曲が見つかりません | RotomSongs',
            description: '指定された楽曲は存在しません。'
        };
    }

    return generateSongMetadata(
        song.frontmatter.title,
        song.original.artist,
        song.original.title,
        song.lyrics.substring(0, 100),
        song.id
    );
}

export default async function SongPage({ params }: SongPageProps) {
    const song = await getSongById(params.id);

    if (!song) {
        notFound();
    }

    const navigation = await getSongNavigation(params.id);
    const relatedSongs = await getRelatedSongs(song.references || []);

    // Fetch all songs to calculate last update and count for the header
    const allSongs = await getSongList();

    // Find the latest song by ID (format: YYYYMMDD_HHMM)
    const latestSong = allSongs.reduce((latest, s) => {
        if (!latest) return s;
        return (s.id > latest.id) ? s : latest;
    }, allSongs[0]);

    // Format the latest song's date for display
    const formattedLastUpdate = latestSong ? formatDateShort(latestSong.id) : '2025.12.31';

    return (
        <LayoutV2 lastUpdate={formattedLastUpdate} songCount={allSongs.length}>
            <SongDetailV2 song={song} navigation={navigation} relatedSongs={relatedSongs} />
        </LayoutV2>
    );
}
