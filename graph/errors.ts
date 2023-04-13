export class VertexError extends Error {
  // deno-lint-ignore no-explicit-any
  constructor(public vertex: any) {
    super(`Graph does not contain vertex ${vertex}`);
    this.name = "VertexError";
  }
}
