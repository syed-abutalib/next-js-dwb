// components/blog/BlogSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function BlogSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30">
      {/* Hero Skeleton */}
      <section className="relative py-16 md:py-20 lg:py-24">
        <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Skeleton className="h-10 w-48 mx-auto mb-6" />
            <Skeleton className="h-16 w-96 mx-auto mb-4" />
            <Skeleton className="h-12 w-2/3 mx-auto mb-8" />
            <Skeleton className="h-14 w-full max-w-2xl mx-auto rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-3 mb-12 lg:mb-0">
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[...Array(5)].map((_, j) => (
                          <Skeleton
                            key={j}
                            className="h-10 w-full rounded-xl"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </aside>

            {/* Main Grid Skeleton */}
            <main className="lg:col-span-9">
              <div className="mb-8 flex justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <Skeleton className="h-48 w-full rounded-t-2xl" />
                    <CardContent className="p-5">
                      <div className="flex justify-between mb-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-full mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between pt-4 border-t">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-20 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>
    </main>
  );
}
