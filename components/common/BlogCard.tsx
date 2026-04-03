// components/blog/BlogCard.tsx
"use client";
import React from "react";
import Link from "next/link";
import { CalendarDays, Clock, Flame, Eye, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/utils/animations";
import OptimizedImage from "@/components/common/OptimizedImage";

export interface BlogCardProps {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    slug: string;
    readTime: string;
    imageUrl: string;
    category: string;
    views?: number;
    likes?: number;
    isPopular?: boolean;
    isHot?: boolean;
    isFeatured?: boolean;
    variant?: "default" | "compact" | "horizontal" | "featured";
    showBadge?: boolean;
    showStats?: boolean;
    className?: string;
    onCardClick?: (slug: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
    id,
    title,
    excerpt,
    date,
    slug,
    readTime,
    imageUrl,
    category,
    views,
    likes,
    isPopular = false,
    isHot = false,
    isFeatured = false,
    variant = "default",
    showBadge = true,
    showStats = true,
    className = "",
    onCardClick,
}) => {
    const handleClick = () => {
        if (onCardClick) {
            onCardClick(slug);
        }
    };

    // Variant styles
    const variants = {
        default: {
            container: "bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500",
            image: "h-48",
            content: "p-5",
            titleSize: "text-lg",
            excerptLines: "line-clamp-3",
            badgePosition: "top-4 left-4",
        },
        compact: {
            container: "bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300",
            image: "h-32",
            content: "p-3",
            titleSize: "text-sm font-semibold",
            excerptLines: "line-clamp-2",
            badgePosition: "top-2 left-2",
        },
        horizontal: {
            container: "bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 flex",
            image: "w-32 h-32 flex-shrink-0",
            content: "p-4 flex-1",
            titleSize: "text-base font-semibold",
            excerptLines: "line-clamp-2",
            badgePosition: "top-2 left-2",
        },
        featured: {
            container: "relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl group",
            image: "absolute inset-0 w-full h-full",
            content: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 flex flex-col justify-end",
            titleSize: "text-2xl md:text-3xl font-bold text-white",
            excerptLines: "line-clamp-3 text-gray-200",
            badgePosition: "top-4 left-4",
        },
    };

    const currentVariant = variants[variant];

    // Badge configuration
    const getBadge = () => {
        if (!showBadge) return null;

        if (isPopular) {
            return {
                text: "Popular",
                icon: <Flame className="w-3 h-3 inline mr-1" />,
                className: "bg-gradient-to-r from-orange-500 to-red-600 text-white",
            };
        }
        if (isHot) {
            return {
                text: "Hot",
                icon: <Flame className="w-3 h-3 inline mr-1" />,
                className: "bg-gradient-to-r from-red-500 to-orange-600 text-white",
            };
        }
        if (isFeatured) {
            return {
                text: "Featured",
                icon: null,
                className: "bg-gradient-to-r from-purple-500 to-pink-600 text-white",
            };
        }
        return null;
    };

    const badge = getBadge();

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: variant !== "featured" ? -4 : 0 }}
            transition={{ duration: 0.3 }}
            className={`${currentVariant.container} ${className} cursor-pointer group`}
            onClick={handleClick}
        >
            <Link href={`/blogs/${slug}`} className="block h-full">
                {/* Image Section */}
                <div className={`relative ${currentVariant.image} overflow-hidden`}>
                    <OptimizedImage
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Badge */}
                    {badge && (
                        <div className={`absolute ${currentVariant.badgePosition} z-10`}>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${badge.className}`}>
                                {badge.icon}
                                {badge.text}
                            </span>
                        </div>
                    )}

                    {/* Gradient Overlay for featured variant */}
                    {variant === "featured" && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    )}
                </div>

                {/* Content Section */}
                <div className={currentVariant.content}>
                    {/* Category */}
                    <div className="mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${variant === "featured"
                            ? "bg-blue-600/90 text-white"
                            : "bg-orange-100 text-orange-700"
                            }`}>
                            {category}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${currentVariant.titleSize}`}>
                        {title}
                    </h3>

                    {/* Excerpt */}
                    <p className={`text-gray-600 text-sm mb-3 ${currentVariant.excerptLines}`}>
                        {excerpt}
                    </p>

                    {/* Stats */}
                    {showStats && (
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{readTime}</span>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Read More Button (optional) */}
                    {variant === "featured" && (
                        <button className="mt-4 px-6 py-2 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 w-fit">
                            Read Story
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};

export default BlogCard;