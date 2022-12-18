export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [K in string]?: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
