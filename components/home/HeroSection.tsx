"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
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
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { scaleIn, fadeInUp } from "@/utils/animations";
import OptimizedImage from "../common/OptimizedImage";
interface HeroSectionProps {
  featuredPosts: any[];
  trendingPosts: any[];
  latestPosts: any[];
}

const HeroSection = ({
  featuredPosts,
  trendingPosts,
  latestPosts,
}: HeroSectionProps) => {
  const leftSwiperRef = useRef<any>(null);
  const rightSwiperRef = useRef<any>(null);
  const leftPrevRef = useRef<HTMLButtonElement>(null);
  const leftNextRef = useRef<HTMLButtonElement>(null);
  const rightPrevRef = useRef<HTMLButtonElement>(null);
  const rightNextRef = useRef<HTMLButtonElement>(null);
  const [leftSwiper, setLeftSwiper] = useState<any>(null);
  const [rightSwiper, setRightSwiper] = useState<any>(null);

  const displayFeaturedPosts =
    featuredPosts.length > 0
      ? featuredPosts
      : trendingPosts.length > 0
        ? trendingPosts.slice(0, 3)
        : latestPosts.slice(0, 3);

  // Initialize swiper navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (leftSwiper) {
        leftSwiper.params.navigation.prevEl = leftPrevRef.current;
        leftSwiper.params.navigation.nextEl = leftNextRef.current;
        leftSwiper.navigation.init();
        leftSwiper.navigation.update();
      }

      if (rightSwiper) {
        rightSwiper.params.navigation.prevEl = rightPrevRef.current;
        rightSwiper.params.navigation.nextEl = rightNextRef.current;
        rightSwiper.navigation.init();
        rightSwiper.navigation.update();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [leftSwiper, rightSwiper]);

  return (
    <section className="relative py-8 md:py-12 lg:py-16 overflow-hidden">
      <div className="container mx-auto max-w-[1660px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Featured Articles */}
          <AnimatePresence>
            {displayFeaturedPosts.length > 0 && (
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
                      <div className="flex items-center gap-3 mb-2 px-2 sm:px-0">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">
                            {featuredPosts.length > 0
                              ? "Featured Stories"
                              : "Latest Stories"}
                          </h1>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {featuredPosts.length > 0
                              ? "Handpicked by our editors"
                              : "Our most recent articles"}
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
                      ref={(swiper) => {
                        if (swiper) {
                          leftSwiperRef.current = swiper;
                          setLeftSwiper(swiper);
                        }
                      }}
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
                      onInit={(swiper) => {
                        setTimeout(() => {
                          if (leftPrevRef.current && leftNextRef.current) {
                            swiper.params.navigation.prevEl =
                              leftPrevRef.current;
                            swiper.params.navigation.nextEl =
                              leftNextRef.current;
                            swiper.navigation.init();
                            swiper.navigation.update();
                          }
                        }, 0);
                      }}
                    >
                      {displayFeaturedPosts.map((post) => (
                        <SwiperSlide key={post.id}>
                          <Link
                            href={`/blogs/${post.slug}`}
                            className="group cursor-pointer h-full relative block"
                          >
                            <div className="absolute inset-0">
                              <OptimizedImage
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                priority={true}
                                quality={95}
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

                              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                                {post.title}
                              </h3>

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
            )}
          </AnimatePresence>

          {/* Right Column - Trending Now */}
          <AnimatePresence>
            {latestPosts.length > 0 && (
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
                      ref={(swiper) => {
                        if (swiper) {
                          rightSwiperRef.current = swiper;
                          setRightSwiper(swiper);
                        }
                      }}
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
                      onInit={(swiper) => {
                        setTimeout(() => {
                          if (rightPrevRef.current && rightNextRef.current) {
                            swiper.params.navigation.prevEl =
                              rightPrevRef.current;
                            swiper.params.navigation.nextEl =
                              rightNextRef.current;
                            swiper.navigation.init();
                            swiper.navigation.update();
                          }
                        }, 0);
                      }}
                    >
                      {latestPosts.map((post) => (
                        <SwiperSlide key={post.id}>
                          <Link
                            href={`/blogs/${post.slug}`}
                            className="group cursor-pointer bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 block"
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

                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {post.title}
                                </h3>

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
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
