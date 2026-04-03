// app/api/blogs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/components/common/Config";

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

    // Format data if needed
    const formattedBlogs = (data.data || []).map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      excerpt: blog.excerpt || "",
      description: blog.description,
      author: blog.user?.name || "Daily World Blog",
      date: new Date(blog.createdAt).toLocaleDateString(),
      slug: blog.slug,
      readTime: `${Math.ceil(blog.description?.split(/\s+/).length / 200)} min read`,
      views: blog.views || 0,
      likes: blog.likes || 0,
      imageUrl:
        blog.imageUrl ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
      category: blog.category?.name || "Uncategorized",
      isFeatured: blog.isFeatured || false,
      isHot: blog.isHot || false,
      isPopular: blog.isPopular || false,
    }));

    return NextResponse.json({
      blogs: formattedBlogs,
      pagination: data.pagination || { page: 1, limit: 9, total: 0, pages: 1 },
      trending: (data.trending || []).map((blog: any) => ({
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
      })),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}
