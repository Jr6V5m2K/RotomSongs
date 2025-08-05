import { Metadata } from 'next';

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://jr6v5m2k.github.io/RotomSongs'
  : 'http://localhost:3000';

export const siteConfig = {
  name: 'RotomSongs - 家電和歌集',
  description: '替え歌コレクション「家電和歌集」- X（旧Twitter）で投稿された112曲の替え歌を体系的にまとめたコレクションサイトです。',
  url: baseUrl,
  ogImage: `${baseUrl}/images/social/twitter.png`,
  creator: 'Jr6V5m2K',
  keywords: [
    '替え歌',
    'パロディソング',
    '家電和歌集',
    'RotomSongs',
    '楽曲コレクション',
    'Twitter替え歌',
    '音楽パロディ'
  ]
};

export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@Starlystrongest' // 実際のTwitterアカウント
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  manifest: `${baseUrl}/manifest.json`,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/images/social/favicon-16x16.png',
    apple: '/images/social/apple-touch-icon.png'
  }
};

/**
 * 楽曲詳細ページ用のメタデータ生成
 */
export function generateSongMetadata(
  songTitle: string,
  originalArtist: string,
  originalTitle: string,
  lyricsPreview: string,
  songId: string
): Metadata {
  const title = `${songTitle} (${originalArtist} - ${originalTitle}の替え歌)`;
  const description = `${originalArtist}「${originalTitle}」の替え歌です。${lyricsPreview}`;
  const url = `${baseUrl}/songs/${songId}`;

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage]
    },
    alternates: {
      canonical: url
    }
  };
}
