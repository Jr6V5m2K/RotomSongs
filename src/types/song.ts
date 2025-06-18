// Song data types based on the markdown structure
export interface SongFrontmatter {
  title: string;
  id: string;
  created: string;
  updated: string;
  tags: string[];
}

export interface OriginalSong {
  artist: string;
  title: string;
  lyrics: string;
}

export interface Song {
  id: string;                    // ファイル名ベース (e.g., "20230209_1519")
  frontmatter: SongFrontmatter;
  lyrics: string;                // 替え歌歌詞
  original: OriginalSong;
  sourceUrl?: string;            // X投稿URL (画像埋め込みから抽出)
  slug: string;                  // URL用スラッグ
  fileName: string;              // 元のファイル名
}

export interface SongListItem {
  id: string;
  title: string;
  created: string;
  updated: string;
  originalArtist: string;
  originalTitle: string;
  lyricsPreview: string;         // 歌詞のプレビュー（最初の2行程度）
  tags: string[];
  slug: string;
  sourceUrl?: string;            // X投稿URL
}

export interface SearchFilters {
  query: string;
  artist?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchIndex {
  songs: SongListItem[];
  artists: string[];
  tags: string[];
  searchableContent: {
    [songId: string]: string;    // 検索用の統合テキスト
  };
}

// パース用の中間型
export interface RawMarkdownData {
  frontmatter: SongFrontmatter;
  content: string;
  fileName: string;
}
