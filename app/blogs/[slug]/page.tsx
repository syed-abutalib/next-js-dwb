// app/blogs/[slug]/page.tsx (Server Component for metadata)

import { Metadata } from 'next';
import axios from 'axios';
import { apiUrl } from '@/components/common/Config';
import SinglePost from '@/components/pages/Detail';

// Generate metadata dynamically based on the blog post
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    try {
        const { slug } = await params;
        const response = await axios.get(`${apiUrl}/blogs/slug/${slug}`);
        const post = response.data.data;

        return {
            title: `${post.title} | Daily World Blog`,
            description: post.excerpt,
            alternates: {
                canonical: `https://dailyworldblog.com/blogs/${post.slug}`,
            },
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: 'article',
                publishedTime: post.createdAt,
                authors: ['Daily World Blog'],
                images: [
                    {
                        url: post.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
                        width: 1200,
                        height: 630,
                        alt: post.title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt,
                images: [post.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643'],
            },
        };
    } catch (error) {
        return {
            title: 'Blog Post | Daily World Blog',
            description: 'Read our latest blog articles',
        };
    }
}
export async function generateStaticParams() {
    try {
        const response = await axios.get(`${apiUrl}/blogs/published?limit=100`);
        const posts = response.data.data;

        return posts.map((post: any) => ({
            slug: post.slug,
        }));
    } catch (error) {
        return [];
    }
}
// Main page component - can be server or client component
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <SinglePost slug={slug} />;
}   