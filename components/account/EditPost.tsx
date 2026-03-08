"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import "react-quill-new/dist/quill.snow.css";

import dynamic from "next/dynamic";

// Dynamically import with no SSR
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false
});

import {
  Upload,
  X,
  Image as ImageIcon,
  Tag,
  FolderOpen,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { apiUrl } from "../common/Config";

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface BlogData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  content?: string;
  status: "pending" | "published" | "rejected";
  imageUrl?: string;
  tags?: string[] | string;
  keywords?: string;
  rejectionReason?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  category: string;
  keywords: string;
}

const EditPost = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      category: "",
      keywords: "",
    },
    mode: "onChange",
  });

  const title = watch("title");
  const slug = watch("slug");
  const description = watch("description");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [title, slug, setValue]);

  // Fetch blog data
  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id) {
        toast.error("No blog ID provided");
        router.push("/my-blogs");
        return;
      }

      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      if (!user) {
        toast.error("User information not available");
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        setFetchError(null);
        setCanEdit(true);

        // Fetch blog details using user-specific endpoint
        const response = await axios.get(`${apiUrl}/blogs/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch blog");
        }

        const blog = response.data.data;
        setBlogData(blog);

        // Check ownership - blog.user is an object with _id property
        // User from localStorage has 'id' property, blog user has '_id'
        const blogUserId = blog.user?._id;
        const currentUserId = (user as User).id;

        if (!blogUserId || !currentUserId) {
          setCanEdit(false);
          setFetchError("User information is missing");
          toast.error("Unable to verify ownership");
          return;
        }

        if (blogUserId !== currentUserId) {
          setCanEdit(false);
          setFetchError("You are not authorized to edit this blog");
          toast.error("You are not authorized to edit this blog");
          return;
        }

        // User can only edit pending or rejected blogs
        if (blog.status === "published") {
          setCanEdit(false);
          setFetchError(
            "Published blogs cannot be edited. Please contact admin.",
          );
          toast.error(
            "Published blogs cannot be edited. Please contact admin.",
          );
          return;
        }

        // User can edit pending or rejected blogs
        if (blog.status === "pending" || blog.status === "rejected") {
          setCanEdit(true);
        } else {
          setCanEdit(false);
          setFetchError("You cannot edit this blog");
          toast.error("You cannot edit this blog");
          return;
        }

        // Set form values
        const formData: FormData = {
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          description: blog.description || blog.content || "",
          category: blog.category?._id || blog.category || "",
          keywords: blog.keywords || "",
        };

        reset(formData);

        // Set featured image
        if (blog.imageUrl) {
          setImagePreview(blog.imageUrl);
        }

        // Set tags - in your response, tags is a string "hello,code"
        if (blog.tags) {
          if (Array.isArray(blog.tags)) {
            setTags(blog.tags);
          } else if (typeof blog.tags === "string") {
            // Split by comma and clean up
            const tagArray = blog.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter((tag: string) => tag);
            setTags(tagArray);
          }
        }

        // Fetch categories
        await fetchCategories();
      } catch (error) {
        let errorMessage = "Failed to load blog";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403 || error.response?.status === 401) {
            errorMessage =
              error.response?.data?.message ||
              "You are not authorized to access this blog";
            setCanEdit(false);
          } else if (error.response?.status === 404) {
            errorMessage = "Blog not found";
            toast.error(errorMessage);
            setTimeout(() => router.push("/my-blogs"), 2000);
            return;
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setFetchError(errorMessage);
        toast.error(errorMessage);

        // Don't redirect immediately for auth errors, let user see the error
        if (axios.isAxiosError(error) &&
          (error.response?.status === 403 || error.response?.status === 401)) {
          setTimeout(() => router.push("/my-blogs"), 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && user && id) {
      fetchBlogData();
    } else {
      if (!token) {
        toast.error("Please login first");
        router.push("/login");
      }
      setLoading(false);
    }
  }, [id, token, user, reset, router]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${apiUrl}/blog-categories`);
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
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
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // Handle tags
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle slug manual input
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
    setValue("slug", newSlug, { shouldValidate: true });
  };

  // Form submission
  const onSubmit = async (formData: FormData) => {
    // Validation
    if (
      !formData.description.trim() ||
      formData.description === "<p><br></p>"
    ) {
      toast.error("Content is required");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Updating blog...");

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("slug", formData.slug);
      submitData.append("description", formData.description);
      submitData.append("excerpt", formData.excerpt);
      submitData.append("category", formData.category);

      // Convert tags array to comma-separated string
      submitData.append("tags", tags.join(","));

      // Keywords is already a string from the form
      submitData.append("keywords", formData.keywords || "");

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      // Use the user-specific endpoint
      const response = await axios.put(
        `${apiUrl}/blogs/user/${id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update blog");
      }

      toast.success(response.data.message || "Blog updated successfully", {
        id: toastId,
        duration: 5000,
      });

      // Navigate back after delay
      setTimeout(() => {
        router.push("/my-blogs");
      }, 1000);
    } catch (error) {
      let message = "Failed to update blog";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          message =
            error.response?.data?.message ||
            "You are not authorized to edit this blog";
        } else if (error.response?.status === 401) {
          message = "Session expired. Please login again";
          router.push("/login");
        } else if (error.response?.status === 400) {
          message = error.response?.data?.message || "Invalid data";
        } else if (error.response?.status === 404) {
          message = "Blog not found";
        } else if (error.response?.data?.message) {
          message = error.response.data.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Delete blog
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this blog? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const toastId = toast.loading("Deleting blog...");

      // Try user-specific delete endpoint first
      await axios.delete(`${apiUrl}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Blog deleted successfully", { id: toastId });
      router.push("/my-blogs");
    } catch (error) {
      // Try fallback to regular delete endpoint
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        try {
          await axios.delete(`${apiUrl}/blogs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Blog deleted successfully", { id: toastId });
          router.push("/my-blogs");
          return;
        } catch (fallbackError) {
          // Ignore fallback error
        }
      }

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete blog"
        : "Failed to delete blog";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  // If user can't edit OR if there's a fetch error
  if (!canEdit || fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {fetchError?.includes("Published")
              ? "Cannot Edit Published Blog"
              : "Access Denied"}
          </h2>
          <p className="text-gray-600 mb-6">
            {fetchError || "You are not authorized to edit this blog."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/my-blogs")}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Back to My Blogs
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Blog not found
  if (!blogData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Blog not found</p>
          <button
            onClick={() => router.push("/my-blogs")}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
          >
            Back to My Blogs
          </button>
        </div>
      </div>
    );
  }

  // Get status badge
  const getStatusBadge = () => {
    switch (blogData.status) {
      case "pending":
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Pending Approval",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "rejected":
        return {
          icon: <X className="w-4 h-4" />,
          text: "Rejected",
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: blogData.status || "Unknown",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const statusBadge = getStatusBadge();

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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/my-blogs")}
              className="flex items-center text-gray-600 hover:text-blue-600 mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to My Blogs</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Blog Post
                </h1>
                <p className="text-gray-600 mt-2">
                  Make changes to your{" "}
                  {blogData.status === "rejected" ? "rejected" : "pending"}{" "}
                  blog
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusBadge.color}`}
              >
                {statusBadge.icon}
                <span className="font-medium">{statusBadge.text}</span>
              </div>
            </div>
          </div>

          {/* Rejection Notice */}
          {blogData.status === "rejected" && blogData.rejectionReason && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800 mb-1">
                    Rejection Reason
                  </h3>
                  <p className="text-sm text-red-700">
                    {blogData.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 5,
                      message: "Title should be at least 10 characters",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.title ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your blog title..."
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  {...register("slug", {
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message:
                        "Use lowercase letters, numbers, and hyphens only",
                    },
                    onChange: handleSlugChange,
                  })}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.slug ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="your-blog-slug"
                />
                {errors.slug && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Category *
                </label>
                <div className="relative">
                  {loadingCategories ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
                      <span className="text-gray-600">
                        Loading categories...
                      </span>
                    </div>
                  ) : (
                    <select
                      {...register("category", {
                        required: "Please select a category",
                      })}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${errors.category ? "border-red-500" : "border-gray-300"
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Tags
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add tags (press Enter to add)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Featured Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="relative max-h-64 w-full overflow-hidden rounded-lg mx-auto">
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
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                        <span className="text-gray-700">
                          Click to upload image
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={saving}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Excerpt (Summary)
                </label>
                <textarea
                  {...register("excerpt", {
                    maxLength: {
                      value: 200,
                      message: "Excerpt should not exceed 200 characters",
                    },
                  })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.excerpt ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                  placeholder="Brief summary of your blog..."
                />
                {errors.excerpt && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.excerpt.message}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Content *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {previewMode ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Edit Mode</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Preview Mode</span>
                      </>
                    )}
                  </button>
                </div>

                {previewMode ? (
                  <div
                    className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50 min-h-[300px] prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: description || "" }}
                  />
                ) : (
                  <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={description || ""}
                      onChange={(value) => setValue("description", value)}
                      modules={modules}
                      formats={formats}
                      className="min-h-[300px]"
                    />
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  SEO Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  {...register("keywords")}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Helps with search engine optimization
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Status after update: </span>
                    <span className="text-yellow-600 font-semibold">
                      Pending Approval
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.push("/my-blogs")}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto"
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors w-full sm:w-auto"
                      disabled={saving}
                    >
                      Delete
                    </button>

                    <button
                      type="submit"
                      disabled={saving || !isDirty}
                      className={`px-8 py-3 rounded-xl font-semibold w-full sm:w-auto ${saving || !isDirty
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                        }`}
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          Update & Resubmit
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Update Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>
                  After updating, your blog will be resubmitted for approval
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Review typically takes 24-48 hours</span>
              </li>

              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>Published blogs cannot be edited by users</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditPost;