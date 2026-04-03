import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getExcerpt } from "@/utils/formatters";
import OptimizedImage from "../common/OptimizedImage";
interface CategorySectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    posts: any[];
    blogCount: number;
    borderColor?: string;
    textColor?: string;
  };
}

const CategorySection = ({ category }: CategorySectionProps) => {
  return (
    <div className="relative group h-full">
      <div
        className={`bg-sky-50/50 rounded-3xl p-6 border ${category.borderColor || "border-gray-200"} hover:shadow-2xl transition-all duration-500 h-full`}
      >
        <div className="mb-8 pt-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {category.name}
          </h3>
          <p className="text-gray-600 text-sm">
            {category.description || `Latest ${category.name} articles`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {category.posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer block"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                    <OptimizedImage
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {post.excerpt || getExcerpt(post.description || "", 20)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {category.posts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href={`/category/${category.slug}`}
              className={`block w-full text-center py-3 font-semibold rounded-xl ${category.textColor || "text-blue-600"} border ${category.borderColor || "border-blue-200"} hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-center gap-2">
                Explore All {category.name}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
