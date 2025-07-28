import {
  type ArrayParser,
  newline,
  type Parser,
  regexp,
  sequence,
  string,
} from "../../parser/mod.ts";
import { Table, type TableHeader } from "./class.ts";

const _optionalColumnSeparator = string("|").optional.ignore;
const _columnSeparator = string("|").ignore;
const _cellContent = regexp(/[^|\r\n]*/).match.into((val) => val.trim());

export const cellParser: Parser<string> = sequence(
  _columnSeparator,
  _cellContent,
  _columnSeparator,
)
  .item(0)
  .named("markdownTable.cell");

export const rowParser: Parser<[string, ...string[]]> = sequence(
  _optionalColumnSeparator,
  _cellContent,
  _columnSeparator,
).item(0)
  .and(sequence(_cellContent, _columnSeparator).oneOrMore.optional)
  .into(([firstCell, restCells = []]) =>
    [firstCell, ...restCells?.flat()] as [string, ...string[]]
  )
  .named("markdownTable.row");

export const headerSeparatorParser: ArrayParser<[string, ...string[]]> =
  sequence(
    string("|").optional.ignore,
    string(" ").optional.ignore,
    string(":").optional,
    string("-").oneOrMore.into(() => "-"),
    string(":").optional,
    string(" ").optional.ignore,
    _columnSeparator,
  )
    .join("")
    .or(string("-").oneOrMore.into(() => "-"))
    .oneOrMore
    .named("markdownTable.headerSeparator");

function _alignment(input: string): TableHeader["alignment"] {
  if (input === ":-") return "left";
  if (input === ":-:") return "center";
  if (input === "-:") return "right";
  return null;
}

/** Parse a markdown table into a 2D array of strings */
export const parser: Parser<Table> = sequence(
  string("-").oneOrMore.and(newline).optional.ignore,
  rowParser,
  newline.ignore,
  headerSeparatorParser,
  newline.ignore,
  sequence(rowParser, newline.optional.ignore).flat.oneOrMore,
)
  .into(([header, separators, ...rows]) => {
    const headers: TableHeader[] = header
      .map((label, index) => ({
        label,
        alignment: _alignment(separators.at(index) ?? ""),
      }));

    return new Table(headers, rows.flat());
  })
  .named("markdownTable.table");
