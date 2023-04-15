import { VertexError } from "./errors.ts";

type N<T> = NonNullable<T>;
type I<T> = Iterable<NonNullable<T>>;

export type Path<T> = [N<T>, ...N<T>[]];
export type Visitor<T, R> = (vertex: N<T>, path: Path<T>) => R;
export type WalkOptions = {
  breadthFirst?: boolean;
  includeSource?: boolean;
  reverse?: boolean;
  skipVisited?: boolean;
};

export declare namespace DirectedGraph {
  export { Path, Visitor, WalkOptions };
}

export class DirectedGraph<T> {
  #vertices = new Set<N<T>>();
  #edgesTo = new Map<N<T>, Set<N<T>>>();
  #edgesFrom = new Map<N<T>, Set<N<T>>>();

  constructor(
    graphLike?: {
      vertices?: I<T>;
      edges?: Iterable<[N<T>, N<T>]>;
    },
  ) {
    if (graphLike) {
      if (graphLike.vertices) {
        for (const vertex of graphLike.vertices) {
          this.#vertices.add(vertex);
        }
      }

      if (graphLike.edges) {
        for (const [source, target] of graphLike.edges) {
          this.#addVertex(source);
          this.#addEdge(source, target);
        }
      }
    }
  }

  get vertices() {
    return new Set(this.#vertices);
  }

  get edges() {
    const edges = new Set<[N<T>, N<T>]>();

    for (const [source, targets] of this.#edgesFrom) {
      for (const target of targets) {
        edges.add([source, target]);
      }
    }

    return edges;
  }

  get roots() {
    return new Set(
      [...this.#vertices]
        .filter((vertex) => this.#edgesTo.get(vertex)!.size === 0),
    );
  }

  get leaves() {
    return new Set(
      [...this.#vertices]
        .filter((vertex) => this.#edgesFrom.get(vertex)!.size === 0),
    );
  }

  /** Mutates `visited`, providing information about which nodes were visited.
   * When `false` is returned, the `visited` nodes can be safely removed from
   * further consideration. */
  #hasCycle(vertex: N<T>, visited: Set<N<T>>) {
    if (visited.has(vertex)) return true;
    visited.add(vertex);

    for (const child of this.#edgesFrom.get(vertex)!) {
      if (this.#hasCycle(child, visited)) return true;
    }

    visited.delete(vertex);
    return false;
  }

  hasCycle(vertex: N<T>): boolean {
    this.#assertVertex(vertex);
    return this.#hasCycle(vertex, new Set());
  }

  get isCyclic() {
    const visited = new Set<N<T>>();

    for (const vertex of this) {
      if (visited.has(vertex)) continue;
      if (this.#hasCycle(vertex, visited)) return true;
    }

    return false;
  }

  #isTree(root: N<T>) {
    const visited = new Set<N<T>>();
    const stack = [root];

    while (stack.length) {
      const current = stack.pop()!;
      if (visited.has(current)) return false;
      visited.add(current);
      stack.push(...this.#edgesFrom.get(current)!);
    }

    return true;
  }

  get isTree() {
    const roots = this.roots;
    if (roots.size !== 1) return false;
    if (this.isCyclic) return false;

    return this.#isTree(roots.values().next().value);
  }

  get isForest() {
    if (this.isCyclic) return false;

    const roots: Set<N<T>> = new Set();

    for (const vertex of this) {
      const edgesTo = this.#edgesTo.get(vertex)!;
      if (edgesTo.size > 1) return false;
      if (edgesTo.size === 0) roots.add(vertex);
    }

    for (const root of roots) {
      if (!this.#isTree(root)) return false;
    }

    return true;
  }

  #assertVertex(vertex: N<T>) {
    if (!this.#vertices.has(vertex)) throw new VertexError(vertex);
  }

  has(vertex: N<T>) {
    return this.#vertices.has(vertex);
  }

  /** Returns all vertices that have an edge to the given vertex. */
  edgesTo(target: N<T>) {
    this.#assertVertex(target);

    return new Set(this.#edgesTo.get(target)!);
  }

  /** Returns all vertices that have an edge from the given vertex. */
  edgesFrom(source: N<T>) {
    this.#assertVertex(source);

    return new Set(this.#edgesFrom.get(source)!);
  }

  #addVertex(vertex: N<T>) {
    this.#vertices.add(vertex);
    !this.#edgesFrom.has(vertex) && this.#edgesFrom.set(vertex, new Set());
    !this.#edgesTo.has(vertex) && this.#edgesTo.set(vertex, new Set());
  }

  #addEdge(source: N<T>, target: N<T>) {
    this.#addVertex(source);
    this.#addVertex(target);
    this.#edgesFrom.get(source)!.add(target);
    this.#edgesTo.get(target)!.add(source);
  }

  #addEdges(source: N<T>, targets: I<T>) {
    this.#addVertex(source);
    for (const target of targets) {
      this.#addVertex(target);
      this.#edgesFrom.get(source)!.add(target);
      this.#edgesTo.get(target)!.add(source);
    }
  }

  add(vertex: N<T>): this;
  /** Add vertices to the graph if they don't exist, and add edges from the
   * source vertex to the target vertices.
   *
   * @example
   * const graph = new DirectedGraph<string>();
   * graph.add("a", "b"); // add a, b, a -> b
   * graph.add("d", ["e", "f"]); // add d, e, f, d -> e, d -> f
   */
  add(source: N<T>, targets: N<T> | I<T>): this;
  add(source: N<T>, targets?: N<T> | I<T>) {
    targets === undefined
      ? this.#addVertex(source)
      : typeof targets === "object" && Symbol.iterator in targets
      ? this.#addEdges(source, targets)
      : this.#addEdge(source, targets);

    return this;
  }

  #removeVertex(vertex: N<T>) {
    this.#assertVertex(vertex);
    this.#vertices.delete(vertex);

    for (const child of this.#edgesFrom.get(vertex)!) {
      this.#edgesTo.get(child)!.delete(vertex);
    }
    this.#edgesFrom.delete(vertex);

    for (const parent of this.#edgesTo.get(vertex)!) {
      this.#edgesFrom.get(parent)!.delete(vertex);
    }
    this.#edgesTo.delete(vertex);

    return this;
  }

  #removeEdge(source: N<T>, target: N<T>) {
    this.#assertVertex(source);
    this.#assertVertex(target);

    this.#edgesFrom.get(source)!.delete(target);
    this.#edgesTo.get(target)!.delete(source);
  }

  #removeEdges(source: N<T>, targets: I<T>) {
    this.#assertVertex(source);

    for (const target of targets) {
      this.#assertVertex(target);

      this.#edgesFrom.get(source)!.delete(target);
      this.#edgesTo.get(target)!.delete(source);
    }
  }

  remove(vertex: N<T>): this;
  /** Remove edges from the source vertex to the target vertices.
   *
   * @example
   * const graph = new DirectedGraph<string>();
   * graph.add("a", "b"); // add a, b, a -> b
   * graph.remove("a", "b"); // remove a -> b
   */
  remove(source: N<T>, targets: N<T> | I<T>): this;
  remove(source: N<T>, targets?: N<T> | I<T>) {
    targets === undefined
      ? this.#removeVertex(source)
      : typeof targets === "object" && Symbol.iterator in targets
      ? this.#removeEdges(source, targets)
      : this.#removeEdge(source, targets);

    return this;
  }

  #walkBreadthFirst<R>(
    source: N<T>,
    path: Path<T>,
    visitor: Visitor<T, R>,
    reverse = false,
    skipVisited = true,
  ): R | undefined {
    const edges = reverse ? this.#edgesTo : this.#edgesFrom;
    const queue = [...edges.get(source)!];

    while (queue.length > 0) {
      const target = queue.shift()!;

      if (skipVisited && path.includes(target)) continue;

      const p: Path<T> = [...path, target];

      const result = visitor(target, p);
      if (result !== undefined) return result;

      queue.push(...edges.get(target)!);
    }
  }

  #walkDepthFirst<R>(
    source: N<T>,
    path: Path<T>,
    visitor: Visitor<T, R>,
    reverse = false,
    skipVisited = true,
  ): R | undefined {
    const targets = (reverse ? this.#edgesTo : this.#edgesFrom).get(source)!;

    for (const target of targets) {
      if (skipVisited && path.includes(target)) continue;

      const p: Path<T> = [...path, target];
      const result = visitor(target, p);
      if (result !== undefined) return result;
      else {
        const result = this
          .#walkDepthFirst(target, p, visitor, reverse, skipVisited);
        if (result !== undefined) return result;
      }
    }
  }

  /** Walk the graph breadth-first starting from the given vertex, calling the
   * visitor function for each vertex. If the visitor function returns a value,
   * the walk will stop and that value will be returned.
   *
   * @param source The vertex to start walking from.
   * @param visitor The function to call for each vertex.
   * @param options Options for the walk.
   * @param options.reverse If true, walk the graph in reverse
   * @param options.includeSource If true, call the visitor function for the source vertex
   * @returns The value returned by the visitor function, or undefined if the visitor function never returned a value.
   */
  walk<R>(
    source: N<T>,
    visitor: Visitor<T, R>,
    options?: WalkOptions,
  ): R | undefined {
    this.#assertVertex(source);
    const { reverse, breadthFirst, includeSource, skipVisited } = options ?? {};

    if (includeSource) {
      const result = visitor(source, [source]);

      if (result !== undefined) return result;
    }

    return breadthFirst
      ? this.#walkBreadthFirst(source, [source], visitor, reverse, skipVisited)
      : this.#walkDepthFirst(source, [source], visitor, reverse, skipVisited);
  }

  paths(source: N<T>, target: N<T>): Path<T>[] {
    this.#assertVertex(source);
    this.#assertVertex(target);

    const paths: Path<T>[] = [];
    this.walk(source, (v, path) => void (v === target && paths.push(path)));

    return paths;
  }

  subgraph(vertices: I<N<T>>): DirectedGraph<T> {
    const subgraph = new DirectedGraph<T>();

    for (const vertex of vertices) {
      this.#assertVertex(vertex);
      subgraph.add(vertex);
    }

    for (const [source, target] of this.edges) {
      if (subgraph.has(source) && subgraph.has(target)) {
        subgraph.add(source, target);
      }
    }

    return subgraph;
  }

  [Symbol.for("Deno.customInspect")]() {
    return `DirectedGraph(${this.#vertices.size} vertices, ${this.edges.size} edges)`;
  }

  [Symbol.iterator](): IterableIterator<N<T>> {
    return this.#vertices.values();
  }
}
