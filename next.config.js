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
  generateBuildId: () => 'build'
}

module.exports = nextConfig
