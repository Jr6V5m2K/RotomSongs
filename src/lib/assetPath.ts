/**
 * GitHub Pages用のbasePath付き画像パスを生成
 *
 * @param path - 画像のパス（例: "/images/logo.svg"）
 * @returns basePath付きのパス
 */
export function getAssetPath(path: string): string {
  // サーバーサイドでのみbasePathを追加
  // クライアントサイドでは常に空（Next.jsのbasePathが自動的に適用される）
  if (typeof window !== 'undefined') {
    // クライアントサイド: そのまま返す
    return path.startsWith('/') ? path : `/${path}`;
  }

  // サーバーサイド: 本番環境のみbasePathを追加
  const basePath = process.env.NODE_ENV === 'production' ? '/RotomSongs' : '';

  // 既にhttpで始まっている場合（外部URL）はそのまま返す
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // /で始まらない場合は/を追加
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${basePath}${normalizedPath}`;
}
