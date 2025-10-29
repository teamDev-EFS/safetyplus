import express from "express";
import Product from "../models/Product.js";
import Post from "../models/Post.js";
import Album from "../models/Album.js";

const router = express.Router();

// Robots.txt
router.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.PUBLIC_WEB_URL || "https://safetyplus.co.in";
  const sitemapUrl = `${baseUrl}/api/meta/sitemap.xml`;

  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/

Sitemap: ${sitemapUrl}
`;

  res.type("text/plain");
  res.send(robots);
});

// Dynamic sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = process.env.PUBLIC_WEB_URL || "https://safetyplus.co.in";
    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages = [
      { url: "", priority: 1.0, changefreq: "daily" },
      { url: "/shop", priority: 0.9, changefreq: "daily" },
      { url: "/about", priority: 0.8, changefreq: "monthly" },
      { url: "/contact", priority: 0.8, changefreq: "monthly" },
      { url: "/team", priority: 0.7, changefreq: "weekly" },
      { url: "/documents", priority: 0.6, changefreq: "monthly" },
      { url: "/blog", priority: 0.8, changefreq: "daily" },
      { url: "/gallery", priority: 0.7, changefreq: "weekly" },
    ];

    // Products
    const products = await Product.find({ isActive: true })
      .select("slug _id updatedAt")
      .lean();
    const productUrls = products.map((p) => ({
      url: `/product/${p.slug || p._id}`,
      priority: 0.7,
      changefreq: "weekly",
      lastmod: p.updatedAt?.toISOString().split("T")[0] || today,
    }));

    // Blog posts
    const posts = await Post.find({ isPublished: true })
      .select("slug _id publishedAt updatedAt")
      .lean();
    const postUrls = posts.map((post) => ({
      url: `/blog/${post.slug || post._id}`,
      priority: 0.6,
      changefreq: "monthly",
      lastmod: post.updatedAt?.toISOString().split("T")[0] || today,
    }));

    // Albums
    const albums = await Album.find({ isPublished: true })
      .select("slug _id updatedAt")
      .lean();
    const albumUrls = albums.map((album) => ({
      url: `/gallery/${album.slug || album._id}`,
      priority: 0.5,
      changefreq: "monthly",
      lastmod: album.updatedAt?.toISOString().split("T")[0] || today,
    }));

    // Generate XML
    const allUrls = [
      ...staticPages.map((p) => ({
        ...p,
        lastmod: today,
      })),
      ...productUrls,
      ...postUrls,
      ...albumUrls,
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${baseUrl}${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).type("text/plain").send("Error generating sitemap");
  }
});

export default router;
