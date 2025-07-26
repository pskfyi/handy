import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { flowchart } from "./flowchart.ts";

it("accepts edges", () => {
  assertEquals(
    flowchart([["a", "b"]]),
    "```mermaid\nflowchart LR\n    a --> b\n```",
  );

  assertEquals(
    flowchart(new Set([["c", "d"]])),
    "```mermaid\nflowchart LR\n    c --> d\n```",
  );
});

describe("direction option", () => {
  it("defaults to LR", () =>
    assertEquals(
      flowchart([]),
      "```mermaid\nflowchart LR\n\n```",
    ));

  it("is configurable", () =>
    assertEquals(
      flowchart([], { direction: "TD" }),
      "```mermaid\nflowchart TD\n\n```",
    ));
});

describe("other options", () => {
  it("can render a title", () => {
    assertEquals(
      flowchart([], { title: "Hello World" }),
      "```mermaid\n---\ntitle: Hello World\n---\nflowchart LR\n\n```",
    );
  });
});
