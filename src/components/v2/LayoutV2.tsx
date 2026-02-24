'use client';

import HeaderV2 from './HeaderV2';
import Footer from '@/components/Footer'; // Temporarily reusing Footer, or we can make FooterV2 later

export default function LayoutV2({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-red-100 selection:text-red-900">
            <HeaderV2 />
            <main className="pt-20 min-h-[calc(100vh-200px)]">
                {children}
            </main>
            <Footer />
        </div>
    );
}
