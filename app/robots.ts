import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/create/', '/profile', '/auth'],
      },
    ],
    sitemap: 'https://www.lorva.app/sitemap.xml',
    host: 'https://www.lorva.app',
  };
}
