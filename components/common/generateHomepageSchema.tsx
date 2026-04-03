// app/page.tsx - Add this to your homepage component

export function generateHomepageSchema() {
    const siteUrl = "https://dailyworldblog.com";

    // 1. WebSite Schema
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Daily World Blog",
        url: siteUrl,
        description: "Daily World Blog posts daily on business, tech, games and consulting. Explore trending topics, guides and ideas that inspire more.",
        inLanguage: "en-US",
        potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}/blogs?search={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };

    // 2. Organization Schema
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Daily World Blog",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: "Daily World Blog - Your trusted source for daily insights, expert opinions, and trending stories from around the world.",
    };

    // 3. BreadcrumbList Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
            },
        ],
    };

    return [websiteSchema, organizationSchema, breadcrumbSchema];
}