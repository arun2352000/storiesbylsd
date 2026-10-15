export default async function handler(req, res) {
  const AALY_BASE_URL = 'https://api.aaly.io/arunachalam_organization/lsd_portfolio';

  let projects = [];
  try {
    const response = await fetch(`${AALY_BASE_URL}/portfolio_items/public`);
    if (response.ok) {
      const data = await response.json();
      projects = Array.isArray(data.items) ? data.items : [];
    }
  } catch (err) {
    console.error('Failed to fetch projects for dynamic sitemap:', err);
  }

  const staticUrls = [
    { loc: 'https://www.storiesbylsd.com/', changefreq: 'weekly', priority: '1.0' },
    { loc: 'https://www.storiesbylsd.com/photography', changefreq: 'weekly', priority: '0.9' },
    { loc: 'https://www.storiesbylsd.com/wedding-films', changefreq: 'weekly', priority: '0.9' },
    { loc: 'https://www.storiesbylsd.com/about-us', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://www.storiesbylsd.com/contact-us', changefreq: 'monthly', priority: '0.8' }
  ];

  const projectUrls = projects.map((p) => {
    const pid = p.id || p._id;
    let lastmod = undefined;
    if (p.updatedAt) {
      try {
        lastmod = new Date(p.updatedAt).toISOString().split('T')[0];
      } catch {}
    } else if (p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
      lastmod = p.date;
    }

    return {
      loc: `https://www.storiesbylsd.com/project/${pid}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod
    };
  });

  const allUrls = [...staticUrls, ...projectUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
