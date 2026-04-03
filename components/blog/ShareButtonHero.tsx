// components/blog/ShareButtonHero.tsx
'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareButtonHeroProps {
    title: string;
    excerpt: string;
    slug: string;
}

export const ShareButtonHero = ({ title, excerpt, slug }: ShareButtonHeroProps) => {
    const url = `https://dailyworldblog.com/blogs/${slug}`;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: excerpt,
                url: url,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Share this article"
        >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
        </button>
    );
};