// app/api/blogs/category/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/components/common/Config";
import { formatDate, calculateReadTime, getExcerpt } from "@/utils/formatters";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const response = await fetch(
      `${apiUrl}/blogs/published?${searchParams.toString()}`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const data = await response.json();

    // Format data
    const formatBlogData = (blog: any) => ({
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
      imageUrl:
        blog.imageUrl ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
      category: blog.category?.name || "Uncategorized",
      categorySlug: blog.category?.slug,
      isFeatured: blog.isFeatured || false,
      isHot: blog.isHot || false,
      isPopular: blog.isPopular || false,
    });

    const formattedBlogs = (data.data || []).map(formatBlogData);
    const formattedTrending = (data.trending || []).map(formatBlogData);

    // Get popular blogs
    const popular = [...(data.data || [])]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3)
      .map(formatBlogData);

    return NextResponse.json({
      blogs: formattedBlogs,
      pagination: data.pagination || { page: 1, limit: 9, total: 0, pages: 1 },
      trending: formattedTrending.slice(0, 5),
      popular,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}
