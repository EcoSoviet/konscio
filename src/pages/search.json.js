import { getCollection } from "astro:content";

export async function GET() {
  try {
    const posts = await getCollection("dispatches");

    const processedPosts = posts
      .filter((post) => post && post.data && post.data.draft !== true)
      .filter((post) => {
        const rawDate = post.data.datePublished;
        const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
        if (isNaN(date.getTime())) {
          return false;
        }
        return date.getTime() <= Date.now();
      })
      .map((post) => {
        let dateObj;
        if (post.data.datePublished instanceof Date) {
          dateObj = post.data.datePublished;
        } else if (typeof post.data.datePublished === "string") {
          dateObj = new Date(post.data.datePublished);
        } else {
          dateObj = new Date(post.data.datePublished);
        }

        const datePublished = isNaN(dateObj.getTime()) ? null : dateObj.toISOString();

        return {
          title: post.data.title || "Untitled",
          url: "/dispatches/" + post.slug,
          datePublished,
          excerpt: post.data.excerpt || post.data.description || "",
          categories: Array.isArray(post.data.categories) ? post.data.categories : [],
        };
      });

    const searchData = processedPosts
      .filter((item) => item.datePublished !== null)
      .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

    return new Response(JSON.stringify(searchData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }
}
