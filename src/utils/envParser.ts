export interface ParsedEnvVar {
  key: string;
  value: string;
}

const KEY = "[A-Za-z_][A-Za-z0-9_]*";
// KEY=VALUE
const EQUALS_FORM = new RegExp(`^(${KEY})\\s*=\\s*(.*)$`);
// KEY: VALUE (YAML style). The space after the colon is required so that a
// bare URL such as `https://gitlab.example.com/foo` is not read as the
// variable `https` with the value `//gitlab.example.com/foo`.
const COLON_FORM = new RegExp(`^(${KEY}):[ \\t]+(.*)$`);

function stripSurroundingQuotes(value: string): string {
  if (value.length < 2) return value;
  const first = value[0];
  const last = value[value.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseEnvText(text: string): ParsedEnvVar[] | null {
  const nonEmptyLines = text.split(/\r?\n/).filter((l) => {
    const trimmed = l.trim();
    return trimmed.length > 0 && !trimmed.startsWith("#");
  });

  if (nonEmptyLines.length === 0) return null;

  const parsed: ParsedEnvVar[] = [];

  for (const line of nonEmptyLines) {
    const trimmed = line.trim();

    // Remove the `export ` prefix
    const cleaned = trimmed.startsWith("export ") ? trimmed.slice(7) : trimmed;

    const match = cleaned.match(EQUALS_FORM) ?? cleaned.match(COLON_FORM);
    if (!match) continue;

    parsed.push({
      key: match[1],
      value: stripSurroundingQuotes(match[2].trim()),
    });
  }

  // If less than 50% of non-empty lines parsed, it's probably not env-var content
  if (parsed.length < nonEmptyLines.length * 0.5) {
    return null;
  }

  return parsed;
}
