import { describe, expect, it } from "vitest";
import { slugifyPath } from "../../src/utils/slugify";

describe("slugifyPath", () => {
  it("should return the filename without extension", () => {
    expect(slugifyPath("path/to/file.md")).toBe("file");
    expect(slugifyPath("file.txt")).toBe("file");
    expect(slugifyPath("simple")).toBe("simple");
  });

  it("should handle files with multiple dots", () => {
    expect(slugifyPath("file.tar.gz")).toBe("file.tar");
    expect(slugifyPath("file.name.with.dots.md")).toBe("file.name.with.dots");
  });

  it("should handle paths with backslashes", () => {
    expect(slugifyPath("path\\to\\file.md")).toBe("file");
  });

  it("should handle empty string", () => {
    expect(slugifyPath("")).toBe("");
  });

  it("should handle path ending with slash", () => {
    expect(slugifyPath("path/to/")).toBe("");
  });

  it("should handle paths with only separators", () => {
    expect(slugifyPath("/")).toBe("");
    expect(slugifyPath("\\")).toBe("");
    expect(slugifyPath("///")).toBe("");
  });

  it("should handle path with special characters", () => {
    expect(slugifyPath("path/with!@#$%file.md")).toBe("with!@#$%file");
    expect(slugifyPath("path/with spaces/file name.md")).toBe("file name");
  });

  it("should handle very long paths", () => {
    const longPath = "a".repeat(1000) + "/file.md";
    expect(slugifyPath(longPath)).toBe("file");
  });

  it("should handle Unicode characters", () => {
    expect(slugifyPath("path/файл.md")).toBe("файл");
    expect(slugifyPath("path/文件.md")).toBe("文件");
    expect(slugifyPath("path/café.md")).toBe("café");
  });

  it("should handle URL-encoded characters", () => {
    expect(slugifyPath("path/file%20name.md")).toBe("file%20name");
    expect(slugifyPath("path/file+name.md")).toBe("file+name");
  });

  it("should handle paths with mixed separators", () => {
    expect(slugifyPath("path\\to/file.md")).toBe("file");
    expect(slugifyPath("path/to\\file.md")).toBe("file");
  });

  it("should handle hidden files", () => {
    expect(slugifyPath(".hidden.md")).toBe(".hidden");
    expect(slugifyPath("path/.hidden")).toBe("");
  });

  it("should handle files without extensions in path", () => {
    expect(slugifyPath("path/to/file")).toBe("file");
    expect(slugifyPath("file")).toBe("file");
  });

  it("should handle null bytes and control characters", () => {
    expect(slugifyPath("path/file\u0000.md")).toBe("file\u0000");
    expect(slugifyPath("path/file\n.md")).toBe("file\n");
  });

  it("should handle paths with special filesystem characters", () => {
    expect(slugifyPath("path/file:with:colons.md")).toBe("file:with:colons");
    expect(slugifyPath("path/file*with*asterisks.md")).toBe("file*with*asterisks");
    expect(slugifyPath("path/file?with?question.md")).toBe("file?with?question");
    expect(slugifyPath('path/file"with"quotes.md')).toBe('file"with"quotes');
  });

  it("should handle paths with encoded characters", () => {
    expect(slugifyPath("path/file%20encoded.md")).toBe("file%20encoded");
    expect(slugifyPath("path/file+plus+encoded.md")).toBe("file+plus+encoded");
  });

  it("should handle deeply nested paths", () => {
    const deepPath = "a/b/c/d/e/f/g/file.md";
    expect(slugifyPath(deepPath)).toBe("file");
  });
});
