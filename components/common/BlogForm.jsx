// components/blog/BlogForm.jsx
import React from "react";
import { motion } from "framer-motion";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Tag,
  FolderOpen,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Hash,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Star,
  Flame,
  TrendingUp,
} from "lucide-react";
import { quillModules } from "../hooks/useBlogForm";

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const BlogForm = ({
  title,
  subtitle,
  isEdit = false,

  // Form state
  loading,
  saving,
  categories,
  loadingCategories,
  imagePreview,
  imageFile,
  tags,
  tagInput,
  setTagInput,
  previewMode,
  setPreviewMode,

  // Form methods
  register,
  handleSubmit,
  watch,
  setValue,
  errors,
  isDirty,

  // Handlers
  handleImageUpload,
  removeImage,
  handleAddTag,
  handleRemoveTag,
  handleTagKeyPress,
  handleSlugChange,
  onSubmit,

  // Navigation
  navigate,
}) => {
  const description = watch("description");
  const isFeatured = watch("isFeatured");
  const isHot = watch("isHot");
  const isPopular = watch("isPopular");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/blogs")}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Blogs</span>
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Main Form Card */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Title *
                </label>
                <input
                  type="text"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 10,
                      message: "Title should be at least 10 characters",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your blog title..."
                  disabled={loading}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
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
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.slug ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="your-blog-slug"
                  disabled={loading}
                />
                {errors.slug && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.slug.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  This will be used in the URL: yourwebsite.com/blog/your-slug
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
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
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      disabled={loading}
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
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Add tags (press Enter to add)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
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
                        <Hash className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-700 hover:text-blue-900 ml-1"
                          disabled={loading}
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
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Featured Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 w-full object-cover rounded-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          disabled={loading}
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
                        disabled={loading}
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
                  rows="3"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.excerpt ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors`}
                  placeholder="Brief summary of your blog..."
                  disabled={loading}
                />
                {errors.excerpt && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
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
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    disabled={loading}
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
                    className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50 min-h-[300px]"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                ) : (
                  <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={(value) => setValue("description", value)}
                      modules={quillModules}
                      className="min-h-[300px]"
                    />
                  </div>
                )}
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="keyword1, keyword2, keyword3"
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Helps with search engine optimization
                </p>
              </div>

              {/* Blog Features */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  Blog Features
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        {...register("isFeatured")}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isFeatured
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isFeatured && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium text-gray-900">
                          Featured
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Highlight this blog on homepage
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-orange-300 cursor-pointer transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        {...register("isHot")}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isHot
                            ? "bg-orange-500 border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isHot && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="font-medium text-gray-900">Hot</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Mark as trending/hot content
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-300 cursor-pointer transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        {...register("isPopular")}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isPopular
                            ? "bg-purple-500 border-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isPopular && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-gray-900">
                          Popular
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Show in popular section
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                {isEdit ? (
                  <>
                    <span className="font-medium">Status: </span>
                    <span className="text-yellow-600 font-semibold">
                      Will be updated immediately
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Status after creation: </span>
                    <span className="text-yellow-600 font-semibold">
                      Pending Review
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate("/admin/blogs")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || (isEdit && !isDirty)}
                  className={`px-8 py-3 rounded-xl font-semibold w-full sm:w-auto transition-all ${
                    saving || (isEdit && !isDirty)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      {isEdit ? "Update Blog" : "Create Blog"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            variants={fadeInUp}
            className="bg-blue-50 rounded-xl p-6 border border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {isEdit ? "Update Guidelines" : "Creation Guidelines"}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>
                  {isEdit
                    ? "Your changes will be visible immediately after update"
                    : "After creation, your blog will be reviewed by our team"}
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Use relevant tags to increase discoverability</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Add a featured image for better engagement</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>Ensure content follows our community guidelines</span>
              </li>
            </ul>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default BlogForm;
