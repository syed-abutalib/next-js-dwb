// app/category/[slug]/page.tsx (Server Component)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { apiUrl } from "@/components/common/Config";
import { formatDate, calculateReadTime, getExcerpt } from "@/utils/formatters";
import CategoryClient from "@/components/pages/Category";
import { CategorySkeleton } from "@/components/skeleton/CategorySkeleton";

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  blogCount?: number;
}

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
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    search?: string;
  }>;
}

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

// Server-side category fetch
async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(`${apiUrl}/blog-categories/${slug}`, {
      next: { revalidate: 3600 }, // ISR: Revalidate every hour
    });

    if (!response.ok) throw new Error("Failed to fetch category");
    const data = await response.json();

    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

// Server-side blogs fetch with filters
async function fetchBlogs(
  categoryId: string,
  page: number = 1,
  sort?: string,
  search?: string
): Promise<{ blogs: FormattedBlog[]; pagination: any; trending: FormattedBlog[]; popular: FormattedBlog[] }> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", "9");
    params.append("category", categoryId);

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    if (sort === "popular") {
      params.append("popular", "true");
    } else if (sort === "featured") {
      params.append("featured", "true");
    } else if (sort === "hot") {
      params.append("hot", "true");
    } else {
      params.append("sort", "latest");
    }

    const response = await fetch(`${apiUrl}/blogs/published?${params.toString()}`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!response.ok) throw new Error("Failed to fetch blogs");
    const data = await response.json();

    const formattedBlogs = (data.data || []).map(formatBlogData);
    const formattedTrending = (data.trending || []).map(formatBlogData);

    // Get popular blogs (top 3 by views)
    const popular = [...(data.data || [])]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3)
      .map(formatBlogData);

    return {
      blogs: formattedBlogs,
      pagination: data.pagination || { page: 1, limit: 9, total: 0, pages: 1 },
      trending: formattedTrending.slice(0, 5),
      popular,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      blogs: [],
      pagination: { page: 1, limit: 9, total: 0, pages: 1 },
      trending: [],
      popular: [],
    };
  }
}

// Server-side categories fetch for sidebar
async function fetchCategories(): Promise<Category[]> {
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

// Generate metadata dynamically
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found | Daily World Blog",
      description: "The requested category could not be found.",
    };
  }

  const metaTitle = category.metaTitle || `${category.name} Articles & Insights | Daily World Blog`;
  const metaDescription = category.metaDescription ||
    category.description ||
    `Explore our collection of ${category.name} articles. Discover expert insights, tips, trends, and in-depth guides about ${category.name}.`;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://dailyworldblog.com/category/${slug}`,
      type: "website",
      siteName: "Daily World Blog",
      images: category.imageUrl ? [
        {
          url: category.imageUrl,
          width: 1200,
          height: 630,
          alt: `${category.name} Category`,
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: category.imageUrl ? [category.imageUrl] : [],
      creator: "@dailyworldblog",
      site: "@dailyworldblog",
    },
    alternates: {
      canonical: `https://dailyworldblog.com/category/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: [
      category.name,
      `${category.name} blog`,
      `${category.name} articles`,
      `${category.name} tips`,
      `${category.name} guide`,
      "blog category",
      "daily world blog",
    ],
  };
}

// Generate static paths for all categories (SSG)
export async function generateStaticParams() {
  try {
    const response = await fetch(`${apiUrl}/blog-categories`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];
    const data = await response.json();

    return data.success ? data.data.map((category: Category) => ({
      slug: category.slug,
    })) : [];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Main Server Component
export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;

  // Parse search params
  const page = Number(search?.page) || 1;
  const sort = search?.sort || "latest";
  const searchQuery = search?.search || "";

  // Fetch category data
  const category = await fetchCategory(slug);

  if (!category) {
    notFound();
  }

  // Fetch all data in parallel
  const [blogsData, categoriesData] = await Promise.all([
    fetchBlogs(category._id, page, sort, searchQuery),
    fetchCategories(),
  ]);

  const initialData = {
    category,
    blogs: blogsData.blogs,
    categories: categoriesData,
    trending: blogsData.trending,
    popular: blogsData.popular,
    pagination: blogsData.pagination,
    currentFilters: {
      sort,
      search: searchQuery,
      page,
    },
  };

  return (
    <Suspense fallback={<CategorySkeleton categoryName={category.name} />}>
      <CategoryClient initialData={initialData} />
    </Suspense>
  );
}