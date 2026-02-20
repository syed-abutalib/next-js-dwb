import { MetadataRoute } from 'next';
import axios from 'axios';
import { apiUrl } from '@/components/common/Config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://dailyworldblog.com';

    // Static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about-us`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact-us`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
    ];

    try {
        // Fetch all published blogs for dynamic routes
        const response = await axios.get(`${apiUrl}/blogs/published?limit=1000`);
        const blogs = response.data.data;

        const blogRoutes = blogs.map((blog: any) => ({
            url: `${baseUrl}/blogs/${blog.slug}`,
            lastModified: new Date(blog.updatedAt || blog.createdAt),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        // Fetch categories
        const categoriesResponse = await axios.get(`${apiUrl}/blog-categories`);
        const categories = categoriesResponse.data.data;

        const categoryRoutes = categories.map((category: any) => ({
            url: `${baseUrl}/category/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        return [...staticRoutes, ...blogRoutes, ...categoryRoutes];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticRoutes;
    }
}