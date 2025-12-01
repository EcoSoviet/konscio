import fs from "fs";
import path from "path";
import linkCheck from "link-check";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkAllExternalLinks,
  checkLinks,
  extractLinks,
  getSourceFiles,
} from "../../scripts/link-check.ts";

vi.mock("fs");
vi.mock("path");
vi.mock("link-check");

describe("link-check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSourceFiles", () => {
    it("should return source files from directory", () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue(["file.md", "file.astro", "file.txt"] as any);
      vi.spyOn(fs, "statSync").mockReturnValue({
        isDirectory: () => false,
      } as any);
      vi.spyOn(path, "join").mockImplementation((...args) => args.join("/"));

      const result = getSourceFiles("/src");

      expect(result).toEqual(["/src/file.md", "/src/file.astro"]);
      expect(fs.readdirSync).toHaveBeenCalledWith("/src");
    });
  });

  describe("extractLinks", () => {
    it("should extract Markdown links", () => {
      const content = "[text](https://example.com) and [another](http://test.com)";
      const result = extractLinks(content);

      expect(result).toEqual(["https://example.com", "http://test.com"]);
    });

    it("should extract Astro/JSX prop links", () => {
      const content = 'url="https://astro.com" href="http://jsx.com"';
      const result = extractLinks(content);

      expect(result).toEqual(["https://astro.com", "http://jsx.com"]);
    });

    it("should return empty array for no links", () => {
      const content = "No links here";
      const result = extractLinks(content);

      expect(result).toEqual([]);
    });
  });

  describe("checkLinks", () => {
    it("should check links and return results", async () => {
      const mockLinkCheck = vi.fn().mockImplementation((url, callback) => {
        if (url === "https://good.com") {
          callback(null, { link: url, status: "alive" });
        } else {
          callback(null, { link: url, status: "dead" });
        }
      });

      vi.mocked(linkCheck).mockImplementation(mockLinkCheck);

      const links = ["https://good.com", "https://bad.com"];
      const result = await checkLinks(links);

      expect(result).toEqual([
        { url: "https://good.com", status: "alive" },
        { url: "https://bad.com", status: "dead" },
      ]);
    });
  });

  describe("checkAllExternalLinks", () => {
    it("should return true when no external links found", async () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue([] as any);
      vi.spyOn(fs, "statSync").mockReturnValue({
        isDirectory: () => false,
      } as any);
      vi.spyOn(fs, "readFileSync").mockReturnValue("No links");
      vi.spyOn(path, "join").mockImplementation((...args) => args.join("/"));

      const result = await checkAllExternalLinks();

      expect(result).toBe(true);
    });

    it("should check external links and return true if all alive", async () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue(["file.astro"] as any);
      vi.spyOn(fs, "statSync").mockReturnValue({
        isDirectory: () => false,
      } as any);
      vi.spyOn(fs, "readFileSync").mockReturnValue('url="https://good.com"');
      vi.spyOn(path, "join").mockImplementation((...args) => args.join("/"));
      vi.mocked(linkCheck).mockImplementation((url, callback: any) => {
        callback(null, { link: url, status: "alive" });
      });

      const result = await checkAllExternalLinks();

      expect(result).toBe(true);
    });

    it("should return false if broken links found", async () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue(["file.astro"] as any);
      vi.spyOn(fs, "statSync").mockReturnValue({
        isDirectory: () => false,
      } as any);
      vi.spyOn(fs, "readFileSync").mockReturnValue('url="https://bad.com"');
      vi.spyOn(path, "join").mockImplementation((...args) => args.join("/"));
      vi.mocked(linkCheck).mockImplementation((url, callback: any) => {
        callback(null, { link: url, status: "dead" });
      });

      const result = await checkAllExternalLinks();

      expect(result).toBe(false);
    });
  });
});
