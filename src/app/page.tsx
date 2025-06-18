import { getSongList } from '@/lib/songs';
import HomeContent from '@/components/HomeContent';

export default async function HomePage() {
  try {
    // ビルド時に楽曲データを取得
    const songs = await getSongList();
    
    return <HomeContent songs={songs} />;
  } catch (error) {
    console.error('Error loading songs:', error);
    return <HomeContent songs={[]} />;
  }
}
