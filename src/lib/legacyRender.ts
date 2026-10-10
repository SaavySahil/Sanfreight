import { scrollFillTextScript } from "@/lib/scrollFillTextScript";

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function safeArticleImageUrl(input: string | null | undefined): string | null {
  const candidate = input?.trim();
  if (!candidate) return null;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("\\")
  ) {
    return candidate;
  }
  return null;
}

/**
 * Legacy page exports contain their own scripts, including tracking snippets
 * injected by the source host. Render their markup only; app scripts are
 * explicitly loaded by the Next.js routes, and optional analytics is consent
 * gated at the root layout.
 */
export function removeEmbeddedScripts(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

/** Preserve the site's own fill-in markup helper while discarding scraped host scripts. */
export function extractSanfreightFillScript(html: string): string {
  const hasLegacyFillScript = /<script\b(?=[^>]*\bid=["']sf-fill-script["'])[^>]*>[\s\S]*?<\/script\s*>/i.test(html);
  const hasPreservedFillTarget = /\bdata-sf-fill-preserve(?:\s|=|>)/i.test(html);
  return hasLegacyFillScript || hasPreservedFillTarget ? scrollFillTextScript : "";
}

export function formatDotDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatSlashDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatLongDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function splitBullets(text: string | null): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}
