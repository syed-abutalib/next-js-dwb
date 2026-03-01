import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiUrl } from "../components/common/Config";
import { formatBlogData } from "../utils/formatters";

export const useHomeData = () => {
  const [data, setData] = useState({
    featuredPosts: [],
    trendingPosts: [],
    latestPosts: [],
    popularPosts: [],
    categories: [],
    categoryPosts: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [blogsResponse, categoriesResponse] = await Promise.all([
        axios.get(`${apiUrl}/blogs/published`, {
          params: { limit: 30 },
          timeout: 10000, // 10 second timeout
        }),
        axios.get(`${apiUrl}/blog-categories/with-count`, {
          timeout: 5000, // 5 second timeout
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
      const featuredPosts =
        featured.length > 0 ? featured : formatAllBlogs.slice(0, 3);

      // Set trending posts
      let trendingPosts = [];
      if (trendingBlogs.length > 0) {
        trendingPosts = trendingBlogs.slice(0, 10).map(formatBlogData);
      } else {
        trendingPosts = [...formatAllBlogs]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 8);
      }

      // Set latest posts
      const latestPosts = [...formatAllBlogs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

      // Set popular posts
      const popularPosts = [...formatAllBlogs]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 8);

      // Set categories
      const categories = categoriesResponse.data.success
        ? categoriesResponse.data.data || []
        : [];

      setData({
        featuredPosts,
        trendingPosts,
        latestPosts,
        popularPosts,
        categories,
        categoryPosts: {},
      });
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryPosts = useCallback(async (categories) => {
    if (!categories.length) return;

    const topCategories = categories.slice(0, 3);

    try {
      const promises = topCategories.map((category) =>
        axios.get(`${apiUrl}/blogs/published`, {
          params: { category: category._id, limit: 3 },
          timeout: 5000,
        }),
      );

      const responses = await Promise.allSettled(promises);

      const postsByCategory = {};
      responses.forEach((response, index) => {
        const category = topCategories[index];
        if (
          response.status === "fulfilled" &&
          response.value.data.success &&
          response.value.data.data
        ) {
          postsByCategory[category.slug] =
            response.value.data.data.map(formatBlogData);
        }
      });

      setData((prev) => ({
        ...prev,
        categoryPosts: postsByCategory,
      }));
    } catch (err) {
      console.error("Error fetching category posts:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data.categories.length > 0) {
      fetchCategoryPosts(data.categories);
    }
  }, [data.categories, fetchCategoryPosts]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    loading,
    error,
    refetch,
  };
};
