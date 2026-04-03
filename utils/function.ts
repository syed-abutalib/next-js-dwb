import { Blog, FormattedBlog } from "@/types/homeType";
import { calculateReadTime, formatDate, getExcerpt } from "./formatters";

export function formatBlogData(blog: Blog): FormattedBlog {
  return {
    id: blog._id,
    title: blog.title,
    excerpt: blog.excerpt || getExcerpt(blog.description, 25),
    author: blog.user?.name || "Daily World Blog",
    date: formatDate(blog.createdAt),
    createdAt: blog.createdAt,
    slug: blog.slug,
    readTime: calculateReadTime(blog.description),
    views: blog.views || 0,
    likes: blog.likes || 0,
    imageUrl:
      blog.imageUrl ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
    category: blog.category?.name || "Uncategorized",
    categoryId: blog.category?._id,
    categorySlug: blog.category?.slug,
    isFeatured: blog.isFeatured || false,
    isHot: blog.isHot || false,
    isPopular: blog.isPopular || false,
  };
}
