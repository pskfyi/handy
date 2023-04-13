import { smallest } from "../collection/smallest.ts";
import {
  assert,
  assertEquals,
  assertThrows,
  beforeEach,
  describe,
  it,
} from "../deps/testing.ts";
import { DirectedGraph } from "./DirectedGraph.ts";
import { VertexError } from "./errors.ts";

describe("DirectedGraph", () => {
  let graph: DirectedGraph<string>;

  beforeEach(() => {
    graph = new DirectedGraph();
  });

  it("is merged with a namespace containing related types", () => {
    const _path: DirectedGraph.Path<string> = ["a", "b", "c"];
    const _visitor: DirectedGraph.Visitor<string, void> = () => {};
    const _options: DirectedGraph.WalkOptions = { includeSource: true };
  });

  it("returns vertices and edges in Sets", () => {
    assert(graph.vertices instanceof Set);
    assert(graph.edges instanceof Set);
  });

  it("has chainable add and remove methods", () => {
    assert(graph.add("a").remove("a") === graph);
  });

  it("adds vertices", () => {
    assert(!graph.vertices.has("a"));
    assert(graph.add("a").vertices.has("a"));
  });

  it("adds edges", () => {
    assert(!graph.vertices.has("a"));
    assert(!graph.vertices.has("b"));

    graph.add("a", "b").add("a", "c");
    assert(graph.vertices.has("a"));
    assert(graph.vertices.has("b"));
    assert(graph.vertices.has("c"));
    assert(graph.edgesFrom("a").has("b"));
    assert(graph.edgesFrom("a").has("c"));
    assert(graph.edgesFrom("a").size === 2);
    assert(graph.edgesTo("b").has("a"));
    assert(graph.edgesTo("b").size === 1);
    assert(graph.edgesTo("c").has("a"));
    assert(graph.edgesTo("c").size === 1);
  });

  it("deduplicates edges", () => {
    graph.add("a", "b").add("a", "b");
    assert(graph.edges.size === 1);
    assert(graph.edgesFrom("a").size === 1);
    assert(graph.edgesTo("b").size === 1);
  });

  it("removes vertices", () => {
    assert(graph.add("a").vertices.has("a"));
    assert(!graph.remove("a").vertices.has("a"));
  });

  it("removes edges", () => {
    graph.add("a", "b").remove("a", "b");
    assert(graph.vertices.has("a"));
    assert(graph.vertices.has("b"));
    assert(!graph.edgesFrom("a").has("b"));
    assert(!graph.edgesTo("b").has("a"));
  });

  it("removes edges when it removes a vertex", () => {
    graph.add("a", "b").add("a", "c").remove("a");
    assert(!graph.vertices.has("a"));
    assert(graph.vertices.has("b"));
    assert(graph.vertices.has("c"));
    assert(!graph.edgesTo("b").has("a"));
    assert(!graph.edgesTo("c").has("a"));
  });

  it("returns new vertices and edges", () => {
    const vertices = graph.add("a", "b").vertices;
    vertices.delete("a");
    assert(graph.vertices.has("a"));
    assert(!vertices.has("a"));

    const edgesFromA = graph.edgesFrom("a");
    edgesFromA.delete("b");
    assert(graph.edgesFrom("a").has("b"));
    assert(!edgesFromA.has("b"));
  });

  it("constructs a new graph from an existing one", () => {
    graph.add("a", "b");
    const clone = new DirectedGraph(graph);
    assert(clone.vertices.has("a"));
    assert(clone.vertices.has("b"));
    assert(clone.edgesFrom("a").has("b"));
    assert(clone.edgesTo("b").has("a"));

    clone.remove("a");
    assert(graph.vertices.has("a"));
    assert(!clone.vertices.has("a"));

    clone.add("c", "d");
    assert(!graph.vertices.has("c"));
    assert(!graph.vertices.has("d"));
  });

  it("throws a custom error when referring to non-existent vertices", () => {
    assertThrows(() => graph.remove("a"), VertexError, " a");
    assertThrows(() => graph.remove("z"), VertexError, " z");
    assertThrows(() => graph.edgesFrom("q"), VertexError, " q");
    assertThrows(() => graph.edgesFrom("x"), VertexError, " x");
  });

  describe("graph.walk", () => {
    it("traverses the graph depth-first from a source vertex", () => {
      graph.add("a", ["b", "c", "d"]).add("b", ["e", "f"]);
      const visited: string[] = [];
      graph.walk("a", (vertex) => void visited.push(vertex));
      assertEquals(visited, ["b", "e", "f", "c", "d"]);
    });

    it("can traverses the graph in reverse", () => {
      graph.add("a", "z").add("b", "z").add("c", "z");
      const visited: string[] = [];
      graph.walk("z", (vertex) => void visited.push(vertex), { reverse: true });
      assertEquals(visited, ["a", "b", "c"]);
    });

    it("can return a value when traversing the graph", () => {
      graph.add("a", ["b", "c", "d"]);
      const visited: string[] = [];
      const result = graph
        .walk("a", (v) => v === "c" ? "stopped at c!" : void visited.push(v));
      assertEquals(visited, ["b"]);
      assertEquals(result, "stopped at c!");
    });

    it("can include the source vertex when traversing the graph", () => {
      graph.add("a", ["b", "c", "d"]);
      const visited: string[] = [];
      graph.walk(
        "a",
        (vertex) => void visited.push(vertex),
        { includeSource: true },
      );
      assertEquals(visited, ["a", "b", "c", "d"]);
    });

    it("can traverse the graph breadth-first", () => {
      graph.add("a", ["b", "c", "d"]).add("b", ["e", "f"]);
      const visited: string[] = [];
      graph.walk("a", (v) => void visited.push(v), { breadthFirst: true });
      assertEquals(visited, ["b", "c", "d", "e", "f"]);
    });

    it("skips vertices that have already been visited", () => {
      graph.add("a", "b").add("b", "a");
      const visited: string[] = [];
      graph.walk("a", (v) => void visited.push(v));
      assertEquals(visited, ["b"]);
    });

    it("can choose not to skip visited vertices", () => {
      graph.add("a", "b").add("b", "a");
      const visited: string[] = [];
      graph.walk(
        "a",
        (v) => visited.push(v) > 8 ? "stop" : undefined,
        { skipVisited: false },
      );
      assertEquals(visited, ["b", "a", "b", "a", "b", "a", "b", "a", "b"]);

      const visited2: string[] = [];
      graph.walk(
        "a",
        (v) => visited2.push(v) > 8 ? "stop" : undefined,
        { skipVisited: false, breadthFirst: true },
      );
      assertEquals(visited2, ["b", "a", "b", "a", "b", "a", "b", "a", "b"]);
    });
  });

  it("finds paths between two vertices", () => {
    graph.add("a", "b").add("b", "c").add("c", "d");
    assertEquals(graph.paths("a", "b"), [["a", "b"]]);
    assertEquals(graph.paths("a", "c"), [["a", "b", "c"]]);
    assertEquals(graph.paths("a", "d"), [["a", "b", "c", "d"]]);

    graph.add("a", "c");
    assertEquals(graph.paths("a", "b"), [["a", "b"]]);
    assertEquals(graph.paths("a", "c"), [["a", "b", "c"], ["a", "c"]]);
    assertEquals(graph.paths("a", "d"), [
      ["a", "b", "c", "d"],
      ["a", "c", "d"],
    ]);
  });

  describe("integration: collection.smallest", () => {
    it("finds the shortest paths between two vertices", () => {
      type T = string;
      const graph = new DirectedGraph<T>();
      const sm = (a: T, b: T) => smallest(graph.paths(a, b));

      graph.add("a", "b").add("b", "c").add("c", "d");
      assertEquals(sm("a", "b"), [["a", "b"]]);
      assertEquals(sm("a", "c"), [["a", "b", "c"]]);
      assertEquals(sm("a", "d"), [["a", "b", "c", "d"]]);

      graph.add("a", "c");
      assertEquals(sm("a", "b"), [["a", "b"]]);
      assertEquals(sm("a", "c"), [["a", "c"]]);
      assertEquals(sm("a", "d"), [["a", "c", "d"]]);

      graph.add("b", "d");
      assertEquals(sm("a", "b"), [["a", "b"]]);
      assertEquals(sm("a", "c"), [["a", "c"]]);
      assertEquals(sm("a", "d"), [["a", "b", "d"], ["a", "c", "d"]]);
    });
  });
});
