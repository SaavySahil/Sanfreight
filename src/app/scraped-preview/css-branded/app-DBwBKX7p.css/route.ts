import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toBrandYellowIfGreen(color: string, digits: string): string {
  if (![3, 4, 6, 8].includes(digits.length)) return color;

  const short = digits.length <= 4;
  const rgb = short
    ? digits.slice(0, 3).split("").map((value) => value + value).join("")
    : digits.slice(0, 6);
  const alpha = digits.length === 4 ? digits[3] + digits[3] : digits.length === 8 ? digits.slice(6) : "";
  const red = Number.parseInt(rgb.slice(0, 2), 16);
  const green = Number.parseInt(rgb.slice(2, 4), 16);
  const blue = Number.parseInt(rgb.slice(4, 6), 16);

  // Recolor distinctly green accents, leaving neutral and blue tones untouched.
  if (green <= red * 1.06 || green <= blue * 1.06 || green < 30) return color;
  return `#ffcc00${alpha}`;
}

export function GET() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "public", "scraped-preview", "css", "app-DBwBKX7p.css"),
    "utf8",
  );
  const branded = source.replace(/#([\da-f]{3,8})\b/gi, toBrandYellowIfGreen);
  const parsed = postcss.parse(branded);

  // This scraped page replaces MIMCO's header, contact CTA and footer with
  // the real SanFreight shell. Drop only legacy rules targeting those same
  // IDs so the shared site's own stylesheet remains authoritative.
  parsed.walkRules((rule) => {
    const kept = (rule.selectors ?? []).filter(
      (selector) => !/(^|\s|>)#(?:header|menu-desktop|menu-mobile|contact|footer)(?=[\s.#:[>]|$)/.test(selector),
    );
    if (kept.length === 0) rule.remove();
    else if (kept.length !== rule.selectors?.length) rule.selectors = kept;

    // Keep the scraped page's typography from overriding SanFreight's
    // responsive root scale. Its html rule sets 16px globally, while the
    // shared desktop site intentionally uses a 12.8px root for rem sizing.
    if (rule.selectors?.some((selector) => selector.trim() === "html")) {
      rule.walkDecls(/^(font-size|--sixtyfps-fontsize)$/i, (declaration) => {
        declaration.remove();
      });
    }
  });
  const css = parsed.toString();

  return new Response(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
