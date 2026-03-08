// components/home/HomeSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <main className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto max-w-[1660px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Featured Skeleton */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-8 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-[600px] md:h-[700px] w-full rounded-3xl" />
            </div>

            {/* Trending Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1660px]">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-32 mx-auto mb-4" />
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Skeleton */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1660px]">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
