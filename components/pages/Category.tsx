// components/pages/CategoryClient.tsx
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Hash,
  TrendingUp,
  Sparkles,
  Flame,
  Search,
  ChevronRight,
  BookOpen,
  Zap,
  Star,
  ChevronDown,
  Loader2,
  NewspaperIcon,
  TrendingUp as TrendingUpIcon,
  Flame as FlameIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { getExcerpt } from "@/utils/formatters";
import BlogCard from "../common/BlogCard";

// Types
interface FormattedBlog {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  author: string;
  date: string;
  createdAt: string;
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
  slug: string;
  description?: string;
  count?: number;
}

interface CategoryClientProps {
  initialData: {
    category: Category;
    blogs: FormattedBlog[];
    categories: Category[];
    trending: FormattedBlog[];
    popular: FormattedBlog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    currentFilters: {
      sort: string;
      search: string;
      page: number;
    };
  };
}

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

const CategoryClient = ({ initialData }: CategoryClientProps) => {
  const router = useRouter();
  const isInitialMount = useRef(true);
  const isFetchingRef = useRef(false);

  // Use initial data from server
  const [category] = useState(initialData.category);
  const [blogs, setBlogs] = useState<FormattedBlog[]>(initialData.blogs);
  const [categories] = useState<Category[]>(initialData.categories);
  const [trendingBlogs] = useState<FormattedBlog[]>(initialData.trending);
  const [popularBlogs] = useState<FormattedBlog[]>(initialData.popular);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [selectedSort, setSelectedSort] = useState<string>(initialData.currentFilters.sort);
  const [searchQuery, setSearchQuery] = useState<string>(initialData.currentFilters.search);
  const [currentPage, setCurrentPage] = useState<number>(initialData.currentFilters.page);
  const [totalPages, setTotalPages] = useState<number>(initialData.pagination.pages);
  const [hasMore, setHasMore] = useState<boolean>(
    initialData.currentFilters.page < initialData.pagination.pages
  );

  // Search timeout ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update URL with filters
  const updateURL = useCallback(
    (params: Record<string, string | number>) => {
      const urlParams = new URLSearchParams();

      if (params.sort && params.sort !== "latest") {
        urlParams.set("sort", params.sort.toString());
      }
      if (params.search && params.search.toString().trim()) {
        urlParams.set("search", params.search.toString());
      }
      if (params.page && params.page !== 1) {
        urlParams.set("page", params.page.toString());
      }

      const queryString = urlParams.toString();
      const newUrl = queryString ? `/category/${category.slug}?${queryString}` : `/category/${category.slug}`;

      router.replace(newUrl, { scroll: false });
    },
    [router, category.slug]
  );

  // Fetch blogs with filters
  const fetchBlogs = useCallback(
    async (page = 1, reset = true) => {
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;

        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params: Record<string, any> = {
          page,
          limit: 9,
          category: category._id,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedSort === "popular") {
          params.popular = "true";
        } else if (selectedSort === "featured") {
          params.featured = "true";
        } else if (selectedSort === "hot") {
          params.hot = "true";
        } else {
          params.sort = "latest";
        }

        const response = await fetch(`/api/blogs/category?${new URLSearchParams(params).toString()}`);

        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();

        if (reset) {
          setBlogs(data.blogs);
          setCurrentPage(page);
          setTotalPages(data.pagination.pages);
          setHasMore(page < data.pagination.pages);
        } else {
          setBlogs((prev) => [...prev, ...data.blogs]);
          setCurrentPage(page);
          setHasMore(page < data.pagination.pages);
        }

        // Update URL
        updateURL({
          sort: selectedSort !== "latest" ? selectedSort : "",
          search: searchQuery || "",
          page: page !== 1 ? page : "",
        });
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load articles");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [category._id, searchQuery, selectedSort, updateURL]
  );

  // Handle filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchBlogs(1, true);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedSort, fetchBlogs]);

  // Handle search with debounce
  useEffect(() => {
    if (isInitialMount.current) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchBlogs(1, true);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchBlogs]);

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    fetchBlogs(1, true);
  };

  // Load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchBlogs(nextPage, false);
  };

  // Get category color
  const getCategoryColor = useCallback((categoryName: string) => {
    const colors: Record<string, { bg: string; light: string; text: string; border: string }> = {
      technology: {
        bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
        light: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      finance: {
        bg: "bg-gradient-to-r from-emerald-500 to-teal-600",
        light: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      business: {
        bg: "bg-gradient-to-r from-purple-500 to-pink-600",
        light: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      "fashion & beauty": {
        bg: "bg-gradient-to-r from-pink-500 to-rose-600",
        light: "bg-pink-50",
        text: "text-pink-600",
        border: "border-pink-200",
      },
      health: {
        bg: "bg-gradient-to-r from-green-500 to-emerald-600",
        light: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
      },
      games: {
        bg: "bg-gradient-to-r from-red-500 to-orange-600",
        light: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
      },
      default: {
        bg: "bg-gradient-to-r from-gray-500 to-gray-600",
        light: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200",
      },
    };

    if (!categoryName) return colors.default;
    const lowerName = categoryName.toLowerCase();
    return colors[lowerName] || colors.default;
  }, []);

  // Get category icon
  const getCategoryIcon = useCallback((categoryName: string) => {
    const icons: Record<string, any> = {
      technology: Sparkles,
      finance: TrendingUp,
      business: Zap,
      "fashion & beauty": Star,
      health: Flame,
      games: BookOpen,
    };

    if (!categoryName) return Hash;
    const lowerName = categoryName.toLowerCase();
    return icons[lowerName] || Hash;
  }, []);

  const categoryColors = getCategoryColor(category.name);
  const CategoryIcon = getCategoryIcon(category.name);

  return (
    <>
      {/* Hero Header */}
      <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="container mx-auto max-w-[1660px] px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6"
            >
              <CategoryIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">CATEGORY</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
            >
              Explore{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {category.name}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
            >
              {category.description ||
                `Discover the latest articles and insights about ${category.name}`}
            </motion.p>

            {/* Search and Filter Bar */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Search in ${category.name}...`}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300 bg-white appearance-none pr-10"
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Most Popular</option>
                    <option value="featured">Featured</option>
                    <option value="hot">Hot</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto max-w-[1660px] px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 mb-12 lg:mb-0"
            >
              <div className="sticky top-24 space-y-8">
                {/* All Categories */}
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
                    <h3 className="text-lg font-semibold text-gray-900">All Categories</h3>
                  </div>
                  <nav className="space-y-2">
                    {categories.map((cat) => {
                      const catColors = getCategoryColor(cat.name);
                      return (
                        <motion.div
                          key={cat._id}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            href={`/category/${cat.slug}`}
                            className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ${cat.slug === category.slug
                              ? `${catColors.light} ${catColors.text} border ${catColors.border}`
                              : "text-gray-600 hover:bg-gray-50"
                              }`}
                          >
                            <span>{cat.name}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                </motion.div>

                {/* Popular in This Category */}
                {popularBlogs.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                        <TrendingUpIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Popular in {category.name}</h3>
                        <p className="text-sm text-gray-500">Most viewed</p>
                      </div>
                    </div>
                    <div className="space-y-4 ">
                      {popularBlogs.map((blog, index) => (
                        <Link key={blog.id} href={`/blogs/${blog.slug}`} prefetch={false}>
                          <motion.article
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="group cursor-pointer mb-2"
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                                  <Image
                                    src={blog.imageUrl}
                                    alt={blog.title}
                                    fill
                                    sizes="48px"
                                    className="object-cover group-hover:scale-110 transition-transform duration-300 rounded-lg"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                  {blog.title}
                                </h4>
                              </div>
                            </div>
                          </motion.article>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Trending Now */}
                {trendingBlogs.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center">
                        <FlameIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Trending Now</h3>
                        <p className="text-sm text-gray-500">This week</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {trendingBlogs.map((blog, index) => (
                        <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                          <motion.article
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                                  {blog.title}
                                </h4>
                              </div>
                            </div>
                          </motion.article>
                        </Link>
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
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
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
                    {(searchQuery || selectedSort !== "latest") && (
                      <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-sm text-gray-600">Filters:</span>
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full">
                            Search: "{searchQuery}"
                            <button onClick={handleClearSearch} className="ml-1 hover:text-purple-800">
                              ×
                            </button>
                          </span>
                        )}
                        {selectedSort !== "latest" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-full">
                            Sort: {selectedSort}
                            <button onClick={() => handleSortChange("latest")} className="ml-1 hover:text-orange-800">
                              ×
                            </button>
                          </span>
                        )}
                      </motion.div>
                    )}

                    {/* Blogs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogs.map((blog, index) => (
                        <BlogCard
                          key={blog.id}
                          id={blog.id}
                          title={blog.title}
                          excerpt={blog.excerpt}
                          date={blog.date}
                          slug={blog.slug}
                          readTime={blog.readTime}
                          imageUrl={blog.imageUrl}
                          category={blog.category}
                          variant="default"
                          showBadge={true}
                          showStats={true}
                        />
                      ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-8">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load More Articles
                              <ChevronRight className="w-5 h-5 inline ml-2" />
                            </>
                          )}
                        </motion.button>
                      </motion.div>
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
                    <NewspaperIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-600 mb-3">No Articles Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                      {searchQuery
                        ? `No articles found for "${searchQuery}" in ${category.name}. Try different keywords or clear filters.`
                        : `No articles available in ${category.name} category yet.`}
                    </p>
                    {searchQuery && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClearSearch}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300"
                      >
                        Clear Search
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

export default CategoryClient;