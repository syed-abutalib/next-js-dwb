// components/layout/Footer.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import {
  Twitter,
  Facebook,
  Linkedin,
  ArrowUpRight,
  Users,
  Clock,
  Home,
  Phone,
  Info,
  BookOpen,
  Mail,
  Sparkles,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { apiUrl } from "./Config";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SocialLink {
  name: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Navigation links
  const navLinks: NavLink[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Blogs", href: "/blogs", icon: BookOpen },
    { name: "About Us", href: "/about-us", icon: Info },
    { name: "Contact Us", href: "/contact-us", icon: Phone },
  ];

  // Social links
  const socialLinks: SocialLink[] = [
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://x.com/dailyworldblog1",
      color: "hover:text-blue-400",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://www.facebook.com/dailyworldblog",
      color: "hover:text-blue-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/company/daily-world-blog/",
      color: "hover:text-blue-700",
    },
  ];

  // Newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/newsletter/subscribe`, {
        email: email,
      });

      if (response.data.success) {
        setIsSubscribed(true);
        setEmail("");
        toast.success(response.data.message || "Successfully subscribed!");

        setTimeout(() => setIsSubscribed(false), 3000);
      } else {
        toast.error(response.data.message || "Failed to subscribe");
      }
    } catch (error: any) {
      console.error("Newsletter error:", error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.msg);
        });
      } else {
        toast.error("Failed to subscribe. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden border-t border-gray-800"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-12 lg:py-16 max-w-[1660px]">
        {/* Newsletter Section */}
        <motion.div variants={itemVariants} className="mb-12 lg:mb-16">
          <Card className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 border-gray-800 backdrop-blur-sm">
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Stay Updated
                      </h3>
                      <p className="text-gray-300 mt-1">
                        Get the latest articles delivered to your inbox
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400">
                    Join our newsletter to receive the latest blog posts,
                    updates, and exclusive content.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 bg-white/10 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || isSubscribed}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Subscribing...</span>
                        </div>
                      ) : isSubscribed ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Subscribed!
                        </>
                      ) : (
                        <>
                          Subscribe
                          <ArrowUpRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block hover:opacity-90 transition-opacity"
              >
                <Image
                  src="/logo.png"
                  alt="Daily World Blog Logo"
                  width={384}
                  height={96}
                  className="w-auto h-24 object-contain"
                  priority
                />
              </Link>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Your Gateway to Knowledge
              </p>
            </div>

            <p className="text-gray-300 max-w-lg leading-relaxed">
              A modern blogging platform where ideas meet innovation. We bring
              you the latest insights across various domains.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 pt-4">
              <div className="flex items-center gap-2 group">
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <span>Active Community</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <span>24/7 Updates</span>
              </div>
            </div>
          </motion.div>

          {/* Navigation & Social Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Quick Navigation */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="font-bold text-lg text-white relative inline-block">
                Quick Navigation
                <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              </h3>
              <div className="space-y-3">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <span className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="font-bold text-lg text-white relative inline-block">
                Follow Us
                <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center transition-all duration-300",
                      social.color,
                    )}
                    title={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connect with us on social media for daily updates and engaging
                content.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div variants={itemVariants}>
          <Separator className="bg-gray-800 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                © {new Date().getFullYear()} Daily World Blog. All rights
                reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1 flex items-center justify-center md:justify-start gap-1">
                Made with{" "}
                <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the
                blogging community
              </p>
            </div>

            {/* Back to Top Button */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-gray-400 hover:text-white group relative overflow-hidden"
                title="Back to top"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ArrowUpRight className="w-5 h-5 rotate-45 relative z-10" />
              </motion.button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs max-w-3xl mx-auto px-4">
              This website is a blogging platform. All content is
              user-generated. We are not responsible for the accuracy of
              information. Please verify important details independently.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </motion.footer>
  );
};

export default Footer;
