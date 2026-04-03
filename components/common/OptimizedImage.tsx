// components/common/OptimizedImage.tsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc,
  width,
  height,
  fill = true,
  priority = false,
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const fallbackImage =
    fallbackSrc ||
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={error ? fallbackImage : imgSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`object-cover ${className}`}
        onError={() => setError(true)}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
      />
    </div>
  );
};

export default OptimizedImage;
