"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HomeClientProps } from "@/types/homeType";
import { CATEGORY_CONFIG } from "@/utils/constants";
import { fadeInUp, staggerContainer } from "@/utils/animations";
import HeroSection from "../home/HeroSection";
import LatestPostsSection from "../home/LatestPostsSection";
import PopularPostsSection from "../home/PopularPostsSection";
import CategorySection from "../home/CategorySection";
const HomeClient = ({ initialData }: HomeClientProps) => {
  const [loading, setLoading] = useState(true);

  const {
    featuredPosts,
    trendingPosts,
    latestPosts,
    popularPosts,
    categories,
    categoryPosts,
  } = initialData;

  useEffect(() => {
    setLoading(false);
  }, []);

  const categorySections = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const categoryConfig = CATEGORY_CONFIG as any[];

    return categories.map((category, index) => {
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
      };
    });
  }, [categories, categoryPosts]);

  const hasAnyPosts =
    featuredPosts.length > 0 ||
    trendingPosts.length > 0 ||
    latestPosts.length > 0;

  if (!hasAnyPosts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No posts available</h2>
          <p className="text-gray-600 mt-2">
            Check back later for new content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection
        featuredPosts={featuredPosts}
        trendingPosts={trendingPosts}
        latestPosts={latestPosts}
      />

      {/* Category Sections */}
      {categorySections.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-415">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-3">
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

            <AnimatePresence>
              {categorySections.length > 0 && (
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
                    >
                      <CategorySection category={category} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Popular Posts Section */}
      {popularPosts.length > 0 && (
        <PopularPostsSection popularPosts={popularPosts} />
      )}

      {/* Latest Articles Section */}
      {latestPosts.length > 0 && (
        <LatestPostsSection latestPosts={latestPosts} />
      )}
    </>
  );
};

export default HomeClient;
