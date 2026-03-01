"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Flame,
  Zap,
  BookOpen,
  Hash,
  AlertCircle,
  NewspaperIcon,
  Clock,
  Filter,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  apiUrl,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "../common/Config";
import toast from "react-hot-toast";
import { calculateReadTime, formatDate, getExcerpt } from "@/utils/formatters";
import { fadeInUp, scaleIn, staggerContainer } from "@/utils/animations";
import { CATEGORY_CONFIG } from "@/utils/constants";

const LeftSwiperSkeleton = React.memo(() => (
  <div className="lg:col-span-2">
    <div className="relative h-[600px] md:h-[700px] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
  </div>
));

const RightSwiperSkeleton = React.memo(() => (
  <div className="relative">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
    <div className="h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse" />
  </div>
));

const CategorySkeleton = React.memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="bg-white rounded-2xl p-5 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((post) => (
            <div
              key={post}
              className="flex gap-3 py-3 border-t border-gray-100"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
));

// Types
interface Blog {
  _id: string;
  id?: string;
  title: string;
  excerpt?: string;
  description: string;
  createdAt: string;
  slug: string;
  imageUrl?: string;
  isFeatured?: boolean;
  isHot?: boolean;
  isPopular?: boolean;
  views?: number;
  likes?: number;
  user?: {
    _id: string;
    name: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface FormattedBlog {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  createdAt: string;
  slug: string;
  readTime: string;
  views: number;
  likes: number;
  imageUrl: string;
  category: string;
  categoryId?: string;
  categorySlug?: string;
  isFeatured: boolean;
  isHot: boolean;
  isPopular: boolean;
  description?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  blogCount?: number;
}

interface CategorySection extends Category {
  posts: FormattedBlog[];
  borderColor?: string;
  textColor?: string;
  bgColor?: string;
}

// Optimized Image Component
const OptimizedImage = React.memo(({
  src,
  alt,
  className,
  fallbackSrc,
  width,
  height
}: {
  src: string;
  alt: string;
  className: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const fallbackImage = fallbackSrc ||
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";

  return (
    <div className={`relative ${className}`} style={{ width: width || '100%', height: height || '100%' }}>
      <Image
        src={error ? fallbackImage : imgSrc}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Main Component
const Home = () => {
  const router = useRouter();

  const [featuredPosts, setFeaturedPosts] = useState<FormattedBlog[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<FormattedBlog[]>([]);
  const [latestPosts, setLatestPosts] = useState<FormattedBlog[]>([]);
  const [popularPosts, setPopularPosts] = useState<FormattedBlog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPosts, setCategoryPosts] = useState<Record<string, FormattedBlog[]>>({});
  const [loading, setLoading] = useState(true);

  // Refs
  const leftSwiperRef = useRef<any>(null);
  const rightSwiperRef = useRef<any>(null);
  const leftPrevRef = useRef<HTMLButtonElement>(null);
  const leftNextRef = useRef<HTMLButtonElement>(null);
  const rightPrevRef = useRef<HTMLButtonElement>(null);
  const rightNextRef = useRef<HTMLButtonElement>(null);

  // Memoized formatter
  const formatBlogData = useCallback(
    (blog: Blog): FormattedBlog => ({
      id: blog._id,
      title: blog.title,
      excerpt: blog.excerpt || getExcerpt(blog.description, 25),
      author: blog.user?.name || "Anonymous",
      date: formatDate(blog.createdAt),
      createdAt: blog.createdAt,
      slug: blog.slug,
      readTime: calculateReadTime(blog.description),
      views: blog.views || 0,
      likes: blog.likes || 0,
      imageUrl:
        blog.imageUrl ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
      category: blog.category?.name || "Uncategorized",
      categoryId: blog.category?._id,
      categorySlug: blog.category?.slug,
      isFeatured: blog.isFeatured || false,
      isHot: blog.isHot || false,
      isPopular: blog.isPopular || false,
    }),
    [],
  );

  // Fetch all data - Optimized with Promise.all and request cancellation
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [blogsResponse, categoriesResponse] = await Promise.all([
        axios.get(`${apiUrl}/blogs/published`, {
          params: { limit: 10 },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }),
        axios.get(`${apiUrl}/blog-categories/with-count`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }),
      ]);

      if (!blogsResponse.data.success) {
        throw new Error("Failed to fetch blogs");
      }

      const blogs = blogsResponse.data.data || [];
      const trendingBlogs = blogsResponse.data.trending || [];

      // Format all blog data
      const formatAllBlogs = blogs.map(formatBlogData);

      // Set featured posts
      const featured = formatAllBlogs
        .filter((blog) => blog.isFeatured)
        .slice(0, 3);
      setFeaturedPosts(
        featured.length > 0 ? featured : formatAllBlogs.slice(0, 3),
      );

      // Set trending posts
      let trending: FormattedBlog[] = [];
      if (trendingBlogs.length > 0) {
        trending = trendingBlogs.slice(0, 10).map(formatBlogData);
      } else {
        trending = [...formatAllBlogs]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 8);
      }
      setTrendingPosts(trending);

      // Set latest posts
      const latest = [...formatAllBlogs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);
      setLatestPosts(latest);

      // Set popular posts
      const popular = [...formatAllBlogs]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 8);
      setPopularPosts(popular);

      // Set categories
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data || []);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Error fetching data:", error);
      toast.error("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formatBlogData]);

  // Fetch category posts with cancellation
  useEffect(() => {
    let isMounted = true;

    const fetchCategoryPosts = async () => {
      if (!categories.length || !isMounted) return;

      const topCategories = categories.slice(0, 3);

      try {
        const promises = topCategories.map((category) =>
          axios.get(`${apiUrl}/blogs/published`, {
            params: {
              category: category._id,
              limit: 3,
            },
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
          }),
        );

        const responses = await Promise.all(promises);

        if (!isMounted) return;

        const postsByCategory: Record<string, FormattedBlog[]> = {};
        responses.forEach((response, index) => {
          const category = topCategories[index];
          if (response.data.success && response.data.data) {
            postsByCategory[category.slug] =
              response.data.data.map(formatBlogData);
          }
        });

        setCategoryPosts(postsByCategory);
      } catch (error) {
        if (!axios.isCancel(error) && isMounted) {
          console.error("Error fetching category posts:", error);
        }
      }
    };

    if (categories.length > 0) {
      fetchCategoryPosts();
    }

    return () => {
      isMounted = false;
    };
  }, [categories, formatBlogData]);

  // Memoized category sections
  const categorySections = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const topCategories = categories.slice(0, 3);

    const categoryConfig = CATEGORY_CONFIG as any[];

    return topCategories.map((category, index) => {
      const categoryPostsData = categoryPosts[category.slug] || [];
      const config = categoryConfig[index] || categoryConfig[0];

      return {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description || `Latest ${category.name} articles`,
        posts: categoryPostsData,
        blogCount: category.blogCount || categoryPostsData.length,
        ...config,
      } as CategorySection;
    });
  }, [categories, categoryPosts]);

  // Handle card click
  const handleCardClick = useCallback(
    (slug: string) => {
      router.push(`/blogs/${slug}`);
    },
    [router],
  );

  // Initialize swiper navigation - optimized
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (leftSwiperRef.current?.swiper) {
        leftSwiperRef.current.swiper.params.navigation.prevEl =
          leftPrevRef.current;
        leftSwiperRef.current.swiper.params.navigation.nextEl =
          leftNextRef.current;
        leftSwiperRef.current.swiper.navigation.init();
        leftSwiperRef.current.swiper.navigation.update();
      }

      if (rightSwiperRef.current?.swiper) {
        rightSwiperRef.current.swiper.params.navigation.prevEl =
          rightPrevRef.current;
        rightSwiperRef.current.swiper.params.navigation.nextEl =
          rightNextRef.current;
        rightSwiperRef.current.swiper.navigation.init();
        rightSwiperRef.current.swiper.navigation.update();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [loading]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized posts to show
  const postsToShow = useMemo(() => {
    const hotPosts = trendingPosts.filter((post) => post.isHot);
    return hotPosts.length > 0 ? hotPosts.slice(0, 10) : trendingPosts;
  }, [trendingPosts]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 lg:py-16 overflow-hidden">
        <div className="container mx-auto max-w-[1660px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Featured Articles */}
            <AnimatePresence mode="wait">
              {loading ? (
                <LeftSwiperSkeleton />
              ) : featuredPosts.length > 0 ? (
                <motion.div
                  key="left-swiper"
                  initial="hidden"
                  animate="visible"
                  variants={scaleIn}
                  className="lg:col-span-2"
                >
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              Featured Stories
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              Handpicked by our editors
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          ref={leftPrevRef}
                          className="w-12 h-12 rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-all duration-300 group backdrop-blur-sm"
                          aria-label="Previous article"
                        >
                          <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          ref={leftNextRef}
                          className="w-12 h-12 rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-all duration-300 group backdrop-blur-sm"
                          aria-label="Next article"
                        >
                          <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>

                    <div className="relative h-[600px] md:h-[700px] overflow-hidden border border-gray-100 shadow-xl">
                      <Swiper
                        ref={leftSwiperRef}
                        modules={[Autoplay, Navigation]}
                        slidesPerView={1}
                        spaceBetween={0}
                        autoplay={{
                          delay: 6000,
                          disableOnInteraction: false,
                        }}
                        speed={600}
                        grabCursor={true}
                        navigation={{
                          prevEl: leftPrevRef.current,
                          nextEl: leftNextRef.current,
                        }}
                        className="h-full"
                      >
                        {featuredPosts.map((post, index) => (
                          <SwiperSlide key={post.id}>
                            <Link
                              href={`/blogs/${post.slug}`}
                              className="group cursor-pointer h-full relative"
                            >
                              <div className="absolute inset-0">
                                <OptimizedImage
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                              </div>

                              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="px-4 py-1.5 bg-blue-600/90 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                                    {post.category}
                                  </span>
                                  {post.isFeatured && (
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                                      Featured
                                    </span>
                                  )}
                                  {post.isHot && (
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-orange-600 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                                      <Flame className="w-3 h-3 inline mr-1" />
                                      Hot
                                    </span>
                                  )}
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                                  {post.title}
                                </h2>

                                <p className="text-gray-200 mb-6 line-clamp-3">
                                  {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-gray-300">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="w-4 h-4" />
                                      <span>{post.date}</span>
                                    </div>
                                  </div>
                                  <button className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center gap-2">
                                    Read Story
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            </Link>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="lg:col-span-2 h-[600px] md:h-[700px] rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50"
                >
                  <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Featured Posts
                  </h3>
                  <p className="text-gray-500 text-center mb-6">
                    There are no featured posts available at the moment.
                  </p>
                  <button
                    onClick={fetchData}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Refresh
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Column - Trending Now with Images */}
            <AnimatePresence mode="wait">
              {loading ? (
                <RightSwiperSkeleton />
              ) : latestPosts.length > 0 ? (
                <motion.div
                  key="right-swiper"
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  className="relative"
                >
                  <div className="sticky top-6">
                    <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Trending Now
                          </h3>
                          <p className="text-sm text-gray-600">
                            <Zap className="w-3 h-3 inline mr-1 text-orange-500" />
                            What's hot this week
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          ref={rightPrevRef}
                          className="w-10 h-10 rounded-full border border-gray-200 hover:border-orange-500 hover:bg-orange-50 flex items-center justify-center transition-all duration-300 group"
                        >
                          <ArrowUp className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                        </button>
                        <button
                          ref={rightNextRef}
                          className="w-10 h-10 rounded-full border border-gray-200 hover:border-orange-500 hover:bg-orange-50 flex items-center justify-center transition-all duration-300 group"
                        >
                          <ArrowDown className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[650px] overflow-y-hidden pr-2">
                      <Swiper
                        ref={rightSwiperRef}
                        modules={[Navigation, Mousewheel, Autoplay]}
                        direction="vertical"
                        spaceBetween={12}
                        mousewheel={{ forceToAxis: true }}
                        autoplay={{
                          delay: 4000,
                          disableOnInteraction: false,
                        }}
                        navigation={{
                          prevEl: rightPrevRef.current,
                          nextEl: rightNextRef.current,
                        }}
                        breakpoints={{
                          0: {
                            slidesPerView: 1.2,
                            direction: "horizontal",
                            mousewheel: false,
                          },
                          640: {
                            slidesPerView: 2,
                            direction: "horizontal",
                            mousewheel: false,
                          },
                          1024: {
                            slidesPerView: 3,
                            direction: "vertical",
                            mousewheel: true,
                          },
                          1280: {
                            slidesPerView: 4,
                            direction: "vertical",
                            mousewheel: true,
                          },
                        }}
                        className="h-[300px] sm:h-[400px] lg:h-[650px]"
                      >
                        {latestPosts.map((post, index) => (
                          <SwiperSlide key={post.id}>
                            <Link
                              href={`/blogs/${post.slug}`}
                              className="group cursor-pointer bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                            >
                              <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-20 h-20 rounded-xl overflow-hidden relative">
                                    <OptimizedImage
                                      src={post.imageUrl}
                                      alt={post.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-xl"
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="mb-2">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-sky-100 text-blue-700">
                                      {post.category}
                                    </span>
                                    {post.isHot && (
                                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white">
                                        HOT
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {post.title}
                                  </h4>

                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {post.excerpt}
                                  </p>

                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <CalendarDays className="w-3 h-3" />
                                    <span>{post.date}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative h-[600px] rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50"
                >
                  <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Trending Posts
                  </h3>
                  <p className="text-gray-500 text-center mb-6">
                    Check back later for trending content.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1660px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-3">
              <Hash className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">
                CATEGORIES
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Explore by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dive into our curated collections. Explore articles from
              different categories.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <CategorySkeleton />
            ) : categorySections.length > 0 ? (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {categorySections.map((category, index) => (
                  <motion.div
                    key={category.id}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div
                      className={`bg-sky-50/50 rounded-3xl p-6 border ${category.borderColor || 'border-gray-200'} hover:shadow-2xl transition-all duration-500 h-full`}
                    >
                      <div className="mb-8 pt-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {category.description ||
                            `Latest ${category.name} articles`}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {category.posts.slice(0, 3).map((post, postIndex) => (
                          <Link
                            key={post.id}
                            href={`/blogs/${post.slug}`}
                            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                                  <OptimizedImage
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                                  {post.title}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {post.excerpt ||
                                    getExcerpt(post.description || "", 20)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {category.posts.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <Link
                            href={`/category/${category.slug}`}
                            className={`block w-full text-center py-3 font-semibold rounded-xl ${category.textColor || 'text-blue-600'} border ${category.borderColor || 'border-blue-200'} hover:shadow-lg transition-all duration-300`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              Explore All {category.name}
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200"
              >
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-600 mb-1">
                  No Categories Available
                </h3>
                <p className="text-gray-500 text-sm">
                  Categories will appear when blogs are published.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Popular Posts Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1660px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Most{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                      Popular
                    </span>
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Articles loved by our readers
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/blogs"
              className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded-t-2xl" />
                  <div className="p-5 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularPosts.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {popularPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-gradient-to-r from-orange-500 to-red-600 text-white">
                        <Flame className="w-3 h-3 inline mr-1" />
                        Popular
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors text-lg">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-2xl"
            >
              <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Popular Posts
              </h3>
              <p className="text-gray-500">
                Popular posts will appear based on reader engagement.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1660px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Latest{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Stories
                    </span>
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Fresh perspectives published daily
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/blogs"
                className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                View All
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 animate-pulse"
                >
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
          ) : latestPosts.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {latestPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-blue-600/90 text-white">
                        {post.category}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm">
                      <CalendarDays className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt || getExcerpt(post.description || "", 20)}
                    </p>

                    <div className="flex items-center justify-end text-sm text-gray-500">
                      <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        Read More →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-2xl"
            >
              <NewspaperIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Articles Available
              </h3>
              <p className="text-gray-500">
                Check back soon for new articles!
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default React.memo(Home);
