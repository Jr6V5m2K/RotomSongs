'use client';

import Link from 'next/link';

export default function HeaderV2() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Site Title */}
          <Link href="/design-v2" className="group flex flex-col items-start">
            <h1 className="text-2xl font-serif font-bold text-stone-800 tracking-widest group-hover:text-red-700 transition-colors duration-300">
              家電和歌集
            </h1>
            <span className="text-xs font-sans text-stone-500 uppercase tracking-widest group-hover:text-red-500 transition-colors duration-300">
              Rotom Songs
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="/design-v2" 
              className="text-stone-600 hover:text-red-700 font-serif text-sm tracking-wider transition-colors duration-300 border-b-2 border-transparent hover:border-red-700 pb-1"
            >
              一覧
            </Link>
            <Link 
              href="/" 
              className="text-stone-400 hover:text-stone-600 font-sans text-xs tracking-wider transition-colors duration-300"
            >
              現行サイトへ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
