// app/blogs/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { BlogSkeleton } from "@/components/skeleton/BlogSkeleton";
import { apiUrl } from "@/components/common/Config";
import { formatDate, calculateReadTime, getExcerpt } from "@/utils/formatters";
import Blog from "@/components/pages/Blog";

// Types
interface Blog {
  _id: string;
  title: string;
  excerpt?: string;
  description: string;
  createdAt: string;
  slug: string;
  imageUrl?: string;
  isFeatured?: boolean;
  isHot?: boolean;
  isPopular?: boolean;
  views?: number;
  likes?: number;
  bookmarks?: number;
  user?: { _id: string; name: string };
  category?: { _id: string; name: string; slug: string };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  blogCount?: number;
}

interface FormattedBlog {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  author: string;
  date: string;
  createdAt: string;
  slug: string;
  readTime: string;
  views: number;
  likes: number;
  bookmarks: number;
  imageUrl: string;
  category: string;
  categorySlug?: string;
  isFeatured: boolean;
  isHot: boolean;
  isPopular: boolean;
}

interface PageProps {
  searchParams?: Promise<{
    page?: string;
    category?: string;
    sort?: string;
    search?: string;
  }>;
}

export const metadata: Metadata = {
  title: "All Blogs | Daily World Blog",
  description:
    "Explore all our blog articles featuring fashion and beauty, finance, technology, gaming, health and fitness, home and garden, business, and consulting. Discover tips, trends, and expert insights in one place.",
  openGraph: {
    title: "All Blogs | Daily World Blog",
    description:
      "Explore all our blog articles featuring fashion and beauty, finance, technology, gaming, health and fitness, home and garden, business, and consulting.",
    url: "https://dailyworldblog.com/blogs",
    type: "website",
  },
  alternates: {
    canonical: "https://dailyworldblog.com/blogs",
  },
};

// Format blog data on server
function formatBlogData(blog: Blog): FormattedBlog {
  return {
    id: blog._id,
    title: blog.title,
    excerpt: blog.excerpt || getExcerpt(blog.description, 25),
    description: blog.description,
    author: blog.user?.name || "Daily World Blog",
    date: formatDate(blog.createdAt),
    createdAt: blog.createdAt,
    slug: blog.slug,
    readTime: calculateReadTime(blog.description),
    views: blog.views || 0,
    likes: blog.likes || 0,
    bookmarks: blog.bookmarks || 0,
    imageUrl: blog.imageUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
    category: blog.category?.name || "Uncategorized",
    categorySlug: blog.category?.slug,
    isFeatured: blog.isFeatured || false,
    isHot: blog.isHot || false,
    isPopular: blog.isPopular || false,
  };
}

// Server-side data fetching
async function fetchBlogs(page: number = 1, category?: string, sort?: string, search?: string) {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", "9");

    if (category && category !== "all") {
      params.append("category", category);
    }

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    if (sort === "popular") {
      params.append("popular", "true");
    } else if (sort === "hot") {
      params.append("hot", "true");
    }

    const response = await fetch(`${apiUrl}/blogs/published?${params.toString()}`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!response.ok) throw new Error("Failed to fetch blogs");
    const data = await response.json();

    const formattedBlogs = (data.data || []).map(formatBlogData);
    const formattedTrending = (data.trending || []).map(formatBlogData);

    return {
      blogs: formattedBlogs,
      pagination: data.pagination || { page: 1, limit: 9, total: 0, pages: 1 },
      trending: formattedTrending,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      blogs: [],
      pagination: { page: 1, limit: 9, total: 0, pages: 1 },
      trending: [],
    };
  }
}

// Server-side categories fetch
async function fetchCategories() {
  try {
    const response = await fetch(`${apiUrl}/blog-categories/with-count`, {
      next: { revalidate: 3600 }, // ISR: Revalidate every hour
    });

    if (!response.ok) throw new Error("Failed to fetch categories");
    const data = await response.json();

    return data.success ? (data.data || []) : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Main Server Component
export default async function BlogsPage({ searchParams }: PageProps) {
  // ✅ AWAIT the searchParams Promise
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const category = params?.category || "all";
  const sort = params?.sort || "latest";
  const search = params?.search || "";

  // Fetch all data in parallel
  const [blogsData, categoriesData] = await Promise.all([
    fetchBlogs(page, category, sort, search),
    fetchCategories(),
  ]);

  const initialData = {
    blogs: blogsData.blogs,
    categories: categoriesData,
    trending: blogsData.trending,
    pagination: blogsData.pagination,
    currentFilters: {
      category,
      sort,
      search,
      page,
    },
  };

  return (
    <Suspense fallback={<BlogSkeleton />}>
      <Blog initialData={initialData} />
    </Suspense>
  );
}