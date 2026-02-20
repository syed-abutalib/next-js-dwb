"use client";
import React from "react";
export const LeftSwiperSkeleton = React.memo(() => (
  <div className="lg:col-span-2">
    <div className="relative h-[600px] md:h-[700px] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
  </div>
));

export const RightSwiperSkeleton = React.memo(() => (
  <div className="relative">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
    <div className="h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse" />
  </div>
));

export const CategorySkeleton = React.memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="bg-white rounded-2xl p-5 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((post) => (
            <div
              key={post}
              className="flex gap-3 py-3 border-t border-gray-100"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
));
