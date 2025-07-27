import { z } from 'zod';

/**
 * 楽曲フロントマターのスキーマ定義
 * 実際のYAMLフォーマットに対応した柔軟な型定義
 */
export const SongFrontmatterSchema = z.object({
  title: z.union([z.string(), z.number()]).transform(String),
  id: z.union([z.string(), z.number()]).transform(String),
  created: z.union([z.string(), z.date()]).transform(val => {
    if (val instanceof Date) {
      return val.toISOString().split('T')[0]; // YYYY-MM-DD形式
    }
    // ISO文字列の場合は日付部分のみ抽出
    const stringVal = String(val);
    if (stringVal.includes('T')) {
      return stringVal.split('T')[0];
    }
    return stringVal;
  }),
  updated: z.union([z.string(), z.date()]).transform(val => {
    if (val instanceof Date) {
      return val.toISOString().split('T')[0]; // YYYY-MM-DD形式
    }
    // ISO文字列の場合は日付部分のみ抽出
    const stringVal = String(val);
    if (stringVal.includes('T')) {
      return stringVal.split('T')[0];
    }
    return stringVal;
  }),
  tags: z.array(z.string()).optional().default([])
});

export type ValidatedFrontmatter = z.infer<typeof SongFrontmatterSchema>;

/**
 * フロントマターの安全な検証
 * @param data 未検証のフロントマターデータ
 * @returns 検証済みフロントマター
 * @throws SongValidationError 検証失敗時
 */
export function validateFrontmatter(data: unknown, filename?: string): ValidatedFrontmatter {
  try {
    const result = SongFrontmatterSchema.parse(data);
    
    // 追加の業務ロジック検証
    if (result.tags.includes('RotomSongs')) {
      // RotomSongsタグがある場合の追加検証
      if (!result.title || result.title.trim().length === 0) {
        throw new Error("RotomSongsタグがある楽曲にはタイトルが必要です");
      }
    }
    
    return result;
  } catch (error) {
    const context = filename ? ` [ファイル: ${filename}]` : '';
    
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new SongValidationError(
        `フロントマター検証エラー${context}: ${messages.join(', ')}`
      );
    }
    
    throw new SongValidationError(
      `フロントマター処理エラー${context}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 楽曲検証専用エラークラス
 */
export class SongValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SongValidationError';
  }
}

/**
 * 楽曲データの安全な取得
 * 検証失敗時はログ出力し、nullを返す（グレースフル・デグラデーション）
 */
export function safeValidateFrontmatter(data: unknown, filename?: string): ValidatedFrontmatter | null {
  try {
    return validateFrontmatter(data, filename);
  } catch (error) {
    console.error('楽曲データ検証失敗:', error instanceof Error ? error.message : String(error));
    
    // 開発環境では詳細エラーを表示
    if (process.env.NODE_ENV === 'development') {
      console.error('検証失敗データ:', data);
      console.error('ファイル名:', filename);
    }
    
    return null;
  }
}

/**
 * バッチ処理用の楽曲データ検証
 * 複数ファイルの一括検証時に使用
 */
export function validateSongBatch(songDataList: { data: unknown; filename: string }[]): {
  valid: Array<{ data: ValidatedFrontmatter; filename: string }>;
  invalid: Array<{ filename: string; error: string }>;
} {
  const valid: Array<{ data: ValidatedFrontmatter; filename: string }> = [];
  const invalid: Array<{ filename: string; error: string }> = [];
  
  for (const { data, filename } of songDataList) {
    try {
      const validatedData = validateFrontmatter(data, filename);
      valid.push({ data: validatedData, filename });
    } catch (error) {
      invalid.push({ 
        filename, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
  
  return { valid, invalid };
}