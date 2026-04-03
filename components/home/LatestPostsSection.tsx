import React from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import BlogCard from "../common/BlogCard";
interface LatestPostsSectionProps {
  latestPosts: any[];
}

const LatestPostsSection = ({ latestPosts }: LatestPostsSectionProps) => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-415">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Latest{" "}
                  <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Stories
                  </span>
                </h2>
                <p className="text-gray-600 mt-1">
                  Fresh perspectives published daily
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/blogs"
              className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              View All
            </Link>
          </div>
        </div>

        {latestPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestPosts.map((post) => (
              <BlogCard
                key={post.id}
                id={post.id}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                slug={post.slug}
                readTime={post.readTime}
                imageUrl={post.imageUrl}
                category={post.category}
                views={post.views}
                likes={post.likes}
                isPopular={post.isPopular}
                isHot={post.isHot}
                isFeatured={post.isFeatured}
                variant="default"
                showBadge={true}
                showStats={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestPostsSection;
