/**
 * Generates an SEO-friendly slug from a string.
 * @param title The string to convert to a slug.
 * @returns A lowercased, hyphenated string.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

