import { assert, assertThrows } from "@std/assert";
import { describe, test } from "@std/testing/bdd";
import { assertIgnored, assertParseResult } from "./asserts.ts";
import {
  blankLine,
  emptyLine,
  end,
  inlineWhitespace,
  line,
  newline,
  nonBlankLine,
  nonEmptyLine,
  whitespace,
} from "./named.ts";

describe("end", () => {
  test("empty string", () => assertIgnored(end.parse("")));

  test("non-empty string", () => {
    assertThrows(() => end.parse("X"));
    assertThrows(() => end.parse(" "));
  });
});

describe("whitespace", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(whitespace.parse(input), value, remainder);
  }

  test("empty string", () => void assertThrows(() => whitespace.parse("")));

  test("non-empty string", () => {
    assertParse(" ", " ");
    assertParse("\t", "\t");
    assertParse("\v", "\v");
    assertParse("\n", "\n");
    assertParse("\r", "\r");
    assertParse("\r\n", "\r\n");
    assertParse(" \t\v\n\r", " \t\v\n\r");
  });

  test("leading whitespace", () => assertParse(" \t\v\n\rX", " \t\v\n\r", "X"));

  test("leading non-whitespace", () => {
    assertThrows(() => whitespace.parse("X"));
    assertThrows(() => whitespace.parse("X\t"));
  });
});

describe("inlineWhitespace", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(inlineWhitespace.parse(input), value, remainder);
  }

  test("empty string", () =>
    void assertThrows(() => inlineWhitespace.parse("")));

  test("non-empty string", () => {
    assertParse(" ", " ");
    assertParse("\t", "\t");
    assertParse("\v", "\v");
    assertParse(" \t\v", " \t\v");
  });

  test("newlines", () => {
    assertThrows(() => inlineWhitespace.parse("\n"));
    assertThrows(() => inlineWhitespace.parse("\r"));
    assertThrows(() => inlineWhitespace.parse("\r\n"));
    assertThrows(() => inlineWhitespace.parse("\n\r"));
  });

  test("leading whitespace", () => assertParse(" \t\vX", " \t\v", "X"));

  test("leading non-whitespace", () => {
    assertThrows(() => inlineWhitespace.parse("X"));
    assertThrows(() => inlineWhitespace.parse("X\t"));
  });

  test("shorthand", () => {
    assert(inlineWhitespace === whitespace.inline);
  });
});

describe("newline", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(newline.parse(input), value, remainder);
  }

  test("newline variants", () => {
    assertParse("\n", "\n");
    assertParse("\r\n", "\r\n");
    assertParse("\r", "\r");
    assertParse("\n\r", "\n", "\r");
  });

  test("empty string", () => void assertThrows(() => newline.parse("")));

  test("non-empty string", () => {
    assertThrows(() => newline.parse("X"));
    assertThrows(() => newline.parse(" "));
    assertThrows(() => newline.parse("\t"));
  });
});

describe("blankLine", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(blankLine.parse(input), value, remainder);
  }

  test("newline variants", () => {
    assertParse("\n", "\n");
    assertParse("\r\n", "\r\n");
    assertParse("\r", "\r");
    assertParse("\n\r", "\n", "\r");
  });

  test("empty input", () => assertParse("", ""));

  test("whitespace", () => {
    assertParse(" ", " ");
    assertParse("\t", "\t");
    assertParse("\v", "\v");
    assertParse("\n", "\n");
    assertParse("\r", "\r");
    assertParse("\r\n", "\r\n");
    assertParse(" \t\v\r\n", " \t\v\r\n");
  });

  test("non-whitespace", () => {
    assertThrows(() => blankLine.parse("X\n"));
    assertThrows(() => blankLine.parse("X\r\n"));
    assertThrows(() => blankLine.parse("X\r"));
  });
});

describe("nonBlankLine", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(nonBlankLine.parse(input), value, remainder);
  }

  test("newline variants", () => {
    assertParse("X\n", "X\n");
    assertParse("X\r\n", "X\r\n");
    assertParse("X\r", "X\r");
    assertParse("X\n\r", "X\n", "\r");
  });

  test("empty input", () => void assertThrows(() => nonBlankLine.parse("")));

  test("whitespace", () => {
    assertThrows(() => nonBlankLine.parse(" "));
    assertThrows(() => nonBlankLine.parse("\t"));
    assertThrows(() => nonBlankLine.parse("\v"));
    assertThrows(() => nonBlankLine.parse("\n"));
    assertThrows(() => nonBlankLine.parse("\r"));
    assertThrows(() => nonBlankLine.parse("\r\n"));
    assertThrows(() => nonBlankLine.parse(" \t\v\r\n"));
  });

  test("non-whitespace", () => {
    assertParse("X", "X");
    assertParse("X X\n", "X X\n");
    assertParse(" X X X \r\n", " X X X \r\n");
    assertParse("  X  ", "  X  ");
  });
});

describe("emptyLine", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(emptyLine.parse(input), value, remainder);
  }

  test("newline variants", () => {
    assertParse("\n", "\n");
    assertParse("\r\n", "\r\n");
    assertParse("\r", "\r");
    assertParse("\n\r", "\n", "\r");
  });

  test("empty input", () => assertParse("", ""));

  test("non-newline whitespace", () => {
    assertThrows(() => emptyLine.parse(" "));
    assertThrows(() => emptyLine.parse("\t"));
    assertThrows(() => emptyLine.parse("\v"));
  });

  test("non-whitespace", () => {
    assertThrows(() => emptyLine.parse("X\n"));
    assertThrows(() => emptyLine.parse("X\r\n"));
    assertThrows(() => emptyLine.parse("X\r"));
  });
});

describe("nonEmptyLine", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(nonEmptyLine.parse(input), value, remainder);
  }

  test("newline variants", () => {
    assertParse("X\n", "X\n");
    assertParse("X\r\n", "X\r\n");
    assertParse("X\r", "X\r");
    assertParse("X\n\r", "X\n", "\r");
  });

  test("empty input", () => void assertThrows(() => nonEmptyLine.parse("")));

  test("non-newline whitespace", () => {
    assertParse(" ", " ");
    assertParse("\t", "\t");
    assertParse("\v", "\v");
    assertParse(" \t\v\r\n", " \t\v\r\n");
  });

  test("newlines only", () => {
    assertThrows(() => nonEmptyLine.parse("\n"));
    assertThrows(() => nonEmptyLine.parse("\r\n"));
    assertThrows(() => nonEmptyLine.parse("\r"));
  });

  test("non-whitespace", () => {
    assertParse("X", "X");
    assertParse("X X\n", "X X\n");
    assertParse(" X X X \r\n", " X X X \r\n");
    assertParse("  X  ", "  X  ");
  });
});

describe("line", () => {
  function assertParse(input: string, value: string, remainder = ""): void {
    assertParseResult(line.parse(input), value, remainder);
  }

  test("newline variants", () => {
    assertParse("\n", "\n");
    assertParse("\r\n", "\r\n");
    assertParse("\r", "\r");
    assertParse("\n\r", "\n", "\r");
  });

  test("empty input", () => assertParse("", ""));

  test("whitespace", () => {
    assertParse(" ", " ");
    assertParse("\t", "\t");
    assertParse("\v", "\v");
    assertParse("\n", "\n");
    assertParse("\r", "\r");
    assertParse("\r\n", "\r\n");
    assertParse(" \t\v\r\n", " \t\v\r\n");
  });

  test("non-whitespace", () => {
    assertParse("X", "X");
    assertParse("X X\n", "X X\n");
    assertParse(" X X X \r\n", " X X X \r\n");
    assertParse("  X  ", "  X  ");
  });

  test("shorthands", () => {
    assert(line.blank === blankLine);
    assert(line.nonBlank === nonBlankLine);
    assert(line.empty === emptyLine);
    assert(line.nonEmpty === nonEmptyLine);
  });
});
