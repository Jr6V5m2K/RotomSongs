/**
 * ファイル名のID（YYYYMMDDHHMM形式）を日時文字列に変換
 * 例: "202506151729" → "2025/06/15 17:29"
 */
export function formatDateFromId(id: string): string {
  if (!id || typeof id !== 'string') {
    return new Date().toLocaleDateString('ja-JP');
  }
  
  // IDから日時部分を抽出（YYYYMMDDHHMM）
  const match = id.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})$/);
  
  if (!match) {
    // フォールバック: ISO日付がある場合はそれを使用
    return new Date().toLocaleDateString('ja-JP');
  }
  
  const [, year, month, day, hour, minute] = match;
  
  return `${year}/${month}/${day} ${hour}:${minute}`;
}

/**
 * ファイル名のIDからDateオブジェクトを生成
 */
export function parseDateFromId(id: string): Date {
  if (!id || typeof id !== 'string') {
    return new Date();
  }
  
  const match = id.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})$/);
  
  if (!match) {
    return new Date();
  }
  
  const [, year, month, day, hour, minute] = match;
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // 月は0ベース
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
}

/**
 * 日付を"YYYY/MM/DD"形式でフォーマット（一覧表示用）
 */
export function formatDateShort(id: string): string {
  if (!id || typeof id !== 'string') {
    return new Date().toLocaleDateString('ja-JP');
  }
  
  const match = id.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})$/);
  
  if (!match) {
    return new Date().toLocaleDateString('ja-JP');
  }
  
  const [, year, month, day] = match;
  
  return `${year}/${parseInt(month)}/${parseInt(day)}`;
}

/**
 * 年を抽出
 */
export function getYearFromId(id: string): string {
  if (!id || typeof id !== 'string') {
    return new Date().getFullYear().toString();
  }
  
  const match = id.match(/^(\d{4})/);
  return match ? match[1] : new Date().getFullYear().toString();
}

/**
 * 複数の日付形式を統一フォーマットに変換する
 * YYYY-MM-DD または YYYYMMDD_HHMM → YYYY/MM/DD
 */
export function formatDateForDisplay(dateStr: string | number): string {
  const str = String(dateStr);
  
  if (str.includes('-')) {
    // YYYY-MM-DD 形式
    return str.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3');
  } else if (str.includes('_')) {
    // YYYYMMDD_HHMM 形式
    return str.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})/, '$1/$2/$3');
  }
  
  return str;
}
