// components/blog/ShareButtons.tsx
'use client';

import { toast } from 'react-hot-toast';
import { Share2, Twitter, Facebook, Linkedin, Copy } from 'lucide-react';

interface ShareButtonsProps {
    title: string;
    excerpt: string;
    slug: string;
}

export const ShareButtons = ({ title, excerpt, slug }: ShareButtonsProps) => {
    const url = `https://dailyworldblog.com/blogs/${slug}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedExcerpt = encodeURIComponent(excerpt);

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

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    return (
        <div className="flex flex-wrap gap-3">
            <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black backdrop-blur-sm rounded-full text-white hover:bg-blue-600 transition-all duration-300"
                aria-label="Share this article"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
            </button>

            <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-700 text-white rounded-full hover:bg-[#1a8cd8] transition-colors"
                aria-label="Share on Twitter"
            >
                <Twitter className="w-5 h-5" />
            </a>

            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-700 text-white rounded-full hover:bg-[#166fe5] transition-colors"
                aria-label="Share on Facebook"
            >
                <Facebook className="w-5 h-5" />
            </a>

            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-700 text-white rounded-full hover:bg-[#0958a8] transition-colors"
                aria-label="Share on LinkedIn"
            >
                <Linkedin className="w-5 h-5" />
            </a>

            <button
                onClick={handleCopyLink}
                className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                aria-label="Copy link"
            >
                <Copy className="w-5 h-5" />
            </button>
        </div>
    );
};