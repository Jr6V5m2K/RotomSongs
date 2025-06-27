import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Song, SongListItem, SongFrontmatter } from '@/types/song';
import { safeValidateFrontmatter } from './validation';

/**
 * ファイル操作を抽象化するクラス
 */
export class SongFileReader {
  private readonly songsDirectory: string;

  constructor(songsDirectory: string = path.join(process.cwd(), 'Songs')) {
    this.songsDirectory = songsDirectory;
  }

  /**
   * 全てのマークダウンファイル名を取得
   */
  getAllMarkdownFiles(): string[] {
    try {
      const filenames = fs.readdirSync(this.songsDirectory);
      return filenames.filter(name => name.endsWith('.md'));
    } catch (error) {
      console.error('Error reading songs directory:', error);
      return [];
    }
  }

  /**
   * 単一ファイルの読み込み
   */
  readSongFile(filename: string): { content: string; frontmatter: SongFrontmatter } | null {
    try {
      const filePath = path.join(this.songsDirectory, filename);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // 型安全なフロントマター検証
      const validatedFrontmatter = safeValidateFrontmatter(data, filename);
      
      if (!validatedFrontmatter) {
        return null;
      }

      return {
        content,
        frontmatter: validatedFrontmatter
      };
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      return null;
    }
  }

  /**
   * 複数ファイルの並列読み込み
   */
  async readMultipleFiles(filenames: string[]): Promise<Array<{
    filename: string;
    content: string;
    frontmatter: SongFrontmatter;
  } | null>> {
    return Promise.all(
      filenames.map(async (filename) => {
        const result = this.readSongFile(filename);
        return result ? { filename, ...result } : null;
      })
    );
  }

  /**
   * RotomSongsタグを持つファイルのフィルタリング
   */
  filterRotomSongsFiles(filenames: string[]): string[] {
    return filenames.filter(filename => {
      const result = this.readSongFile(filename);
      return result?.frontmatter.tags?.includes('RotomSongs') ?? false;
    });
  }
}

/**
 * マークダウンセクションの解析結果
 */
interface ParsedSections {
  lyrics: string;
  source: string;
  originalArtist: string;
  originalTitle: string;
  originalLyrics: string;
  reference: string;
}

/**
 * マークダウンコンテンツのパーサー
 */
export class SongContentParser {

  /**
   * メインのパース処理
   */
  parse(content: string, frontmatter: SongFrontmatter, filename: string): Song {
    const sections = this.parseMarkdownSections(content);
    const id = filename.replace(/\.md$/, '');
    
    return {
      id,
      frontmatter,
      lyrics: sections.lyrics,
      original: {
        artist: sections.originalArtist,
        title: sections.originalTitle,
        lyrics: sections.originalLyrics
      },
      sourceUrl: this.extractSourceUrl(sections.source),
      slug: this.generateSlug(id),
      fileName: filename,
      references: this.parseReferences(sections.reference)
    };
  }

  /**
   * マークダウンセクションの分割と解析
   */
  private parseMarkdownSections(content: string): ParsedSections {
    const sections: Partial<ParsedSections> = {};
    
    // ### で始まるセクションを分割
    const sectionMatches = content.split(/(?=^###\s)/m);
    
    sectionMatches.forEach(section => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return;

      const sectionHandler = this.getSectionHandler(trimmedSection);
      if (sectionHandler) {
        Object.assign(sections, sectionHandler(trimmedSection));
      }
    });
    
    return {
      lyrics: sections.lyrics ?? '',
      source: sections.source ?? '',
      originalArtist: sections.originalArtist ?? '',
      originalTitle: sections.originalTitle ?? '',
      originalLyrics: sections.originalLyrics ?? '',
      reference: sections.reference ?? ''
    };
  }

  /**
   * セクションタイプに応じたハンドラーを取得
   */
  private getSectionHandler(section: string): ((section: string) => Partial<ParsedSections>) | null {
    const lines = section.split('\n');
    const headerLine = lines[0];

    if (headerLine.startsWith('### Source')) {
      return this.parseSourceSection.bind(this);
    } else if (headerLine.startsWith('### Lyrics')) {
      return this.parseLyricsSection.bind(this);
    } else if (headerLine.startsWith('### Original')) {
      return this.parseOriginalSection.bind(this);
    } else if (headerLine.startsWith('### Reference')) {
      return this.parseReferenceSection.bind(this);
    }

    return null;
  }

  /**
   * Sourceセクションの解析
   */
  private parseSourceSection(section: string): Partial<ParsedSections> {
    const lines = section.split('\n');
    const bodyLines = lines.slice(1);
    return { source: bodyLines.join('\n').trim() };
  }

  /**
   * Lyricsセクションの解析
   */
  private parseLyricsSection(section: string): Partial<ParsedSections> {
    const lines = section.split('\n');
    const bodyLines = lines.slice(1);
    return { lyrics: bodyLines.join('\n').trim() };
  }

  /**
   * Originalセクションの解析
   */
  private parseOriginalSection(section: string): Partial<ParsedSections> {
    const lines = section.split('\n');
    const originalContent = lines.slice(1).join('\n');
    
    // 正規表現パターンを定数として定義
    const PATTERNS = {
      artist: /#### Artist\s*\n(.*?)(?=\n####|\n\n|$)/s,
      title: /#### Title\s*\n(.*?)(?=\n####|\n\n|$)/s,
      lyrics: /#### Lyrics\s*\n(.*?)(?=\n####|$)/s
    };

    const artistMatch = originalContent.match(PATTERNS.artist);
    const titleMatch = originalContent.match(PATTERNS.title);
    const lyricsMatch = originalContent.match(PATTERNS.lyrics);
    
    return {
      originalArtist: artistMatch ? artistMatch[1].trim() : '',
      originalTitle: titleMatch ? titleMatch[1].trim() : '',
      originalLyrics: lyricsMatch ? lyricsMatch[1].trim() : ''
    };
  }

  /**
   * Referenceセクションの解析
   */
  private parseReferenceSection(section: string): Partial<ParsedSections> {
    const lines = section.split('\n');
    const referenceContent = lines.slice(1).join('\n').trim();
    return { reference: referenceContent };
  }

  /**
   * SourceセクションからX投稿URLを抽出
   */
  private extractSourceUrl(sourceContent: string): string | undefined {
    const urlPattern = /!\[.*?\]\((https?:\/\/x\.com\/[^)]+)\)/;
    const urlMatch = sourceContent.match(urlPattern);
    return urlMatch ? urlMatch[1] : undefined;
  }

  /**
   * Referenceセクションから楽曲IDのリストを抽出
   */
  private parseReferences(referenceContent: string): string[] {
    if (!referenceContent.trim()) {
      return [];
    }
    
    const linkMatches = referenceContent.match(/\[\[([^\]]+)\]\]/g);
    
    if (!linkMatches) {
      return [];
    }
    
    return linkMatches
      .map(match => {
        const idMatch = match.match(/\[\[([^\]]+)\]\]/);
        return idMatch ? idMatch[1] : '';
      })
      .filter(id => id.length > 0);
  }

  /**
   * URL用スラッグを生成
   */
  private generateSlug(id: string): string {
    return id; // 現在はIDをそのまま使用
  }
}

/**
 * データ変換ユーティリティ
 */
export class SongDataTransformer {
  /**
   * Song から SongListItem への変換
   */
  static toListItem(song: Song): SongListItem {
    return {
      id: song.id || '',
      title: song.frontmatter?.title || '',
      created: String(song.frontmatter?.created || ''),
      updated: String(song.frontmatter?.updated || ''),
      originalArtist: song.original?.artist || '',
      originalTitle: song.original?.title || '',
      lyricsPreview: this.generateLyricsPreview(song.lyrics || ''),
      lyrics: song.lyrics || '',
      originalLyrics: song.original?.lyrics || '',
      tags: song.frontmatter?.tags || [],
      slug: song.slug || '',
      sourceUrl: song.sourceUrl
    };
  }

  /**
   * 複数のSongをSongListItemに一括変換
   */
  static toListItems(songs: Song[]): SongListItem[] {
    return songs.map(song => this.toListItem(song));
  }

  /**
   * 歌詞のプレビューテキストを生成
   */
  static generateLyricsPreview(lyrics: string): string {
    const lines = lyrics.split('\n').filter(line => line.trim() !== '');
    const previewLines = lines.slice(0, 2);
    const preview = previewLines.join(' ').substring(0, 100);
    return preview.length < lyrics.length ? `${preview}...` : preview;
  }
}

/**
 * 楽曲データのソート機能
 */
export class SongSorter {
  /**
   * IDベースでの時系列降順ソート（新しい順）
   */
  static sortByIdDescending(songs: Song[]): Song[] {
    return songs.sort((a, b) => {
      const aTime = parseInt(String(a.id).replace('_', ''));
      const bTime = parseInt(String(b.id).replace('_', ''));
      return bTime - aTime;
    });
  }

  /**
   * SongListItemの時系列降順ソート
   */
  static sortListItemsByIdDescending(songs: SongListItem[]): SongListItem[] {
    return songs.sort((a, b) => {
      const aTime = parseInt(String(a.id).replace('_', ''));
      const bTime = parseInt(String(b.id).replace('_', ''));
      return bTime - aTime;
    });
  }

  /**
   * アーティスト名での並び替え
   */
  static sortByArtist(songs: SongListItem[]): SongListItem[] {
    return songs.sort((a, b) => a.originalArtist.localeCompare(b.originalArtist, 'ja'));
  }

  /**
   * タイトル名での並び替え
   */
  static sortByTitle(songs: SongListItem[]): SongListItem[] {
    return songs.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
  }
}

/**
 * 楽曲リポジトリ - 全ての楽曲データアクセスを統括
 */
export class SongRepository {
  private fileReader: SongFileReader;
  private parser: SongContentParser;

  constructor() {
    this.fileReader = new SongFileReader();
    this.parser = new SongContentParser();
  }

  /**
   * 全楽曲の取得（抽象化済み）
   */
  async getAllSongs(): Promise<Song[]> {
    try {
      const markdownFiles = this.fileReader.getAllMarkdownFiles();
      const fileResults = await this.fileReader.readMultipleFiles(markdownFiles);

      const songs = fileResults
        .filter((result): result is NonNullable<typeof result> => result !== null)
        .filter(result => result.frontmatter.tags?.includes('RotomSongs'))
        .map(result => this.parser.parse(result.content, result.frontmatter, result.filename));

      return SongSorter.sortByIdDescending(songs);
    } catch (error) {
      console.error('Error in getAllSongs:', error);
      return [];
    }
  }

  /**
   * ID による単一楽曲取得（抽象化済み）
   */
  async getSongById(id: string): Promise<Song | null> {
    try {
      const filename = `${id}.md`;
      const result = this.fileReader.readSongFile(filename);
      
      if (!result) {
        return null;
      }
      
      // RotomSongsタグチェック
      if (!result.frontmatter.tags?.includes('RotomSongs')) {
        return null;
      }
      
      return this.parser.parse(result.content, result.frontmatter, filename);
    } catch (error) {
      console.error(`Error in getSongById(${id}):`, error);
      return null;
    }
  }

  /**
   * 静的パラメータ生成（抽象化済み）
   */
  async generateStaticParams(): Promise<{ id: string }[]> {
    try {
      const markdownFiles = this.fileReader.getAllMarkdownFiles();
      const rotomSongFiles = this.fileReader.filterRotomSongsFiles(markdownFiles);
      
      return rotomSongFiles.map(filename => ({
        id: filename.replace(/\.md$/, '')
      }));
    } catch (error) {
      console.error('Error in generateStaticParams:', error);
      return [];
    }
  }
}