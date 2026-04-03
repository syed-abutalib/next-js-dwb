// components/blog/TableOfContents.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Menu } from 'lucide-react';

interface TableOfContentsProps {
    content: string;
}

export const TableOfContents = ({ content }: TableOfContentsProps) => {
    const [activeId, setActiveId] = useState<string>("");
    const [isVisible, setIsVisible] = useState(true);

    const headings = useMemo(() => {
        if (typeof window === 'undefined') return [];
        const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
        const matches = [...content.matchAll(regex)];
        return matches.map(match => ({
            level: match[1],
            id: match[2],
            text: match[3].replace(/<[^>]+>/g, ''),
        }));
    }, [content]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0px 0px -40% 0px' }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className={`bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8 ${!isVisible ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Menu className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg text-gray-900">Table of Contents</h3>
                </div>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={isVisible ? "Hide table of contents" : "Show table of contents"}
                >
                    {isVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>
            <ul className="space-y-2">
                {headings.map((heading, i) => (
                    <li key={i} className={`${heading.level === '3' ? 'ml-4' : ''}`}>
                        <a
                            href={`#${heading.id}`}
                            className={`text-sm transition-colors hover:text-blue-600 ${activeId === heading.id
                                ? 'text-blue-600 font-medium'
                                : 'text-gray-600'
                                }`}
                            onClick={(e) => handleClick(e, heading.id)}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};