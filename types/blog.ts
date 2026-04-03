export interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  description: string;
  slug: string;
  imageUrl?: string;
  createdAt: string;
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

export interface RelatedPost {
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

export interface Category {
  _id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface FeaturedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
}
