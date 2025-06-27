/**
 * 日付解析の結果を表すインターフェース
 */
interface ParsedDateComponents {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  isValid: boolean;
}

/**
 * 各種日付形式のパターン定義
 */
const DATE_PATTERNS = {
  // YYYYMMDD_HHMM 形式（楽曲ID）
  songId: /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})$/,
  // YYYY-MM-DD 形式
  isoDate: /^(\d{4})-(\d{2})-(\d{2})$/,
  // YYYY-MM-DD HH:MM 形式
  isoDateTime: /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/,
  // 年のみ
  yearOnly: /^(\d{4})$/
} as const;

/**
 * 統一された日付解析関数
 * 複数の日付形式に対応し、一度の解析で全コンポーネントを抽出
 */
function parseDateComponents(input: string | number | Date): ParsedDateComponents {
  // Dateオブジェクトの場合
  if (input instanceof Date) {
    return {
      year: input.getFullYear(),
      month: input.getMonth() + 1, // 1ベースに変換
      day: input.getDate(),
      hour: input.getHours(),
      minute: input.getMinutes(),
      isValid: !isNaN(input.getTime())
    };
  }

  const str = String(input).trim();
  
  if (!str) {
    return { year: 0, month: 0, day: 0, isValid: false };
  }

  // 楽曲ID形式（YYYYMMDD_HHMM）の解析
  let match = str.match(DATE_PATTERNS.songId);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      isValid: true
    };
  }

  // ISO日時形式（YYYY-MM-DD HH:MM）の解析
  match = str.match(DATE_PATTERNS.isoDateTime);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      isValid: true
    };
  }

  // ISO日付形式（YYYY-MM-DD）の解析
  match = str.match(DATE_PATTERNS.isoDate);
  if (match) {
    const [, year, month, day] = match;
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      isValid: true
    };
  }

  // 年のみの解析
  match = str.match(DATE_PATTERNS.yearOnly);
  if (match) {
    const [, year] = match;
    return {
      year: parseInt(year, 10),
      month: 1,
      day: 1,
      isValid: true
    };
  }

  return { year: 0, month: 0, day: 0, isValid: false };
}

/**
 * フォールバック日付の生成
 */
function getDefaultDateString(format: 'short' | 'full' | 'year' = 'short'): string {
  const now = new Date();
  
  switch (format) {
    case 'full':
      return now.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'year':
      return now.getFullYear().toString();
    default:
      return now.toLocaleDateString('ja-JP');
  }
}

/**
 * ファイル名のID（YYYYMMDDHHMM形式）を日時文字列に変換
 * 例: "20250615_1729" → "2025/06/15 17:29"
 */
export function formatDateFromId(id: string): string {
  const parsed = parseDateComponents(id);
  
  if (!parsed.isValid) {
    return getDefaultDateString('full');
  }
  
  const { year, month, day, hour, minute } = parsed;
  
  if (hour !== undefined && minute !== undefined) {
    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  
  return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
}

/**
 * ファイル名のIDからDateオブジェクトを生成
 */
export function parseDateFromId(id: string): Date {
  const parsed = parseDateComponents(id);
  
  if (!parsed.isValid) {
    return new Date();
  }
  
  const { year, month, day, hour = 0, minute = 0 } = parsed;
  
  return new Date(year, month - 1, day, hour, minute); // 月は0ベース
}

/**
 * 日付を"YYYY/M/D"形式でフォーマット（一覧表示用）
 * ゼロパディングなしの短縮形式
 */
export function formatDateShort(id: string): string {
  const parsed = parseDateComponents(id);
  
  if (!parsed.isValid) {
    return getDefaultDateString('short');
  }
  
  const { year, month, day } = parsed;
  
  return `${year}/${month}/${day}`;
}

/**
 * 年を抽出
 */
export function getYearFromId(id: string): string {
  const parsed = parseDateComponents(id);
  
  if (!parsed.isValid) {
    return getDefaultDateString('year');
  }
  
  return parsed.year.toString();
}

/**
 * 複数の日付形式を統一フォーマットに変換する
 * 入力形式を自動判別して YYYY/MM/DD 形式に統一
 */
export function formatDateForDisplay(dateInput: string | number | Date): string {
  const parsed = parseDateComponents(dateInput);
  
  if (!parsed.isValid) {
    return getDefaultDateString('short');
  }
  
  const { year, month, day } = parsed;
  
  return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
}

/**
 * 相対時間の表示（"2日前", "1週間前"など）
 */
export function formatRelativeTime(id: string): string {
  const date = parseDateFromId(id);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '昨日';
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}週間前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}ヶ月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}年前`;
  }
}

/**
 * 日付の妥当性チェック
 */
export function isValidDate(dateInput: string | number | Date): boolean {
  const parsed = parseDateComponents(dateInput);
  return parsed.isValid;
}

/**
 * 日付範囲での絞り込み用ヘルパー
 */
export function isDateInRange(
  id: string, 
  startDate?: string, 
  endDate?: string
): boolean {
  if (!startDate && !endDate) return true;
  
  const targetDate = parseDateFromId(id);
  
  if (startDate) {
    const start = parseDateFromId(startDate);
    if (targetDate < start) return false;
  }
  
  if (endDate) {
    const end = parseDateFromId(endDate);
    if (targetDate > end) return false;
  }
  
  return true;
}
