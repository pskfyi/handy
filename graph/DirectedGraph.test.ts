import { smallest } from "../collection/smallest.ts";
import {
  assert,
  assertEquals,
  assertThrows,
  beforeEach,
  describe,
  it,
} from "../_deps/testing.ts";
import { DirectedGraph } from "./DirectedGraph.ts";
import { VertexError } from "./errors.ts";

describe("DirectedGraph", () => {
  let graph: DirectedGraph<string>;

  beforeEach(() => {
    graph = new DirectedGraph();
  });

  describe("namespace", () => {
    it("includes its related types", () => {
      const _path: DirectedGraph.Path<string> = ["a", "b", "c"];
      const _visitor: DirectedGraph.Visitor<string, void> = () => {};
      const _options: DirectedGraph.WalkOptions = { includeSource: true };
    });
  });

  describe("constructor", () => {
    it("can clone a graph", () => {
      graph.add(["a", "b"]);
      const clone = new DirectedGraph(graph);
      assert(clone.has("a", "b"));
      assert(clone.edgesFrom("a").has("b"));
      assert(clone.edgesTo("b").has("a"));

      clone.remove("a");
      assert(graph.has("a"));
      assert(!clone.has("a"));

      clone.add(["c", "d"]);
      assert(!graph.has("c", "d"));
    });
  });

  describe("properties", () => {
    it("has vertices", () => assert(graph.vertices instanceof Set));

    it("has edges", () => assert(graph.edges instanceof Set));

    it("has root vertices", () => {
      graph.add(["a", "b", "c", "d"]);
      assertEquals(graph.roots, new Set("a"));
    });

    it("has leaf vertices", () => {
      graph.add(["a", "b", "c", "d"]);
      assertEquals(graph.leaves, new Set(["d"]));
    });

    it("can tell if it's cyclic", () => {
      graph.add(["a", "b", "c", "d"]);
      assert(!graph.isCyclic);

      assert(new DirectedGraph(graph).add(["d", "a"]).isCyclic);
      assert(new DirectedGraph(graph).add(["d", "c"]).isCyclic);
      assert(new DirectedGraph(graph).add(["d", "b"]).isCyclic);
      assert(new DirectedGraph<string>().add(["y", "z", "y"]).isCyclic);
      assert(!new DirectedGraph(graph).add(["a", "c"]).isCyclic);
    });

    it("can tell if it's a tree", () => {
      graph.add(["a", "b", "c", "d"], ["a", "e"], ["b", "f"]);
      assert(graph.isTree);

      assert(!new DirectedGraph(graph).add(["d", "a"]).isTree);
      assert(!new DirectedGraph(graph).add(["a", "c"]).isTree);
      assert(!new DirectedGraph(graph).add(["y", "z", "y"]).isTree);
    });

    it("can tell if it's a forest", () => {
      graph.add(["a", "b", "c", "d"], ["h", "i"], ["v", "w", "x"]);
      assert(graph.isForest);

      assert(!new DirectedGraph(graph).add(["b", "i"]).isForest);
      assert(new DirectedGraph(graph).add(["x", "h"]).isForest);
      assert(new DirectedGraph(graph).add(["d", "v"]).isForest);
    });

    it("has custom console.log output", () => {
      graph.add(["a", "b", "c", "d"]);
      assertEquals(Deno.inspect(graph), "DirectedGraph(4 vertices, 3 edges)");
    });

    it("is iterable, yielding vertices", () => {
      graph.add(["a", "b", "c", "d"]);
      assertEquals([...graph], ["a", "b", "c", "d"]);
    });
  });

  it("has chainable add/remove methods", () =>
    assert(graph.add("a").remove("a") === graph));

  describe("graph.has()", () => {
    it("accepts a vertex", () => {
      assert(!graph.has("a"));
      assert(graph.add("a").has("a"));
    });

    it("accepts an edge", () => {
      assert(!graph.has(["a", "b"]));
      assert(graph.add(["a", "b"]).has(["a", "b"]));
    });

    it("accepts a path", () => {
      assert(!graph.has(["a", "b", "c", "d"]));
      assert(graph.add(["a", "b", "c", "d"]).has(["a", "b", "c", "d"]));
    });

    it("treats a single-element path as a vertex", () => {
      assert(graph.add("a").has(["a"]));
    });

    it("accepts multiple inputs", () => {
      assert(!graph.has(["a", "b"], "c", ["d", "e", "f"]));
      assert(
        graph.add(["a", "b"], "c", ["d", "e", "f"])
          .has(["a", "b"], "c", ["d", "e", "f"]),
      );
    });
  });

  describe("graph.add()", () => {
    it("adds vertices", () => assert(graph.add("a").has("a")));

    it("adds edges", () => {
      graph.add(["a", "b"], ["a", "c"]);
      assertEquals(graph.vertices, new Set(["a", "b", "c"]));
      assertEquals(graph.edges, new Set([["a", "b"], ["a", "c"]]));
    });

    it("deduplicates edges", () => {
      graph.add(["a", "b"], ["a", "b"]);
      assertEquals(graph.vertices, new Set(["a", "b"]));
      assertEquals(graph.edges, new Set([["a", "b"]]));
    });

    it("adds paths", () => {
      graph.add(["a", "b", "c"]);
      assertVertices(graph, "a", "b", "c");
      assertEdges(graph, ["a", "b"], ["b", "c"]);
    });

    it("treats a single-element path as a vertex", () => {
      graph.add(["a"]);
      assertVertices(graph, "a");
      assertEdges(graph);
    });

    it("handles multiple inputs", () => {
      graph.add(["a", "b"], "c", ["d", "e", "f"]);
      assertVertices(graph, "a", "b", "c", "d", "e", "f");
      assertEdges(graph, ["a", "b"], ["d", "e"], ["e", "f"]);
    });
  });

  it("removes vertices", () => {
    assert(graph.add("a").has("a"));
    assert(!graph.remove("a").has("a"));
  });

  it("removes edges", () => {
    graph.add(["a", "b"]).remove("a", "b");
    assert(graph.has("a", "b"));
    assert(!graph.edgesFrom("a").has("b"));
    assert(!graph.edgesTo("b").has("a"));
  });

  it("removes edges of a removed vertex", () => {
    graph.add(["a", "b"], ["a", "c"]).remove("a");
    assert(!graph.has("a"));
    assert(graph.has("b", "c"));
    assert(!graph.edgesTo("b").has("a"));
    assert(!graph.edgesTo("c").has("a"));
  });

  it("returns new vertices and edges", () => {
    const vertices = graph.add(["a", "b"]).vertices;
    vertices.delete("a");
    assert(graph.has("a"));
    assert(!vertices.has("a"));

    const edgesFromA = graph.edgesFrom("a");
    edgesFromA.delete("b");
    assert(graph.edgesFrom("a").has("b"));
    assert(!edgesFromA.has("b"));
  });

  it("throws custom error on absent vertex", () => {
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

    it("can visit the source vertex", () => {
      graph.add(["a", "b"], ["a", "c"], ["a", "d"]);
      const visited: string[] = [];
      graph.walk(
        "a",
        (vertex) => void visited.push(vertex),
        { includeSource: true },
      );
      assertEquals(visited, ["a", "b", "c", "d"]);
    });

    it("can traverse breadth-first", () => {
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

  it("finds paths between vertices", () => {
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

  it("identifies if a vertex has cycles", () => {
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
    assertEquals(subgraph.vertices, new Set(["a", "b", "c"]));
    assertEquals(subgraph.edges, new Set([["a", "b"], ["b", "c"]]));

    const subgraph2 = graph.subgraph(["a", "b", "c", "d"]);
    assertEquals(subgraph2.vertices, graph.vertices);
    assertEquals(subgraph2.edges, graph.edges);

    const subgraph3 = graph.subgraph(["b", "d"]);
    assertEquals(subgraph3.vertices, new Set(["b", "d"]));
    assertEquals(subgraph3.edges, new Set([]));
  });

  describe("integration: collection.smallest", () => {
    it("gets shortest paths between vertices", () => {
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
});
