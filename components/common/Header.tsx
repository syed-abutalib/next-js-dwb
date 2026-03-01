"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { apiUrl } from "../common/Config";
import {
  ArrowLeftEndOnRectangleIcon,
  ChevronDownIcon,
  UserCircleIcon,
  HomeIcon,
  NewspaperIcon,
  InformationCircleIcon,
  PhoneIcon,
  XMarkIcon,
  Bars3Icon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  PhoneIcon as PhoneIconSolid,
} from "@heroicons/react/24/solid";
import logo from "@/public/logo.png";

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
  blogCount?: number;
}

interface User {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const categoriesRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/blog-categories`);
        if (response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setIsCategoriesOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  // Animation variants
  const menuVariants = {
    closed: {
      opacity: 0,
      x: "-100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
      },
    },
  };

  const dropdownItemVariants = {
    closed: { opacity: 0, y: -5 },
    open: { opacity: 1, y: 0 },
  };

  // Navigation links
  const navLinks = [
    { to: "/", label: "Home", icon: HomeIcon, activeIcon: HomeIconSolid },
    {
      to: "/blogs",
      label: "Blogs",
      icon: NewspaperIcon,
      activeIcon: NewspaperIconSolid,
    },
    {
      to: "/about-us",
      label: "About Us",
      icon: InformationCircleIcon,
      activeIcon: InformationCircleIconSolid,
    },
    {
      to: "/contact-us",
      label: "Contact Us",
      icon: PhoneIcon,
      activeIcon: PhoneIconSolid,
    },
  ];

  // Check if link is active
  const isActive = (path: string) => {
    return (
      pathname === path ||
      (path !== "/" && pathname?.startsWith(path))
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100 font-dm-sans">
        <div className="container max-w-[1660px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative w-68 h-12">
                  <Image
                    src={logo}
                    alt="Daily World Blog Logo"
                    fill
                    sizes="600px"
                    className="object-contain rounded-lg"
                    priority
                  />
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isLinkActive = isActive(link.to);

                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    className="relative px-4 py-2 rounded-xl group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2"
                    >
                      <span
                        className={`font-medium ${isLinkActive ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"}`}
                      >
                        {link.label}
                      </span>
                    </motion.div>
                    {isLinkActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                      />
                    )}
                  </Link>
                );
              })}

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleCategories}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 font-medium group"
                >
                  <span>Categories</span>
                  <motion.div
                    animate={{ rotate: isCategoriesOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isCategoriesOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropdownVariants}
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-2 max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {loading ? (
                          <div className="py-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          </div>
                        ) : categories.length > 0 ? (
                          categories.map((category) => (
                            <motion.div
                              key={category._id}
                              variants={dropdownItemVariants}
                            >
                              <Link
                                href={`/category/${category.slug}`}
                                onClick={() => setIsCategoriesOpen(false)}
                                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="font-medium">
                                    {category.name}
                                  </span>
                                </div>
                              </Link>
                            </motion.div>
                          ))
                        ) : (
                          <div className="py-4 text-center text-gray-500">
                            No categories found
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* User Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(user as User).username || (user as User).name}
                      </p>
                      <p className="text-sm text-gray-500">{(user as User).email}</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Link
                        href="/profile"
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold hover:shadow-lg transition-shadow"
                      >
                        {(user as User).name?.charAt(0)?.toUpperCase() || (
                          <UserCircleIcon className="w-6 h-6" />
                        )}
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl hover:from-red-100 hover:to-red-200 transition-all border border-red-200"
                    >
                      <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </motion.button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/login"
                      className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition-colors"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/register"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 font-medium transition-all"
                    >
                      Register
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 hover:text-blue-600"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-white to-blue-50 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link
                    href="/"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-2"
                  >
                    <div className="relative w-48 h-12">
                      <Image
                        src={logo}
                        alt="Daily World Blog Logo"
                        fill
                        sizes="192px"
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* User Info */}
                {user && (
                  <motion.div variants={itemVariants} className="mb-8">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {(user as User).name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{(user as User).name}</p>
                        <p className="text-sm text-gray-600">{(user as User).email}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2 mb-8">
                  {navLinks.map((link) => {
                    const isLinkActive = isActive(link.to);
                    const Icon = isLinkActive ? link.activeIcon : link.icon;

                    return (
                      <motion.div key={link.to} variants={itemVariants}>
                        <Link
                          href={link.to}
                          onClick={toggleMobileMenu}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isLinkActive
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                          {isLinkActive && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Categories Section */}
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Categories</h3>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/category/${category.slug}`}
                          onClick={toggleMobileMenu}
                          className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {category.blogCount || 0}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        No categories found
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Auth Buttons */}
                <motion.div variants={itemVariants} className="space-y-3">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={toggleMobileMenu}
                        className="block w-full px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          toggleMobileMenu();
                        }}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl hover:from-red-100 hover:to-red-200 transition-all border border-red-200"
                      >
                        <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={toggleMobileMenu}
                        className="block w-full px-4 py-3 text-center border-2 border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={toggleMobileMenu}
                        className="block w-full px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </motion.div>

                {/* Footer */}
                <motion.div
                  variants={itemVariants}
                  className="mt-8 pt-6 border-t border-gray-200"
                >
                  <p className="text-sm text-gray-500 text-center">
                    © {new Date().getFullYear()} Daily World Blog. All rights
                    reserved.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;