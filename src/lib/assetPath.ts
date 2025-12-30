/**
 * GitHub Pages用のbasePath付き画像パスを生成
 *
 * @param path - 画像のパス（例: "/images/logo.svg"）
 * @returns basePath付きのパス
 */
export function getAssetPath(path: string): string {
  // 本番環境ではbasePathを追加
  const basePath = process.env.NODE_ENV === 'production' ? '/RotomSongs' : '';

  // 既にhttpで始まっている場合（外部URL）はそのまま返す
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // /で始まらない場合は/を追加
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${basePath}${normalizedPath}`;
}
