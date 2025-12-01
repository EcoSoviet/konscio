import rss from "@astrojs/rss";
import { config } from "../config";

export async function GET(context) {
  const posts = import.meta.glob("../content/dispatches/*.{md,mdx}", {
    eager: true,
  });

  const items = Object.entries(posts)
    .filter(([_path, post]) => post && post.frontmatter && post.frontmatter.draft !== true)
    .filter(([_path, post]) => {
      const rawDate = post.frontmatter.datePublished;
      const date = new Date(rawDate);
      if (isNaN(date.getTime())) {
        return false;
      }
      return date.getTime() <= Date.now();
    })
    .map(([path, post]) => {
      const slug = path
        .split("/")
        .pop()
        .replace(/\.(md|mdx)$/, "");
      return {
        title: post.frontmatter.title || "Untitled",
        pubDate: post.frontmatter.datePublished,
        description: post.frontmatter.excerpt || post.frontmatter.description || "",
        link: `/dispatches/${slug}/`,
      };
    })
    .filter((item) => item.title !== "Untitled" || item.description)
    .sort((a, b) => {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }
      return dateB.getTime() - dateA.getTime();
    });

  const siteUrl = typeof context.site === "string" ? context.site.replace(/\/?$/, "/") : "/";
  return rss({
    title: config.title,
    description: config.description,
    site: context.site,
    items,
    customData: `
      <language>en-gb</language>
      <atom:link href="${siteUrl}rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>
    `,
  });
}
