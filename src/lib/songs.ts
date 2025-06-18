// 暫定的なモックデータ（テスト用）
import { Song, SongListItem, SearchIndex } from '@/types/song';

const mockSongs: Song[] = [
  {
    id: '20230209_1519',
    frontmatter: {
      title: '20230209_1519',
      id: '202302091519',
      created: '2023-02-09',
      updated: '2025-06-17',
      tags: ['RotomSongs']
    },
    lyrics: `オーバタ オバタ オーバタ 球人♪
オーバタ ナカノ 好守二遊♪

オーバタ オバタ オーバタ 遊撃♪
オーバタ オバタで アスパラガス♪`,
    original: {
      artist: '株式会社ミライト',
      title: 'バニラ（求人サイト）の歌',
      lyrics: `バーニラ バニラ バーニラ 求人
バーニラ バニラ 高収入

バーニラ バニラ バーニラ 求人
バーニラ バニラで アルバイト`
    },
    sourceUrl: 'https://x.com/Starlystrongest/status/1623567298064678912',
    slug: '20230209_1519',
    fileName: '20230209_1519.md'
  },
  {
    id: '20230523_2125',
    frontmatter: {
      title: '20230523_2125',
      id: '202305232125',
      created: '2023-05-23',
      updated: '2025-06-17',
      tags: ['RotomSongs']
    },
    lyrics: `オーバ オーバ オバ おばたの子♪
鳴尾浜から やってきた

オーバ オーバ オバ ほそながい♪
ドヤ顔ピースの 勝男の子`,
    original: {
      artist: '藤岡藤巻と大橋のぞみ',
      title: '崖の上のポニョ',
      lyrics: `ポーニョ　ポーニョ　ポニョ　さかなの子
青い海からやってきた
ポーニョ　ポーニョ　ポニョ　ふくらんだ
まんまるおなかの女の子`
    },
    sourceUrl: 'https://x.com/Starlystrongest/status/1660985387379204098',
    slug: '20230523_2125',
    fileName: '20230523_2125.md'
  },
  {
    id: '20250617_1532',
    frontmatter: {
      title: '20250617_1532',
      id: '202506171532',
      created: '2025-06-17',
      updated: '2025-06-17',
      tags: ['RotomSongs']
    },
    lyrics: `カフェテリア流れる music
ぼんやり聴いていたら
知らぬ間にリズムに合わせ
つま先から動き出す

止められない今の尿意
カモン カモン カモン カモン ベイビー
ウンコもだよ`,
    original: {
      artist: 'AKB48',
      title: '恋するフォーチュンクッキー',
      lyrics: `カフェテリア流れるMusic
ぼんやり聴いていたら
知らぬ間にリズムに合わせ
つま先から動き出す
止められない今の気持ち
カモン　カモン　カモン　カモン　ベイビー
占ってよ`
    },
    sourceUrl: 'https://x.com/Starlystrongest/status/1934861742003376472',
    slug: '20250617_1532',
    fileName: '20250617_1532.md'
  }
];

/**
 * 全ての楽曲を取得（モックデータ）
 */
export async function getAllSongs(): Promise<Song[]> {
  // 実際の実装では Songsディレクトリからファイルを読み込み
  // 現在はモックデータを返す
  return mockSongs.sort((a, b) => 
    new Date(b.frontmatter.created).getTime() - new Date(a.frontmatter.created).getTime()
  );
}

/**
 * IDによる単一楽曲の取得
 */
export async function getSongById(id: string): Promise<Song | null> {
  const song = mockSongs.find(song => song.id === id);
  return song || null;
}

/**
 * 一覧表示用の軽量データを取得
 */
export async function getSongList(): Promise<SongListItem[]> {
  const songs = await getAllSongs();
  
  return songs.map(song => ({
    id: song.id,
    title: song.frontmatter.title,
    created: song.frontmatter.created,
    updated: song.frontmatter.updated,
    originalArtist: song.original.artist,
    originalTitle: song.original.title,
    lyricsPreview: generateLyricsPreview(song.lyrics),
    tags: song.frontmatter.tags,
    slug: song.slug
  }));
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
  
  const allSongs = await getAllSongs();
  allSongs.forEach(song => {
    searchableContent[song.id] = [
      song.frontmatter.title,
      song.lyrics,
      song.original.artist,
      song.original.title,
      song.original.lyrics,
      song.frontmatter.tags.join(' ')
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
 * 歌詞のプレビューテキストを生成（最初の2行程度）
 */
function generateLyricsPreview(lyrics: string): string {
  const lines = lyrics.split('\n').filter(line => line.trim() !== '');
  const previewLines = lines.slice(0, 2);
  const preview = previewLines.join(' ').substring(0, 100);
  return preview.length < lyrics.length ? `${preview}...` : preview;
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
