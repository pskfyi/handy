import { stripColor } from "../_deps/fmt.ts";
import { assert, assertEquals, describe, it } from "../_deps/testing.ts";
import { TextCursor } from "./TextCursor.ts";
import { dedent } from "./dedent.ts";

const str = "feat: example";
const longStr =
  "the quick brown fox jumps over the lazy dog then does it again and again until it is tired";
const maxLength = 39;

describe("new TextCursor()", () => {
  it("requires a string", () => assert(new TextCursor(str)));

  it("can clone a cursor", () => {
    const cursorA = new TextCursor(str);
    const cursorB = new TextCursor(cursorA);
    assert(cursorA !== cursorB);
    assertEquals(cursorA.index, cursorB.index);
    assertEquals(cursorA.input, cursorB.input);
  });

  it("can clone w/ new index", () => {
    const cursorA = new TextCursor(str);
    const cursorB = new TextCursor(cursorA, 3);
    assert(cursorA !== cursorB);
    assertEquals(cursorA.input, cursorB.input);
    assertEquals(cursorB.index, 3);
  });
});

describe("TextCursor.index", () => {
  it("starts at 0", () => assertEquals(new TextCursor(str).index, 0));

  it("can be initialized", () => assertEquals(new TextCursor(str, 3).index, 3));
});

describe("TextCursor.move()", () => {
  it("moves the index", () => {
    assertEquals(new TextCursor(str).move(3).index, 3);
    assertEquals(new TextCursor(str, 3).move(2).index, 5);
  });

  it("returns a new cursor", () => {
    const cursor = new TextCursor(str);
    assert(cursor !== cursor.move(3));
  });
});

describe("TextCursor.char", () => {
  it("is the index character", () =>
    assertEquals(new TextCursor(str, 2).char, "a"));
});

describe("TextCursor.remainder", () => {
  it("defaults to full input", () =>
    assertEquals(new TextCursor(str).remainder, str));

  it("is index onward", () =>
    assertEquals(new TextCursor(str, 3).remainder, "t: example"));
});

describe("TextCursor.antecedent", () => {
  it("is empty by default", () =>
    assertEquals(new TextCursor(str).antecedent, ""));

  it("is value before index", () =>
    assertEquals(new TextCursor(str, 3).antecedent, "fea"));
});

describe("TextCursor.location", () => {
  it("is index Text.Location", () => {
    const text = "a\n\nbc\nd\nef";
    const cursor = new TextCursor(text);

    assertEquals(cursor.location, { offset: 0, line: 1, column: 1 });
    assertEquals(cursor.move(1).location, { offset: 1, line: 1, column: 2 });
    assertEquals(cursor.move(2).location, { offset: 2, line: 2, column: 1 });
    assertEquals(cursor.move(3).location, { offset: 3, line: 3, column: 1 });
    assertEquals(cursor.move(4).location, { offset: 4, line: 3, column: 2 });
    assertEquals(cursor.move(5).location, { offset: 5, line: 3, column: 3 });
    assertEquals(cursor.move(6).location, { offset: 6, line: 4, column: 1 });
    assertEquals(cursor.move(7).location, { offset: 7, line: 4, column: 2 });
    assertEquals(cursor.move(8).location, { offset: 8, line: 5, column: 1 });
    assertEquals(cursor.move(9).location, { offset: 9, line: 5, column: 2 });
  });
});

describe("TextCursor.line", () => {
  it("is the line at the index", () => {
    const text = "a\n\nbc\nd\nef";

    assertEquals(new TextCursor(text).line, "a\n");
    assertEquals(new TextCursor(text, 1).line, "a\n");
    assertEquals(new TextCursor(text, 2).line, "\n");
    assertEquals(new TextCursor(text, 3).line, "bc\n");
    assertEquals(new TextCursor(text, 4).line, "bc\n");
    assertEquals(new TextCursor(text, 5).line, "bc\n");
    assertEquals(new TextCursor(text, 6).line, "d\n");
    assertEquals(new TextCursor(text, 7).line, "d\n");
    assertEquals(new TextCursor(text, 8).line, "ef");
    assertEquals(new TextCursor(text, 9).line, "ef");
  });
});

describe("TextCursor.toString()", () => {
  it("is elided around index", () =>
    assertEquals(
      new TextCursor("abcdefghijklmnopqrstuvwxyz", 13).toString(),
      'TextCursor("…efghijklmnopqrstuv…", 13)',
    ));
});

describe("TextCursor.startsWith()", () => {
  it("matches from the index", () => {
    assert(new TextCursor(str).startsWith("feat"));
    assert(!new TextCursor(str).startsWith("wxyz"));
    assert(new TextCursor(str, 4).startsWith(": ex"));
  });
});

describe("inspect", () => {
  it("depicts the location", () =>
    assertEquals(
      stripColor(new TextCursor(str, 3).inspect()),
      dedent(`
        feat: example
           ^
      `).trim(),
    ));

  it("elides long lines", () =>
    assertEquals(
      stripColor(new TextCursor(longStr, 37).inspect({ maxLength })),
      dedent(`
        … jumps over the lazy dog then does it…
                           ^
      `).trim(),
    ));

  describe("line numbers", () => {
    it("shows when >1 lines", () => {
      const cursor = new TextCursor("a\nb", 1);

      assertEquals(
        stripColor(cursor.inspect()),
        dedent(`
          [L1] a¶
                ^
        `).trim(),
      );

      assertEquals(
        stripColor(new TextCursor("a\nb", 2).inspect()),
        dedent(`
          [L2] b
               ^
        `).trim(),
      );
    });

    it("is configurable", () => {
      const cursor = new TextCursor("a\nb", 1);

      assertEquals(
        stripColor(cursor.inspect({ lineNumber: false })),
        dedent(`
          a¶
           ^
        `).trim(),
      );

      assertEquals(
        stripColor(cursor.move(1).inspect({ lineNumber: false })),
        dedent(`
          b
          ^
        `).trim(),
      );
    });
  });

  describe("max length", () => {
    it("defaults to 40 or console width", () => {
      // TODO: Consider refactoring to allow stubbing console width.
    });

    it("is configurable", () => {
      const cursor = new TextCursor(longStr, 37);

      assertEquals(
        stripColor(cursor.inspect({ maxLength: 10 })),
        dedent(`
          …e lazy d…
               ^
        `).trim(),
      );

      assertEquals(
        stripColor(cursor.inspect({ maxLength: 20 })),
        dedent(`
          …er the lazy dog th…
                    ^
        `).trim(),
      );
    });
  });

  describe("colors", () => {
    it("has color by default", () => {
      const cursor = new TextCursor(str, 3);
      const msg = cursor.inspect();

      assert(msg !== stripColor(msg));
    });

    it("is configurable", () => {
      const cursor = new TextCursor(str, 3);
      const msg = cursor.inspect({ colors: false });

      assertEquals(msg, stripColor(msg));
    });
  });
});
