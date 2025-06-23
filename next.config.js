/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/RotomSongs' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/RotomSongs' : '',
  // GitHub Pages用の設定
  experimental: {
    esmExternals: false
  },
  // 静的パスの生成
  generateBuildId: () => 'build',
  
  // Content Security Policy (CSP) 設定
  // 注意: GitHub Pagesでは独自ヘッダーは無視されるが、開発環境とセルフホスト環境での保護を提供
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'", // Next.js inline scripts用
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
}

module.exports = nextConfig
