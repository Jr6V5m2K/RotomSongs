'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAssetPath } from '@/lib/assetPath';


interface HeaderV2Props {
  lastUpdate?: string;
  songCount?: number;
}

export default function HeaderV2({ lastUpdate, songCount }: HeaderV2Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Site Title */}
          <Link href="/" className="group flex items-center">
            <div className="relative h-8 w-32 md:h-10 md:w-40 transition-opacity duration-300 group-hover:opacity-80">
              <Image
                src={getAssetPath("/images/kadenlogo.svg")}
                alt="家電和歌集"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6 md:space-x-8">
            {/* Song Count & Last Update (Hidden on mobile) */}
            {isClient && (songCount !== undefined || lastUpdate) && (
              <div className="hidden md:flex flex-col items-end gap-0.5 text-sm text-stone-500 font-serif">
                {songCount !== undefined && (
                  <div className="tracking-wider">
                    {songCount} songs
                  </div>
                )}
                {lastUpdate && (
                  <div className="tracking-wider">
                    Last Updated: {lastUpdate}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
