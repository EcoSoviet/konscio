import { describe, expect, it } from "vitest";
import { config } from "../../src/config";
import { categoryPath, withBase } from "../../src/utils/url";

function withTempBase(base: string, fn: () => void) {
  const original = config.baseUrl;
  (config as any).baseUrl = base;
  try {
    fn();
  } finally {
    (config as any).baseUrl = original;
  }
}

describe("withBase", () => {
  it("normalises leading slashes in path and preserves internal", () => {
    withTempBase("/", () => {
      expect(withBase("categories/test")).toBe("/categories/test");
      expect(withBase("/categories/test")).toBe("/categories/test");
      expect(withBase("///categories//test")).toBe("/categories//test");
    });
  });

  it("returns just base when path empty", () => {
    withTempBase("/", () => {
      expect(withBase("")).toBe("/");
    });
  });

  it("adds trailing slash when missing", () => {
    withTempBase("/sub", () => {
      expect(withBase("dispatches/post")).toBe("/sub/dispatches/post");
      expect(withBase("")).toBe("/sub/");
    });
  });

  it("does not duplicate slash when base already has one", () => {
    withTempBase("/sub/", () => {
      expect(withBase("dispatches/post")).toBe("/sub/dispatches/post");
    });
  });
});

describe("categoryPath", () => {
  it("slugifies spaces and slashes to dashes and lowercases", () => {
    withTempBase("/", () => {
      expect(categoryPath("Global South")).toBe("/categories/global-south");
      expect(categoryPath("Energy/Transition")).toBe("/categories/energy-transition");
    });
  });

  it("honours custom baseUrl", () => {
    withTempBase("/root/", () => {
      expect(categoryPath("Editorial")).toBe("/root/categories/editorial");
    });
  });
});
