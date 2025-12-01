import fs from "fs";
import path from "path";
import linkCheck from "link-check";

const CONTENT_DIRS = [path.join(process.cwd(), "src")];

function getSourceFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSourceFiles(filePath));
    } else if (
      file.endsWith(".md") ||
      file.endsWith(".mdx") ||
      file.endsWith(".ts") ||
      file.endsWith(".js") ||
      file.endsWith(".astro")
    ) {
      results.push(filePath);
    }
  });
  return results;
}

function extractLinks(content: string): string[] {
  const links: string[] = [];
  const mdRegex = /\[([^\]]+)\]\((https?:[^)]+)\)/g;
  let match;
  while ((match = mdRegex.exec(content)) !== null) {
    links.push(match[2]);
  }
  const propRegex = /(url|href)="(https?:[^"]+)"/g;
  while ((match = propRegex.exec(content)) !== null) {
    links.push(match[2]);
  }
  return links;
}

async function checkLinks(links: string[]): Promise<{ url: string; status: string }[]> {
  const results: { url: string; status: string }[] = [];
  for (const url of links) {
    const res = await new Promise<{ url: string; status: string }>((resolve) => {
      linkCheck(url, (err, result) => {
        if (err) {
          resolve({ url, status: "error" });
        } else {
          resolve({ url, status: result.status });
        }
      });
    });
    results.push(res);
  }
  return results;
}

export { getSourceFiles, extractLinks, checkLinks };
export async function checkAllExternalLinks() {
  let allLinks: string[] = [];
  for (const dir of CONTENT_DIRS) {
    const files = getSourceFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const links = extractLinks(content);
      allLinks = allLinks.concat(links);
    }
  }
  allLinks = allLinks.filter((url) => url.startsWith("http"));
  if (allLinks.length === 0) {
    console.log("No external links found.");
    return true;
  }
  console.log(`Checking ${allLinks.length} external links...`);
  const results = await checkLinks(allLinks);
  const failed = results.filter((r) => r.status !== "alive");
  if (failed.length > 0) {
    console.error("Broken links found:", failed);
    return false;
  }
  console.log("All external links are alive.");
  return true;
}

checkAllExternalLinks().then((ok) => {
  process.exit(ok ? 0 : 1);
});
