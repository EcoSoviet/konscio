import { getCollection } from "astro:content";
import { describe, expect, it, vi } from "vitest";
import { GET } from "../../src/pages/search.json.js";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

describe("search.json", () => {
  it("should return search data for dispatches and compendium", async () => {
    const mockPosts = [
      {
        data: {
          title: "Test Post 1",
          datePublished: new Date("2023-01-01"),
          excerpt: "Test excerpt 1",
          categories: ["category1"],
        },
        slug: "test-post-1",
      },
      {
        data: {
          title: "Test Post 2",
          datePublished: new Date("2023-01-02"),
          description: "Test description 2",
          categories: ["category2"],
        },
        slug: "test-post-2",
      },
    ];

    const mockCompendium = [
      {
        data: {
          title: "Socialism",
          description: "A political and economic tradition",
        },
        slug: "socialism",
      },
      {
        data: {
          title: "Eco-Socialism",
          description: "A socialist tradition anchored in ecological limits",
        },
        slug: "eco-socialism",
      },
    ];

    (getCollection as any)
      .mockResolvedValueOnce(mockPosts)
      .mockResolvedValueOnce(mockCompendium);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual([
      {
        title: "Test Post 2",
        url: "/dispatches/test-post-2",
        datePublished: "2023-01-02T00:00:00.000Z",
        excerpt: "Test description 2",
        categories: ["category2"],
        type: "dispatch",
      },
      {
        title: "Test Post 1",
        url: "/dispatches/test-post-1",
        datePublished: "2023-01-01T00:00:00.000Z",
        excerpt: "Test excerpt 1",
        categories: ["category1"],
        type: "dispatch",
      },
      {
        title: "Eco-Socialism",
        url: "/compendium/eco-socialism",
        datePublished: null,
        excerpt: "A socialist tradition anchored in ecological limits",
        categories: [],
        type: "compendium",
      },
      {
        title: "Socialism",
        url: "/compendium/socialism",
        datePublished: null,
        excerpt: "A political and economic tradition",
        categories: [],
        type: "compendium",
      },
    ]);
  });

  it("should handle posts without excerpt or description", async () => {
    const mockPosts = [
      {
        data: {
          title: "Untitled Post",
          datePublished: new Date("2023-01-01"),
        },
        slug: "untitled-post",
      },
    ];

    (getCollection as any)
      .mockResolvedValueOnce(mockPosts)
      .mockResolvedValueOnce([]);

    const response = await GET();
    const data = await response.json();
    expect(data[0].excerpt).toBe("");
    expect(data[0].categories).toEqual([]);
    expect(data[0].type).toBe("dispatch");
  });

  it("should sort posts by date descending, then compendium alphabetically", async () => {
    const mockPosts = [
      {
        data: {
          title: "Older Post",
          datePublished: new Date("2023-01-01"),
          excerpt: "Old",
        },
        slug: "older",
      },
      {
        data: {
          title: "Newer Post",
          datePublished: new Date("2023-01-03"),
          excerpt: "New",
        },
        slug: "newer",
      },
    ];

    const mockCompendium = [
      {
        data: {
          title: "Mutual Aid",
          description: "Community-based support",
        },
        slug: "mutual-aid",
      },
      {
        data: {
          title: "Commons",
          description: "Collectively managed resources",
        },
        slug: "commons",
      },
    ];

    (getCollection as any)
      .mockResolvedValueOnce(mockPosts)
      .mockResolvedValueOnce(mockCompendium);

    const response = await GET();
    const data = await response.json();
    expect(data[0].title).toBe("Newer Post");
    expect(data[1].title).toBe("Older Post");
    expect(data[2].title).toBe("Commons");
    expect(data[3].title).toBe("Mutual Aid");
  });

  it("should handle posts with invalid dates", async () => {
    const mockPosts = [
      {
        data: {
          title: "Invalid Date Post",
          datePublished: "invalid-date",
          excerpt: "Invalid",
        },
        slug: "invalid-date",
      },
      {
        data: {
          title: "Valid Post",
          datePublished: "2023-01-02T00:00:00.000Z",
          excerpt: "Valid",
        },
        slug: "valid",
      },
    ];

    (getCollection as any)
      .mockResolvedValueOnce(mockPosts)
      .mockResolvedValueOnce([]);

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.length).toBe(1);
    expect(data[0].title).toBe("Valid Post");
  });

  it("should handle getCollection throwing an error", async () => {
    (getCollection as any).mockRejectedValue(new Error("Collection error"));

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it("should handle posts with no data property", async () => {
    const mockPosts = [
      {
        slug: "no-data-post",
      } as any,
    ];

    (getCollection as any)
      .mockResolvedValueOnce(mockPosts)
      .mockResolvedValueOnce([]);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it("should filter out draft posts and future dated posts", async () => {
    const mockPosts = [
      {
        data: {
          title: "Past Post",
          datePublished: new Date("2023-01-01"),
          excerpt: "Past excerpt",
          draft: false,
        },
        slug: "past-post",
      },
      {
        data: {
          title: "Future Post",
          datePublished: new Date("2026-01-01"),
          excerpt: "Future excerpt",
          draft: false,
        },
        slug: "future-post",
      },
      {
        data: {
          title: "Draft Post",
          datePublished: new Date("2023-01-01"),
          excerpt: "Draft excerpt",
          draft: true,
        },
        slug: "draft-post",
      },
    ];

    (getCollection as any)
      .mockResolvedValueOnce(mockPosts)
      .mockResolvedValueOnce([]);

    const response = await GET();
    const data = await response.json();
    expect(data.length).toBe(1);
    expect(data[0].title).toBe("Past Post");
  });

  it("should filter out draft compendium entries", async () => {
    const mockCompendium = [
      {
        data: {
          title: "Published Entry",
          description: "Available to all",
          draft: false,
        },
        slug: "published",
      },
      {
        data: {
          title: "Draft Entry",
          description: "Not yet ready",
          draft: true,
        },
        slug: "draft",
      },
    ];

    (getCollection as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockCompendium);

    const response = await GET();
    const data = await response.json();
    expect(data.length).toBe(1);
    expect(data[0].title).toBe("Published Entry");
    expect(data[0].type).toBe("compendium");
  });

  it("should include compendium entries with no description", async () => {
    const mockCompendium = [
      {
        data: {
          title: "Entry Without Description",
        },
        slug: "no-desc",
      },
    ];

    (getCollection as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockCompendium);

    const response = await GET();
    const data = await response.json();
    expect(data[0].excerpt).toBe("");
    expect(data[0].type).toBe("compendium");
  });
});
