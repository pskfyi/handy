import { assertEquals, describe, it } from "../_deps/testing.ts";
import { elideAround, elideEnd, elideMiddle, elideStart } from "./elide.ts";

const digits = "1234567890";
const len70 = digits.repeat(7);
const len90 = digits.repeat(9);

describe("elideStart", () => {
  it("defaults to len 80 and …", () =>
    assertEquals(elideStart(len90), "…" + len90.slice(90 - 79)));

  it("forwards short strings", () => assertEquals(elideStart(len70), len70));

  it("can customize maxLength", () =>
    assertEquals(elideStart(digits, { maxLength: 8 }), "…4567890"));

  it("can customize ellipses", () =>
    assertEquals(
      elideStart(len90, { ellipsis: "..." }),
      "..." + len90.slice(90 - 77),
    ));
});

describe("elideEnd", () => {
  it("defaults to len 80 and …", () =>
    assertEquals(elideEnd(len90), len90.slice(0, 79) + "…"));

  it("forwards short strings", () => assertEquals(elideEnd(len70), len70));

  it("can customize maxLength", () =>
    assertEquals(elideEnd(digits, { maxLength: 8 }), "1234567…"));

  it("can customize ellipses", () =>
    assertEquals(
      elideEnd(len90, { ellipsis: "..." }),
      len90.slice(0, 77) + "...",
    ));
});

describe("elideMiddle", () => {
  it("defaults to len 80 and …", () =>
    assertEquals(
      elideMiddle(len90),
      len90.slice(0, 40) + "…" + len90.slice(90 - 39),
    ));

  it("forwards short strings", () => assertEquals(elideMiddle(len70), len70));

  it("can customize maxLength", () =>
    assertEquals(
      elideMiddle(digits, { maxLength: 8 }),
      "1234…890",
    ));

  it("can customize ellipses", () =>
    assertEquals(
      elideMiddle(len90, { ellipsis: "..." }),
      len90.slice(0, 39) + "..." + len90.slice(90 - 38),
    ));
});

describe("elideAround", () => {
  it("defaults to len 80 and …", () =>
    assertEquals(
      elideAround(len90, 45),
      ["…" + len90.slice(45 - 39, 45 + 39) + "…", 40],
    ));

  it("forwards short strings", () =>
    assertEquals(elideAround(len70, 0), [len70, 0]));

  it("can customize maxLength", () => {
    assertEquals(elideAround(digits, 5, { maxLength: 8 }), ["…345678…", 4]);
    assertEquals(elideAround(digits, 5, { maxLength: 7 }), ["…45678…", 3]);
    assertEquals(elideAround(digits, 5, { maxLength: 6 }), ["…4567…", 3]);
    assertEquals(elideAround(digits, 5, { maxLength: 5 }), ["…567…", 2]);
  });

  it("can customize ellipses", () => {
    assertEquals(
      elideAround(len90, 45, { ellipsis: "..." }),
      ["..." + len90.slice(45 - 37, 45 + 37) + "...", 40],
    );
  });

  it("handles indices near the start", () => {
    assertEquals(elideAround(digits, 2, { maxLength: 8 }), ["1234567…", 2]);
    assertEquals(elideAround(digits, 2, { maxLength: 7 }), ["123456…", 2]);
    assertEquals(elideAround(digits, 2, { maxLength: 6 }), ["12345…", 2]);
    assertEquals(elideAround(digits, 2, { maxLength: 5 }), ["1234…", 2]);
  });

  it("handles indices near the end", () => {
    assertEquals(elideAround(digits, 7, { maxLength: 8 }), ["…4567890", 5]);
    assertEquals(elideAround(digits, 7, { maxLength: 7 }), ["…567890", 4]);
    assertEquals(elideAround(digits, 7, { maxLength: 6 }), ["…67890", 3]);
    assertEquals(elideAround(digits, 7, { maxLength: 5 }), ["…7890", 2]);
  });
});
