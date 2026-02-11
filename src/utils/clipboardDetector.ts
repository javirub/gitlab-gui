import { parseEnvText, type ParsedEnvVar } from "./envParser";

export async function readEnvFromClipboard(): Promise<ParsedEnvVar[] | null> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text || text.trim().length === 0) return null;
    return parseEnvText(text);
  } catch {
    return null;
  }
}

export function parseEnvFromPaste(pastedText: string): ParsedEnvVar[] | null {
  if (!pastedText || !pastedText.includes("\n")) return null;
  return parseEnvText(pastedText);
}
