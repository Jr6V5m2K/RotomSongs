'use client';

import HeaderV2 from './HeaderV2';
import FooterV2 from './FooterV2';

interface LayoutV2Props {
    children: React.ReactNode;
    lastUpdate?: string;
    songCount?: number;
}

export default function LayoutV2({ children, lastUpdate, songCount }: LayoutV2Props) {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-red-100 selection:text-red-900 relative">
            {/* Ambient Background Gradients */}
            {/* Ambient Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-orange-200/40 to-red-300/30 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tl from-lime-200/40 to-green-300/30 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10">
                <HeaderV2 lastUpdate={lastUpdate} songCount={songCount} />
                <main className="pt-20 min-h-[calc(100vh-200px)]">
                    {children}
                </main>
                <FooterV2 songCount={songCount} />
            </div>
        </div>
    );
}
