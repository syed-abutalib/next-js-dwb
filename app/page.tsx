import { apiUrl } from "@/components/common/Config";
import { generateHomepageSchema } from "@/components/common/generateHomepageSchema";
import { Blog, Category, FormattedBlog } from "@/types/homeType";
import { formatBlogData } from "@/utils/function";
import { CATEGORY_CONFIG } from "@/utils/constants";
import HeroSection from "@/components/home/HeroSection";
import LatestPostsSection from "@/components/home/LatestPostsSection";
import PopularPostsSection from "@/components/home/PopularPostsSection";
import CategorySection from "@/components/home/CategorySection";
import { Metadata } from "next";

// Force dynamic rendering to ensure fresh data and server-side HTML
export const dynamic = "force-dynamic";
export const revalidate = 30;

async function fetchBlogs() {
  try {
    const response = await fetch(`${apiUrl}/blogs/published?limit=20`, {
      next: { revalidate: 3600 },
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const data = await response.json();

    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(`${apiUrl}/blog-categories?limit=3`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();

    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function fetchCategoryPosts(categoryId: string, limit: number = 3) {
  try {
    const response = await fetch(
      `${apiUrl}/blogs/published?category=${categoryId}&limit=${limit}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) throw new Error("Failed to fetch category posts");
    const data = await response.json();
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error("Error fetching category posts:", error);
    return [];
  }
}

async function getHomeData() {
  try {
    const [blogsData, categoriesData] = await Promise.all([
      fetchBlogs(),
      fetchCategories(),
    ]);

    const blogs: Blog[] = blogsData;
    const categories: Category[] = categoriesData;

    const formattedBlogs = blogs
      .map(formatBlogData)
      .filter((blog) => blog !== null);

    // Server-side calculations
    const featuredPosts = formattedBlogs
      .filter((blog) => blog.isFeatured)
      .slice(0, 3);

    const trendingPosts = [...formattedBlogs]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8);

    const latestPosts = [...formattedBlogs]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 8);

    const popularPosts = [...formattedBlogs]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8);

    // Fetch posts for top 3 categories
    const topCategories = categories.slice(0, 3);
    const categoryPostsMap: Record<string, FormattedBlog[]> = {};

    if (topCategories.length > 0) {
      const categoryPostsPromises = topCategories.map(async (category) => {
        const posts = await fetchCategoryPosts(category._id, 3);
        categoryPostsMap[category.slug] = posts
          .map(formatBlogData)
          .filter((post) => post !== null);
      });

      await Promise.all(categoryPostsPromises);
    }

    const categoryConfig = CATEGORY_CONFIG as any[];
    const categorySections = topCategories.map(
      (category: Category, index: number) => {
        const categoryPostsData = categoryPostsMap[category.slug] || [];
        const config = categoryConfig[index] || categoryConfig[0];

        return {
          id: category._id,
          name: category.name,
          slug: category.slug,
          description:
            category.description || `Latest ${category.name} articles`,
          posts: categoryPostsData,
          blogCount: category.blogCount || categoryPostsData.length,
          ...config,
        };
      },
    );

    return {
      featuredPosts,
      trendingPosts,
      latestPosts,
      popularPosts,
      categorySections,
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      featuredPosts: [],
      trendingPosts: [],
      latestPosts: [],
      popularPosts: [],
      categorySections: [],
    };
  }
}
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};
export default async function HomePage() {
  const {
    featuredPosts,
    trendingPosts,
    latestPosts,
    popularPosts,
    categorySections,
  } = await getHomeData();

  const hasAnyPosts =
    featuredPosts.length > 0 ||
    trendingPosts.length > 0 ||
    latestPosts.length > 0;

  // Generate schemas
  const schemas = generateHomepageSchema();

  if (!hasAnyPosts) {
    return (
      <>
        {/* Schema Scripts */}
        {schemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No posts available</h1>
            <p className="text-gray-600 mt-2">
              Check back later for new content.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Schema Scripts */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <>
        <HeroSection
          featuredPosts={featuredPosts}
          trendingPosts={trendingPosts}
          latestPosts={latestPosts}
        />

        {/* Category Sections */}
        {categorySections.length > 0 &&
          categorySections.some((section) => section.posts.length > 0) && (
            <section className="py-12 md:py-16 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-415">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-3">
                    <h1 className="text-xs font-medium text-blue-600">
                      Daily World Blog Expert Insights on Business,
                      Technology, Gaming, Finance & More
                    </h1>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Explore by Category
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Your trusted source for daily insights on{" "}
                    <strong>Business</strong>,<strong> Technology</strong>,{" "}
                    <strong>Gaming</strong>, and expert
                    <strong> Consulting</strong> advice.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {categorySections.map((category) => (
                    <CategorySection key={category.id} category={category} />
                  ))}
                </div>
              </div>
            </section>
          )}

        {/* Popular Posts Section */}
        {popularPosts.length > 0 && (
          <PopularPostsSection popularPosts={popularPosts} />
        )}

        {/* Latest Articles Section */}
        {latestPosts.length > 0 && (
          <LatestPostsSection latestPosts={latestPosts} />
        )}
      </>
    </>
  );
}
