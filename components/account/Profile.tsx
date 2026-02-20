"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  SparklesIcon,
  FireIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { apiUrl } from "../common/Config";
import Sidebar from "./Sidebar";
import { ChartNoAxesColumn } from "lucide-react";

// Types
interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: "published" | "pending" | "rejected";
  views?: number;
  likes?: number;
  bookmarks?: number;
  imageUrl?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface Stats {
  totalBlogs: number;
  publishedBlogs: number;
  pendingBlogs: number;
  rejectedBlogs: number;
  totalViews?: number;
  totalLikes?: number;
  totalBookmarks?: number;
}

interface StatCard {
  id: number;
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: string;
  description: string;
}

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    pendingBlogs: 0,
    rejectedBlogs: 0,
  });
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user blogs
      const blogsResponse = await axios.get(`${apiUrl}/blogs/my-blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch trending blogs
      const trendingResponse = await axios.get(
        `${apiUrl}/blogs/published?limit=3&sortBy=views&sortOrder=desc`,
      );

      if (blogsResponse.data.success) {
        const blogs = blogsResponse.data.data;

        // Calculate stats
        const published = blogs.filter((blog: Blog) => blog.status === "published");
        const pending = blogs.filter((blog: Blog) => blog.status === "pending");
        const rejected = blogs.filter((blog: Blog) => blog.status === "rejected");

        setStats({
          totalBlogs: blogs.length,
          publishedBlogs: published.length,
          pendingBlogs: pending.length,
          rejectedBlogs: rejected.length,
        });

        // Get recent blogs (last 3)
        setRecentBlogs(blogs.slice(0, 3));
      }

      if (trendingResponse.data.success) {
        setTrendingBlogs(trendingResponse.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      id: 2,
      title: "Published",
      value: stats.publishedBlogs,
      icon: CheckCircleIcon,
      color: "from-green-500 to-emerald-500",
      trend: "Published",
      bgColor: "bg-green-500/10",
      description: "Approved and live",
    },
    {
      id: 3,
      title: "Pending Review",
      value: stats.pendingBlogs,
      icon: ClockIcon,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/10",
      trend: "Waiting",
      description: "Awaiting approval",
    },
    {
      id: 4,
      title: "Rejected Blogs",
      value: stats.rejectedBlogs,
      icon: ChartNoAxesColumn,
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-500/20",
      trend: "rejected",
      description: "Rejected Posts",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <Sidebar />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Welcome Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {user?.name || user?.username}
                        </span>
                        <SparklesIcon className="w-6 h-6 text-yellow-500 inline-block ml-2" />
                      </h1>
                      <p className="text-gray-600">
                        Here's what's happening with your blog today
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/create-blog"
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>Create New Blog</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              >
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon
                          className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                        />
                      </div>

                      {stat.trend && (
                        <span className="text-sm font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                          {stat.trend}
                        </span>
                      )}
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </h3>

                    <p className="text-gray-700 font-medium mb-2">
                      {stat.title}
                    </p>

                    <p className="text-sm text-gray-500">
                      {stat.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Recent Blogs & Trending */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Blogs */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Recent Blogs
                      </h2>
                      <Link
                        href="/my-blogs"
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                      >
                        View All →
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    <AnimatePresence>
                      {recentBlogs.length > 0 ? (
                        <div className="space-y-4">
                          {recentBlogs.map((blog, index) => (
                            <motion.div
                              key={blog._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ x: 5 }}
                              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`p-2 rounded-lg ${blog.status === "published"
                                    ? "bg-green-100 text-green-600"
                                    : blog.status === "pending"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : "bg-red-100 text-red-600"
                                    }`}
                                >
                                  {blog.status === "published" ? (
                                    <CheckCircleIcon className="w-5 h-5" />
                                  ) : blog.status === "pending" ? (
                                    <ClockIcon className="w-5 h-5" />
                                  ) : (
                                    <XCircleIcon className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                                    {blog.title}
                                  </h4>
                                </div>
                              </div>
                              <Link
                                href={`/blogs/${blog.slug}`}
                                className="text-blue-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                →
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No blogs yet</p>
                          <Link
                            href="/create-blog"
                            className="inline-block mt-4 text-blue-500 hover:text-blue-600 font-medium"
                          >
                            Create your first blog →
                          </Link>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Trending Blogs */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold flex items-center">
                        <FireIcon className="w-5 h-5 mr-2 text-orange-500" />
                        Trending Now
                      </h2>
                      <span className="text-sm text-gray-300">This Week</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <AnimatePresence>
                      {trendingBlogs.length > 0 ? (
                        <div className="space-y-6">
                          {trendingBlogs.map((blog, index) => (
                            <motion.div
                              key={blog._id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-colors group"
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                    <Image
                                      src={
                                        blog.imageUrl ||
                                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100&h=100&fit=crop"
                                      }
                                      alt={blog.title}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100&h=100&fit=crop";
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate group-hover:text-blue-300">
                                    {blog.title}
                                  </h4>
                                  <div className="mt-2">
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-full">
                                      {blog.category?.name || "Uncategorized"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FireIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">
                            No trending blogs yet
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/create-blog"
                      className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-all group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="p-2 bg-white rounded-lg">
                          <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 group-hover:text-blue-600">
                            Write New Blog
                          </p>
                          <p className="text-sm text-gray-600">
                            Start writing
                          </p>
                        </div>
                      </motion.div>
                    </Link>

                    <Link
                      href="/my-blogs"
                      className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:border-green-300 transition-all group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="p-2 bg-white rounded-lg">
                          <EyeIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 group-hover:text-green-600">
                            Manage Blogs
                          </p>
                          <p className="text-sm text-gray-600">
                            Edit or delete
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;