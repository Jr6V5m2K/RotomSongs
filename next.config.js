/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発環境ではSSRを有効にし、本番環境でのみ静的エクスポート
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/RotomSongs' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/RotomSongs' : '',
  // GitHub Pages用の設定
  // experimental.esmExternals removed due to Next.js 15.4 compatibility issues
  // 静的パスの生成


  // Content Security Policy (CSP) 設定
  // GitHub Pages (output: 'export') ではheadersは使用できないため、開発環境のみ適用
  ...(process.env.NODE_ENV !== 'production' ? {
    async headers() {
      // 開発環境では緩いCSPを使用（Next.js 15はunsafe-evalが必要）
      const isDevelopment = process.env.NODE_ENV === 'development';

      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                isDevelopment
                  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" // 開発環境: unsafe-evalを許可
                  : "script-src 'self' 'unsafe-inline'", // 本番環境: unsafe-evalを禁止
                "style-src 'self' 'unsafe-inline' fonts.googleapis.com", // Tailwind CSS用
                "font-src 'self' fonts.gstatic.com", // Web fonts用
                "img-src 'self' data: https:", // 画像とdata URLs
                "connect-src 'self'", // API calls
                "frame-ancestors 'none'", // Clickjacking防止
                "base-uri 'self'", // Base URL制限
                "form-action 'self'" // フォーム送信先制限
              ].join('; ')
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY' // Clickjacking防止
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff' // MIME sniffing防止
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin' // Refererヘッダー制御
            }
          ]
        }
      ];
    }
  } : {})
};

module.exports = nextConfig
