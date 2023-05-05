import {
  assertEquals,
  assertThrows,
  describe,
  it,
} from "../../_deps/testing.ts";
import { dedent } from "../../string/dedent.ts";
import {
  ConventionalDescriptionError,
  ConventionalFooterError,
  ConventionalFormatError,
  ConventionalScopeError,
  ConventionalTypeError,
  parse,
  stringify,
} from "./conventional.ts";

function msg(str: string): string {
  return dedent(str).trim();
}

describe("parse", () => {
  describe("official examples", () => {
    // https://www.conventionalcommits.org/en/v1.0.0/#examples

    it("handles #1", () =>
      assertEquals(
        parse(msg(`
        feat: allow provided config object to extend other configs

        BREAKING CHANGE: \`extends\` key in config file is now used for extending other config files`)),
        {
          type: "feat",
          description: "allow provided config object to extend other configs",
          footers: [{
            key: "BREAKING CHANGE",
            value:
              "`extends` key in config file is now used for extending other config files",
          }],
          breakingChange: true,
        },
      ));

    it("handles #2", () =>
      assertEquals(
        parse("feat!: send an email to the customer when a product is shipped"),
        {
          type: "feat",
          description:
            "send an email to the customer when a product is shipped",
          breakingChange: true,
        },
      ));

    it("handles #3", () =>
      assertEquals(
        parse(
          "feat(api)!: send an email to the customer when a product is shipped",
        ),
        {
          type: "feat",
          scope: "api",
          description:
            "send an email to the customer when a product is shipped",
          breakingChange: true,
        },
      ));

    it("handles #4", () =>
      assertEquals(
        parse(msg(`
          chore!: drop support for Node 6

          BREAKING CHANGE: use JavaScript features not available in Node 6.
        `)),
        {
          type: "chore",
          description: "drop support for Node 6",
          footers: [{
            key: "BREAKING CHANGE",
            value: "use JavaScript features not available in Node 6.",
          }],
          breakingChange: true,
        },
      ));

    it("handles #5", () =>
      assertEquals(
        parse("docs: correct spelling of CHANGELOG"),
        {
          type: "docs",
          description: "correct spelling of CHANGELOG",
        },
      ));

    it("handles #6", () =>
      assertEquals(
        parse("feat(lang): add Polish language"),
        {
          type: "feat",
          scope: "lang",
          description: "add Polish language",
        },
      ));

    it("handles #7", () =>
      assertEquals(
        parse(msg(`
        fix: prevent racing of requests

        Introduce a request id and a reference to latest request. Dismiss
        incoming responses other than from latest request.
        
        Remove timeouts which were used to mitigate the racing issue but are
        obsolete now.
        
        Reviewed-by: Z
        Refs: #123`)),
        {
          type: "fix",
          description: "prevent racing of requests",
          body: "Introduce a request id and a reference to latest request. " +
            "Dismiss\nincoming responses other than from latest request.\n\n" +
            "Remove timeouts which were used to mitigate the racing issue " +
            "but are\nobsolete now.",
          footers: [
            { key: "Reviewed-by", value: "Z" },
            { key: "Refs", value: "#123" },
          ],
        },
      ));
  });

  describe("common usage", () => {
    it("handles magic comments", () =>
      assertEquals(
        parse(msg(`
          fix: prevent racing of requests

          Fixes #123`)),
        {
          type: "fix",
          description: "prevent racing of requests",
          footers: [{ key: "Fixes", value: "#123" }],
        },
      ));

    it("handles BREAKING-CHANGE", () =>
      assertEquals(
        parse(msg(`
        fix: do something

        BREAKING-CHANGE: Example`)),
        {
          type: "fix",
          description: "do something",
          footers: [{ key: "BREAKING-CHANGE", value: "Example" }],
          breakingChange: true,
        },
      ));
  });

  describe("multi-line footers", () => {
    it("handles them", () =>
      assertEquals(
        parse(msg(`
          refactor: whatever

          this-is-a: mutli-line
          footer`)),
        {
          type: "refactor",
          description: "whatever",
          footers: [{ key: "this-is-a", value: "mutli-line\nfooter" }],
        },
      ));

    it("trims lines", () =>
      assertEquals(
        parse(msg(`
            refactor: whatever
  
            this-is-a: mutli
                line
              footer`)),
        {
          type: "refactor",
          description: "whatever",
          footers: [{ key: "this-is-a", value: "mutli\nline\nfooter" }],
        },
      ));
  });

  describe("complex bodies", () => {
    it("doesn't ruin them", () =>
      assertEquals(
        parse(msg(`
            test: this
  
            \`\`\`ts
            import { foo } from "bar";

            foo()
              .then((x) => x + 1)
            \`\`\`
            `)),
        {
          type: "test",
          description: "this",
          body: '```ts\nimport { foo } from "bar";\n\n' +
            "foo()\n  .then((x) => x + 1)\n```",
        },
      ));
  });

  describe("validation", () => {
    it("throws w/o type", () =>
      void assertThrows(
        () => parse(": whatever"),
        ConventionalFormatError,
      ));

    it("throws w/o desc", () =>
      void assertThrows(
        () => parse("feat: "),
        ConventionalFormatError,
      ));

    it("throws w/o :", () =>
      void assertThrows(
        () => parse("feat whatever"),
        ConventionalFormatError,
      ));
  });
});

describe("stringify", () => {
  it("handles scope", () =>
    assertEquals(
      stringify({ type: "feat", scope: "lang", description: "add Polish" }),
      "feat(lang): add Polish",
    ));

  it("handles breakingChange", () =>
    assertEquals(
      stringify({ type: "feat", description: "oops", breakingChange: true }),
      "feat!: oops",
    ));

  it("handles body", () =>
    assertEquals(
      stringify({ type: "feat", body: "XXX", description: "whatever" }),
      "feat: whatever\n\nXXX",
    ));

  it("preserves body format", () =>
    assertEquals(
      stringify({ type: "feat", body: "XXX\n  \nYY", description: "whatever" }),
      "feat: whatever\n\nXXX\n  \nYY",
    ));

  it('ignores "" body', () =>
    assertEquals(
      stringify({ type: "feat", body: "", description: "whatever" }),
      "feat: whatever",
    ));

  it("handles footers", () =>
    assertEquals(
      stringify({
        type: "feat",
        description: "whatever",
        footers: [{ key: "Reviewed-by", value: "Z" }],
      }),
      "feat: whatever\n\nReviewed-by: Z",
    ));

  it("handles [] footers", () =>
    assertEquals(
      stringify({ type: "feat", description: "whatever", footers: [] }),
      "feat: whatever",
    ));

  it("handles all fields", () =>
    assertEquals(
      stringify({
        type: "feat",
        scope: "lang",
        description: "add Polish",
        body: "XXX\n\nYYY",
        footers: [{ key: "Reviewed-by", value: "Z" }],
        breakingChange: true,
      }),
      "feat(lang)!: add Polish\n\nXXX\n\nYYY\n\nReviewed-by: Z",
    ));

  it("handles hash footers", () =>
    assertEquals(
      stringify({
        type: "feat",
        description: "allow provided config object to extend other configs",
        footers: [{ key: "Fixes", value: "#101" }],
        breakingChange: true,
      }),
      msg(`
        feat!: allow provided config object to extend other configs

        Fixes #101
      `),
    ));

  it("always uses !", () =>
    assertEquals(
      stringify({
        type: "feat",
        description: "allow provided config object to extend other configs",
        footers: [{ key: "BREAKING CHANGE", value: "foo" }],
      }),
      msg(`
        feat!: allow provided config object to extend other configs

        BREAKING CHANGE: foo
      `),
    ));

  describe("validation", () => {
    it('throws on "" type', () =>
      void assertThrows(
        () => stringify({ type: "", description: "bar" }),
        ConventionalTypeError,
      ));

    it("throws on \\n in type", () =>
      void assertThrows(
        () => stringify({ type: "a\nb", description: "bar" }),
        ConventionalTypeError,
      ));

    it('throws on "" scope', () =>
      void assertThrows(
        () => stringify({ type: "feat", scope: "", description: "bar" }),
        ConventionalScopeError,
      ));

    it("throws on \\n in scope", () =>
      void assertThrows(
        () => stringify({ type: "feat", scope: "a\nb", description: "bar" }),
        ConventionalScopeError,
      ));

    it('throws on "" desc', () =>
      void assertThrows(
        () => stringify({ type: "feat", description: "a\nb" }),
        ConventionalDescriptionError,
      ));

    it("throws on \\n in desc", () =>
      void assertThrows(
        () => stringify({ type: "feat", description: "a\nb" }),
        ConventionalDescriptionError,
      ));

    it('throws on "" footer key', () =>
      void assertThrows(
        () =>
          stringify({
            type: "feat",
            description: "bar",
            footers: [{ key: "", value: "foo" }],
          }),
        ConventionalFooterError,
      ));

    it("throws on \\n footer key", () =>
      void assertThrows(
        () =>
          stringify({
            type: "feat",
            description: "bar",
            footers: [{ key: "a\nb", value: "foo" }],
          }),
        ConventionalFooterError,
      ));
  });
});
