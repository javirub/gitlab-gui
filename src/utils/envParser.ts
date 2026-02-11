export interface ParsedEnvVar {
  key: string;
  value: string;
}

export function parseEnvText(text: string): ParsedEnvVar[] | null {
  const lines = text.split(/\r?\n/);
  const nonEmptyLines = lines.filter(l => {
    const trimmed = l.trim();
    return trimmed.length > 0 && !trimmed.startsWith("#");
  });

  if (nonEmptyLines.length === 0) return null;

  const parsed: ParsedEnvVar[] = [];

  for (const line of nonEmptyLines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith("#") || trimmed.length === 0) continue;

    // Remove `export ` prefix
    const cleaned = trimmed.startsWith("export ") ? trimmed.slice(7) : trimmed;

    // Try KEY=VALUE or KEY: VALUE
    let match = cleaned.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)/);
    if (!match) {
      match = cleaned.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)/);
    }

    if (match) {
      const key = match[1];
      let value = match[2].trim();

      // Strip surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      parsed.push({ key, value });
    }
  }

  // If less than 50% of non-empty lines parsed, it's probably not env-var content
  if (parsed.length < nonEmptyLines.length * 0.5) {
    return null;
  }

  return parsed;
}
