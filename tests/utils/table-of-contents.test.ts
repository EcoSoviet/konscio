import { describe, expect, it } from "vitest";
import { extractHeadings, filterHeadingsForTOC } from "../../src/utils/table-of-contents";

describe("extractHeadings", () => {
  it("should extract headings from markdown", () => {
    const content = `
# Heading 1
Some text
## Heading 2
More text
### Heading 3
Even more
#### Heading 4
`;

    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { depth: 1, text: "Heading 1", slug: "heading-1" },
      { depth: 2, text: "Heading 2", slug: "heading-2" },
      { depth: 3, text: "Heading 3", slug: "heading-3" },
      { depth: 4, text: "Heading 4", slug: "heading-4" },
    ]);
  });

  it("should ignore frontmatter", () => {
    const content = `---
title: Test
---
# Heading 1
## Heading 2
`;

    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { depth: 1, text: "Heading 1", slug: "heading-1" },
      { depth: 2, text: "Heading 2", slug: "heading-2" },
    ]);
  });

  it("should handle headings with special characters", () => {
    const content = "## Heading with !@#$%^&*()";
    const headings = extractHeadings(content);
    expect(headings[0].slug).toBe("heading-with");
  });

  it("should return empty array for no headings", () => {
    const content = "Just some text without headings.";
    const headings = extractHeadings(content);
    expect(headings).toEqual([]);
  });

  it("should handle malformed frontmatter", () => {
    const content = `---
title: Test
unclosed frontmatter
# Heading 1
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([{ depth: 1, text: "Heading 1", slug: "heading-1" }]);
  });

  it("should handle headings with invalid depths", () => {
    const content = `
####### Invalid Heading
# Valid Heading
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([{ depth: 1, text: "Valid Heading", slug: "valid-heading" }]);
  });

  it("should handle content with only special characters in headings", () => {
    const content = "## !@#$%^&*()";
    const headings = extractHeadings(content);
    expect(headings[0].slug).toBe("");
  });

  it("should handle headings with multiple consecutive special characters", () => {
    const content = "## Heading with --- multiple --- dashes";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading with --- multiple --- dashes");
    expect(headings[0].slug).toBe("heading-with-----multiple-----dashes");
  });

  it("should handle headings with leading and trailing spaces", () => {
    const content = "##   Heading with spaces   ";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading with spaces");
    expect(headings[0].slug).toBe("heading-with-spaces");
  });

  it("should handle mixed markdown elements in headings", () => {
    const content = "## Heading with [link](http://example.com) and `code`";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading with [link](http://example.com) and `code`");
    expect(headings[0].slug).toBe("heading-with-linkhttpexamplecom-and-code");
  });

  it("should handle content with very long headings", () => {
    const longText = "A".repeat(1000);
    const content = `## ${longText}`;
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe(longText);
  });

  it("should handle headings with inline code", () => {
    const content = "## Heading with `code` inside";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading with `code` inside");
    expect(headings[0].slug).toBe("heading-with-code-inside");
  });

  it("should handle headings with links", () => {
    const content = "## Heading with [link](url)";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading with [link](url)");
    expect(headings[0].slug).toBe("heading-with-linkurl");
  });

  it("should handle headings with HTML entities", () => {
    const content = "## Heading with &amp; entities";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading with &amp; entities");
    expect(headings[0].slug).toBe("heading-with-amp-entities");
  });

  it("should handle mixed heading levels", () => {
    const content = `
# H1
### H3
## H2
#### H4
### Another H3
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { depth: 1, text: "H1", slug: "h1" },
      { depth: 3, text: "H3", slug: "h3" },
      { depth: 2, text: "H2", slug: "h2" },
      { depth: 4, text: "H4", slug: "h4" },
      { depth: 3, text: "Another H3", slug: "another-h3" },
    ]);
  });

  it("should handle headings with trailing spaces", () => {
    const content = "## Heading with spaces   ";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading with spaces");
    expect(headings[0].slug).toBe("heading-with-spaces");
  });

  it("should handle headings with multiple spaces", () => {
    const content = "## Heading   with   multiple   spaces";
    const headings = extractHeadings(content);
    expect(headings[0].text).toBe("Heading   with   multiple   spaces");
    expect(headings[0].slug).toBe("heading-with-multiple-spaces");
  });
});

describe("filterHeadingsForTOC", () => {
  it("should filter headings to only depth 2 and 3", () => {
    const headings = [
      { depth: 1, text: "H1", slug: "h1" },
      { depth: 2, text: "H2", slug: "h2" },
      { depth: 3, text: "H3", slug: "h3" },
      { depth: 4, text: "H4", slug: "h4" },
    ];

    const filtered = filterHeadingsForTOC(headings);
    expect(filtered).toEqual([
      { depth: 2, text: "H2", slug: "h2" },
      { depth: 3, text: "H3", slug: "h3" },
    ]);
  });

  it("should return empty array if no matching depths", () => {
    const headings = [
      { depth: 1, text: "H1", slug: "h1" },
      { depth: 4, text: "H4", slug: "h4" },
    ];

    const filtered = filterHeadingsForTOC(headings);
    expect(filtered).toEqual([]);
  });

  it("should handle empty array", () => {
    const filtered = filterHeadingsForTOC([]);
    expect(filtered).toEqual([]);
  });

  it("should handle headings with negative depths", () => {
    const headings = [
      { depth: -1, text: "Negative", slug: "negative" },
      { depth: 0, text: "Zero", slug: "zero" },
    ];

    const filtered = filterHeadingsForTOC(headings);
    expect(filtered).toEqual([]);
  });
});
