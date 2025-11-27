import { getCollection } from "astro:content";

export async function GET() {
  try {
    const posts = await getCollection("dispatches");
    const compendiumEntries = await getCollection("compendium");

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

        const datePublished = isNaN(dateObj.getTime())
          ? null
          : dateObj.toISOString();

        return {
          title: post.data.title || "Untitled",
          url: "/dispatches/" + post.slug,
          datePublished,
          excerpt: post.data.excerpt || post.data.description || "",
          categories: Array.isArray(post.data.categories)
            ? post.data.categories
            : [],
          type: "dispatch",
        };
      });

    const processedCompendium = compendiumEntries
      .filter((entry) => entry && entry.data && entry.data.draft !== true)
      .map((entry) => ({
        title: entry.data.title || "Untitled",
        url: "/compendium/" + entry.slug,
        datePublished: null,
        excerpt: entry.data.description || "",
        categories: [],
        type: "compendium",
      }));

    const searchData = [
      ...processedPosts.filter((item) => item.datePublished !== null),
      ...processedCompendium,
    ].sort((a, b) => {
      if (a.datePublished && b.datePublished) {
        return new Date(b.datePublished) - new Date(a.datePublished);
      }
      if (a.datePublished && !b.datePublished) {
        return -1;
      }
      if (!a.datePublished && b.datePublished) {
        return 1;
      }
      return a.title.localeCompare(b.title);
    });

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
