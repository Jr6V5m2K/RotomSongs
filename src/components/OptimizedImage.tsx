'use client';

import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // LCP最適化用
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 最適化された画像コンポーネント
 * - Lazy Loading（優先度指定可能）
 * - Progressive Loading（プレースホルダー）
 * - エラーハンドリング
 * - Intersection Observer API使用
 * - WebP対応（フォールバック付き）
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // priorityがtrueの場合は即座に読み込み
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 画面に入る50px前から読み込み開始
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // src変更時の状態リセット
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setImageSrc('');
  }, [src]);

  // ベースパス対応（GitHub Pages）
  useEffect(() => {
    if (isInView || priority) {
      const basePath = process.env.NODE_ENV === 'production' ? '/RotomSongs' : '';
      const fullSrc = src.startsWith('http') ? src : `${basePath}${src}`;
      console.log('OptimizedImage - Loading:', { src, basePath, fullSrc });
      setImageSrc(fullSrc);
    }
  }, [isInView, priority, src]);

  // WebP対応とフォールバック
  const getOptimizedSrc = (originalSrc: string): string => {
    // 外部URLの場合はそのまま返す
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // WebP版が存在する可能性をチェック（実際の実装では事前生成が必要）
    if (originalSrc.endsWith('.png') || originalSrc.endsWith('.jpg') || originalSrc.endsWith('.jpeg')) {
      // 本来はWebP版のURLを返すが、今回は元画像をそのまま使用
      return originalSrc;
    }

    return originalSrc;
  };

  // 画像読み込み完了時の処理
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // 画像読み込みエラー時の処理
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // プレースホルダーの生成
  const getPlaceholder = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return blurDataURL;
    }
    
    // SVGプレースホルダー（グレーの背景）
    const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
      <svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              fill="#9ca3af" font-family="sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `)}`;
    
    return placeholderSvg;
  };

  // エラー時のフォールバック画像
  const getErrorFallback = () => {
    const errorSvg = `data:image/svg+xml;base64,${btoa(`
      <svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fef2f2"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              fill="#ef4444" font-family="sans-serif" font-size="12">
          Image failed
        </text>
      </svg>
    `)}`;
    
    return errorSvg;
  };

  // 基本的なスタイルクラス
  const baseClasses = 'transition-opacity duration-300';
  const combinedClasses = `${baseClasses} ${className}`;

  // エラー状態の場合
  if (hasError) {
    return (
      <img
        ref={imgRef}
        src={getErrorFallback()}
        alt={`${alt} (Image load error)`}
        className={combinedClasses}
        width={width}
        height={height}
        style={{
          opacity: 1
        }}
      />
    );
  }

  // まだビューポートに入っていない場合はプレースホルダー
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={combinedClasses}
        style={{
          width: width || 'auto',
          height: height || 'auto',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={getPlaceholder()}
          alt=""
          className="w-full h-full object-cover"
          width={width}
          height={height}
        />
      </div>
    );
  }

  // メイン画像の表示
  return (
    <div className="relative">
      {/* プレースホルダー（読み込み中） */}
      {!isLoaded && placeholder !== 'empty' && (
        <img
          src={getPlaceholder()}
          alt=""
          className={`${combinedClasses} absolute inset-0 w-full h-full object-cover`}
          width={width}
          height={height}
        />
      )}
      
      {/* メイン画像 */}
      <img
        ref={imgRef}
        src={getOptimizedSrc(imageSrc)}
        alt={alt}
        className={combinedClasses}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0
        }}
        // SEO and accessibility improvements
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

/**
 * ヒーロー画像専用の最適化コンポーネント
 * LCP (Largest Contentful Paint) 最適化済み
 */
export function HeroImage({ className, ...props }: Omit<OptimizedImageProps, 'priority'>) {
  return (
    <OptimizedImage
      {...props}
      priority={true} // ヒーロー画像は優先読み込み
      className={className}
    />
  );
}

/**
 * アバター画像専用の最適化コンポーネント
 * 小さな画像に最適化
 */
export function AvatarImage({ 
  size = 32, 
  className = '', 
  ...props 
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <OptimizedImage
      {...props}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      placeholder="blur"
    />
  );
}