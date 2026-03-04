import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiUrl } from "@/components/common/Config";
import Newsletter from "@/components/common/Newsletter";
export const revalidate = 60;
// Types
interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  description: string;
  slug: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  readTime?: number;
  views?: number;
  likes?: number;
  likedBy?: string[];
  isFeatured?: boolean;
  isHot?: boolean;
  isPopular?: boolean;
  tags?: string[];
  keywords?: string[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  user?: {
    _id: string;
    name: string;
    displayName?: string;
  };
}

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  date: string;
  slug: string;
  imageUrl: string;
  category: string;
  views?: number;
  readTime?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  count?: number;
}

interface FeaturedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await fetch(`${apiUrl}/blogs/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    const data = await response.json();

    if (!data.success) {
      return {
        title: "Blog Post Not Found",
        description: "The requested blog post could not be found.",
        robots: "noindex, nofollow",
      };
    }

    const post = data.data;
    const publishedTime = post.createdAt;
    const modifiedTime = post.updatedAt || post.createdAt;
    const authors = "Daily World Blog";
    const keywords = post.keywords?.join(", ") || post.tags?.join(", ") || "";

    // Generate JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt || post.description?.substring(0, 160),
      image: post.imageUrl || "/logo.png",
      datePublished: publishedTime,
      dateModified: modifiedTime,
      author: {
        "@type": "Person",
        name: authors,
      },
      publisher: {
        "@type": "Organization",
        name: "Daily World Blog",
        logo: {
          "@type": "ImageObject",
          url: "https://dailyworldblog.com/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://dailyworldblog.com/blogs/${post.slug}`,
      },
      keywords: keywords,
      articleSection: post.category?.name || "Uncategorized",
    };

    return {
      title: post.title,
      description: post.excerpt || post.description?.substring(0, 160),
      keywords: keywords,
      authors: { name: authors },
      publisher: "Daily World Blog",
      robots:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      alternates: {
        canonical: `https://dailyworldblog.com/blogs/${post.slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.excerpt || post.description?.substring(0, 160),
        type: "website",
        url: `https://dailyworldblog.com/blogs/${post.slug}`,
        publishedTime: publishedTime,
        modifiedTime: modifiedTime,
        authors: [authors],
        tags: post.tags || [],
        images: [
          {
            url: post.imageUrl || "/logo.png",
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        siteName: "Daily World Blog",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt || post.description?.substring(0, 160),
        images: [post.imageUrl || "/logo.png"],
        creator: "@dailyworldblog",
        site: "@dailyworldblog",
      },
      other: {
        "og:locale": "en_US",
        "article:published_time": publishedTime,
        "article:modified_time": modifiedTime,
        "article:section": post.category?.name || "Uncategorized",
        "article:tag": post.tags?.join(", ") || "",
      },
      verification: {
        google: "io5RXL-XeeOBEDERvvO0K547E0GLnTgcrD5TBgrhUOw",
      },
    };
  } catch (error) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
      robots: "noindex, nofollow",
    };
  }
}

// Generate static paths at build time (for better performance)
// export async function generateStaticParams() {
//   try {
//     const response = await fetch(`${apiUrl}/blogs/published?limit=100000`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       next: { revalidate: 3600 }, // Revalidate every hour
//     });

//     const data = await response.json();
//     const posts = data.data || [];

//     return posts.map((post: any) => ({
//       slug: post.slug,
//     }));
//   } catch (error) {
//     return [];
//   }
// }

// Helper functions
function getExcerpt(text: string, wordCount = 30): string {
  if (!text) return "";
  const cleanText = text.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
  const words = cleanText.split(" ");
  if (words.length <= wordCount) return cleanText;
  return words.slice(0, wordCount).join(" ") + "...";
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateForSchema(dateString?: string): string {
  if (!dateString) return new Date().toISOString();
  return new Date(dateString).toISOString();
}

// CRITICAL: Preserve ALL HTML content including links
function processHTMLContent(html: string): string {
  if (!html) return "";

  // Add lazy loading to images and add alt text if missing
  return html.replace(/<img /g, '<img loading="lazy" ');
}

// Fetch all data on the server
async function getBlogData(slug: string) {
  try {
    // Fetch main post with ISR
    const postResponse = await fetch(`${apiUrl}/blogs/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600, // Revalidate every hour
        tags: [`blog-${slug}`], // For on-demand revalidation
      },
    });

    const postData = await postResponse.json();

    if (!postData.success) {
      return null;
    }

    const post = postData.data;

    // Fetch categories in parallel
    let categories: Category[] = [];
    let featuredPosts: FeaturedPost[] = [];
    let relatedPosts: RelatedPost[] = [];

    const fetchPromises = [];

    // Categories fetch
    const categoriesPromise = fetch(`${apiUrl}/blog-categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 86400 }, // Revalidate daily
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          categories = data.data || [];
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));

    fetchPromises.push(categoriesPromise);

    // Featured posts fetch
    const featuredPromise = fetch(
      `${apiUrl}/blogs/published?featured=true&limit=4&exclude=${post._id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          featuredPosts = (data.data || []).map((blog: any) => ({
            id: blog._id,
            title: blog.title,
            excerpt: blog.excerpt || getExcerpt(blog.description, 20),
            slug: blog.slug,
            imageUrl:
              blog.imageUrl ||
              "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
            category: blog.category?.name || "Uncategorized",
          }));
        }
      })
      .catch((error) => console.error("Error fetching featured posts:", error));

    fetchPromises.push(featuredPromise);

    // Format related posts
    if (postData.related) {
      relatedPosts = (postData.related || []).map((blog: any) => ({
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt || getExcerpt(blog.description, 25),
        date: formatDate(blog.createdAt),
        slug: blog.slug,
        imageUrl:
          blog.imageUrl ||
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
        category: blog.category?.name || post.category?.name || "Uncategorized",
        views: blog.views || 0,
        readTime: blog.readTime || 1,
      }));
    }

    // Wait for all parallel fetches
    await Promise.all(fetchPromises);

    return {
      post,
      categories,
      featuredPosts,
      relatedPosts,
    };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return null;
  }
}

// SVG Icons (server components can't use lucide-react)
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const HashIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" />
    <line x1="16" x2="14" y1="3" y2="21" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const FlameIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2H2v10l9.29 9.29a2 2 0 0 0 2.83 0l7-7a2 2 0 0 0 0-2.83L12 2z" />
    <circle cx="7" cy="7" r="1" />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Server Component with ORIGINAL UI
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getBlogData(slug);

  if (!data || !data.post) {
    notFound();
  }

  const { post, categories, featuredPosts, relatedPosts } = data;

  // CRITICAL: Process HTML WITHOUT removing anything
  const processedDescription = processHTMLContent(post.description);

  const featuredImage =
    post.imageUrl ||
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop";

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.description?.substring(0, 160),
    image: featuredImage,
    datePublished: formatDateForSchema(post.createdAt),
    dateModified: formatDateForSchema(post.updatedAt || post.createdAt),
    author: {
      "@type": "Person",
      name: "Daily World Blog",
    },
    publisher: {
      "@type": "Organization",
      name: "Daily World Blog",
      logo: {
        "@type": "ImageObject",
        url: "https://dailyworldblog.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://dailyworldblog.com/blogs/${post.slug}`,
    },
    keywords: post.keywords?.join(", ") || post.tags?.join(", ") || "",
    articleSection: post.category?.name || "Uncategorized",
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://dailyworldblog.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blogs",
                item: "https://dailyworldblog.com/blogs",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.category?.name || "Uncategorized",
                item: post.category
                  ? `https://dailyworldblog.com/category/${post.category.slug}`
                  : "https://dailyworldblog.com/blogs",
              },
              {
                "@type": "ListItem",
                position: 4,
                name: post.title,
                item: `https://dailyworldblog.com/blogs/${post.slug}`,
              },
            ],
          }),
        }}
      />

      <div>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Hero Section - ORIGINAL UI */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <div>
              {/* Back Button */}
              <Link
                href="/blogs"
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors group"
                aria-label="Back to all articles"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Articles</span>
              </Link>

              {/* Category Badge */}
              <div className="mb-6">
                <Link
                  href={
                    post.category ? `/category/${post.category.slug}` : "/blogs"
                  }
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  aria-label={`View all posts in ${post.category?.name || "Uncategorized"} category`}
                >
                  <HashIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {post.category?.name || "Uncategorized"}
                  </span>
                </Link>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-white/80 mb-8 max-w-3xl">
                {post.excerpt || getExcerpt(post.description, 40)}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        <time
                          dateTime={formatDateForSchema(post.createdAt)}
                          className="flex items-center space-x-1"
                        >
                          <CalendarIcon className="w-3 h-3" />
                          <span>{formatDate(post.createdAt)}</span>
                        </time>
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{post.readTime || 5} min read</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Main Article Content */}
              <main id="main-content" className="lg:col-span-8">
                {/* Featured Image with optimized loading */}
                <div className="relative overflow-hidden rounded-xl mb-12 shadow-2xl group">
                  <div className="relative w-full h-96 max-h-[600px]">
                    <Image
                      src={featuredImage}
                      alt={`Featured image for ${post.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                      className="w-full h-auto max-h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                      quality={85}
                    />
                  </div>
                </div>

                {/* Article Content - LINKS PRESERVED */}
                <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-a:font-medium prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-img:rounded-2xl prose-img:shadow-lg">
                  {processedDescription && (
                    <div
                      dangerouslySetInnerHTML={{ __html: processedDescription }}
                    />
                  )}
                </article>

                {/* Stats & Tags */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* Featured Badges */}
                    <div className="flex items-center space-x-2">
                      {post.isFeatured && (
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold rounded-full">
                          <SparklesIcon className="w-3 h-3 inline mr-1" />
                          Featured
                        </span>
                      )}
                      {post.isHot && (
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-bold rounded-full">
                          <FlameIcon className="w-3 h-3 inline mr-1" />
                          Hot
                        </span>
                      )}
                      {post.isPopular && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                          <TrendingUpIcon className="w-3 h-3 inline mr-1" />
                          Popular
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags Section */}
                  {(post.tags?.length > 0 || post.keywords?.length > 0) && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <TagIcon className="w-5 h-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-700">Tags</h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.tags &&
                          post.tags
                            .filter((tag) => tag && tag.trim())
                            .map((tag, index: number) => (
                              <Link
                                key={`tag-${index}`}
                                href={`/tag/${encodeURIComponent(tag.trim().toLowerCase().replace(/\s+/g, "-"))}`}
                                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-md"
                                aria-label={`View all posts tagged with ${tag}`}
                              >
                                #{tag.trim()}
                              </Link>
                            ))}

                        {(!post.tags || post.tags.length === 0) &&
                          post.keywords &&
                          post.keywords
                            .filter((keyword) => keyword && keyword.trim())
                            .map((keyword, index: number) => (
                              <Link
                                key={`keyword-${index}`}
                                href={`/tag/${encodeURIComponent(keyword.trim().toLowerCase().replace(/\s+/g, "-"))}`}
                                className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-full text-sm font-medium hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-md"
                                aria-label={`View all posts tagged with ${keyword}`}
                              >
                                #{keyword.trim()}
                              </Link>
                            ))}

                        {(!post.tags || post.tags.length === 0) &&
                          (!post.keywords || post.keywords.length === 0) &&
                          post.category && (
                            <Link
                              href={`/category/${post.category.slug}`}
                              className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-sm font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:shadow-md"
                              aria-label={`View all posts in ${post.category.name} category`}
                            >
                              #{post.category.name}
                            </Link>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Category Link */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <HashIcon className="w-5 h-5 text-gray-400" />
                      <h2 className="font-semibold text-gray-700">Category</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.category && (
                        <Link
                          href={`/category/${post.category.slug}`}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 hover:shadow-md flex items-center gap-2"
                          aria-label={`View all posts in ${post.category.name} category`}
                        >
                          {post.category.name}
                          <ExternalLinkIcon className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Sharing */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Share this article
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://dailyworldblog.com/blogs/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=https://dailyworldblog.com/blogs/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=https://dailyworldblog.com/blogs/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </main>

              {/* Sidebar */}
              <aside className="lg:col-span-4 mt-12 lg:mt-0 lg:pl-8">
                <div className="sticky top-24 space-y-8">
                  {/* Featured Posts */}
                  {featuredPosts.length > 0 && (
                    <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                          <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Featured Posts
                          </h2>
                          <p className="text-sm text-gray-600">
                            Editor's picks
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {featuredPosts.map((featuredPost) => (
                          <Link
                            key={featuredPost.id}
                            href={`/blogs/${featuredPost.slug}`}
                            className="group block"
                            aria-label={`Read ${featuredPost.title}`}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                  <Image
                                    src={featuredPost.imageUrl}
                                    alt=""
                                    fill
                                    sizes="48px"
                                    className="object-cover group-hover:scale-110 transition-transform duration-300 rounded-lg"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                                  {featuredPost.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {featuredPost.excerpt}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Popular Categories */}
                  {categories.length > 0 && (
                    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 flex items-center justify-center">
                          <HashIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Categories
                        </h2>
                      </div>
                      <nav className="space-y-2" aria-label="Blog categories">
                        {categories.slice(0, 6).map((category) => (
                          <Link
                            key={category._id}
                            href={`/category/${category.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 text-sm rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300"
                            aria-label={`View all posts in ${category.name} category`}
                          >
                            <span>{category.name}</span>
                          </Link>
                        ))}
                      </nav>
                    </section>
                  )}

                  {/* Newsletter - This is a client component but will work fine */}
                  <Newsletter />
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section
            className="bg-gradient-to-b from-white to-gray-50 py-16"
            aria-label="Related articles"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div>
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Related Articles
                    </h2>
                    <p className="text-gray-600">
                      More articles you might enjoy
                    </p>
                  </div>
                  <Link
                    href="/blogs"
                    className="inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700"
                    aria-label="View all blog posts"
                  >
                    <span>View All</span>
                    <ChevronRightIcon className="w-5 h-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blogs/${relatedPost.slug}`}
                      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
                      aria-label={`Read ${relatedPost.title}`}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={relatedPost.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-blue-600/90 text-white">
                            {relatedPost.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <time
                            dateTime={formatDateForSchema(relatedPost.date)}
                            className="text-xs text-gray-500 font-medium"
                          >
                            {relatedPost.date}
                          </time>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                          {relatedPost.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>

                        <div className="flex items-center text-blue-600 font-medium text-sm">
                          Read More →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
