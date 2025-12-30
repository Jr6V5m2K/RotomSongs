import { getSongList } from '@/lib/songs';
import LayoutV2 from '@/components/LayoutV2';
import HomeContentV2 from '@/components/HomeContentV2';
import { formatDateShort } from '@/lib/dateUtils';

export const metadata = {
    title: 'RotomSongs - 家電和歌集',
    description: 'A collection of heartfelt parody songs for Obata',
};

export default async function HomePage() {
    try {
        const songs = await getSongList();

        // Find the latest song by ID (format: YYYYMMDD_HHMM)
        const latestSong = songs.reduce((latest, song) => {
            if (!latest) return song;
            return (song.id > latest.id) ? song : latest;
        }, songs[0]);

        // Format the latest song's date for display
        const formattedLastUpdate = latestSong ? formatDateShort(latestSong.id) : '2025.12.31';

        return (
            <LayoutV2 lastUpdate={formattedLastUpdate} songCount={songs.length}>
                <HomeContentV2 songs={songs} />
            </LayoutV2>
        );
    } catch (error) {
        console.error('Error loading songs:', error);
        return (
            <LayoutV2>
                <div className="container-responsive py-20 text-center">
                    <p className="text-red-700 font-serif">Error loading songs.</p>
                </div>
            </LayoutV2>
        );
    }
}
