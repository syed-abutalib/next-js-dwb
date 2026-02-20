import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import axios from "axios";
import CategoryClient from "@/components/pages/Category";
import { apiUrl } from "@/components/common/Config";

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

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata dynamically based on the category
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { slug } = await params;

    // Fetch category data
    const response = await axios.get(`${apiUrl}/blog-categories/${slug}`);

    if (!response.data.success) {
      return {
        title: "Category Not Found | Daily World Blog",
        description: "The requested category could not be found.",
      };
    }

    const category: Category = response.data.data;

    // Construct meta title
    const metaTitle = category.metaTitle ||
      `${category.name} Articles & Insights | Daily World Blog`;

    // Construct meta description
    const metaDescription = category.metaDescription ||
      category.description ||
      `Explore our collection of ${category.name} articles. Discover expert insights, tips, trends, and in-depth guides about ${category.name}.`;

    // Category image for OG
    const ogImage = category.imageUrl || ``;

    // Get parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `https://dailyworldblog.com/category/${slug}`,
        type: "website",
        siteName: "Daily World Blog",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${category.name} Category`,
          },
          ...previousImages,
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: [ogImage],
        creator: "@dailyworldblog",
        site: "@dailyworldblog",
      },
      alternates: {
        canonical: `https://dailyworldblog.com/category/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
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
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Category | Daily World Blog",
      description: "Explore articles by category on Daily World Blog.",
    };
  }
}

// Generate static paths for all categories (optional - for SSG)
export async function generateStaticParams() {
  try {
    const response = await axios.get(`${apiUrl}/blog-categories`);

    if (!response.data.success) {
      return [];
    }

    return response.data.data.map((category: Category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Main page component
export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    // Fetch category data to validate existence
    const response = await axios.get(`${apiUrl}/blog-categories/${slug}`);

    if (!response.data.success) {
      notFound();
    }

    // Pass slug to client component
    return <CategoryClient slug={slug} />;
  } catch (error) {
    notFound();
  }
}