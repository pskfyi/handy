import {
  assertEquals,
  assertThrows,
  describe,
  it,
  test,
} from "../../_deps/testing.ts";
import { assertParseResult } from "../../parser/asserts.ts";
import { dedent } from "../../string/dedent.ts";
import {
  conventionalCommit as cc,
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

describe("language", () => {
  test("type", () => {
    assertParseResult(cc.type.parse("feat: example"), "feat", ": example");
    assertParseResult(cc.type.parse("refactor"), "refactor");
    assertThrows(() => cc.type.parse(" "));
  });

  describe("scope", () => {
    test("scopes", () =>
      assertParseResult(cc.scope.parse("(foo): example"), "foo", ": example"));

    test("invalid input", () => void assertThrows(() => cc.scope.parse("foo")));
  });

  describe("delimiter", () => {
    test('": "', () =>
      assertParseResult(
        cc.delimiter.parse(": example"),
        [false, ": "],
        "example",
      ));

    test('"!: "', () =>
      assertParseResult(
        cc.delimiter.parse("!: example"),
        [true, ": "],
        "example",
      ));

    test("invalid input", () =>
      void assertThrows(() => cc.delimiter.parse(":")));
  });

  describe("description", () => {
    test("inline strings", () =>
      assertParseResult(
        cc.description.parse("Hello, world!\n\n"),
        "Hello, world!",
        "\n\n",
      ));

    test("invalid input", () =>
      void assertThrows(() => cc.description.parse("")));
  });

  describe("footer", () => {
    test("BREAKING CHANGE", () =>
      assertParseResult(
        cc.footer.parse("BREAKING CHANGE: foo\n\nbar\nexclude: this"),
        { key: "BREAKING CHANGE", value: "foo\n\nbar" },
        "exclude: this",
      ));

    test('"#" footer', () =>
      assertParseResult(
        cc.footer.parse("Closes #4\ninclude\nexclude: this"),
        { key: "Closes", value: "#4\ninclude" },
        "exclude: this",
      ));

    test("standard footer", () => {
      assertParseResult(cc.footer.parse("hyphen-ated: foo\n\n\n"), {
        key: "hyphen-ated",
        value: "foo",
      });

      assertParseResult(
        cc.footer.parse("Reviewed-by: Z"),
        { key: "Reviewed-by", value: "Z" },
      );

      assertParseResult(
        cc.footer.parse("Refs: #123"),
        { key: "Refs", value: "#123" },
      );
    });

    test("invalid input", () => {
      assertThrows(() => cc.footer.parse(""));
      assertThrows(() => cc.footer.parse("two words: foo"));
      assertThrows(() => cc.footer.parse(" starting: space"));
    });
  });

  describe("footers", () => {
    test('"#" footers', () =>
      assertParseResult(
        cc.footers.parse("Closes #4\nOpens #5"),
        {
          footers: [
            { key: "Closes", value: "#4" },
            { key: "Opens", value: "#5" },
          ],
        },
      ));

    test("standard footers", () =>
      assertParseResult(
        cc.footers.parse("Reviewed-by: Z\nRefs: #123"),
        {
          footers: [
            { key: "Reviewed-by", value: "Z" },
            { key: "Refs", value: "#123" },
          ],
        },
      ));

    test("mixed footers", () =>
      assertParseResult(
        cc.footers.parse("Closes #4\nReviewed-by: Z"),
        {
          footers: [
            { key: "Closes", value: "#4" },
            { key: "Reviewed-by", value: "Z" },
          ],
        },
      ));
  });

  describe("body", () => {
    test("single-chunk body", () =>
      assertParseResult(
        cc.body.parse("Hello, world!\n\n"),
        { body: "Hello, world!" },
      ));

    test("multi-chunk body", () => {
      assertParseResult(
        cc.body.parse(
          dedent(
            `Introduce a request id and a reference to latest request. Dismiss
            incoming responses other than from latest request.
            
            Remove timeouts which were used to mitigate the racing issue but are
            obsolete now.`,
          ),
        ),
        {
          body: dedent(
            `Introduce a request id and a reference to latest request. Dismiss
            incoming responses other than from latest request.
            
            Remove timeouts which were used to mitigate the racing issue but are
            obsolete now.`,
          ),
        },
      );
    });

    test("body w/ footers", () =>
      assertParseResult(
        cc.body.parse("Hello, world!\n\nCloses #4\n\n"),
        { body: "Hello, world!" },
        "Closes #4\n\n",
      ));
  });

  describe("message", () => {
    test("one-line messages", () => {
      assertParseResult(cc.message.parse("feat: description"), {
        type: "feat",
        description: "description",
      });

      assertParseResult(cc.message.parse("fix(md)!: foo"), {
        type: "fix",
        scope: "md",
        description: "foo",
        breakingChange: true,
      });
    });

    test("bodies", () => {
      assertParseResult(cc.message.parse("feat: X\n\nbody"), {
        type: "feat",
        description: "X",
        body: "body",
      });

      assertParseResult(cc.message.parse("feat: X\n\nbody1\n\nbody2"), {
        type: "feat",
        description: "X",
        body: "body1\n\nbody2",
      });

      assertParseResult(cc.message.parse("feat: X\n\nbody1\nbody2\n\nbody3"), {
        type: "feat",
        description: "X",
        body: "body1\nbody2\n\nbody3",
      });

      assertParseResult(cc.message.parse("feat: X\n\nbody1\n\nbody2\n\n"), {
        type: "feat",
        description: "X",
        body: "body1\n\nbody2",
      });
    });

    test("footers", () => {
      assertParseResult(cc.message.parse("feat: X\n\nA: B"), {
        type: "feat",
        description: "X",
        footers: [
          { key: "A", value: "B" },
        ],
      });

      assertParseResult(cc.message.parse("feat: X\n\nA: B\nC #1"), {
        type: "feat",
        description: "X",
        footers: [
          { key: "A", value: "B" },
          { key: "C", value: "#1" },
        ],
      });
    });

    test("breaking changes", () => {
      assertParseResult(cc.message.parse("feat: X\n\nBREAKING CHANGE: Y"), {
        type: "feat",
        description: "X",
        breakingChange: true,
        footers: [{ key: "BREAKING CHANGE", value: "Y" }],
      });

      assertParseResult(cc.message.parse("feat!: X"), {
        type: "feat",
        description: "X",
        breakingChange: true,
      });
    });

    test("invalid messages", () => {
      assertThrows(() => cc.message.parse(""));
      assertThrows(() => cc.message.parse("foo"));
      assertThrows(() => cc.message.parse("feat: "));
      assertThrows(() => cc.message.parse("feat:! description"));
      assertThrows(() => cc.message.parse("feat : description"));
      assertThrows(() => cc.message.parse("feat: description\n\n"));
    });
  });
});

describe("parse", () => {
  describe("official examples", () => {
    // https://www.conventionalcommits.org/en/v1.0.0/#examples

    test("example #1", () =>
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

    test("example #2", () =>
      assertEquals(
        parse("feat!: send an email to the customer when a product is shipped"),
        {
          type: "feat",
          description:
            "send an email to the customer when a product is shipped",
          breakingChange: true,
        },
      ));

    test("example #3", () =>
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

    test("example #4", () =>
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

    test("example #5", () =>
      assertEquals(
        parse("docs: correct spelling of CHANGELOG"),
        {
          type: "docs",
          description: "correct spelling of CHANGELOG",
        },
      ));

    test("example #6", () =>
      assertEquals(
        parse("feat(lang): add Polish language"),
        {
          type: "feat",
          scope: "lang",
          description: "add Polish language",
        },
      ));

    test("example #7", () =>
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

  test("special footers", () => {
    assertEquals(
      parse(msg(`
        fix: prevent racing of requests

        Fixes #123`)),
      {
        type: "fix",
        description: "prevent racing of requests",
        footers: [{ key: "Fixes", value: "#123" }],
      },
    );

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
    );
  });

  test("multi-line footers", () => {
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
    );

    assertEquals(
      parse(msg(`
        refactor: whatever

        this-is-a: mutli
            line
          footer`)),
      {
        type: "refactor",
        description: "whatever",
        footers: [{ key: "this-is-a", value: "mutli\n    line\n  footer" }],
      },
    );
  });

  test("complex bodies", () => {
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
    );
  });

  test("validation", () => {
    assertThrows(() => parse(": whatever"), ConventionalFormatError);
    assertThrows(() => parse("feat: "), ConventionalFormatError);
    assertThrows(() => parse("feat whatever"), ConventionalFormatError);
  });
});

describe("stringify", () => {
  test("scope", () =>
    assertEquals(
      stringify({ type: "feat", scope: "lang", description: "add Polish" }),
      "feat(lang): add Polish",
    ));

  test("breakingChange", () =>
    assertEquals(
      stringify({ type: "feat", description: "oops", breakingChange: true }),
      "feat!: oops",
    ));

  test("body", () =>
    assertEquals(
      stringify({ type: "feat", body: "XXX", description: "whatever" }),
      "feat: whatever\n\nXXX",
    ));

  test("body", () =>
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

  test("validation: throwing", () => {
    assertThrows(
      () => stringify({ type: "", description: "bar" }),
      ConventionalTypeError,
    );

    assertThrows(
      () => stringify({ type: "a\nb", description: "bar" }),
      ConventionalTypeError,
    );

    assertThrows(
      () => stringify({ type: "feat", scope: "", description: "bar" }),
      ConventionalScopeError,
    );

    assertThrows(
      () => stringify({ type: "feat", scope: "a\nb", description: "bar" }),
      ConventionalScopeError,
    );

    assertThrows(
      () => stringify({ type: "feat", description: "a\nb" }),
      ConventionalDescriptionError,
    );

    assertThrows(
      () => stringify({ type: "feat", description: "a\nb" }),
      ConventionalDescriptionError,
    );

    assertThrows(
      () =>
        stringify({
          type: "feat",
          description: "bar",
          footers: [{ key: "", value: "foo" }],
        }),
      ConventionalFooterError,
    );

    assertThrows(
      () =>
        stringify({
          type: "feat",
          description: "bar",
          footers: [{ key: "a\nb", value: "foo" }],
        }),
      ConventionalFooterError,
    );
  });
});
