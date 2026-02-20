import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/private/', '/profile/', '/my-blogs/', '/create-blog/', '/edit-blog/'],
        },
        sitemap: 'https://dailyworldblog.com/sitemap.xml',
        host: 'https://dailyworldblog.com',
    };
}