// sitemap-generator.js

import fs from 'fs'; // This is the only line that changed

const websiteUrl = 'https://www.manindra.in';

// Add all the routes/pages you want in your sitemap here
const pages = [
  '/'
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(page => {
      const path = page === '/' ? '' : page;
      return `
    <url>
        <loc>${`${websiteUrl}${path}`}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>${page === '/' ? '1.0' : '0.8'}</priority>
    </url>
      `;
    })
    .join('')}
</urlset>`;

fs.writeFileSync('public/sitemap.xml', sitemap);

console.log('✅ sitemap.xml generated successfully!');