"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ChevronRight,
  Hash,
  Sparkles,
  Flame,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from "react-share";
import toast from "react-hot-toast";
import { apiUrl } from "../common/Config";
import Newsletter from "../common/Newsletter";

// Types
interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  description: string;
  slug: string;
  imageUrl?: string;
  createdAt: string;
  readTime?: number;
  views?: number;
  likes?: number;
  likedBy?: string[];
  isFeatured?: boolean;
  isHot?: boolean;
  isPopular?: boolean;
  tags?: string[];
  keywords?: string[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  user?: {
    _id: string;
    name: string;
    displayName?: string;
  };
}

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  date: string;
  slug: string;
  imageUrl: string;
  category: string;
  views?: number;
  readTime?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  count?: number;
}

interface FeaturedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
}

const SinglePost = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Clean HTML content - remove inline styles that might interfere with styling
  const cleanHTMLContent = (html: string) => {
    if (!html) return "";
    // Remove inline styles
    let cleaned = html.replace(/style="[^"]*"/g, "");
    // Remove span tags that only contain styles
    cleaned = cleaned.replace(/<span[^>]*>([^<]*)<\/span>/g, "$1");
    // Replace grey text color with default
    cleaned = cleaned.replace(/color:\s*rgb\(156,\s*163,\s*175\)/g, "");
    cleaned = cleaned.replace(/color:\s*#9ca3af/g, "");
    // Remove background colors
    cleaned = cleaned.replace(
      /background-color:\s*rgb\(255,\s*255,\s*255\)/g,
      "",
    );
    cleaned = cleaned.replace(/background-color:\s*#ffffff/g, "");
    return cleaned;
  };

  // Get excerpt
  const getExcerpt = (text: string, wordCount = 30) => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]+>/g, "");
    const words = cleanText.split(" ");
    if (words.length <= wordCount) return cleanText;
    return words.slice(0, wordCount).join(" ") + "...";
  };

  // Fetch single post by slug
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        // Fetch post by slug
        const response = await axios.get(`${apiUrl}/blogs/slug/${slug}`);

        if (!response.data.success) {
          toast.error("Post not found");
          router.push("/");
          return;
        }

        const postData = response.data.data;
        setPost(postData);

        // Set related posts from API response
        if (response.data.related && response.data.related.length > 0) {
          const formatRelatedPost = (blog: any): RelatedPost => ({
            id: blog._id,
            title: blog.title,
            excerpt: blog.excerpt || getExcerpt(blog.description, 25),
            date: formatDate(blog.createdAt),
            slug: blog.slug,
            imageUrl:
              blog.imageUrl ||
              "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
            category: postData.category?.name || "Uncategorized",
            views: blog.views || 0,
            readTime: blog.readTime || 1,
          });

          setRelatedPosts(response.data.related.map(formatRelatedPost));
        }

        // Check if bookmarked
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
        setIsBookmarked(bookmarks.includes(postData._id));

        // Fetch categories
        try {
          const categoriesResponse = await axios.get(
            `${apiUrl}/blog-categories`,
          );
          if (categoriesResponse.data.success) {
            setCategories(categoriesResponse.data.data || []);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        }

        // Fetch featured posts for sidebar
        try {
          const featuredResponse = await axios.get(
            `${apiUrl}/blogs/published`,
            {
              params: { featured: true, limit: 4, exclude: postData._id },
            },
          );

          if (featuredResponse.data.success) {
            const formatBlogData = (blog: any): FeaturedPost => ({
              id: blog._id,
              title: blog.title,
              excerpt: blog.excerpt || getExcerpt(blog.description, 20),
              slug: blog.slug,
              imageUrl:
                blog.imageUrl ||
                "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
              category: blog.category?.name || "Uncategorized",
            });

            setFeaturedPosts(featuredResponse.data.data.map(formatBlogData));
          }
        } catch (error) {
          console.error("Error fetching featured posts:", error);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, router]);

  // Handle bookmark
  const handleBookmark = () => {
    if (!post) return;

    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id: string) => id !== post._id);
      localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      toast.success("Removed from bookmarks");
    } else {
      bookmarks.push(post._id);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
      toast.success("Added to bookmarks");
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!post) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to like posts");
        router.push("/login");
        return;
      }

      const response = await axios.put(
        `${apiUrl}/blogs/${post._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setPost({
          ...post,
          likes: response.data.data.likes,
          likedBy: response.data.data.isLiked
            ? [...(post.likedBy || []), post.user?._id].filter(Boolean)
            : (post.likedBy || []).filter((id) => id !== post.user?._id),
        });
      }
    } catch (error) {
      console.error("Like error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Please login to like posts");
        router.push("/login");
      } else {
        toast.error("Failed to like post");
      }
    }
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!");
        setShowShareMenu(false);
      })
      .catch(() => toast.error("Failed to copy link"));
  };

  // Get featured image
  const getFeaturedImage = () => {
    if (post?.imageUrl) {
      return post.imageUrl;
    }
    return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-10 w-32 bg-gray-200 rounded-lg mb-8"></div>

            {/* Title skeleton */}
            <div className="h-12 bg-gray-200 rounded-lg mb-6 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-lg mb-12 w-1/2"></div>

            {/* Image skeleton */}
            <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>

            {/* Content skeletons */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Post not found
          </h2>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post.title;
  const cleanedDescription = cleanHTMLContent(post.description);

  return (
    <>
      <div>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Back Button */}
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => router.back()}
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Articles</span>
              </motion.button>

              {/* Category Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {post.category?.name || "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-white/80 mb-8 max-w-3xl">
                {post.excerpt || getExcerpt(post.description, 40)}
              </p>

              {/* Author & Meta Info */}
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(post.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime || 5} min read</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  {/* Like Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className={`p-3 rounded-full ${post.likedBy?.includes(post.user?._id || '')
                      ? "bg-red-500 text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={
                        post.likedBy?.includes(post.user?._id || '')
                          ? "currentColor"
                          : "none"
                      }
                    />
                    <span className="sr-only">Like</span>
                  </motion.button>

                  {/* Share Button */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="sr-only">Share</span>
                    </motion.button>

                    {/* Share Menu */}
                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl p-4 min-w-[200px] z-50 border border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              Share this article
                            </h4>
                            <button
                              onClick={() => setShowShareMenu(false)}
                              className="text-gray-400 hover:text-gray-600 text-sm"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex space-x-2 mb-4">
                            <FacebookShareButton
                              url={shareUrl}
                              quote={shareTitle}
                            >
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300">
                                <Facebook className="w-5 h-5" />
                              </div>
                            </FacebookShareButton>

                            <TwitterShareButton
                              url={shareUrl}
                              title={shareTitle}
                            >
                              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-all duration-300">
                                <Twitter className="w-5 h-5" />
                              </div>
                            </TwitterShareButton>

                            <LinkedinShareButton
                              url={shareUrl}
                              title={shareTitle}
                            >
                              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300">
                                <Linkedin className="w-5 h-5" />
                              </div>
                            </LinkedinShareButton>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:shadow-md transition-all duration-300"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Copy Link
                            </span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Main Article Content */}
              <div className="lg:col-span-8">
                {/* Featured Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative overflow-hidden rounded-xl mb-12 shadow-2xl group"
                >
                  <div className="relative w-full h-96 max-h-[600px]">
                    <Image
                      src={getFeaturedImage()}
                      alt={post.title}
                      fill
                      className="w-full h-auto max-h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"

                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";
                      }}
                    />
                  </div>
                </motion.div>

                {/* Article Content */}
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-img:rounded-2xl prose-img:shadow-lg"
                >
                  {cleanedDescription && (
                    <div
                      dangerouslySetInnerHTML={{ __html: cleanedDescription }}
                    />
                  )}
                </motion.article>

                {/* Stats & Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 pt-8 border-t border-gray-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* Featured Badges */}
                    <div className="flex items-center space-x-2">
                      {post.isFeatured && (
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold rounded-full">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          Featured
                        </span>
                      )}
                      {post.isHot && (
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-bold rounded-full">
                          <Flame className="w-3 h-3 inline mr-1" />
                          Hot
                        </span>
                      )}
                      {post.isPopular && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          Popular
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags Section */}
                  {(post.tags?.length > 0 || post.keywords?.length > 0) && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          Tags
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {/* Display tags if available */}
                        {post.tags &&
                          post.tags
                            .filter((tag) => tag && tag.trim())
                            .map((tag, index) => (
                              <span
                                key={`tag-${index}`}
                                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-md cursor-pointer"
                              >
                                {tag.trim()}
                              </span>
                            ))}

                        {/* Display keywords if no tags or additional keywords */}
                        {(!post.tags || post.tags.length === 0) &&
                          post.keywords &&
                          post.keywords
                            .filter((keyword) => keyword && keyword.trim())
                            .map((keyword, index) => (
                              <span
                                key={`keyword-${index}`}
                                className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-full text-sm font-medium hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-md cursor-pointer"
                              >
                                {keyword.trim()}
                              </span>
                            ))}

                        {/* Fallback to category if no tags or keywords */}
                        {(!post.tags || post.tags.length === 0) &&
                          (!post.keywords || post.keywords.length === 0) &&
                          post.category && (
                            <Link
                              href={`/category/${post.category.slug}`}
                              className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-sm font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:shadow-md"
                            >
                              {post.category.name}
                            </Link>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Category Link */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Hash className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-gray-700">
                        Category
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.category && (
                        <Link
                          href={`/category/${post.category.slug}`}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 hover:shadow-md flex items-center gap-2"
                        >
                          {post.category.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 mt-12 lg:mt-0 lg:pl-8">
                <div className="sticky top-24 space-y-8">
                  {/* Featured Posts */}
                  {featuredPosts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Featured Posts
                          </h3>
                          <p className="text-sm text-gray-600">
                            Editor's picks
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {featuredPosts.map((featuredPost, index) => (
                          <motion.article
                            key={featuredPost.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            onClick={() =>
                              router.push(`/blogs/${featuredPost.slug}`)
                            }
                            className="group cursor-pointer"
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                  <Image
                                    src={featuredPost.imageUrl}
                                    alt={featuredPost.title}
                                    fill
                                    sizes="48px"
                                    className="object-cover group-hover:scale-110 transition-transform duration-300 rounded-lg"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src =
                                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                                  {featuredPost.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {featuredPost.excerpt}
                                </p>
                              </div>
                            </div>
                          </motion.article>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Popular Categories */}
                  {categories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 flex items-center justify-center">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Categories
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {categories.slice(0, 6).map((category) => (
                          <Link
                            key={category._id}
                            href={`/category/${category.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 text-sm rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300"
                          >
                            <span>{category.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Newsletter */}
                  <Newsletter />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-gradient-to-b from-white to-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Related Articles
                    </h2>
                    <p className="text-gray-600">
                      More articles you might enjoy
                    </p>
                  </div>
                  <Link
                    href="/blogs"
                    className="inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.article
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
                      onClick={() => router.push(`/blogs/${relatedPost.slug}`)}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={relatedPost.imageUrl}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-blue-600/90 text-white">
                            {relatedPost.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500 font-medium">
                            {relatedPost.date}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                          {relatedPost.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>

                        <div className="flex items-center text-blue-600 font-medium text-sm">
                          Read More →
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Add Tailwind prose styles */}
        <style jsx global>{`
          .prose {
            color: #374151;
          }
          .prose h1,
          .prose h2,
          .prose h3,
          .prose h4 {
            margin-top: 2em;
            margin-bottom: 1em;
            font-weight: 700;
          }
          .prose p {
            margin-bottom: 1.5em;
            line-height: 1.7;
          }
          .prose img {
            border-radius: 12px;
            margin: 2em 0;
          }
          .prose ul,
          .prose ol {
            margin: 1.5em 0;
            padding-left: 1.5em;
          }
          .prose li {
            margin: 0.5em 0;
          }
          .prose blockquote {
            background: #f8fafc;
            padding: 1.5em;
            border-radius: 12px;
            margin: 2em 0;
          }
          .prose pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1.5em;
            border-radius: 12px;
            overflow-x: auto;
          }
          .prose code {
            background: #f1f5f9;
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 0.875em;
          }
          .prose a {
            text-decoration: none;
            border-bottom: 2px solid #dbeafe;
            transition: all 0.2s;
          }
          .prose a:hover {
            border-bottom-color: #3b82f6;
          }
          .prose u {
            text-decoration: none;
          }
          .prose a[target="_blank"] {
            color: #2563eb;
            text-decoration: underline;
          }
          .prose a[target="_blank"]:hover {
            color: #1d4ed8;
          }
        `}</style>
      </div>
    </>
  );
};

export default SinglePost;