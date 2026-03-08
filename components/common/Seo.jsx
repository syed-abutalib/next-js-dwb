import { Helmet } from "react-helmet-async";

const Seo = ({
  title,
  description,
  url,
  image,
  type = "website",
  author,
  publishedTime,
  noIndex = false,
}) => {
  const siteName = "Daily World Blog";
  const siteUrl = "https://dailyworldblog.com";
  const seoUrl = url || siteUrl;
  const seoImage = image || `${siteUrl}/images/og-image.jpg`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />
      <meta name="author" content={author || siteName} />

      {/* Canonical */}
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Article specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={seoImage} />

      {/* Theme */}
      <meta name="theme-color" content="#ffffff" />
    </Helmet>
  );
};

export default Seo;
