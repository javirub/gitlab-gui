import { describe, expect, it } from "bun:test";
import { parseEnvText } from "../src/utils/envParser";

describe("parseEnvText", () => {
  it("parses KEY=VALUE pairs", () => {
    expect(parseEnvText("A=1\nB=two")).toEqual([
      { key: "A", value: "1" },
      { key: "B", value: "two" },
    ]);
  });

  it("drops the export prefix and comment lines", () => {
    expect(parseEnvText("# comment\nexport A=1")).toEqual([{ key: "A", value: "1" }]);
  });

  it("keeps everything after the first = sign", () => {
    expect(parseEnvText("DB_URL=postgres://u:p@h/db?x=1")).toEqual([
      { key: "DB_URL", value: "postgres://u:p@h/db?x=1" },
    ]);
  });

  it("strips matching surrounding quotes only", () => {
    expect(parseEnvText(`A="quoted"\nB='single'\nC="mismatched'`)).toEqual([
      { key: "A", value: "quoted" },
      { key: "B", value: "single" },
      { key: "C", value: `"mismatched'` },
    ]);
  });

  it("keeps a lone quote character as the value", () => {
    expect(parseEnvText(`A="`)).toEqual([{ key: "A", value: `"` }]);
  });

  it("parses the YAML-style KEY: VALUE form", () => {
    expect(parseEnvText("A: 1\nB: two")).toEqual([
      { key: "A", value: "1" },
      { key: "B", value: "two" },
    ]);
  });

  it("does not read a bare URL as a variable", () => {
    expect(parseEnvText("https://gitlab.example.com/group/project")).toBeNull();
  });

  it("returns null when most lines are not variables", () => {
    expect(parseEnvText("just some prose\nmore prose\nA=1")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(parseEnvText("   \n\n")).toBeNull();
  });
});
