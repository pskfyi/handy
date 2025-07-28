/**
 * @module
 *
 * Create a markdown table. */

export type TableHeader = {
  label: string;
  alignment: "left" | "center" | "right" | null;
};

export type TableRow = Record<string, string>;

function _header(input: string | TableHeader): TableHeader {
  return typeof input === "string" ? { label: input, alignment: null } : input;
}

function _validRow(
  headers: TableHeader[],
  row: TableRow,
): TableRow {
  const headerLabels = headers.map((h) => h.label);

  for (const key of Object.keys(row)) {
    if (!headerLabels.includes(key)) {
      throw new Error(
        `Invalid header "${key}" in TableRow.\nExpected one of: ${
          headerLabels.join(", ")
        }`,
      );
    }
  }

  for (const header of headers) {
    if (!(header.label in row)) {
      throw new Error(
        `Missing value for header "${header.label}" in TableRow.`,
      );
    }
  }

  return row;
}

function _row(headers: TableHeader[], input: string[] | TableRow): TableRow {
  if (!Array.isArray(input)) return _validRow(headers, input);

  if (input.length !== headers.length) {
    throw new Error(
      "Cannot create TableRow. Input length does not match headers length.",
    );
  }

  return _validRow(
    headers,
    Object.fromEntries(
      input.map((value, index) => [headers[index].label, value]),
    ),
  );
}

export class Table {
  headers: TableHeader[];
  rows: TableRow[];

  constructor(
    headers: Array<TableHeader | string>,
    rows: Array<TableRow | string[]> = [],
  ) {
    this.headers = headers.map(_header);
    this.rows = rows.map((row) => _row(this.headers, row));
  }

  addRow(row: string[] | TableRow) {
    this.rows.push(_row(this.headers, row));
  }

  addColumn(
    header: TableHeader | string,
    initializer?: (row: TableRow) => string,
  ) {
    const _h = _header(header);
    this.headers.push(_h);
    this.rows.map((row) => {
      row[_h.label] = initializer ? initializer(row) : "";
    });
  }
}
