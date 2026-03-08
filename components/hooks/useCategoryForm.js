// hooks/useCategoryForm.js
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../common/Config";
import { useAuth } from "./useAuth";

export const useCategoryForm = (categoryId = null) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      status: true,
    },
    mode: "onChange",
  });

  const name = watch("name");
  const status = watch("status");

  // Fetch category data for editing
  const fetchCategoryData = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${apiUrl}/blog-categories/${categoryId}`,
      );

      if (response.data.success) {
        const category = response.data.data;
        setCategoryData(category);

        // Set form values
        reset({
          name: category.name || "",
          description: category.description || "",
          status: category.status || true,
        });

        // Set image
        if (category.imageUrl) {
          setImagePreview(category.imageUrl);
        }
      }
    } catch (error) {
      console.error("Failed to fetch category:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return; // Handle error in component
    }

    if (!file.type.match("image.*")) {
      return; // Handle error in component
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // Submit form
  const onSubmit = async (data) => {
    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append("name", data.name);
      submitData.append("description", data.description);
      submitData.append("status", data.status);

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const url = categoryId
        ? `${apiUrl}/blog-categories/${categoryId}`
        : `${apiUrl}/blog-categories`;

      const method = categoryId ? "put" : "post";

      const response = await axios[method](url, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Failed to save category:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to save category",
      };
    } finally {
      setSaving(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  return {
    // State
    loading,
    saving,
    imagePreview,
    imageFile,
    categoryData,

    // Form
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isDirty,

    // Methods
    handleImageUpload,
    removeImage,
    onSubmit: handleSubmit(onSubmit),

    // Navigation
    navigate,
  };
};
