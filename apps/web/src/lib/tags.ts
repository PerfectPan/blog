/**
 * Parse the JSON-encoded `tags` column from the D1 `post` table. Stored values
 * written by the admin are JSON arrays of strings; anything else parses to an
 * empty list so a corrupted column cannot break post rendering.
 */
export function parseTagsColumn(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
