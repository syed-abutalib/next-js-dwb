"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  ChevronRight,
  Search,
  TrendingUp,
  Flame,
  Hash,
  Loader2,
  Star,
  ChevronDown,
  Sparkles,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import { apiUrl } from "../common/Config";
import toast from "react-hot-toast";
import { useDebounce } from "react-use";
import { calculateReadTime, formatDate, getExcerpt } from "@/utils/formatters";

// Animation variants
const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  author: string;
  date: string;
  slug: string;
  readTime: string;
  views: number;
  likes: number;
  bookmarks: number;
  imageUrl: string;
  category: string;
  categorySlug?: string;
  isFeatured: boolean;
  isHot: boolean;
  isPopular: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug?: string;
  count?: number;
}

interface ApiResponse {
  success: boolean;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  trending?: any[];
}

const Blog = () => {
  const router = useRouter();
  const isInitialMount = useRef(true);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  // Create a ref to track if a fetch is in progress
  const isFetchingRef = useRef(false);

  // Fetch blogs with filters
  const fetchBlogs = useCallback(
    async (page = 1, reset = true) => {
      // Prevent multiple simultaneous requests
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;

        if (reset) {
          setLoading(true);
        } else {
          setLoadingPage(true);
        }

        const params: Record<string, any> = {
          page,
          limit: 9,
        };

        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedSort === "popular") {
          params.popular = "true";
        } else if (selectedSort === "featured") {
          params.featured = "true";
        } else if (selectedSort === "hot") {
          params.hot = "true";
        }

        const response = await axios.get<ApiResponse>(
          `${apiUrl}/blogs/published`,
          {
            params,
          },
        );

        if (response.data.success) {
          const formatBlogData = (blog: any): Blog => ({
            id: blog._id,
            title: blog.title,
            excerpt: blog.excerpt || getExcerpt(blog.description, 25),
            author: blog.user?.name || "Anonymous",
            date: formatDate(blog.createdAt),
            slug: blog.slug,
            readTime: calculateReadTime(blog.description),
            views: blog.views || 0,
            likes: blog.likes || 0,
            bookmarks: blog.bookmarks || 0,
            imageUrl:
              blog.imageUrl ||
              "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
            category: blog.category?.name || "Uncategorized",
            categorySlug: blog.category?.slug,
            isFeatured: blog.isFeatured || false,
            isHot: blog.isHot || false,
            isPopular: blog.isPopular || false,
          });

          const newBlogs = response.data.data.map(formatBlogData);

          if (reset) {
            setBlogs(newBlogs);
          } else {
            setBlogs((prev) => [...prev, ...newBlogs]);
          }

          setCurrentPage(page);
          setTotalPages(response.data.pagination?.pages || 1);
          setTotalBlogs(response.data.pagination?.total || 0);

          // Set trending blogs if available and it's a reset
          if (response.data.trending && reset) {
            const trending = response.data.trending.map(formatBlogData);
            setTrendingBlogs(trending);
          }
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load blogs");
      } finally {
        setLoading(false);
        setLoadingPage(false);
        isFetchingRef.current = false;
      }
    },
    [selectedCategory, selectedSort, searchQuery],
  );

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get<{ success: boolean; data: Category[] }>(
        `${apiUrl}/blog-categories/with-count`,
      );
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchBlogs(1, true), fetchCategories()]);
    };
    fetchData();
  }, []); // Empty dependency array for initial mount only

  // Handle filter changes - separate useEffect for filter changes
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Debounce filter changes to avoid too many requests
    const timer = setTimeout(() => {
      fetchBlogs(1, true);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSort]); // Remove searchQuery from here

  // Handle search with debounce
  useEffect(() => {
    if (isInitialMount.current) return;

    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchBlogs(1, true);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Handle sort
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
  };

  // Handle search form submit
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchBlogs(1, true);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page === currentPage || loadingPage) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchBlogs(page, true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (loadingPage) return;
    const nextPage = currentPage + 1;
    fetchBlogs(nextPage, false);
  };

  // Handle share
  const handleShare = (blog: Blog) => {
    const shareUrl = `${window.location.origin}/blog/${blog.slug}`;
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  // Handle navigation
  const handleNavigation = (slug: string) => {
    router.push(`/blogs/${slug}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedSort("latest");
    fetchBlogs(1, true);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  return (
    <>
      {/* Hero Header */}
      <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-4">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">BLOG</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover insightful articles, expert opinions, and the latest
              trends from our growing community of writers.
            </p>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles, topics, or authors..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </form>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300 bg-white appearance-none pr-10"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="hot">Hot</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:pb-20 bg-white">
        <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 mb-12 lg:mb-0"
            >
              <div className="sticky top-24 space-y-8">
                {/* Categories */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Categories
                    </h3>
                  </div>
                  <nav className="space-y-1">
                    <motion.button
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryFilter("all")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ${selectedCategory === "all"
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span>All Categories</span>
                    </motion.button>

                    {categories.map((category) => (
                      <motion.button
                        key={category._id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryFilter(category._id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ${selectedCategory === category._id
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100"
                            : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </nav>
                </motion.div>

                {/* Trending Posts */}
                {trendingBlogs.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Trending Now
                        </h3>
                        <p className="text-sm text-gray-500">This week</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {trendingBlogs.slice(0, 5).map((blog, index) => (
                        <motion.article
                          key={blog.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                          onClick={() => handleNavigation(blog.slug)}
                          className="group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-sky-600 flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {blog.title}
                              </h4>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.aside>

            {/* Main Blog Grid */}
            <main className="lg:col-span-9">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 animate-pulse"
                      >
                        <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                        <div className="p-5 space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-6 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : blogs.length > 0 ? (
                  <motion.div
                    key="blogs-grid"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    {/* Active Filters */}
                    {(selectedCategory !== "all" ||
                      searchQuery ||
                      selectedSort !== "latest") && (
                        <motion.div
                          variants={fadeInUp}
                          className="flex flex-wrap items-center gap-2 mb-6"
                        >
                          <span className="text-sm text-gray-600">Filters:</span>
                          {selectedCategory !== "all" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                              {categories.find((c) => c._id === selectedCategory)
                                ?.name || selectedCategory}
                              <button
                                onClick={() => handleCategoryFilter("all")}
                                className="ml-1 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          )}
                          {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full">
                              Search: "{searchQuery}"
                              <button
                                onClick={() => {
                                  setSearchQuery("");
                                  fetchBlogs(1, true);
                                }}
                                className="ml-1 hover:text-purple-800"
                              >
                                ×
                              </button>
                            </span>
                          )}
                          {selectedSort !== "latest" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-full">
                              Sort: {selectedSort}
                              <button
                                onClick={() => handleSortChange("latest")}
                                className="ml-1 hover:text-orange-800"
                              >
                                ×
                              </button>
                            </span>
                          )}
                        </motion.div>
                      )}

                    {/* Blogs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogs.map((blog, index) => (
                        <motion.article
                          key={blog.id}
                          variants={fadeInUp}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
                          onClick={() => handleNavigation(blog.slug)}
                        >
                          {/* Image Container */}
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={blog.imageUrl}
                              alt={blog.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl" />

                            {/* Category Badge */}
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-blue-600/90 text-white">
                                {blog.category}
                              </span>
                            </div>

                            {/* Featured Badge */}
                            {blog.isFeatured && (
                              <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                                  <Star className="w-3 h-3 inline mr-1" />
                                  Featured
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              {blog.isHot && (
                                <span className="px-2 mx-1 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full">
                                  <Flame className="w-3 h-3 inline mr-1" />
                                  Hot
                                </span>
                              )}
                              {blog.isPopular && (
                                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full">
                                  <Sparkles className="w-3 h-3 inline mr-1" />
                                  Popular
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                              {blog.title}
                            </h3>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {blog.excerpt ||
                                getExcerpt(blog.description || "", 25)}
                            </p>

                            {/* Author & Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 bg-sky-200/60 px-3 py-2 rounded-full font-medium">
                                  {blog.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(blog);
                                  }}
                                  className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                                  title="Share"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>

                    {/* Pagination or Load More */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 pt-8"
                      >
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loadingPage}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loadingPage}
                            className={`min-w-[40px] h-10 rounded-lg font-medium transition-all duration-300 ${currentPage === pageNum
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                              }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || loadingPage}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </motion.div>
                    )}

                    {/* Loading Overlay for Page Change */}
                    {loadingPage && (
                      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                          <span className="text-gray-700 font-medium">
                            Loading...
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-300"
                  >
                    <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                      No Articles Found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                      {searchQuery
                        ? `No articles found for "${searchQuery}". Try different keywords or clear filters.`
                        : "No articles available in this category yet."}
                    </p>
                    {(searchQuery || selectedCategory !== "all") && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClearFilters}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300"
                      >
                        Clear All Filters
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
