import { Song, SongListItem, SearchIndex } from '@/types/song';
import { SongRepository, SongDataTransformer } from './songRepository';

// シングルトンのリポジトリインスタンス
const songRepository = new SongRepository();

/**
 * 全ての楽曲ファイルを読み込んでパースする
 * @deprecated この関数は将来的に非公開になる予定です。代わりに getSongList() の使用を推奨します。
 */
export async function getAllSongs(): Promise<Song[]> {
  return songRepository.getAllSongs();
}

/**
 * IDによる単一楽曲の取得
 */
export async function getSongById(id: string): Promise<Song | null> {
  return songRepository.getSongById(id);
}

/**
 * 一覧表示用の軽量データを取得
 */
export async function getSongList(): Promise<SongListItem[]> {
  const songs = await songRepository.getAllSongs();
  return SongDataTransformer.toListItems(songs);
}

/**
 * 検索用インデックスの生成
 */
export async function generateSearchIndex(): Promise<SearchIndex> {
  const songs = await getSongList();
  
  // Array.from()を使用してSet変換の問題を回避
  const artists = Array.from(new Set(songs.map(song => song.originalArtist))).sort();
  const tags = Array.from(new Set(songs.flatMap(song => song.tags))).sort();
  
  const searchableContent: { [songId: string]: string } = {};
  
  // SongListItemから検索用テキストを生成（より効率的）
  songs.forEach(song => {
    searchableContent[song.id] = [
      song.title,
      song.lyrics,
      song.originalArtist,
      song.originalTitle,
      song.originalLyrics,
      song.tags.join(' ')
    ].join(' ').toLowerCase();
  });

  return {
    songs,
    artists,
    tags,
    searchableContent
  };
}

/**
 * 静的パラメータの生成（全楽曲のIDを取得）
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return songRepository.generateStaticParams();
}


/**
 * 関連楽曲の情報を取得
 */
export async function getRelatedSongs(referenceIds: string[]): Promise<SongListItem[]> {
  if (!referenceIds || referenceIds.length === 0) {
    return [];
  }
  
  const allSongs = await getSongList();
  return allSongs.filter(song => referenceIds.includes(song.id));
}

/**
 * 楽曲の前後のナビゲーション情報を取得
 */
export async function getSongNavigation(currentId: string): Promise<{
  prev: SongListItem | null;
  next: SongListItem | null;
}> {
  const songs = await getSongList();
  const currentIndex = songs.findIndex(song => song.id === currentId);
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  
  return {
    prev: currentIndex > 0 ? songs[currentIndex - 1] : null,
    next: currentIndex < songs.length - 1 ? songs[currentIndex + 1] : null
  };
}

/**
 * 楽曲データリポジトリへの直接アクセス（高度な機能用）
 * @internal 内部使用のみ。通常は上記の公開関数を使用してください。
 */
export function getSongRepository(): SongRepository {
  return songRepository;
}
