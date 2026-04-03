// components/blog/BlogSkeleton.tsx
import React from "react";

export const BlogSkeleton = () => {
    return (
        <section className="py-12 md:py-16 lg:py-20 bg-white">
            <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                {/* Hero Skeleton */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 animate-pulse mb-4">
                        <div className="w-4 h-4 bg-gray-300 rounded" />
                        <div className="w-12 h-4 bg-gray-300 rounded" />
                    </div>
                    <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4" />
                    <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
                </div>

                {/* Search Bar Skeleton */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="w-40 h-12 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-3 mb-12 lg:mb-0">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog Grid Skeleton */}
                    <div className="lg:col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-t-2xl" />
                                    <div className="p-5 space-y-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-6 bg-gray-200 rounded" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};