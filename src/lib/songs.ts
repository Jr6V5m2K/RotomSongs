import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Song, SongListItem, OriginalSong, RawMarkdownData, SearchIndex } from '@/types/song';

const songsDirectory = path.join(process.cwd(), 'Songs');

/**
 * 全ての楽曲ファイルを読み込んでパースする
 */
export async function getAllSongs(): Promise<Song[]> {
  try {
    const filenames = fs.readdirSync(songsDirectory);
    const markdownFiles = filenames.filter(name => name.endsWith('.md'));

    const songs = await Promise.all(
      markdownFiles.map(async (filename) => {
        const filePath = path.join(songsDirectory, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        const { data, content } = matter(fileContents);
        
        return parseSongContent({
          frontmatter: data as any,
          content,
          fileName: filename
        });
      })
    );

    // RotomSongsタグを持つ楽曲のみフィルタリング
    const filteredSongs = songs.filter(song => 
      song.frontmatter.tags && 
      song.frontmatter.tags.includes('RotomSongs')
    );

    // ファイル名のIDで降順ソート（新しい順）
    return filteredSongs.sort((a, b) => {
      // IDを数値として比較（YYYYMMDDHHMM形式）
      const aTime = parseInt(a.id.replace('_', ''));
      const bTime = parseInt(b.id.replace('_', ''));
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error reading songs directory:', error);
    return [];
  }
}

/**
 * IDによる単一楽曲の取得
 */
export async function getSongById(id: string): Promise<Song | null> {
  try {
    const filePath = path.join(songsDirectory, `${id}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // RotomSongsタグがない場合はnullを返す
    if (!data.tags || !data.tags.includes('RotomSongs')) {
      return null;
    }
    
    return parseSongContent({
      frontmatter: data as any,
      content,
      fileName: `${id}.md`
    });
  } catch (error) {
    console.error(`Error reading song ${id}:`, error);
    return null;
  }
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
    lyrics: song.lyrics,
    originalLyrics: song.original.lyrics,
    tags: song.frontmatter.tags,
    slug: song.slug,
    sourceUrl: song.sourceUrl
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
 * 静的パラメータの生成（全楽曲のIDを取得）
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const filenames = fs.readdirSync(songsDirectory);
    const markdownFiles = filenames.filter(name => name.endsWith('.md'));
    
    // RotomSongsタグを持つファイルのみ静的生成対象とする
    const rotomSongFiles = markdownFiles.filter(filename => {
      const filePath = path.join(songsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return data.tags && data.tags.includes('RotomSongs');
    });
    
    return rotomSongFiles.map(filename => ({
      id: filename.replace(/\.md$/, '')
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

/**
 * Markdownコンテンツから楽曲データをパース
 */
function parseSongContent(rawData: RawMarkdownData): Song {
  const { frontmatter, content, fileName } = rawData;
  
  // コンテンツを各セクションに分割
  const sections = parseMarkdownSections(content);
  
  const id = fileName.replace(/\.md$/, '');
  
  return {
    id,
    frontmatter,
    lyrics: sections.lyrics || '',
    original: {
      artist: sections.originalArtist || '',
      title: sections.originalTitle || '',
      lyrics: sections.originalLyrics || ''
    },
    sourceUrl: extractSourceUrl(sections.source || ''),
    slug: generateSlug(id),
    fileName
  };
}

/**
 * Markdownのセクションをパース
 */
function parseMarkdownSections(content: string) {
  const sections: { [key: string]: string } = {};
  
  // ### で始まるセクションを分割
  const sectionMatches = content.split(/(?=^###\s)/m);
  
  sectionMatches.forEach(section => {
    const lines = section.trim().split('\n');
    if (lines.length === 0) return;
    
    const headerLine = lines[0];
    const bodyLines = lines.slice(1);
    
    if (headerLine.startsWith('### Source')) {
      sections.source = bodyLines.join('\n').trim();
    } else if (headerLine.startsWith('### Lyrics')) {
      sections.lyrics = bodyLines.join('\n').trim();
    } else if (headerLine.startsWith('### Original')) {
      // Original セクション内の #### Artist, #### Title, #### Lyrics を処理
      const originalContent = bodyLines.join('\n');
      const artistMatch = originalContent.match(/#### Artist\s*\n(.*?)(?=\n####|\n\n|$)/s);
      const titleMatch = originalContent.match(/#### Title\s*\n(.*?)(?=\n####|\n\n|$)/s);
      const lyricsMatch = originalContent.match(/#### Lyrics\s*\n(.*?)(?=\n####|$)/s);
      
      sections.originalArtist = artistMatch ? artistMatch[1].trim() : '';
      sections.originalTitle = titleMatch ? titleMatch[1].trim() : '';
      sections.originalLyrics = lyricsMatch ? lyricsMatch[1].trim() : '';
    }
  });
  
  return sections;
}

/**
 * SourceセクションからX投稿URLを抽出
 */
function extractSourceUrl(sourceContent: string): string | undefined {
  // ![](https://x.com/...) または ![](http://x.com/...) の形式からURLを抽出
  const urlMatch = sourceContent.match(/!\[.*?\]\((https?:\/\/x\.com\/[^)]+)\)/);
  return urlMatch ? urlMatch[1] : undefined;
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
 * URL用スラッグを生成
 */
function generateSlug(id: string): string {
  return id; // 現在はIDをそのまま使用（20230209_1519）
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
