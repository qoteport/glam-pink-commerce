/**
 * Generate a URL-friendly slug from a string.
 * E.g. "Wig Irene 22-inch" → "wig-irene-22-inch"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a product slug with ID suffix for uniqueness.
 * E.g. "Wig Irene" with id "226c6303-..." → "wig-irene-226c6303"
 */
export function productSlug(name: string, id: string): string {
  const slug = slugify(name);
  const shortId = id.split('-')[0];
  return `${slug}-${shortId}`;
}

/**
 * Extract the short ID from a product slug.
 * E.g. "wig-irene-226c6303" → "226c6303"
 */
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
