export const getExcerpt = (text, wordCount = 25) => {
  if (!text) return "";
  const cleanText = text.replace(/<[^>]+>/g, "");
  const words = cleanText.split(" ");
  if (words.length <= wordCount) return cleanText;
  return words.slice(0, wordCount).join(" ") + "...";
};

export const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const calculateReadTime = (content) => {
  if (!content) return "2 min read";
  const wordCount = content.split(" ").length;
  const readTime = Math.ceil(wordCount / 200);
  return `${readTime} min read`;
};

export const formatBlogData = (blog) => ({
  id: blog._id,
  title: blog.title,
  excerpt: blog.excerpt || getExcerpt(blog.description, 25),
  author: blog.user?.name || "Anonymous",
  date: formatDate(blog.createdAt),
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
});
