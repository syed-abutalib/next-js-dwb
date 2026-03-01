"use client";
import React, { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { AuthContext } from "../context/Auth";
import axios from "axios";
import toast from "react-hot-toast";

const AddBlogModal = ({ openModal, setOpenModal }) => {
  const { getAuthHeaders } = useContext(AuthContext);
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const title = watch("title");
  const slug = watch("slug");

  // Auto-generate slug from title
  useEffect(() => {
    if (!slug && title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setValue("slug", generatedSlug);
    }
  }, [title, slug, setValue]);

  // Preview selected image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  // Submit post
  const onSubmit = async (data) => {
    if (!description) {
      toast.error("Description is required!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Submitting blog...");

    try {
      let featured_media_id = null;
      const headers = getAuthHeaders();

      // Upload image first if it exists
      if (data.image && data.image[0]) {
        const formData = new FormData();
        formData.append("file", data.image[0]);

        const mediaRes = await axios.post(
          "https://purple-weasel-386695.hostingersite.com/wp-json/wp/v2/media",
          formData,
          {
            headers: {
              ...headers,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        featured_media_id = mediaRes.data.id;
      }

      // Create post via custom endpoint
      const postRes = await axios.post(
        "https://purple-weasel-386695.hostingersite.com/wp-json/custom-posts/v1/save",
        {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: description,
          featured_media: featured_media_id,
        },
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success(postRes.data.message || "Post submitted for approval!", {
        id: toastId,
      });

      // Reset form
      reset();
      setDescription("");
      setImagePreview(null);
      setOpenModal(false);
    } catch (err) {
      console.error("Submission error:", err.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Failed to submit post", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!openModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-75">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold uppercase text-gray-800">
            Add Blog
          </h3>
          <button
            className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl"
            onClick={() => setOpenModal(false)}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Image */}
          <div>
            <label className="block mb-1 font-semibold">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              onChange={handleImageChange}
              className="border border-gray-300 w-full p-2 rounded-lg"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 rounded-lg w-full h-48 object-cover border"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block mb-1 font-semibold">Title</label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="border border-gray-300 w-full p-2 rounded-lg"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block mb-1 font-semibold">Slug</label>
            <input
              type="text"
              {...register("slug", { required: "Slug is required" })}
              className="border border-gray-300 w-full p-2 rounded-lg"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm">{errors.slug.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block mb-1 font-semibold">Excerpt</label>
            <textarea
              {...register("excerpt")}
              placeholder="Optional excerpt"
              className="border border-gray-300 w-full p-2 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-semibold">Description</label>
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              className="bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3 text-white font-semibold rounded-xl ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
          >
            {loading ? "Submitting..." : "Submit Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlogModal;
