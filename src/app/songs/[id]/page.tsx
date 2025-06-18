import { notFound } from 'next/navigation';
import { getSongById, getSongNavigation, generateStaticParams as getStaticParams } from '@/lib/songs';
import { generateSongMetadata } from '@/lib/metadata';
import SongDetail from '@/components/SongDetail';

interface SongPageProps {
  params: {
    id: string;
  };
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

export async function generateStaticParams() {
  // 全83曲の静的パラメータを生成
  return await getStaticParams();
}

export default async function SongPage({ params }: SongPageProps) {
  const song = await getSongById(params.id);
  
  if (!song) {
    notFound();
  }

  const navigation = await getSongNavigation(params.id);

  return (
    <div className="container-responsive py-8">
      <SongDetail song={song} navigation={navigation} />
    </div>
  );
}
