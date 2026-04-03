// app/blogs/[slug]/page.tsx
export const revalidate = 60;
export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiUrl } from "@/components/common/Config";
import { unstable_noStore as noStore } from "next/cache";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { ShareButtonHero } from "@/components/blog/ShareButtonHero";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import BlogFAQ from "../BlogFAQ";

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

interface FAQItem {
  question: string;
  answer: string;
  order: number;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  noStore();
  try {
    const { slug } = await params;
    const response = await fetch(`${apiUrl}/blogs/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 0 },
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
        type: "article",
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

function processHTMLContent(html: string): string {
  if (!html) return "";

  // Add lazy loading to images AND add IDs to headings for table of contents
  let processed = html.replace(/<img /g, '<img loading="lazy" ');

  // Add IDs to headings for table of contents
  processed = processed.replace(
    /<h([2-3])[^>]*>(.*?)<\/h\1>/gi,
    (match, level, content) => {
      const cleanText = content.replace(/<[^>]+>/g, "");
      const id = cleanText
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);
      return `<h${level} id="${id}">${content}</h${level}>`;
    },
  );

  return processed;
}

// ✅ NEW: Fetch FAQ data server-side
async function fetchFAQ(slug: string): Promise<FAQItem[]> {
  try {
    const response = await fetch(`${apiUrl}/blogs/faq/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const data = await response.json();

    if (data.success && data.data?.questions) {
      // Sort by order
      return [...data.data.questions].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return [];
  }
}

// Fetch all data on the server
async function getBlogData(slug: string) {
  noStore();
  try {
    // Fetch main post with ISR
    const postResponse = await fetch(`${apiUrl}/blogs/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      next: {
        revalidate: 0,
        tags: [`blog-${slug}`],
      },
    });

    const postData = await postResponse.json();
    if (!postData.success || !postData.data) {
      return null;
    }

    const post = postData.data;

    // ✅ Fetch FAQ data
    const faqItems = await fetchFAQ(slug);

    // Fetch categories, featured posts, and related posts in parallel
    let categories: Category[] = [];
    let featuredPosts: FeaturedPost[] = [];
    let relatedPosts: RelatedPost[] = [];

    const fetchPromises = [];

    // Categories fetch
    const categoriesPromise = fetch(`${apiUrl}/blog-categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 0 },
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
          "Cache-Control": "no-cache",
        },
        next: { revalidate: 0 },
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
      faqItems, // ✅ Include FAQ items in return
    };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return null;
  }
}

// SVG Icons
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

// ✅ Generate FAQPage Schema
function generateFAQSchema(faqItems: FAQItem[]) {
  if (faqItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Main Server Component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  noStore();

  const { slug } = await params;
  const data = await getBlogData(slug);

  if (!data || !data.post) {
    notFound();
  }

  const { post, categories, featuredPosts, relatedPosts, faqItems } = data;

  // Process HTML with heading IDs for table of contents
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

  // ✅ Generate FAQ schema
  const faqSchema = generateFAQSchema(faqItems);

  return (
    <>
      {/* Reading Progress Bar - Client Component */}
      <ReadingProgress />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ✅ FAQPage Structured Data - Added here! */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

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

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />

      <div>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <div>
              {/* Back Button */}
              <Link
                href="/blogs"
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors group"
                aria-label="Back to all articles"
                prefetch
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
                  prefetch
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

              {/* Meta Info with Read Time Badge */}
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
                          <span>
                            {post.readTime ||
                              Math.ceil(
                                post.description?.split(/\s+/).length / 200,
                              ) ||
                              5}{" "}
                            min read
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Button Hero - Client Component */}
                <ShareButtonHero
                  title={post.title}
                  excerpt={
                    post.excerpt || post.description?.substring(0, 160) || ""
                  }
                  slug={post.slug}
                />
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
                {/* Featured Image */}
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

                {/* Article Content */}
                <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-img:rounded-2xl prose-img:shadow-lg">
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
                                prefetch
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
                                prefetch
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
                              prefetch
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
                          prefetch
                        >
                          {post.category.name}
                          <ExternalLinkIcon className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Sharing - Client Component */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Share this article
                  </h3>
                  <ShareButtons
                    title={post.title}
                    excerpt={
                      post.excerpt || post.description?.substring(0, 160) || ""
                    }
                    slug={post.slug}
                  />
                </div>

                {/* ✅ FAQ Section - Pass faqItems as prop */}
                <BlogFAQ slug={slug} initialFaqs={faqItems} />
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
                            prefetch
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
                                    loading="lazy"
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
                  <TableOfContents content={processedDescription} />
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
                        {categories.slice(0, 8).map((category) => (
                          <Link
                            key={category._id}
                            href={`/category/${category.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 text-sm rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300"
                            aria-label={`View all posts in ${category.name} category`}
                            prefetch
                          >
                            <span>{category.name}</span>
                          </Link>
                        ))}
                      </nav>
                    </section>
                  )}
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
                <div className="sm:flex items-center justify-between mb-12 ">
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
                    className="inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 mt-3"
                    aria-label="View all blog posts"
                    prefetch
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
                      prefetch
                    >
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

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <time
                            dateTime={formatDateForSchema(relatedPost.date)}
                            className="text-xs text-gray-500 font-medium"
                          >
                            {relatedPost.date}
                          </time>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {relatedPost.readTime || 5} min read
                          </span>
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
