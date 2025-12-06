/**
 * Validate Slug Tool
 *
 * Validates if a string is URL-friendly:
 * - Lowercase
 * - No umlauts (ä, ö, ü, ß)
 * - Only hyphens as separators
 * - No special characters
 */

interface SlugValidationResult {
  valid: boolean;
  slug: string;
  errors: string[];
  suggestions: string[];
}

export function validateSlug(text: string): SlugValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (!text || typeof text !== "string") {
    return {
      valid: false,
      slug: "",
      errors: ["Input must be a non-empty string"],
      suggestions: [],
    };
  }

  const original = text;

  // Check for uppercase
  if (text !== text.toLowerCase()) {
    errors.push("Slug contains uppercase characters");
    suggestions.push("Convert to lowercase");
  }

  // Check for German umlauts
  const umlautMap: Record<string, string> = {
    "ä": "ae",
    "ö": "oe",
    "ü": "ue",
    "ß": "ss",
    "Ä": "ae",
    "Ö": "oe",
    "Ü": "ue",
  };

  for (const [umlaut, replacement] of Object.entries(umlautMap)) {
    if (text.includes(umlaut)) {
      errors.push(`Slug contains umlaut: ${umlaut}`);
      suggestions.push(`Replace ${umlaut} with ${replacement}`);
    }
  }

  // Check for spaces
  if (text.includes(" ")) {
    errors.push("Slug contains spaces");
    suggestions.push("Replace spaces with hyphens");
  }

  // Check for special characters
  const specialChars = text.match(/[^a-z0-9-]/g);
  if (specialChars) {
    const uniqueChars = [...new Set(specialChars)];
    errors.push(`Slug contains special characters: ${uniqueChars.join(", ")}`);
    suggestions.push("Remove special characters");
  }

  // Check for consecutive hyphens
  if (text.includes("--")) {
    errors.push("Slug contains consecutive hyphens");
    suggestions.push("Replace with single hyphen");
  }

  // Check for leading/trailing hyphens
  if (text.startsWith("-") || text.endsWith("-")) {
    errors.push("Slug has leading or trailing hyphens");
    suggestions.push("Remove leading/trailing hyphens");
  }

  // Generate corrected slug
  let correctedSlug = original
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    valid: errors.length === 0,
    slug: correctedSlug,
    errors,
    suggestions,
  };
}

