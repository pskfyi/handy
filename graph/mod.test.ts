import { smallest } from "../collection/smallest.ts";
import { assert, assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it, test } from "@std/testing/bdd";
import { DirectedGraph, VertexError } from "./mod.ts";

let graph: DirectedGraph<string>;

function assertVertices(
  graph: DirectedGraph<string>,
  ...vertices: string[]
): void {
  assertEquals(graph.vertices, new Set(vertices));
}

function assertEdges(
  graph: DirectedGraph<string>,
  ...edges: [string, string][]
): void {
  assertEquals(graph.edges, new Set(edges));
}

beforeEach(() => {
  graph = new DirectedGraph();
});

describe("namespace", () => {
  it("includes related types", () => {
    const _vertex: DirectedGraph.Vertex<string> = "a";
    const _vertices: DirectedGraph.Vertices<string> = new Set("a");
    const _edge: DirectedGraph.Edge<string> = ["a", "b"];
    const _path: DirectedGraph.Path<string> = ["a", "b", "c"];
    const _visitor: DirectedGraph.Visitor<string, void> = () => {};
    const _options: DirectedGraph.WalkOptions = { includeSource: true };
  });
});

describe("constructor", () => {
  it("can clone a graph", () => {
    graph.add(["a", "b"]);
    const clone = new DirectedGraph(graph);
    assertVertices(clone, "a", "b");
    assertEdges(clone, ["a", "b"]);

    clone.remove("a");
    assertVertices(graph, "a", "b");
    assertVertices(clone, "b");

    clone.add(["c", "d"]);
    assertVertices(graph, "a", "b");
    assertEdges(graph, ["a", "b"]);
    assertVertices(clone, "b", "c", "d");
    assertEdges(clone, ["c", "d"]);
  });
});

describe("properties", () => {
  test("vertices", () => assert(graph.vertices instanceof Set));

  test("edges", () => assert(graph.edges instanceof Set));

  test("roots", () => {
    graph.add(["a", "b", "c", "d"]);
    assertEquals(graph.roots, new Set("a"));
  });

  test("leaves", () => {
    graph.add(["a", "b", "c", "d"]);
    assertEquals(graph.leaves, new Set(["d"]));
  });

  test("isCyclic", () => {
    graph.add(["a", "b", "c", "d"]);
    assert(!graph.isCyclic);

    assert(new DirectedGraph(graph).add(["d", "a"]).isCyclic);
    assert(new DirectedGraph(graph).add(["d", "c"]).isCyclic);
    assert(new DirectedGraph(graph).add(["d", "b"]).isCyclic);
    assert(new DirectedGraph<string>().add(["y", "z", "y"]).isCyclic);
    assert(!new DirectedGraph(graph).add(["a", "c"]).isCyclic);
  });

  test("isTree", () => {
    graph.add(["a", "b", "c", "d"], ["a", "e"], ["b", "f"]);
    assert(graph.isTree);

    assert(!new DirectedGraph(graph).add(["d", "a"]).isTree);
    assert(!new DirectedGraph(graph).add(["a", "c"]).isTree);
    assert(!new DirectedGraph(graph).add(["y", "z", "y"]).isTree);
  });

  test("isForest", () => {
    graph.add(["a", "b", "c", "d"], ["h", "i"], ["v", "w", "x"]);
    assert(graph.isForest);

    assert(!new DirectedGraph(graph).add(["b", "i"]).isForest);
    assert(new DirectedGraph(graph).add(["x", "h"]).isForest);
    assert(new DirectedGraph(graph).add(["d", "v"]).isForest);
  });

  test("custom inspect", () => {
    graph.add(["a", "b", "c", "d"]);
    assertEquals(Deno.inspect(graph), "DirectedGraph(4 vertices, 3 edges)");
  });

  test("iterator of vertices", () => {
    graph.add(["a", "b", "c", "d"]);
    assertEquals([...graph], ["a", "b", "c", "d"]); // yields vertices
  });
});

it("has chainable methods", () => assert(graph.add("a").remove("a") === graph));

describe("graph.has()", () => {
  test("vertex", () => {
    assert(!graph.has("a"));
    assert(graph.add("a").has("a"));
  });

  test("edge", () => {
    assert(!graph.has(["a", "b"]));
    assert(graph.add(["a", "b"]).has(["a", "b"]));
  });

  test("path", () => {
    assert(!graph.has(["a", "b", "c", "d"]));
    assert(graph.add(["a", "b", "c", "d"]).has(["a", "b", "c", "d"]));
  });

  test("length-1 path", () => {
    assert(graph.add("a").has(["a"])); // treat as vertex only
  });

  test("mixed inputs", () => {
    assert(!graph.has(["a", "b"], "c", ["d", "e", "f"]));
    assert(
      graph.add(["a", "b"], "c", ["d", "e", "f"])
        .has(["a", "b"], "c", ["d", "e", "f"]),
    );
  });
});

describe("graph.add()", () => {
  test("vertices", () => assert(graph.add("a").has("a")));

  test("edges", () => {
    graph.add(["a", "b"], ["a", "c"]);
    assertVertices(graph, "a", "b", "c");
    assertEdges(graph, ["a", "b"], ["a", "c"]);
  });

  it("deduplicates edges", () => {
    graph.add(["a", "b"], ["a", "b"]);
    assertVertices(graph, "a", "b");
    assertEdges(graph, ["a", "b"]);
  });

  test("paths", () => {
    graph.add(["a", "b", "c"]);
    assertVertices(graph, "a", "b", "c");
    assertEdges(graph, ["a", "b"], ["b", "c"]);
  });

  test("length-1 paths", () => {
    graph.add(["a"]);
    assertVertices(graph, "a");
    assertEdges(graph); // treated as vertex only
  });

  test(" mixed inputs", () => {
    graph.add(["a", "b"], "c", ["d", "e", "f"]);
    assertVertices(graph, "a", "b", "c", "d", "e", "f");
    assertEdges(graph, ["a", "b"], ["d", "e"], ["e", "f"]);
  });
});

describe("graph.remove()", () => {
  test("vertices", () => {
    assert(graph.add("a").has("a"));
    assert(!graph.remove("a").has("a"));
  });

  test("edges", () => {
    graph.add(["a", "b"]).remove(["a", "b"]);
    assertVertices(graph, "a", "b");
    assertEdges(graph);
  });

  test("paths", () => {
    graph.add(["a", "b", "c", "d", "e"]).remove(["b", "c", "d"]);
    assertVertices(graph, "a", "b", "c", "d", "e");
    assertEdges(graph, ["a", "b"], ["d", "e"]);
  });

  test("length-1 paths", () => {
    graph.add(["a", "b", "c"]).remove(["b"]);
    assertVertices(graph, "a", "b", "c");
    assertEdges(graph, ["a", "b"], ["b", "c"]);
  });

  test("mixed inputs", () => {
    graph.add(["a", "b", "c", "d", "e"], "f").remove(["a", "b", "c"], "e");
    assertVertices(graph, "a", "b", "c", "d", "f");
    assertEdges(graph, ["c", "d"]);
  });

  it("cascade removes edges", () => {
    graph.add(["a", "b"], ["a", "c"]).remove("a");
    assertVertices(graph, "b", "c");
    assertEdges(graph);
  });
});

it("returns new vertices", () => {
  const vertices = graph.add(["a", "b"]).vertices;
  vertices.delete("a");
  assert(graph.has("a"));
  assert(!vertices.has("a"));
});

it("returns new edges", () => {
  const edgesFromA = graph.add(["a", "b"]).edgesFrom("a");
  edgesFromA.delete("b");
  assert(graph.edgesFrom("a").has("b"));
  assert(!edgesFromA.has("b"));
});

it("throws on absent vertex", () => {
  assertThrows(() => graph.remove("a"), VertexError, " a");
  assertThrows(() => graph.remove("z"), VertexError, " z");
  assertThrows(() => graph.edgesFrom("q"), VertexError, " q");
  assertThrows(() => graph.edgesFrom("x"), VertexError, " x");
  assertThrows(() => graph.hasCycle("w"), VertexError, " w");
  assertThrows(() => graph.subgraph(["a"]), VertexError, " a");
});

describe("graph.walk", () => {
  it("traverses depth-first", () => {
    graph.add(["a", "b", "e"], ["a", "c"], ["a", "d"], ["b", "f"]);
    const visited: string[] = [];
    graph.walk("a", (vertex) => void visited.push(vertex));
    assertEquals(visited, ["b", "e", "f", "c", "d"]);
  });

  it("can walk in reverse", () => {
    graph.add(["a", "z"], ["b", "z"], ["c", "z"]);
    const visited: string[] = [];
    graph.walk("z", (vertex) => void visited.push(vertex), { reverse: true });
    assertEquals(visited, ["a", "b", "c"]);
  });

  it("can return a value", () => {
    graph.add(["a", "b"], ["a", "c"], ["a", "d"]);
    const visited: string[] = [];
    const result = graph
      .walk("a", (v) => v === "c" ? "stopped at c!" : void visited.push(v));
    assertEquals(visited, ["b"]);
    assertEquals(result, "stopped at c!");
  });

  it("can visit the source", () => {
    graph.add(["a", "b"], ["a", "c"], ["a", "d"]);
    const visited: string[] = [];
    graph.walk(
      "a",
      (vertex) => void visited.push(vertex),
      { includeSource: true },
    );
    assertEquals(visited, ["a", "b", "c", "d"]);
  });

  it("can walk breadth-first", () => {
    graph.add(["a", "b", "e"], ["a", "c"], ["a", "d"], ["b", "f"]);
    const visited: string[] = [];
    graph.walk("a", (v) => void visited.push(v), { breadthFirst: true });
    assertEquals(visited, ["b", "c", "d", "e", "f"]);
  });

  it("skips visited vertices", () => {
    graph.add(["a", "b", "a"]);
    const visited: string[] = [];
    graph.walk("a", (v) => void visited.push(v));
    assertEquals(visited, ["b"]);
  });

  it("can revisit vertices", () => {
    graph.add(["a", "b", "a"]);
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

it("finds paths", () => {
  graph.add(["a", "b", "c", "d"]);
  assertEquals(graph.paths("a", "b"), [["a", "b"]]);
  assertEquals(graph.paths("a", "c"), [["a", "b", "c"]]);
  assertEquals(graph.paths("a", "d"), [["a", "b", "c", "d"]]);

  graph.add(["a", "c"]);
  assertEquals(graph.paths("a", "b"), [["a", "b"]]);
  assertEquals(graph.paths("a", "c"), [["a", "b", "c"], ["a", "c"]]);
  assertEquals(graph.paths("a", "d"), [
    ["a", "b", "c", "d"],
    ["a", "c", "d"],
  ]);
});

it("detects cycles", () => {
  graph.add(["a", "b", "c"]);
  assert(!graph.hasCycle("a"));
  assert(!graph.hasCycle("b"));
  assert(!graph.hasCycle("c"));

  graph.add(["c", "a"]);
  assert(graph.hasCycle("a"));
  assert(graph.hasCycle("b"));
  assert(graph.hasCycle("c"));
});

it("creates subgraphs", () => {
  graph.add(["a", "b", "c", "d"]);
  const subgraph = graph.subgraph(["a", "b", "c"]);
  assertVertices(subgraph, "a", "b", "c");
  assertEdges(subgraph, ["a", "b"], ["b", "c"]);

  const subgraph2 = graph.subgraph(["a", "b", "c", "d"]);
  assertVertices(subgraph2, ...graph.vertices);
  assertEdges(subgraph2, ...graph.edges);

  const subgraph3 = graph.subgraph(["b", "d"]);
  assertVertices(subgraph3, "b", "d");
  assertEdges(subgraph3);
});

describe("integration: collection.smallest", () => {
  it("gets shortest path", () => {
    type T = string;
    const graph = new DirectedGraph<T>();
    const sm = (a: T, b: T) => smallest(graph.paths(a, b));

    graph.add(["a", "b", "c", "d"]);
    assertEquals(sm("a", "b"), [["a", "b"]]);
    assertEquals(sm("a", "c"), [["a", "b", "c"]]);
    assertEquals(sm("a", "d"), [["a", "b", "c", "d"]]);

    graph.add(["a", "c"]);
    assertEquals(sm("a", "b"), [["a", "b"]]);
    assertEquals(sm("a", "c"), [["a", "c"]]);
    assertEquals(sm("a", "d"), [["a", "c", "d"]]);

    graph.add(["b", "d"]);
    assertEquals(sm("a", "b"), [["a", "b"]]);
    assertEquals(sm("a", "c"), [["a", "c"]]);
    assertEquals(sm("a", "d"), [["a", "b", "d"], ["a", "c", "d"]]);
  });
});
