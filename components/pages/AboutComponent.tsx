// components/pages/AboutUs.tsx
"use client";

import { motion } from "framer-motion";
import {
  Users,
  Target,
  Award,
  Globe,
  Heart,
  TrendingUp,
  Eye,
  Phone,
  ShieldCheck, // Changed from Shield to ShieldCheck
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const AboutComponent = () => {
  const stats = [
    { value: "10M+", label: "Monthly Readers", icon: Eye },
    { value: "24/7", label: "24/7 Live Support", icon: Phone },
    { value: "150+", label: "Expert Writers", icon: Users },
    { value: "100%", label: "Reader Satisfaction", icon: Heart },
  ];

  const values = [
    {
      icon: ShieldCheck, // Changed from Shield to ShieldCheck
      title: "Journalistic Integrity",
      description:
        "We maintain the highest standards of accuracy and fairness in all our reporting.",
      color: "blue",
    },
    {
      icon: Target,
      title: "Data-Driven Insights",
      description:
        "Our analysis is backed by rigorous research and verifiable data.",
      color: "black",
    },
    {
      icon: TrendingUp,
      title: "Forward-Thinking",
      description:
        "We focus on trends and developments that shape tomorrow's world.",
      color: "blue",
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description:
        "Our coverage spans continents to provide comprehensive global insights.",
      color: "black",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-black to-blue-600" />

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6"
            >
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">
                AWARD-WINNING JOURNALISM
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Who
              <span className="bg-gradient-to-r mx-2 from-blue-600 to-black bg-clip-text text-transparent">
                We
              </span>
              Are
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed"
            >
              Welcome to DailyWorldBlog, the community-led platform designed for
              writers, readers, discussion contributors and creators from
              everywhere. Our mission is to make blogging much easier and more
              fun. We want everyone, whether novice or seasoned expert, to be
              able to blog. DailyWorldBlog, we believe that every voice matters.
              Everyone has a Story, or Knowledge, or experience to Share. That's
              where we created a site that makes it easy to sign up, write,
              upload and publish blogs about the things you love.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        </div>

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-blue-200 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-blue-600">Mission</span> &{" "}
              <span className="text-black">Values</span>
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Daily World Blog provides the most important knowledge, resources
              and ideas about services. All of things that influence people
              daily. dailyworldblog is where people go to learn about the world.
              We combines a great headline, story into an Natural Language
              generation. An easy and warm blogging experience, a welcoming
              community, a platform where you learn, express yourself, and grow.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`group p-8 rounded-2xl border ${value.color === "blue"
                    ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300"
                    : "border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300"
                    } hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${value.color === "blue"
                      ? "bg-gradient-to-r from-blue-600 to-blue-800 group-hover:from-blue-700 group-hover:to-blue-900"
                      : "bg-gradient-to-r from-gray-900 to-black group-hover:from-gray-800 group-hover:to-black"
                      } flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-4 transition-colors ${value.color === "blue"
                      ? "text-blue-600 group-hover:text-blue-700"
                      : "text-gray-900 group-hover:text-black"
                      }`}
                  >
                    {value.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {value.description}
                  </p>

                  {/* Hover Effect Line */}
                  <div
                    className={`h-1 w-0 group-hover:w-full transition-all duration-500 mt-6 rounded-full ${value.color === "blue"
                      ? "bg-gradient-to-r from-blue-600 to-blue-800"
                      : "bg-gradient-to-r from-gray-900 to-black"
                      }`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default AboutComponent;
