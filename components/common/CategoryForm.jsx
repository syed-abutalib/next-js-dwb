// components/category/CategoryForm.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  FolderOpen,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Hash,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const CategoryForm = ({
  title,
  subtitle,
  isEdit = false,

  // Form state
  loading,
  saving,
  imagePreview,
  imageFile,

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
  onSubmit,

  // Navigation
  navigate,
}) => {
  const status = watch("status");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/categories")}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Categories</span>
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
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Category Name *
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Category name is required",
                    minLength: {
                      value: 3,
                      message: "Name should be at least 3 characters",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Enter category name..."
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description", {
                    maxLength: {
                      value: 500,
                      message: "Description should not exceed 500 characters",
                    },
                  })}
                  rows="4"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors`}
                  placeholder="Describe this category..."
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Category Image
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

              {/* Status Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setValue("status", !status, { shouldValidate: true })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      status ? "bg-green-500" : "bg-gray-300"
                    }`}
                    disabled={loading}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        status ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    {status ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-900">
                      {status ? "Active" : "Inactive"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {status ? "(Visible to users)" : "(Hidden from users)"}
                    </span>
                  </div>
                </div>
                <input type="hidden" {...register("status")} />
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
                <span className="font-medium">Status: </span>
                <span
                  className={`font-semibold ${
                    status ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {status ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate("/admin/categories")}
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
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
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
                      {isEdit ? "Update Category" : "Create Category"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            variants={fadeInUp}
            className="bg-green-50 rounded-xl p-6 border border-green-200"
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
                    : "Category will be available for use immediately"}
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>
                  Use clear, descriptive names for better organization
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                <span>Add an image to make the category more appealing</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                <span>Inactive categories won't appear in blog creation</span>
              </li>
            </ul>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CategoryForm;
