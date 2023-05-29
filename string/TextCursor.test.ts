import { stripColor } from "../_deps/fmt.ts";
import { assert, assertEquals, describe, it, test } from "../_deps/testing.ts";
import { TextCursor } from "./TextCursor.ts";
import { dedent } from "./dedent.ts";

const str = "feat: example";
const longStr =
  "the quick brown fox jumps over the lazy dog then does it again and again until it is tired";
const maxLength = 39;

test("new TextCursor()", () => {
  const cursorA = new TextCursor(str);
  const cursorB = new TextCursor(cursorA);

  assert(cursorA !== cursorB);

  assertEquals(cursorA.index, cursorB.index);
  assertEquals(cursorA.input, cursorB.input);

  const cursorC = new TextCursor(cursorA, 3);
  assertEquals(cursorC.index, 3);
});

test(".index", () => {
  assertEquals(new TextCursor(str).index, 0);
  assertEquals(new TextCursor(str, 3).index, 3);
});

test(".move()", () => {
  assertEquals(new TextCursor(str).move(3).index, 3);
  assertEquals(new TextCursor(str, 3).move(2).index, 5);

  const cursor = new TextCursor(str);
  assert(cursor !== cursor.move(3));
});

test(".char", () => assertEquals(new TextCursor(str, 2).char, "a"));

test(".remainder", () => {
  assertEquals(new TextCursor(str).remainder, str);
  assertEquals(new TextCursor(str, 3).remainder, "t: example");
});

test(".antecedent", () => {
  assertEquals(new TextCursor(str).antecedent, "");
  assertEquals(new TextCursor(str, 3).antecedent, "fea");
});

test(".location", () => {
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

test(".line", () => {
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

describe(".toString() elides input", () =>
  assertEquals(
    new TextCursor("abcdefghijklmnopqrstuvwxyz", 13).toString(),
    'TextCursor("…efghijklmnopqrstuv…", 13)',
  ));

test(".startsWith()", () => {
  assert(new TextCursor(str).startsWith("feat"));
  assert(!new TextCursor(str).startsWith("wxyz"));
  assert(new TextCursor(str, 4).startsWith(": ex"));
});

describe("inspect()", () => {
  it("depicts the location", () =>
    assertEquals(
      stripColor(new TextCursor(str, 3).inspect()),
      dedent(`
        feat:·example
           ^
      `).trim(),
    ));

  test("elision", () =>
    assertEquals(
      stripColor(new TextCursor(longStr, 37).inspect({ maxLength })),
      dedent(`
        …·jumps·over·the·lazy·dog·then·does·it…
                           ^
      `).trim(),
    ));

  test("line numbers", () => {
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

  test("maxLength", () => {
    // TODO: Consider refactoring to allow stubbing console width.

    const cursor = new TextCursor(longStr, 37);

    assertEquals(
      stripColor(cursor.inspect({ maxLength: 10 })),
      dedent(`
        …e·lazy·d…
             ^
      `).trim(),
    );

    assertEquals(
      stripColor(cursor.inspect({ maxLength: 20 })),
      dedent(`
        …er·the·lazy·dog·th…
                  ^
      `).trim(),
    );
  });

  test("colors", () => {
    const cursor = new TextCursor(str, 3);
    const msg = cursor.inspect();
    const msg2 = cursor.inspect({ colors: false });

    assert(msg !== stripColor(msg));
    assertEquals(msg2, stripColor(msg2));
  });
});
