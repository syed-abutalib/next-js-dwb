"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircleIcon,
  DocumentTextIcon,
  HeartIcon,
  KeyIcon,
  ChartBarIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import userImage from "@/public/user-anonymous.webp";
import { PencilIcon, Settings } from "lucide-react";
import Image from "next/image";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(true);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const tabs = [
    {
      id: "profile",
      url: "/profile",
      name: "Dashboard",
      icon: HomeIcon,
    },
    {
      id: "blogs",
      url: "/my-blogs",
      name: "My Blogs",
      icon: DocumentTextIcon,
    },
    {
      id: "favorites",
      url: "/create-blog",
      name: "Add New Post",
      icon: PencilIcon,
    },
    // {
    //   id: "password",
    //   url: "/change-password",
    //   name: "Change Password",
    //   icon: KeyIcon,
    // },
  ];

  const sidebarVariants = {
    closed: {
      x: -300,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  const staggerContainer = {
    open: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="md:hidden fixed bottom-2 right-20 left-20 z-50 p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <span className="flex items-center justify-center gap-2">
            {" "}
            <XMarkIcon className="w-6 h-6" /> Close Menu
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {" "}
            <Settings className="w-6 h-6" /> Open Menu
          </span>
        )}
      </motion.button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed md:relative top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white z-40 shadow-2xl overflow-hidden ${isMobile ? "fixed" : "sticky"
          }`}
        style={{
          height: isMobile ? "100vh" : "calc(100vh - 2rem)",
          margin: isMobile ? "0" : "1rem",
          borderRadius: isMobile ? "0" : "1rem",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative h-full flex flex-col p-6">
          {/* Close button for mobile */}
          {isMobile && (
            <div className="flex justify-end mb-4">
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>
          )}

          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4 mb-8 p-4 bg-white/5 rounded-2xl backdrop-blur-sm"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/20 relative">
                <Image
                  src={userImage}
                  alt="Profile"
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority
                />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">
                {user?.name || user?.username || "Guest"}
              </h2>
              <p className="text-sm text-gray-300 truncate">
                {user?.email || "guest@example.com"}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-full">
                  {user?.role === "admin" ? "Administrator" : "Blogger"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.nav
            variants={staggerContainer}
            initial="closed"
            animate="open"
            className="flex-1 space-y-2"
          >
            {tabs.map((tab, index) => {
              const isActive = pathname === tab.url;
              return (
                <motion.div key={tab.id} variants={itemVariants} custom={index}>
                  <Link
                    href={tab.url}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {/* Animated background for active state */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl -z-10"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <motion.div
                      whileHover={{ rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-lg ${isActive
                        ? "bg-white/20"
                        : "bg-white/5 group-hover:bg-white/10"
                        }`}
                    >
                      <tab.icon className="w-5 h-5" />
                    </motion.div>

                    <span className="font-medium">{tab.name}</span>

                    {/* Hover indicator */}
                    {!isActive && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
                        initial={{ height: 0 }}
                        whileHover={{ height: "60%" }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-6 mt-6 border-t border-white/10"
          >
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg transition-all duration-300 group"
            >
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </motion.div>
              <span className="font-medium">Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;