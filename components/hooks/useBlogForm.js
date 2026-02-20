// hooks/useBlogForm.js
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../common/Config";
import { useAuth } from "./useAuth";

export const useBlogForm = (blogId = null) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [blogData, setBlogData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      category: "",
      keywords: "",
      isFeatured: false,
      isHot: false,
      isPopular: false,
    },
    mode: "onChange",
  });

  const title = watch("title");
  const slug = watch("slug");
  const description = watch("description");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${apiUrl}/blog-categories`);
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch blog data for editing
  const fetchBlogData = async () => {
    if (!blogId) return;

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const blog = response.data.data;
        setBlogData(blog);

        // Set form values
        reset({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          description: blog.description || "",
          category: blog.category?._id || blog.category || "",
          keywords: blog.keywords?.join(", ") || "",
          isFeatured: blog.isFeatured || false,
          isHot: blog.isHot || false,
          isPopular: blog.isPopular || false,
        });

        // Set featured image
        if (blog.imageUrl) {
          setImagePreview(blog.imageUrl);
        }

        // Set tags
        if (blog.tags) {
          if (Array.isArray(blog.tags)) {
            setTags(blog.tags);
          } else if (typeof blog.tags === "string") {
            setTags(
              blog.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag),
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug && !blogId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [title, slug, blogId, setValue]);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    if (blogId) {
      fetchBlogData();
    }
  }, [blogId]);

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

  // Handle tags
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle slug manual input
  const handleSlugChange = (e) => {
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
    setValue("slug", newSlug, { shouldValidate: true });
  };

  // Submit form
  const onSubmit = async (data) => {
    if (!data.description.trim() || data.description === "<p><br></p>") {
      return { success: false, message: "Content is required" };
    }

    if (!data.category) {
      return { success: false, message: "Please select a category" };
    }

    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append("title", data.title);
      submitData.append("slug", data.slug);
      submitData.append("description", data.description);
      submitData.append("excerpt", data.excerpt);
      submitData.append("category", data.category);
      submitData.append("tags", tags.join(","));
      submitData.append("keywords", data.keywords);
      submitData.append("isFeatured", data.isFeatured);
      submitData.append("isHot", data.isHot);
      submitData.append("isPopular", data.isPopular);

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const url = blogId ? `${apiUrl}/blogs/${blogId}` : `${apiUrl}/blogs`;

      const method = blogId ? "put" : "post";

      const response = await axios[method](url, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Failed to save blog:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to save blog",
      };
    } finally {
      setSaving(false);
    }
  };

  return {
    // State
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
    blogData,

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
    handleAddTag,
    handleRemoveTag,
    handleTagKeyPress,
    handleSlugChange,
    onSubmit: handleSubmit(onSubmit),

    // Navigation
    navigate,
  };
};

// Quill editor modules configuration
export const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  },
};



