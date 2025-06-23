import DOMPurify from 'dompurify';

/**
 * 楽曲歌詞のセキュアなサニタイゼーション
 * XSS攻撃を防ぎながら、歌詞の基本的なフォーマットを保持
 */
export function sanitizeLyrics(content: string): string {
  // サーバーサイドレンダリング環境の考慮
  if (typeof window === 'undefined') {
    // SSR環境では基本的なエスケープのみ
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // クライアントサイドでのDOMPurify実行
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['br', 'p', 'span'], // 改行、段落、スパンのみ許可
    ALLOWED_ATTR: [], // 属性は一切許可しない
    KEEP_CONTENT: true, // タグ削除時もコンテンツは保持
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style'], // 危険タグの明示的禁止
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'], // イベント属性の禁止
  });
}

/**
 * 検索クエリのサニタイゼーション
 * 検索機能における特殊文字の安全な処理
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }
  
  // 基本的なサニタイゼーション（検索機能なので制限は最小限）
  return query
    .trim()
    .replace(/[<>]/g, '') // HTMLタグの基本的な防止
    .substring(0, 100); // 長すぎるクエリの制限
}

/**
 * 楽曲タイトルのサニタイゼーション
 * タイトル表示における安全性確保
 */
export function sanitizeTitle(title: string): string {
  if (typeof title !== 'string') {
    return 'タイトルなし';
  }

  if (typeof window === 'undefined') {
    return title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return DOMPurify.sanitize(title, {
    ALLOWED_TAGS: [], // タグ一切不許可
    KEEP_CONTENT: true
  });
}