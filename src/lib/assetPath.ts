/**
 * GitHub Pages用のbasePath付き画像パスを生成
 *
 * @param path - 画像のパス（例: "/images/logo.svg"）
 * @returns basePath付きのパス
 */
export function getAssetPath(path: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const basePath = isProduction ? '/RotomSongs' : '';

  // 既にhttpで始まっている場合（外部URL）はそのまま返す
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // /で始まらない場合は/を追加
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 既にbasePathが含まれている場合はそのまま返す（二重付与防止）
  if (basePath && normalizedPath.startsWith(basePath)) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}
