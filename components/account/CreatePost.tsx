"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  TagIcon,
  SparklesIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  HashtagIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { apiUrl } from "../common/Config";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface FormData {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  category: string;
  tags: string;
  keywords: string;
  isFeatured: boolean;
  isHot: boolean;
  isPopular: boolean;
  status: string;
}

const CreateBlog = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const quillRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [slugError, setSlugError] = useState("");
  const [slugLoading, setSlugLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    description: "",
    excerpt: "",
    category: "",
    tags: "",
    keywords: "",
    isFeatured: false,
    isHot: false,
    isPopular: false,
    status: "pending",
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${apiUrl}/blog-categories`);
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  // Check if slug is available
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) return;

    setSlugLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/blogs/check-slug/${slug}`);
      if (response.data.exists) {
        setSlugError("This URL slug is already taken");
      } else {
        setSlugError("");
      }
    } catch (error) {
      console.error("Error checking slug:", error);
    } finally {
      setSlugLoading(false);
    }
  };

  // Handle title change with auto-slug generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));

    // Check slug availability after a delay
    if (title.length > 3) {
      const delayDebounce = setTimeout(() => {
        checkSlugAvailability(generateSlug(title));
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  };

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = generateSlug(e.target.value);
    setFormData((prev) => ({ ...prev, slug }));

    if (slug.length > 3) {
      const delayDebounce = setTimeout(() => {
        checkSlugAvailability(slug);
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  };

  // Update character and word count
  const updateCounts = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    setCharacterCount(text.length);
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  };

  // Handle content change
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, description: content }));
    updateCounts(content);
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.match("image.*")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  // Add tag
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setFormData((prev) => ({ ...prev, tags: newTags.join(",") }));
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    setFormData((prev) => ({ ...prev, tags: newTags.join(",") }));
  };

  // Custom Quill modules
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  // Custom formats
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "direction",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push("Title is required");
    if (!formData.description.trim() || formData.description === "<p><br></p>")
      errors.push("Content is required");
    if (!formData.category) errors.push("Please select a category");
    if (slugError) errors.push("Please fix the URL slug issue");

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Submitting for approval...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("tags", formData.tags);
      formDataToSend.append("keywords", formData.keywords);
      formDataToSend.append("isFeatured", String(formData.isFeatured));
      formDataToSend.append("isHot", String(formData.isHot));
      formDataToSend.append("isPopular", String(formData.isPopular));
      formDataToSend.append("status", "pending");

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await axios.post(`${apiUrl}/blogs`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(
          "Blog submitted successfully! It's now pending approval.",
          {
            id: toastId,
            duration: 6000,
          },
        );
        router.push("/my-blogs");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Slug already exists or something went wrong", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
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
        damping: 15,
      },
    },
  };

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Sidebar - Hidden on small screens */}
            <div className="lg:w-1/4 hidden lg:block">
              <Sidebar />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Header */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-4 md:p-6 border border-white/50 backdrop-blur-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <Link
                        href="/my-blogs"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3 transition-colors group"
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">
                          Back to My Blogs
                        </span>
                      </Link>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                          <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Create New Blog Post
                          </h1>
                          <p className="text-gray-600 mt-1 text-sm md:text-base">
                            Share your thoughts and ideas with our community
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pending Status Badge */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>Will be Pending</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Approval Notice */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                        Important Approval Information
                      </h3>
                      <p className="text-sm text-yellow-700">
                        All blog posts require approval from our editorial
                        team. After submission, your post will be reviewed
                        within 24-48 hours. You'll receive a notification once
                        it's approved and published.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Form */}
                <motion.form
                  variants={itemVariants}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                >
                  {/* Editor Header */}
                  <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewMode(!previewMode)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {previewMode ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFullscreen(!fullscreen)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {fullscreen ? (
                            <ArrowsPointingInIcon className="w-5 h-5" />
                          ) : (
                            <ArrowsPointingOutIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">{wordCount}</span>{" "}
                          words •{" "}
                          <span className="font-medium">
                            {characterCount}
                          </span>{" "}
                          characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div
                    className={`p-4 md:p-6 lg:p-8 ${fullscreen ? "fixed inset-0 z-50 bg-white overflow-auto" : ""}`}
                  >
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4" />
                          Blog Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={handleTitleChange}
                          placeholder="Enter a compelling title..."
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                          required
                        />
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          URL Slug *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">/blog/</span>
                          </div>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={handleSlugChange}
                            placeholder="your-blog-slug"
                            className="w-full pl-16 pr-10 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {slugLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : slugError ? (
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                            ) : formData.slug ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : null}
                          </div>
                        </div>
                        {slugError && (
                          <p className="mt-2 text-sm text-red-600">
                            {slugError}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <TagIcon className="w-4 h-4" />
                          Category *
                          {loadingCategories && (
                            <span className="text-xs text-gray-500 font-normal ml-2">
                              (Loading...)
                            </span>
                          )}
                        </label>

                        <div className="relative">
                          {loadingCategories ? (
                            <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="text-gray-600">
                                  Loading categories...
                                </span>
                              </div>
                            </div>
                          ) : categories.length === 0 ? (
                            <div className="w-full px-4 py-3.5 border-2 border-red-200 rounded-xl flex items-center justify-center bg-red-50">
                              <div className="flex items-center space-x-2">
                                <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                                <span className="text-red-600">
                                  No categories available
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                value={formData.category}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    category: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-all duration-300 hover:border-gray-400 pr-12 cursor-pointer"
                                required
                                disabled={categories.length === 0}
                              >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>

                              {/* Custom dropdown arrow */}
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <div className="relative">
                                  {formData.category && !loadingCategories ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <svg
                                      className="w-5 h-5 text-gray-400 transform transition-transform duration-300 group-hover:rotate-180"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Error message */}
                          {!loadingCategories && categories.length === 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <ExclamationCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <p className="text-sm text-red-600">
                                Please contact admin to add categories first
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <HashtagIcon className="w-4 h-4" />
                          Tags
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInput}
                            placeholder="Add tags (press Enter or comma to add)"
                            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            Add
                          </button>
                        </div>

                        {/* Selected Tags */}
                        {selectedTags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="text-blue-700 hover:text-blue-900"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4" />
                          SEO Keywords
                        </label>
                        <textarea
                          value={formData.keywords}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              keywords: e.target.value,
                            })
                          }
                          placeholder="Add relevant keywords separated by commas..."
                          rows={2}
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 resize-none"
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          Add keywords to help users discover your content
                        </div>
                      </div>

                      {/* Featured Image */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <PhotoIcon className="w-4 h-4" />
                          Featured Image
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`border-3 ${imagePreview ? "border-blue-200" : "border-dashed border-gray-300"} rounded-2xl p-6 text-center hover:border-blue-400 transition-all duration-300 cursor-pointer bg-gradient-to-br ${imagePreview ? "from-blue-50/50 to-white" : "from-gray-50/50 to-white"}`}
                        >
                          {imagePreview ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-4"
                            >
                              <div className="relative">
                                <div className="relative max-h-72 w-full overflow-hidden rounded-xl mx-auto shadow-lg">
                                  <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    width={800}
                                    height={400}
                                    className="object-cover w-full h-auto"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                  }}
                                  className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600">
                                Click to change image
                              </p>
                            </motion.div>
                          ) : (
                            <label className="cursor-pointer">
                              <div className="flex flex-col items-center">
                                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
                                  <PhotoIcon className="w-12 h-12 text-blue-500" />
                                </div>
                                <span className="text-gray-700 font-medium">
                                  Click to upload image
                                </span>
                                <span className="text-sm text-gray-500 mt-2">
                                  Recommended: 1200×630px • Max: 5MB
                                </span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </motion.div>
                      </div>

                      {/* Excerpt */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4" />
                          Meta Description / Excerpt (Summary)
                        </label>
                        <textarea
                          value={formData.excerpt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              excerpt: e.target.value,
                            })
                          }
                          placeholder="Write a brief summary that will appear in blog listings or search engine results..."
                          rows={3}
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 resize-none"
                        />
                      </div>

                      {/* Content Editor */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4" />
                          Content *
                        </label>

                        {previewMode ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="prose prose-lg max-w-none border-2 border-gray-200 rounded-xl p-6 bg-gray-50 min-h-[400px]"
                            dangerouslySetInnerHTML={{
                              __html: formData.description,
                            }}
                          />
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="border-2 border-gray-300 rounded-xl overflow-hidden hover:border-gray-400 transition-all duration-300"
                          >
                            <ReactQuill
                              ref={quillRef}
                              theme="snow"
                              value={formData.description}
                              onChange={handleContentChange}
                              modules={modules}
                              formats={formats}
                              className={`${fullscreen ? "h-[calc(100vh-200px)]" : "h-96"} min-h-[400px]`}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-yellow-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Status:{" "}
                          </span>
                          <span className="text-sm text-yellow-600 font-semibold">
                            Pending Approval
                          </span>
                          <p className="text-xs text-gray-500">
                            Will be reviewed within 24-48 hours
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push("/my-blogs")}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium w-full sm:w-auto"
                        >
                          Cancel
                        </motion.button>

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={loading}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="w-5 h-5" />
                              <span>Submit for Approval</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.form>

                {/* Tips & Guidelines */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Tips for Successful Submission
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Writing Tips */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                        Content Guidelines
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            Original content is prioritized for approval
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            Proper grammar and spelling increase approval
                            chances
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Include credible sources and references</span>
                        </li>
                      </ul>
                    </div>

                    {/* Approval Process */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-yellow-500" />
                        Approval Process
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                          <span>Review typically takes 24-48 hours</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                          <span>
                            You'll receive email notifications for status
                            updates
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                          <span>
                            Editors may request revisions before approval
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Best Practices */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-purple-500" />
                        Best Practices
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                          <span>
                            Use relevant tags to help categorization
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                          <span>High-quality images improve engagement</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                          <span>Proper formatting enhances readability</span>
                        </li>
                      </ul>
                    </div>

                    {/* What to Avoid */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                        What to Avoid
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <XMarkIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Plagiarized or copied content</span>
                        </li>
                        <li className="flex items-start">
                          <XMarkIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Promotional or spammy content</span>
                        </li>
                        <li className="flex items-start">
                          <XMarkIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Inappropriate or offensive material</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Fullscreen Overlay */}
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-40 overflow-auto"
          >
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Fullscreen Editor
                </h2>
                <button
                  onClick={() => setFullscreen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowsPointingInIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default CreateBlog;