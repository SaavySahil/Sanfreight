export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  return (
    html.match(
      /<script\b(?=[^>]*\bid=["']sf-fill-script["'])[^>]*>([\s\S]*?)<\/script\s*>/i,
    )?.[1] ?? ""
  );
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
