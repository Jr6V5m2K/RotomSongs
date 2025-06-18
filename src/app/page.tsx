import { getSongList } from '@/lib/songs';

export default async function HomePage() {
  // ビルド時に楽曲データを取得
  const songs = await getSongList();

  return (
    <div className="container-responsive py-8">
      {/* ヒーローセクション */}
      <section className="text-center py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Rotom</span>Songs
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 japanese-text">
            家電和歌集
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-12 max-w-2xl mx-auto japanese-text">
            X（旧Twitter）で投稿された替え歌を体系的にまとめたコレクションサイトです。
            <br />
            2023年から現在まで、<span className="font-semibold text-blue-600">{songs.length}曲</span>の替え歌を収録しています。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#songs"
              className="btn-primary text-center"
            >
              楽曲を探す
            </a>
            <a
              href="https://x.com/Starlystrongest"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center"
            >
              X でフォロー
            </a>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            コレクションの特徴
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">豊富なコレクション</h3>
              <p className="text-gray-600 japanese-text">
                2023年から継続的に投稿された83曲の替え歌を、時系列順に整理して収録しています。
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">検索・分類機能</h3>
              <p className="text-gray-600 japanese-text">
                原曲アーティスト、タイトル、歌詞で検索可能。ジャンルやテーマでの絞り込みもできます。
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">原曲情報付き</h3>
              <p className="text-gray-600 japanese-text">
                各替え歌には原曲のアーティスト、タイトル、歌詞情報を併記。元ネタも楽しめます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 最新楽曲プレビュー */}
      <section id="songs" className="py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              最新の楽曲
            </h2>
            <a
              href="/songs"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              すべて見る →
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.slice(0, 6).map((song) => (
              <div key={song.id} className="card card-hover">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {song.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {song.originalArtist} - {song.originalTitle}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {new Date(song.created).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3 japanese-text">
                    {song.lyricsPreview}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {song.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a
                      href={`/songs/${song.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                    >
                      詳細 →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About セクション */}
      <section id="about" className="py-16 bg-gray-50 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            RotomSongs について
          </h2>
          <div className="prose prose-lg mx-auto japanese-text">
            <p className="text-gray-700 leading-relaxed mb-6">
              RotomSongs（家電和歌集）は、X（旧Twitter）アカウント 
              <a 
                href="https://x.com/Starlystrongest" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                @Starlystrongest
              </a> 
              で投稿された替え歌をまとめたコレクションサイトです。
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              2023年2月から始まった創作活動で、様々な人気楽曲をベースにした替え歌を制作。
              野球、日常生活、時事ネタなど幅広いテーマで、ユニークで親しみやすい替え歌を投稿し続けています。
            </p>
            <p className="text-gray-700 leading-relaxed">
              このサイトでは、投稿された替え歌を検索・閲覧しやすい形で整理し、
              原曲情報と合わせて楽しんでいただけるよう構成しています。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
