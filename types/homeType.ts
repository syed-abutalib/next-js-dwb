export interface Blog {
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
  user?: { _id: string; name: string };
  category?: { _id: string; name: string; slug: string };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  blogCount?: number;
}

export interface FormattedBlog {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  createdAt: string;
  slug: string;
  readTime: string;
  views: number;
  likes: number;
  imageUrl: string;
  category: string;
  categoryId?: string;
  categorySlug?: string;
  isFeatured: boolean;
  isHot: boolean;
  isPopular: boolean;
  description?: string;
}

export interface CategorySection extends Category {
  posts: FormattedBlog[];
  borderColor?: string;
  textColor?: string;
  bgColor?: string;
}

export interface HomeClientProps {
  initialData: {
    featuredPosts: FormattedBlog[];
    trendingPosts: FormattedBlog[];
    latestPosts: FormattedBlog[];
    popularPosts: FormattedBlog[];
    categories: Category[];
    categoryPosts: Record<string, FormattedBlog[]>;
  };
}
