"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  ClockIcon as PendingIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BookmarkIcon,
  SparklesIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { apiUrl } from "../common/Config";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";

// Types
interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  status: "published" | "pending" | "rejected";
  imageUrl?: string;
  createdAt: string;
  readTime?: number;
  views?: number;
  likes?: number;
  bookmarks?: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface Stats {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  totalViews: number;
  totalLikes: number;
}

interface StatusOption {
  value: string;
  label: string;
  color: string;
  icon: React.ElementType;
}

interface SortOption {
  value: string;
  label: string;
}

const MyBlogs = () => {
  const { user, token } = useAuth();
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  // Stats
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    pending: 0,
    rejected: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  // Status options
  const statusOptions: StatusOption[] = [
    { value: "all", label: "All Blogs", color: "gray", icon: DocumentTextIcon },
    {
      value: "published",
      label: "Published",
      color: "green",
      icon: CheckCircleIcon,
    },
    { value: "pending", label: "Pending", color: "yellow", icon: PendingIcon },
    { value: "rejected", label: "Rejected", color: "red", icon: XCircleIcon },
  ];

  // Sort options
  const sortOptions: SortOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title", label: "Title A-Z" },
  ];

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/blogs/my-blogs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 100 },
      });

      if (response.data.success) {
        const fetchedBlogs = response.data.data;
        setBlogs(fetchedBlogs);

        // Calculate stats
        const published = fetchedBlogs.filter((b: Blog) => b.status === "published");
        const pending = fetchedBlogs.filter((b: Blog) => b.status === "pending");
        const rejected = fetchedBlogs.filter((b: Blog) => b.status === "rejected");

        const totalViews = published.reduce(
          (sum: number, blog: Blog) => sum + (blog.views || 0),
          0,
        );
        const totalLikes = published.reduce(
          (sum: number, blog: Blog) => sum + (blog.likes || 0),
          0,
        );

        setStats({
          total: fetchedBlogs.length,
          published: published.length,
          pending: pending.length,
          rejected: rejected.length,
          totalViews,
          totalLikes,
        });

        applyFilters(fetchedBlogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Apply filters and sorting
  const applyFilters = (blogList: Blog[] = blogs) => {
    let result = [...blogList];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((blog) => blog.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          (blog.excerpt && blog.excerpt.toLowerCase().includes(query)) ||
          (blog.description && blog.description.toLowerCase().includes(query)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "views":
          return (b.views || 0) - (a.views || 0);
        case "likes":
          return (b.likes || 0) - (a.likes || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    // Pagination
    const totalPages = Math.ceil(result.length / itemsPerPage);
    setTotalPages(totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResult = result.slice(startIndex, endIndex);

    setFilteredBlogs(paginatedResult);
  };

  // Handle delete
  const handleDelete = async (blogId: string, blogTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"?`)) {
      return;
    }

    setDeleting(blogId);
    try {
      const response = await axios.delete(`${apiUrl}/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Blog deleted successfully");
        fetchBlogs();
      }
    } catch (error) {
      console.error("Error deleting blog:", error);

      // Check if it's a published blog
      const errorMsg = axios.isAxiosError(error) ? error.response?.data?.message : null;
      if (errorMsg?.includes("cannot delete a published blog")) {
        toast.error(
          <div>
            <p className="font-semibold">Cannot Delete Published Blog</p>
            <p className="text-sm mt-1">
              Please contact admin to delete published blogs.
            </p>
          </div>,
          { duration: 5000 },
        );
      } else {
        toast.error("Failed to delete blog");
      }
    } finally {
      setDeleting(null);
    }
  };

  // Request re-approval
  const requestReapproval = async (blogId: string) => {
    try {
      const response = await axios.put(
        `${apiUrl}/blogs/request-reapproval/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Blog submitted for re-approval");
        fetchBlogs();
      }
    } catch (error) {
      console.error("Error requesting re-approval:", error);
      toast.error("Failed to submit for re-approval");
    }
  };

  // Pagination controls
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Effects
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, searchQuery, sortBy, currentPage, blogs]);

  // Loading skeleton
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
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Blogs{" "}
                        <SparklesIcon className="w-6 h-6 text-yellow-500 inline-block" />
                      </h1>
                      <p className="text-gray-600">
                        Manage all your blog posts in one place
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
                        <PlusIcon className="w-5 h-5" />
                        <span>Create New Blog</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              >
                {statusOptions.map((status, index) => {
                  const statusKey = status.value as keyof Stats;
                  const value = status.value === "all"
                    ? stats.total
                    : stats[statusKey] as number;

                  return (
                    <motion.div
                      key={status.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                      className={`bg-white rounded-xl p-4 shadow-md border border-gray-100 cursor-pointer transition-all ${statusFilter === status.value
                        ? `ring-2 ring-${status.color}-500`
                        : "hover:shadow-lg"
                        }`}
                      onClick={() => {
                        setStatusFilter(status.value);
                        setCurrentPage(1);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-${status.color}-100`}>
                          <status.icon
                            className={`w-6 h-6 text-${status.color}-600`}
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {value}
                          </p>
                          <p className="text-sm text-gray-600">
                            {status.label}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Filters Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-8"
              >
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {/* Search */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Blogs
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search by title or content..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="appearance-none w-full md:w-48 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Reset</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Blogs Grid */}
              <AnimatePresence>
                {filteredBlogs.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                  >
                    {filteredBlogs.map((blog, index) => (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                      >
                        {/* Blog Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={
                              blog.imageUrl ||
                              "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop"
                            }
                            alt={blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop";
                            }}
                          />
                          {/* Status Badge */}
                          <div
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${blog.status === "published"
                              ? "bg-green-100 text-green-800"
                              : blog.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {blog.status.charAt(0).toUpperCase() +
                              blog.status.slice(1)}
                          </div>
                        </div>

                        {/* Blog Content */}
                        <div className="p-5">
                          {/* Category & Date */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              {blog.category?.name || "Uncategorized"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {blog.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {blog.excerpt ||
                              (blog.description
                                ?.replace(/<[^>]+>/g, "")
                                .slice(0, 100) + "...")
                              ? blog.description
                                ?.replace(/<[^>]+>/g, "")
                                .slice(0, 100) + "..."
                              : "No description available."}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center text-sm text-gray-500">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {blog.readTime || 5}m
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              {/* Edit Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  router.push(`/edit-blog/${blog._id}`)
                                }
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Edit Blog"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </motion.button>

                              {/* Delete Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  handleDelete(blog._id, blog.title)
                                }
                                disabled={deleting === blog._id}
                                className={`p-2 rounded-lg transition-colors ${blog.status === "published"
                                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                  : "bg-red-50 text-red-600 hover:bg-red-100"
                                  }`}
                                title={
                                  blog.status === "published"
                                    ? "Cannot delete published blog"
                                    : "Delete Blog"
                                }
                              >
                                {deleting === blog._id ? (
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <TrashIcon className="w-4 h-4" />
                                )}
                              </motion.button>

                              {/* Re-approval Button for rejected blogs */}
                              {blog.status === "rejected" && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => requestReapproval(blog._id)}
                                  className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg hover:bg-yellow-100 transition-colors"
                                >
                                  Resubmit
                                </motion.button>
                              )}
                            </div>

                            {/* View Button */}
                            <Link
                              href={`/blogs/${blog.slug}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>View</span>
                              <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100"
                  >
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No blogs found
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filter to find what you're looking for."
                        : "You haven't created any blogs yet. Start sharing your thoughts!"}
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/create-blog"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Your First Blog</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center space-x-2 mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <motion.button
                            key={page}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg font-medium ${currentPage === page
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            {page}
                          </motion.button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    },
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyBlogs;