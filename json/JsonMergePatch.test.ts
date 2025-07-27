import { assertEquals } from "@std/assert/equals";
import { JsonMergePatch } from "./JsonMergePatch.ts";
import { describe, test } from "@std/testing/bdd";

const before = () => ({
  title: "Goodbye!",
  author: { givenName: "John", familyName: "Doe" },
  tags: ["example", "sample"],
  content: "This will be unchanged",
});

const patch = () => ({
  title: "Hello!",
  phoneNumber: "+01-123-456-7890",
  author: { familyName: null },
  tags: ["example"],
});

const after = () => ({
  title: "Hello!",
  author: { givenName: "John" },
  tags: ["example"],
  content: "This will be unchanged",
  phoneNumber: "+01-123-456-7890",
});

describe("JsonMergePatch", () => {
  describe("apply", () => {
    test("matches the spec", () => {
      assertEquals(JsonMergePatch.apply(before(), patch()), after());
    });
    test("mutates the target", () => {
      const target = {};
      const patch = { title: "Hello!" };
      JsonMergePatch.apply(target, patch);

      assertEquals(target, patch);
    });
  });

  test("diff", () => {
    assertEquals(JsonMergePatch.diff(before(), after()), patch());
  });
});
