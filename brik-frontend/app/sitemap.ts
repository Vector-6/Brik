import { MetadataRoute } from "next";

/**
 * Generate sitemap for search engines
 * Helps with SEO and discoverability
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://brik.gg";
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/swap`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
