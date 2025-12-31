'use client';

import Image from 'next/image';
import { getAssetPath } from '@/lib/assetPath';


interface FooterV2Props {
    songCount?: number;
}

export default function FooterV2({ songCount }: FooterV2Props) {
    return (
        <footer className="bg-white/40 backdrop-blur-md border-t border-stone-200 mt-20">
            <div className="container-responsive py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">

                    {/* Message / Branding */}
                    <div className="flex flex-col items-center md:items-start text-stone-500 font-sans">
                        <div className="relative h-8 w-32 mb-2 opacity-80">
                            <Image
                                src={getAssetPath("/images/kadenlogo.svg")}
                                alt="家電和歌集"
                                fill
                                className="object-contain object-center md:object-left"
                            />
                        </div>
                        <p className="text-stone-400 text-xs md:text-sm font-serif pl-1">
                            {songCount || 0} songs for Obata...
                        </p>
                    </div>

                    {/* Links & Info */}
                    <div className="flex flex-col items-center md:items-end gap-2">
                        <a
                            href="https://x.com/Starlystrongest"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span>@Starlystrongest</span>
                        </a>


                    </div>
                </div>

                <div className="border-t border-stone-200 mt-8 pt-8 text-center text-stone-400 text-xs font-sans tracking-wider">
                    <span suppressHydrationWarning>
                        &copy; {new Date().getFullYear()} Rotom Songs. All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
