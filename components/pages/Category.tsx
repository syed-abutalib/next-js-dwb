"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
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
import { apiUrl } from "../common/Config";
import toast from "react-hot-toast";

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
  slug: string;
  description?: string;
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

const CategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [selectedSort, setSelectedSort] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Refs for debouncing and cleanup
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Helper functions
  const getExcerpt = useCallback((text: string, wordCount = 25) => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]+>/g, "");
    const words = cleanText.split(" ");
    if (words.length <= wordCount) return cleanText;
    return words.slice(0, wordCount).join(" ") + "...";
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const calculateReadTime = useCallback((content: string) => {
    if (!content) return "2 min read";
    const wordCount = content.split(" ").length;
    const readTime = Math.ceil(wordCount / 200);
    return `${readTime} min read`;
  }, []);

  // Fetch category details
  const fetchCategoryDetails = useCallback(async () => {
    if (!slug) return null;
    try {
      const categoryResponse = await axios.get<{
        success: boolean;
        data: Category;
      }>(`${apiUrl}/blog-categories/${slug}`);
      if (categoryResponse.data.success && isMountedRef.current) {
        setCategory(categoryResponse.data.data);
        return categoryResponse.data.data;
      } else {
        toast.error("Category not found");
        router.push("/");
        return null;
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Failed to load category");
      router.push("/");
      return null;
    }
  }, [slug, router]);

  // Fetch blogs with category data
  const fetchBlogs = useCallback(
    async (page = 1, reset = false, categoryData: Category | null = null) => {
      if (!isMountedRef.current) return;

      try {
        if (reset) {
          setLoading(true);
        } else if (page > 1) {
          setLoadingMore(true);
        }

        // Get category data if not provided
        let categoryToUse = categoryData || category;
        if (!categoryToUse && slug) {
          categoryToUse = await fetchCategoryDetails();
          if (!categoryToUse) return;
        }

        if (!categoryToUse) return;

        // Build params for blogs
        const params: Record<string, any> = {
          page,
          limit: 9,
          category: categoryToUse._id,
        };

        // Add search query if exists
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Add sort filter
        if (selectedSort === "popular") {
          params.sort = "popular";
        } else if (selectedSort === "featured") {
          params.featured = "true";
        } else if (selectedSort === "hot") {
          params.hot = "true";
        } else {
          params.sort = "latest";
        }

        // Single API call for blogs
        const blogsResponse = await axios.get<ApiResponse>(
          `${apiUrl}/blogs/published`,
          {
            params,
          },
        );

        if (blogsResponse.data.success && isMountedRef.current) {
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

          const newBlogs = blogsResponse.data.data.map(formatBlogData);

          if (reset || page === 1) {
            setBlogs(newBlogs);
            setCurrentPage(page);

            // Extract trending and popular blogs only on first load or reset
            if (blogsResponse.data.trending) {
              const trending = blogsResponse.data.trending.map(formatBlogData);
              setTrendingBlogs(trending.slice(0, 5));
            }

            // Get popular blogs (based on views)
            const popular = [...blogsResponse.data.data]
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 3)
              .map(formatBlogData);
            setPopularBlogs(popular);
          } else {
            setBlogs((prev) => [...prev, ...newBlogs]);
            setCurrentPage(page);
          }

          setTotalPages(blogsResponse.data.pagination?.pages || 1);
          setHasMore(page < (blogsResponse.data.pagination?.pages || 1));
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        if (
          axios.isAxiosError(error) &&
          error.response?.status !== 401 &&
          isMountedRef.current
        ) {
          toast.error("Failed to load articles");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [
      category,
      slug,
      searchQuery,
      selectedSort,
      fetchCategoryDetails,
      getExcerpt,
      formatDate,
      calculateReadTime,
    ],
  );

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get<{ success: boolean; data: Category[] }>(
        `${apiUrl}/blog-categories/with-count`,
      );
      if (response.data.success && isMountedRef.current) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    isMountedRef.current = true;

    const fetchInitialData = async () => {
      if (!slug) return;

      setLoading(true);
      setBlogs([]);
      setCategory(null);
      setPopularBlogs([]);
      setTrendingBlogs([]);
      setCurrentPage(1);
      setSearchQuery("");
      setSelectedSort("latest");

      // Fetch categories first if not loaded
      if (categories.length === 0) {
        await fetchCategories();
      }

      // Fetch category details and then blogs
      const categoryData = await fetchCategoryDetails();
      if (categoryData) {
        await fetchBlogs(1, true, categoryData);
      }
    };

    fetchInitialData();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [slug]); // Only depend on slug

  // Handle sort change
  const handleSortChange = async (sort: string) => {
    setSelectedSort(sort);
    await fetchBlogs(1, true);
  };

  // Handle search with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchBlogs(1, true);
      }
    }, 500);
  };

  // Clear search immediately
  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    fetchBlogs(1, true);
  };

  // Load more blogs
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchBlogs(nextPage, false);
  };

  // Handle navigation
  const handleNavigation = (slug: string) => {
    router.push(`/blogs/${slug}`);
  };

  // Get category color based on name
  const getCategoryColor = useCallback((categoryName: string) => {
    const colors: Record<
      string,
      { bg: string; light: string; text: string; border: string }
    > = {
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
      fashion: {
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
      travel: {
        bg: "bg-gradient-to-r from-cyan-500 to-sky-600",
        light: "bg-cyan-50",
        text: "text-cyan-600",
        border: "border-cyan-200",
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
      fashion: Star,
      health: Flame,
      travel: BookOpen,
    };

    if (!categoryName) return Hash;
    const lowerName = categoryName.toLowerCase();
    return icons[lowerName] || Hash;
  }, []);

  const categoryColors = category
    ? getCategoryColor(category.name)
    : getCategoryColor("default");
  const CategoryIcon = category ? getCategoryIcon(category.name) : Hash;

  return (
    <>
      

      <div>
        {/* Hero Header */}
        <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="container mx-auto max-w-[1660px] px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              {/* Category Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6"
              >
                <CategoryIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">
                  CATEGORY
                </span>
              </motion.div>

              {/* Category Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
              >
                Explore{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {category?.name || "Loading..."}
                </span>
              </motion.h1>

              {/* Category Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
              >
                {category?.description ||
                  `Discover the latest articles and insights about ${category?.name || "this category"}`}
              </motion.p>

              {/* Search and Filter Bar */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-4xl mx-auto"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={`Search in ${category?.name || "category"}...`}
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

                  {/* Sort Dropdown */}
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        All Categories
                      </h3>
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
                              className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ${
                                cat.slug === slug
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
                          <h3 className="text-lg font-semibold text-gray-900">
                            Popular in {category?.name}
                          </h3>
                          <p className="text-sm text-gray-500">Most viewed</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {popularBlogs.map((blog, index) => (
                          <motion.article
                            key={blog.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            onClick={() => handleNavigation(blog.slug)}
                            className="group cursor-pointer"
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
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src =
                                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";
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
                          <h3 className="text-lg font-semibold text-gray-900">
                            Trending Now
                          </h3>
                          <p className="text-sm text-gray-500">This week</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {trendingBlogs.map((blog, index) => (
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
                      {(searchQuery || selectedSort !== "latest") && (
                        <motion.div
                          variants={fadeInUp}
                          className="flex flex-wrap items-center gap-2 mb-6"
                        >
                          <span className="text-sm text-gray-600">
                            Filters:
                          </span>
                          {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full">
                              Search: "{searchQuery}"
                              <button
                                onClick={handleClearSearch}
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

                              {/* Hot Badge */}
                              {blog.isHot && (
                                <div className="absolute top-12 right-4">
                                  <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-gradient-to-r from-red-500 to-orange-600 text-white">
                                    <Flame className="w-3 h-3 inline mr-1" />
                                    Hot
                                  </span>
                                </div>
                              )}

                              {/* Stats Overlay */}
                              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{blog.readTime}</span>
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-gray-500 font-medium">
                                  {blog.date}
                                </span>
                                {blog.isPopular && (
                                  <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
                                    <TrendingUp className="w-3 h-3 inline mr-1" />
                                    Popular
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                                {blog.title}
                              </h3>

                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {blog.excerpt ||
                                  getExcerpt(blog.description || "", 30)}
                              </p>
                            </div>
                          </motion.article>
                        ))}
                      </div>

                      {/* Load More */}
                      {hasMore && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center pt-8"
                        >
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
                      <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                        No Articles Found
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-8">
                        {searchQuery
                          ? `No articles found for "${searchQuery}" in ${category?.name}. Try different keywords or clear filters.`
                          : `No articles available in ${category?.name} category yet.`}
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

        {/* Newsletter Section - Commented out as in original */}
        {/* ... */}
      </div>
    </>
  );
};

export default CategoryPage;
